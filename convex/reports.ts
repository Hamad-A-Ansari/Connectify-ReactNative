import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";
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

    // If child safety report, send an immediate email alert
    if (args.reason === "child_safety") {
      const postOwner = await ctx.db.get(post.userId);

      await ctx.scheduler.runAfter(0, internal.sendChildSafetyAlert.sendChildSafetyAlert, {
        reporterUsername: currentUser.username,
        reporterEmail: currentUser.email,
        postId: args.postId,
        postImageUrl: post.imageUrl,
        postOwnerUsername: postOwner?.username ?? "unknown",
      });
    }
  },
});
