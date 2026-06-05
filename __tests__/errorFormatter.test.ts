jest.unmock("@/lib/errorFormatter");
import { formatErrorForUser } from "../lib/errorFormatter";

describe("formatErrorForUser", () => {
  describe("Error objects", () => {
    it("extracts message from Error objects", () => {
      const error = new Error("cannot be empty");
      expect(formatErrorForUser(error)).toBe("cannot be empty");
    });

    it("strips stack trace lines from error messages", () => {
      const error = new Error("Something failed");
      // Simulate a multi-line message with stack trace info
      error.message =
        "Something failed\n    at Object.run (/path/to/file.ts:123)\n    at main (/app/index.ts:5)";
      expect(formatErrorForUser(error)).toBe("Something failed");
    });

    it("removes 'Error: ' prefix", () => {
      const error = new Error("Error: bad input");
      error.message = "Error: bad input";
      expect(formatErrorForUser(error)).toBe("bad input");
    });
  });

  describe("plain objects", () => {
    it("returns generic message for plain objects without message", () => {
      expect(formatErrorForUser({ code: 500 })).toBe(
        "Something went wrong. Please try again."
      );
    });

    it("extracts message property from object-like errors", () => {
      expect(
        formatErrorForUser({ message: "caption cannot be empty" })
      ).toBe("caption cannot be empty");
    });

    it("returns generic message for null", () => {
      expect(formatErrorForUser(null)).toBe(
        "Something went wrong. Please try again."
      );
    });

    it("returns generic message for undefined", () => {
      expect(formatErrorForUser(undefined)).toBe(
        "Something went wrong. Please try again."
      );
    });
  });

  describe("strings", () => {
    it("uses string directly after sanitizing", () => {
      expect(formatErrorForUser("username cannot be empty")).toBe(
        "username cannot be empty"
      );
    });

    it("strips stack trace from string input", () => {
      const input =
        "Failed\n    at Module.run (/src/app.ts:42)\n    at process (/node_modules/lib.js:10)";
      expect(formatErrorForUser(input)).toBe("Failed");
    });

    it("replaces [object Object] with generic message", () => {
      expect(formatErrorForUser("[object Object]")).toBe(
        "Something went wrong. Please try again."
      );
    });
  });

  describe("unknown types", () => {
    it("returns generic message for number", () => {
      expect(formatErrorForUser(42)).toBe(
        "Something went wrong. Please try again."
      );
    });

    it("returns generic message for boolean", () => {
      expect(formatErrorForUser(true)).toBe(
        "Something went wrong. Please try again."
      );
    });
  });

  describe("known error mappings", () => {
    it("maps network errors to connectivity message", () => {
      expect(formatErrorForUser(new Error("network request failed"))).toBe(
        "Check your internet connection and try again."
      );
    });

    it("maps fetch errors to connectivity message", () => {
      expect(formatErrorForUser(new Error("fetch failed"))).toBe(
        "Check your internet connection and try again."
      );
    });

    it("maps unauthorized errors to sign-in message", () => {
      expect(formatErrorForUser(new Error("unauthorized access"))).toBe(
        "You need to sign in to do that."
      );
    });

    it("maps Unauthorized errors to sign-in message", () => {
      expect(formatErrorForUser(new Error("Unauthorized"))).toBe(
        "You need to sign in to do that."
      );
    });
  });

  describe("passthrough patterns", () => {
    it("passes through 'cannot be empty' messages", () => {
      expect(formatErrorForUser(new Error("username cannot be empty"))).toBe(
        "username cannot be empty"
      );
    });

    it("passes through 'exceeds maximum length' messages", () => {
      expect(
        formatErrorForUser(
          new Error("caption exceeds maximum length of 2200 characters")
        )
      ).toBe("caption exceeds maximum length of 2200 characters");
    });

    it("passes through 'cannot interact' messages", () => {
      expect(
        formatErrorForUser(
          new Error("You cannot interact with this user's content")
        )
      ).toBe("You cannot interact with this user's content");
    });
  });

  describe("sanitization", () => {
    it("removes file path patterns from messages", () => {
      const input = "Error occurred at /src/components/Post.tsx:45";
      expect(formatErrorForUser(input)).not.toContain("/src/components/");
    });

    it("handles empty string by returning generic message", () => {
      expect(formatErrorForUser("")).toBe(
        "Something went wrong. Please try again."
      );
    });
  });
});
