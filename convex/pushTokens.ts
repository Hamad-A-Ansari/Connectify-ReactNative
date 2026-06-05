import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./users";

export const registerPushToken = mutation({
  args: {
    token: v.string(),
    platform: v.union(v.literal("ios"), v.literal("android")),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    // Check if this token already exists for this user (avoid duplicates)
    const existing = await ctx.db
      .query("pushTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (existing) {
      // If the token exists but belongs to a different user, update ownership
      if (existing.userId !== currentUser._id) {
        await ctx.db.patch(existing._id, {
          userId: currentUser._id,
          platform: args.platform,
        });
      }
      // If it already belongs to this user, no action needed
      return;
    }

    // Insert new token record
    await ctx.db.insert("pushTokens", {
      userId: currentUser._id,
      token: args.token,
      platform: args.platform,
    });
  },
});

export const removePushToken = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const tokenRecord = await ctx.db
      .query("pushTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (tokenRecord) {
      await ctx.db.delete(tokenRecord._id);
    }
  },
});
