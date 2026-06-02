import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthenticatedUser } from "./users";

export const createReport = mutation({
  args: {
    targetId: v.string(),
    targetType: v.union(v.literal("post"), v.literal("user")),
    reason: v.union(
      v.literal("spam"),
      v.literal("harassment"),
      v.literal("nudity"),
      v.literal("violence"),
      v.literal("other")
    ),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    if (!args.targetId || args.targetId.trim().length === 0) {
      throw new Error("targetId cannot be empty");
    }

    await ctx.db.insert("reports", {
      reporterId: currentUser._id,
      targetId: args.targetId,
      targetType: args.targetType,
      reason: args.reason,
    });
  },
});
