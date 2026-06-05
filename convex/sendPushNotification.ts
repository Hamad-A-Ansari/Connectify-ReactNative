import { internalAction, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Internal query to look up a user's push token
export const getUserPushToken = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const tokenRecord = await ctx.db
      .query("pushTokens")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    return tokenRecord?.token ?? null;
  },
});

// Internal action to send a push notification via Expo Push API
export const sendPushNotification = internalAction({
  args: {
    receiverId: v.id("users"),
    title: v.string(),
    body: v.string(),
    data: v.optional(v.object({ postId: v.optional(v.id("posts")) })),
    actorId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    // Safety check: don't send self-notifications
    if (args.actorId && args.actorId === args.receiverId) {
      return;
    }

    // Look up receiver's push token
    const token = await ctx.runQuery(
      internal.sendPushNotification.getUserPushToken,
      { userId: args.receiverId }
    );

    // Skip if receiver has no registered token
    if (!token) {
      return;
    }

    // Call Expo Push API
    try {
      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          to: token,
          title: args.title,
          body: args.body,
          data: args.data ?? {},
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(
          `Push notification failed: ${response.status} ${errorBody}`
        );
      }
    } catch (error) {
      console.error("Push notification delivery error:", error);
    }
  },
});
