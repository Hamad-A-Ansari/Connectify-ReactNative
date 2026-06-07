import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { getAuthenticatedUser } from "./users";
import { validateField, LIMITS } from "./validation";
import { internal } from "./_generated/api";



export const addComment = mutation({
  args: {
    content: v.string(),
    postId: v.id("posts")
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    if (!currentUser) throw new Error("Unauthorized");

    validateField(args.content, LIMITS.COMMENT_MAX, "comment");

    const post = await ctx.db.get(args.postId);
    if (!post) throw new ConvexError("Post not found");

    // Check if current user is blocked by the post author
    const block = await ctx.db
      .query("blocks")
      .withIndex("by_both", (q) => q.eq("blockerId", post.userId).eq("blockedId", currentUser._id))
      .first();
    if (block) throw new Error("You cannot interact with this user's content");

    //insert comment to db
    const commentId = await ctx.db.insert("comments", {
      userId: currentUser?._id,
      postId: args.postId,
      content: args.content,
    });

    //update post comments count
    await ctx.db.patch(args.postId, {comments: post.comments + 1});

    //if not my post create a notification
    if(post.userId !== currentUser._id){
      await ctx.db.insert("notifications", {
        receiverId: post.userId,
        senderId: currentUser._id,
        postId: args.postId,
        type: "comment",
        commentId,
      });

      // Schedule push notification
      const commentPreview = args.content.length > 50
        ? args.content.substring(0, 50) + "..."
        : args.content;
      await ctx.scheduler.runAfter(0, internal.sendPushNotification.sendPushNotification, {
        receiverId: post.userId,
        title: "New Comment",
        body: `${currentUser.username} commented: ${commentPreview}`,
        data: { postId: args.postId },
        actorId: currentUser._id,
      });
    }

  }
})

export const getComments = query({
  args: {
    postId: v.id("posts"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) throw new ConvexError("Post not found");

    const results = await ctx.db.query("comments")
      .withIndex("by_post", q => q.eq("postId", args.postId))
      .order("asc")
      .paginate(args.paginationOpts);

    const commentsWithInfo = await Promise.all(
      results.page.map(async (comment) => {
        const user = (await ctx.db.get(comment.userId))!;
        return {
          ...comment,
          user: {
            fullname: user!.fullname,
            image: user!.image,
          },
        };
      })
    );

    return {
      ...results,
      page: commentsWithInfo,
    };
  }
})