import { v } from "convex/values";
import { query } from "./_generated/server";

export const searchUsers = query({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    // Return empty array for queries shorter than 2 characters
    if (args.query.length < 2) {
      return [];
    }

    const queryLower = args.query.toLowerCase();

    const allUsers = await ctx.db.query("users").collect();

    const matchingUsers = allUsers.filter((user) =>
      user.username.toLowerCase().includes(queryLower)
    );

    return matchingUsers.map((user) => ({
      _id: user._id,
      username: user.username,
      fullname: user.fullname,
      image: user.image,
    }));
  },
});
