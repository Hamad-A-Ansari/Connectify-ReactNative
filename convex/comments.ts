import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./users";



export const addComment = mutation({
  args: {
    content: v.string(),
    postId: v.id("posts")
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    if (!currentUser) throw new Error("Unauthorized");


    const post = await ctx.db.get(args.postId);
    if (!post) throw new ConvexError("Post not found");

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
    }

  }
})

export const getComments = query({
  args: {
    postId: v.id("posts")
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) throw new ConvexError("Post not found");

    const comments = await ctx.db.query("comments")
      .withIndex("by_post", q=>q.eq("postId", args.postId))
      .collect();

    const commentsWithInfo = await Promise.all(
      comments.map(async (comment) => {
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

    return commentsWithInfo;
  }
})