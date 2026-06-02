import { query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { getAuthenticatedUser } from "./users";


export const getNotifications = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const results = await ctx.db
      .query("notifications")
      .withIndex("by_receiver", (q) => q.eq("receiverId", currentUser._id))
      .order("desc")
      .paginate(args.paginationOpts);

    const notificationsWithInfo = await Promise.all(
      results.page.map(async (notification) => {
        const sender = (await ctx.db.get(notification.senderId))!;
        let post = null;
        let comment = null;

        if (notification.postId) {
          post = (await ctx.db.get(notification.postId))!;
        }

        if (notification.type === "comment" && notification.commentId) {
          comment = (await ctx.db.get(notification.commentId))!;
        }

        return {
          ...notification,
          sender: {
            _id: sender._id,
            username: sender.username,
            image: sender.image,
          },
          post,
          comment: comment?.content,
        };
      }),
    );

    return {
      ...results,
      page: notificationsWithInfo,
    };
  },
})