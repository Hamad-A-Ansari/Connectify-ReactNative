import {
  LIMITS,
  validateNonEmpty,
  validateMaxLength,
  validateField,
} from "../convex/validation";

describe("LIMITS", () => {
  it("has correct values for all fields", () => {
    expect(LIMITS.CAPTION_MAX).toBe(2200);
    expect(LIMITS.COMMENT_MAX).toBe(1000);
    expect(LIMITS.USERNAME_MAX).toBe(30);
    expect(LIMITS.BIO_MAX).toBe(150);
  });
});

describe("validateNonEmpty", () => {
  it("throws when value is empty string", () => {
    expect(() => validateNonEmpty("", "caption")).toThrow(
      "caption cannot be empty"
    );
  });

  it("throws when value is whitespace only", () => {
    expect(() => validateNonEmpty("   ", "comment")).toThrow(
      "comment cannot be empty"
    );
  });

  it("throws when value is tabs and newlines only", () => {
    expect(() => validateNonEmpty("\t\n\r ", "username")).toThrow(
      "username cannot be empty"
    );
  });

  it("does not throw for valid non-empty value", () => {
    expect(() => validateNonEmpty("hello", "caption")).not.toThrow();
  });

  it("includes field name in error message", () => {
    expect(() => validateNonEmpty("", "bio")).toThrow("bio");
  });
});

describe("validateMaxLength", () => {
  it("throws when value exceeds max length", () => {
    const longString = "a".repeat(2201);
    expect(() => validateMaxLength(longString, 2200, "caption")).toThrow(
      "caption exceeds maximum length of 2200 characters"
    );
  });

  it("does not throw when value is exactly at max length", () => {
    const exactString = "a".repeat(2200);
    expect(() =>
      validateMaxLength(exactString, 2200, "caption")
    ).not.toThrow();
  });

  it("does not throw when value is under max length", () => {
    expect(() => validateMaxLength("short", 2200, "caption")).not.toThrow();
  });

  it("includes field name and max in error message", () => {
    const longString = "a".repeat(31);
    expect(() => validateMaxLength(longString, 30, "username")).toThrow(
      "username exceeds maximum length of 30 characters"
    );
  });
});

describe("validateField", () => {
  it("throws for empty value", () => {
    expect(() => validateField("", 2200, "caption")).toThrow(
      "caption cannot be empty"
    );
  });

  it("throws for whitespace-only value", () => {
    expect(() => validateField("   ", 1000, "comment")).toThrow(
      "comment cannot be empty"
    );
  });

  it("throws for value exceeding max length", () => {
    const longString = "a".repeat(1001);
    expect(() => validateField(longString, 1000, "comment")).toThrow(
      "comment exceeds maximum length of 1000 characters"
    );
  });

  it("does not throw for valid value within limits", () => {
    expect(() => validateField("valid content", 2200, "caption")).not.toThrow();
  });

  it("validates non-empty before max length", () => {
    // Empty string should trigger non-empty error, not max-length
    expect(() => validateField("", 10, "username")).toThrow(
      "username cannot be empty"
    );
  });
});
