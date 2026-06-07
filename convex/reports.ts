import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthenticatedUser } from "./users";

export const createReport = mutation({
  args: {
    postId: v.id("posts"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    await ctx.db.insert("reports", {
      reporterId: currentUser._id,
      postId: args.postId,
      reason: args.reason,
    });
  },
});
