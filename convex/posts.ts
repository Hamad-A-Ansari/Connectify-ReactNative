import { v } from "convex/values";
import { action, internalMutation, mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { getAuthenticatedUser } from "./users";
import { validateField, LIMITS } from "./validation";
import { internal } from "./_generated/api";

export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if(!identity) throw new Error("Unauthorized");
  return await ctx.storage.generateUploadUrl();
})



// Internal mutation to insert a post into the database.
// Called by the createPost action after moderation passes.
export const insertPost = internalMutation({
  args: {
    storageId: v.id("_storage"),
    imageUrl: v.string(),
    caption: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    if (args.caption !== undefined) {
      validateField(args.caption, LIMITS.CAPTION_MAX, "caption");
    }

    // Create post
    const postId = await ctx.db.insert("posts", {
      userId: currentUser._id,
      imageUrl: args.imageUrl,
      storageId: args.storageId,
      caption: args.caption,
      likes: 0,
      comments: 0,
    });

    // Increment user's post count
    await ctx.db.patch(currentUser._id, {
      posts: currentUser.posts + 1,
    });

    return postId;
  },
});

export const createPost = action({
  args: {
    caption: v.optional(v.string()),
    storageId: v.id("_storage"),
  },

  handler: async (ctx, args): Promise<string> => {
    // Verify user is authenticated
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Validate caption upfront before any async work
    if (args.caption !== undefined) {
      validateField(args.caption, LIMITS.CAPTION_MAX, "caption");
    }

    // Get image URL from storage
    const imageUrl = await ctx.storage.getUrl(args.storageId);
    if (!imageUrl) throw new Error("Image not found");

    // Run image moderation
    const moderationResult = await ctx.runAction(
      internal.moderation.moderateImage,
      { imageUrl }
    );

    // If moderation returns unsafe, reject the post
    if (!moderationResult.safe) {
      throw new Error(
        `Content policy violation: ${moderationResult.reason || "Image violates content policy"}`
      );
    }

    // Moderation passed (safe or graceful failure) — insert the post
    const postId: string = await ctx.runMutation(internal.posts.insertPost, {
      storageId: args.storageId,
      imageUrl,
      caption: args.caption,
    });

    return postId;
  },
});



export const getFeedPosts = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const results = await ctx.db
      .query("posts")
      .order("desc")
      .paginate(args.paginationOpts);

    // Transform page results with author/like/bookmark info
    const postsWithInfo = (await Promise.all(
      results.page.map(async (post) => {
        const postAuthor = await ctx.db.get(post.userId);

        // Skip posts with deleted/null authors
        if (!postAuthor) return null;

        const like = await ctx.db
          .query("likes")
          .withIndex("by_user_and_post", (q) =>
            q.eq("userId", currentUser._id).eq("postId", post._id)
          )
          .first();

        const bookmark = await ctx.db
          .query("bookmarks")
          .withIndex("by_user_and_post", (q) =>
            q.eq("userId", currentUser._id).eq("postId", post._id)
          )
          .first();

        return {
          ...post,
          author: {
            _id: postAuthor._id,
            username: postAuthor.username,
            image: postAuthor.image,
          },
          isLiked: !!like,
          isBookmarked: !!bookmark,
        };
      })
    )).filter((p): p is NonNullable<typeof p> => p !== null);

    return {
      ...results,
      page: postsWithInfo,
    };
  },
});


export const toggleLike = mutation({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const existing = await ctx.db
      .query("likes")
      .withIndex("by_user_and_post", (q)=> 
          q.eq("userId", currentUser._id).eq("postId", args.postId))
      .first();
    
    const post = await ctx.db.get(args.postId);
    if(!post) throw new Error("Post not found");

    // Check if current user is blocked by the post author
    const block = await ctx.db
      .query("blocks")
      .withIndex("by_both", (q) => q.eq("blockerId", post.userId).eq("blockedId", currentUser._id))
      .first();
    if (block) throw new Error("You cannot interact with this user's content");

    if(existing){
      await ctx.db.delete(existing._id);
      await ctx.db.patch(args.postId, {likes: post.likes - 1});
      return false; // unliked
    }else{
      await ctx.db.insert("likes", {
        userId: currentUser._id,
        postId: args.postId,
      });
      await ctx.db.patch(args.postId, {likes: post.likes + 1});

      //if not my post create a notification
      if(currentUser._id !== post.userId) {
        await ctx.db.insert("notifications", {
          receiverId: post.userId,
          senderId: currentUser._id,
          postId: args.postId,
          type: "like",
        });

        // Schedule push notification
        await ctx.scheduler.runAfter(0, internal.sendPushNotification.sendPushNotification, {
          receiverId: post.userId,
          title: "New Like",
          body: `${currentUser.username} liked your post`,
          data: { postId: args.postId },
          actorId: currentUser._id,
        });
      }

      return true; // liked
    }
  }
});


export const deletePost = mutation({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const post = await ctx.db.get(args.postId);
    if(!post) throw new Error("Post not found");

    //verify-post-ownership
    if(currentUser._id !== post.userId) throw new Error("Not authorized to delete this post");

    //delete associated likes
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_post", (q)=> q.eq("postId", args.postId))
      .collect();
    
      for(const like of likes) {
        await ctx.db.delete(like._id);
      }

      //delete associated comments
      const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q)=> q.eq("postId", args.postId))
      .collect();

      for(const comment of comments) {
        await ctx.db.delete(comment._id);
      }

      //delete associated bookmarks
      const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_post", (q)=> q.eq("postId", args.postId))
      .collect();

      for(const bookmark of bookmarks) {
        await ctx.db.delete(bookmark._id);
      }

      // delete associated notifications
      const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_post", (q)=> q.eq("postId", args.postId))
      .collect();
      
      for(const notification of notifications) {
        await ctx.db.delete(notification._id);
      }

      //delete storage file
      await ctx.storage.delete(post.storageId);

      //delete post
      await ctx.db.delete(args.postId);
      
      //decrement post count by 1
      await ctx.db.patch(currentUser._id, {
        posts: Math.max(0, (currentUser.posts || 1) - 1),
      });
  
    },
});


export const getPostByUser = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const user = args.userId ? await ctx.db.get(args.userId) : await getAuthenticatedUser(ctx);

    if(!user) throw new Error("User not found");
    
    const posts = await ctx.db
     .query("posts")
     .withIndex("by_user", (q)=> q.eq("userId", args.userId || user._id))
     .order("desc")
     .collect();

    return posts;
  },
});

