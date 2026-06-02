import { validateField, validateMaxLength, LIMITS } from "../convex/validation";

/**
 * Tests that validate the mutation-level integration of validation helpers.
 * These verify the same logic that runs inside createPost, addComment,
 * createUser, and updateProfile mutations.
 */

describe("createPost caption validation", () => {
  it("accepts caption within limit", () => {
    expect(() =>
      validateField("Hello world", LIMITS.CAPTION_MAX, "caption")
    ).not.toThrow();
  });

  it("rejects caption exceeding CAPTION_MAX", () => {
    const longCaption = "a".repeat(LIMITS.CAPTION_MAX + 1);
    expect(() =>
      validateField(longCaption, LIMITS.CAPTION_MAX, "caption")
    ).toThrow(/caption exceeds maximum length of 2200/);
  });

  it("rejects whitespace-only caption", () => {
    expect(() =>
      validateField("   ", LIMITS.CAPTION_MAX, "caption")
    ).toThrow(/caption cannot be empty/);
  });

  it("accepts caption at exactly CAPTION_MAX length", () => {
    const exactCaption = "a".repeat(LIMITS.CAPTION_MAX);
    expect(() =>
      validateField(exactCaption, LIMITS.CAPTION_MAX, "caption")
    ).not.toThrow();
  });
});

describe("addComment content validation", () => {
  it("accepts valid comment", () => {
    expect(() =>
      validateField("Nice photo!", LIMITS.COMMENT_MAX, "comment")
    ).not.toThrow();
  });

  it("rejects comment exceeding COMMENT_MAX", () => {
    const longComment = "x".repeat(LIMITS.COMMENT_MAX + 1);
    expect(() =>
      validateField(longComment, LIMITS.COMMENT_MAX, "comment")
    ).toThrow(/comment exceeds maximum length of 1000/);
  });

  it("rejects empty comment", () => {
    expect(() =>
      validateField("", LIMITS.COMMENT_MAX, "comment")
    ).toThrow(/comment cannot be empty/);
  });

  it("rejects whitespace-only comment", () => {
    expect(() =>
      validateField("\t\n  ", LIMITS.COMMENT_MAX, "comment")
    ).toThrow(/comment cannot be empty/);
  });
});

describe("createUser / updateProfile username validation", () => {
  it("accepts valid username", () => {
    expect(() =>
      validateField("john_doe", LIMITS.USERNAME_MAX, "username")
    ).not.toThrow();
  });

  it("rejects username exceeding USERNAME_MAX", () => {
    const longUsername = "u".repeat(LIMITS.USERNAME_MAX + 1);
    expect(() =>
      validateField(longUsername, LIMITS.USERNAME_MAX, "username")
    ).toThrow(/username exceeds maximum length of 30/);
  });

  it("rejects empty username", () => {
    expect(() =>
      validateField("", LIMITS.USERNAME_MAX, "username")
    ).toThrow(/username cannot be empty/);
  });

  it("accepts username at exactly USERNAME_MAX length", () => {
    const exactUsername = "a".repeat(LIMITS.USERNAME_MAX);
    expect(() =>
      validateField(exactUsername, LIMITS.USERNAME_MAX, "username")
    ).not.toThrow();
  });
});

describe("createUser / updateProfile bio validation", () => {
  it("accepts valid bio", () => {
    expect(() =>
      validateMaxLength("I love photography", LIMITS.BIO_MAX, "bio")
    ).not.toThrow();
  });

  it("rejects bio exceeding BIO_MAX", () => {
    const longBio = "b".repeat(LIMITS.BIO_MAX + 1);
    expect(() =>
      validateMaxLength(longBio, LIMITS.BIO_MAX, "bio")
    ).toThrow(/bio exceeds maximum length of 150/);
  });

  it("accepts bio at exactly BIO_MAX length", () => {
    const exactBio = "b".repeat(LIMITS.BIO_MAX);
    expect(() =>
      validateMaxLength(exactBio, LIMITS.BIO_MAX, "bio")
    ).not.toThrow();
  });

  it("bio uses validateMaxLength only (empty bio allowed since optional)", () => {
    // Bio is optional, so empty string should not fail validateMaxLength
    expect(() =>
      validateMaxLength("", LIMITS.BIO_MAX, "bio")
    ).not.toThrow();
  });
});
