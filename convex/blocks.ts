import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./users";

export const blockUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    if (currentUser._id === args.userId) {
      throw new Error("You cannot block yourself");
    }

    // Check if already blocked
    const existing = await ctx.db
      .query("blocks")
      .withIndex("by_both", (q) =>
        q.eq("blockerId", currentUser._id).eq("blockedId", args.userId)
      )
      .first();

    if (existing) return;

    await ctx.db.insert("blocks", {
      blockerId: currentUser._id,
      blockedId: args.userId,
    });
  },
});

export const unblockUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const existing = await ctx.db
      .query("blocks")
      .withIndex("by_both", (q) =>
        q.eq("blockerId", currentUser._id).eq("blockedId", args.userId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

export const getBlockedUsers = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const blocks = await ctx.db
      .query("blocks")
      .withIndex("by_blocker", (q) => q.eq("blockerId", currentUser._id))
      .collect();

    return blocks.map((block) => block.blockedId);
  },
});

export const isBlocked = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const block = await ctx.db
      .query("blocks")
      .withIndex("by_both", (q) =>
        q.eq("blockerId", currentUser._id).eq("blockedId", args.userId)
      )
      .first();

    return !!block;
  },
});
