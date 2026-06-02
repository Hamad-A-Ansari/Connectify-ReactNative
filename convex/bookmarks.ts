import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./users";


export const toggleBookmark = mutation({
  args: { postId: v.id("posts")},
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    // Check if current user is blocked by the post author
    const block = await ctx.db
      .query("blocks")
      .withIndex("by_both", (q) => q.eq("blockerId", post.userId).eq("blockedId", currentUser._id))
      .first();
    if (block) throw new Error("You cannot interact with this user's content");

    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_and_post", (q) => q.eq("userId", currentUser._id).eq("postId", args.postId))
      .first();

    if(existing) {
      await ctx.db.delete(existing._id);
      return false;
    } else {
      await ctx.db.insert("bookmarks", {
        userId: currentUser._id,
        postId: args.postId,
      });
      return true;
    }
  },
});


export const getBookmarkedPosts = query({
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const bookmarks = await ctx.db
     .query("bookmarks")
     .withIndex("by_user", (q) => q.eq("userId", currentUser._id))
     .order("desc")
     .collect();

     const bookmarksWithInfo = await Promise.all(
      bookmarks.map(async (bookmark) => {
        const post = (await ctx.db.get(bookmark.postId))!;
        return post;
      })
    );

    return bookmarksWithInfo;
  },
});