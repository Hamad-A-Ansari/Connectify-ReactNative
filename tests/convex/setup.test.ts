import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import schema from "../../convex/schema";
import { modules } from "./testSetup";

describe("convex-test setup", () => {
  it("should initialize convex test environment", async () => {
    const t = convexTest(schema, modules);
    // Verify we can run an inline query on the empty database
    const result = await t.run(async (ctx) => {
      const users = await ctx.db.query("users").collect();
      return users;
    });
    expect(result).toEqual([]);
  });

  it("should support identity for authenticated operations", async () => {
    const t = convexTest(schema, modules);
    const asUser = t.withIdentity({
      name: "Test User",
      subject: "test-user-123",
      tokenIdentifier: "https://clerk.test|test-user-123",
    });
    // Verify identity is available
    const result = await asUser.run(async (ctx) => {
      const identity = await ctx.auth.getUserIdentity();
      return identity?.name;
    });
    expect(result).toBe("Test User");
  });
});
