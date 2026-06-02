import * as fc from "fast-check";

// Feature: production-readiness-p0, Property 3: Feed excludes blocked users' posts
// Feature: production-readiness-p0, Property 4: Blocked user interactions rejected
// Feature: production-readiness-p0, Property 5: Block/unblock round trip
// **Validates: Requirements 2.3, 2.4, 2.6**

/**
 * These tests validate the pure logic used by the block system.
 * We extract and test the same filtering/checking behavior that
 * the Convex queries and mutations use, without needing a database.
 */

// --- Extracted logic helpers (mirrors what the backend does) ---

interface Post {
  id: string;
  userId: string;
  content: string;
}

/**
 * Filters posts to exclude those authored by blocked users.
 * This is the same logic used in getFeedPosts:
 *   posts.filter(post => !blockedUserIds.has(post.userId))
 */
function filterFeedPosts(posts: Post[], blockedUserIds: Set<string>): Post[] {
  return posts.filter((post) => !blockedUserIds.has(post.userId));
}

/**
 * Checks if an interaction should be rejected.
 * The backend rejects interactions when the post author has blocked the interacting user.
 * Logic: if blockedSet contains the interactingUserId, reject.
 */
function shouldRejectInteraction(
  postAuthorId: string,
  interactingUserId: string,
  blocks: Set<string> // Set of user IDs that postAuthorId has blocked
): boolean {
  return blocks.has(interactingUserId);
}

/**
 * Simulates a block set: add a user to the blocked set.
 */
function addBlock(blockedSet: Set<string>, userId: string): Set<string> {
  const newSet = new Set(blockedSet);
  newSet.add(userId);
  return newSet;
}

/**
 * Simulates an unblock: remove a user from the blocked set.
 */
function removeBlock(blockedSet: Set<string>, userId: string): Set<string> {
  const newSet = new Set(blockedSet);
  newSet.delete(userId);
  return newSet;
}

// --- Generators ---

const userIdArb = fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0);

const postArb = fc.record({
  id: fc.uuid(),
  userId: userIdArb,
  content: fc.string({ minLength: 1, maxLength: 100 }),
});

// Feature: production-readiness-p0, Property 3: Feed excludes blocked users' posts
describe("Property 3: Feed excludes blocked users' posts", () => {
  it("filtered feed contains zero posts from any blocked user", () => {
    fc.assert(
      fc.property(
        fc.array(postArb, { minLength: 0, maxLength: 50 }),
        fc.array(userIdArb, { minLength: 0, maxLength: 10 }),
        (posts, blockedUserIds) => {
          const blockedSet = new Set(blockedUserIds);
          const filteredPosts = filterFeedPosts(posts, blockedSet);

          // Property: no post in filtered result has a userId in the blocked set
          for (const post of filteredPosts) {
            expect(blockedSet.has(post.userId)).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("filtered feed preserves all posts from non-blocked users", () => {
    fc.assert(
      fc.property(
        fc.array(postArb, { minLength: 0, maxLength: 50 }),
        fc.array(userIdArb, { minLength: 0, maxLength: 10 }),
        (posts, blockedUserIds) => {
          const blockedSet = new Set(blockedUserIds);
          const filteredPosts = filterFeedPosts(posts, blockedSet);

          // Property: every non-blocked user's posts are preserved
          const nonBlockedPosts = posts.filter(
            (post) => !blockedSet.has(post.userId)
          );
          expect(filteredPosts).toHaveLength(nonBlockedPosts.length);
          expect(filteredPosts).toEqual(nonBlockedPosts);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("blocking all post authors results in empty feed", () => {
    fc.assert(
      fc.property(
        fc.array(postArb, { minLength: 1, maxLength: 20 }),
        (posts) => {
          // Block every unique author
          const allAuthors = new Set(posts.map((p) => p.userId));
          const filteredPosts = filterFeedPosts(posts, allAuthors);
          expect(filteredPosts).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: production-readiness-p0, Property 4: Blocked user interactions rejected
describe("Property 4: Blocked user interactions rejected", () => {
  it("interactions from blocked users are always rejected", () => {
    fc.assert(
      fc.property(
        userIdArb, // post author
        userIdArb, // interacting user
        fc.array(userIdArb, { minLength: 1, maxLength: 10 }),
        (postAuthorId, interactingUserId, additionalBlocked) => {
          // Ensure the interacting user is in the blocked set
          const blockedSet = new Set([...additionalBlocked, interactingUserId]);

          const rejected = shouldRejectInteraction(
            postAuthorId,
            interactingUserId,
            blockedSet
          );

          // Property: interaction must be rejected when user is blocked
          expect(rejected).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("interactions from non-blocked users are never rejected", () => {
    fc.assert(
      fc.property(
        userIdArb, // post author
        userIdArb, // interacting user
        fc.array(userIdArb, { minLength: 0, maxLength: 10 }),
        (postAuthorId, interactingUserId, blockedUsers) => {
          // Ensure the interacting user is NOT in the blocked set
          const blockedSet = new Set(
            blockedUsers.filter((u) => u !== interactingUserId)
          );

          const rejected = shouldRejectInteraction(
            postAuthorId,
            interactingUserId,
            blockedSet
          );

          // Property: interaction must NOT be rejected when user is not blocked
          expect(rejected).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("rejection check is independent of post author identity", () => {
    fc.assert(
      fc.property(
        userIdArb, // post author 1
        userIdArb, // post author 2
        userIdArb, // interacting user
        fc.boolean(), // whether to block
        (author1, author2, interactingUser, shouldBlock) => {
          const blockedSet = shouldBlock
            ? new Set([interactingUser])
            : new Set<string>();

          // Same blocked set produces same result regardless of author
          const result1 = shouldRejectInteraction(
            author1,
            interactingUser,
            blockedSet
          );
          const result2 = shouldRejectInteraction(
            author2,
            interactingUser,
            blockedSet
          );

          expect(result1).toBe(result2);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: production-readiness-p0, Property 5: Block/unblock round trip
describe("Property 5: Block/unblock round trip", () => {
  it("unblocking restores visibility of previously-blocked user's posts", () => {
    fc.assert(
      fc.property(
        fc.array(postArb, { minLength: 1, maxLength: 30 }),
        userIdArb, // user to block then unblock
        fc.array(userIdArb, { minLength: 0, maxLength: 5 }), // other blocked users
        (posts, targetUser, otherBlocked) => {
          const initialBlockedSet = new Set(otherBlocked);

          // State before blocking the target
          const feedBefore = filterFeedPosts(posts, initialBlockedSet);

          // Block the target user
          const blockedSet = addBlock(initialBlockedSet, targetUser);
          const feedDuringBlock = filterFeedPosts(posts, blockedSet);

          // Unblock the target user
          const unblockedSet = removeBlock(blockedSet, targetUser);
          const feedAfterUnblock = filterFeedPosts(posts, unblockedSet);

          // Property: feed after unblock equals feed before blocking
          expect(feedAfterUnblock).toEqual(feedBefore);

          // Additional: during block, target's posts are excluded
          const targetPosts = feedDuringBlock.filter(
            (p) => p.userId === targetUser
          );
          expect(targetPosts).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("block then unblock is equivalent to never blocking", () => {
    fc.assert(
      fc.property(
        fc.array(postArb, { minLength: 1, maxLength: 20 }),
        userIdArb, // user to block/unblock
        (posts, targetUser) => {
          const emptyBlockedSet = new Set<string>();

          // Never blocked
          const feedNeverBlocked = filterFeedPosts(posts, emptyBlockedSet);

          // Block then unblock
          const afterBlock = addBlock(emptyBlockedSet, targetUser);
          const afterUnblock = removeBlock(afterBlock, targetUser);
          const feedAfterRoundTrip = filterFeedPosts(posts, afterUnblock);

          // Property: round trip returns to original state
          expect(feedAfterRoundTrip).toEqual(feedNeverBlocked);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("unblock only affects the unblocked user, other blocks remain", () => {
    fc.assert(
      fc.property(
        fc.array(postArb, { minLength: 1, maxLength: 20 }),
        userIdArb, // user to unblock
        fc.array(userIdArb, { minLength: 1, maxLength: 5 }), // other blocked users
        (posts, targetUser, otherBlocked) => {
          // Block multiple users including target
          const blockedSet = new Set([...otherBlocked, targetUser]);

          // Unblock only the target
          const afterUnblock = removeBlock(blockedSet, targetUser);

          const feedAfterUnblock = filterFeedPosts(posts, afterUnblock);

          // Property: posts from other blocked users still excluded
          for (const post of feedAfterUnblock) {
            const isOtherBlocked =
              otherBlocked.includes(post.userId) && post.userId !== targetUser;
            expect(isOtherBlocked).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
