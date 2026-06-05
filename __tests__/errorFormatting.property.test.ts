jest.unmock("@/lib/errorFormatter");
import * as fc from "fast-check";
import { formatErrorForUser } from "../lib/errorFormatter";

// Feature: production-readiness-p0, Property 8: Error messages contain no raw objects or stack traces
// **Validates: Requirements 6.4**

const GENERIC_MESSAGE = "Something went wrong. Please try again.";

/**
 * Helper to assert the formatted output meets all safety constraints.
 */
function assertOutputIsSafe(output: string): void {
  // Must be a non-empty string
  expect(typeof output).toBe("string");
  expect(output.length).toBeGreaterThan(0);

  // Must NOT contain "[object Object]"
  expect(output).not.toContain("[object Object]");

  // Must NOT contain file path patterns (e.g., /path/to/file.ts:123)
  expect(output).not.toMatch(/\/[\w./:-]+\.\w+:\d+/);

  // Must NOT contain lines starting with "at " (stack trace indicator)
  const lines = output.split("\n");
  for (const line of lines) {
    expect(line.trimStart()).not.toMatch(/^at\s+/);
  }

  // Must NOT start with "Error: "
  expect(output.startsWith("Error: ")).toBe(false);
}

describe("Property 8: Error messages contain no raw objects or stack traces", () => {
  describe("Error objects with arbitrary messages", () => {
    it("formats random Error objects safely", () => {
      fc.assert(
        fc.property(fc.string({ minLength: 0, maxLength: 500 }), (message) => {
          const error = new Error(message);
          const output = formatErrorForUser(error);
          assertOutputIsSafe(output);
        }),
        { numRuns: 100 }
      );
    });

    it("formats Error objects with embedded stack traces safely", () => {
      // Generate messages that contain stack trace-like content
      const stackTraceMessage = fc
        .tuple(
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.array(
            fc.tuple(
              fc.string({ minLength: 1, maxLength: 30 }),
              fc.string({ minLength: 1, maxLength: 50 }),
              fc.nat({ max: 9999 })
            ),
            { minLength: 1, maxLength: 5 }
          )
        )
        .map(([msg, frames]) => {
          const stackLines = frames.map(
            ([fn, file, line]) => `    at ${fn} (/${file}.ts:${line})`
          );
          return `${msg}\n${stackLines.join("\n")}`;
        });

      fc.assert(
        fc.property(stackTraceMessage, (message) => {
          const error = new Error(message);
          error.message = message; // Ensure the multi-line message is set
          const output = formatErrorForUser(error);
          assertOutputIsSafe(output);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe("Plain objects", () => {
    it("formats random plain objects safely", () => {
      // Generate arbitrary objects (without a string message property)
      const plainObjectArb = fc.oneof(
        fc.record({
          code: fc.nat(),
          detail: fc.string(),
        }),
        fc.record({
          error: fc.boolean(),
          data: fc.anything(),
        }),
        fc.record({
          status: fc.nat(),
        }),
        fc.constant({}),
        fc.constant(null),
        fc.constant(undefined)
      );

      fc.assert(
        fc.property(plainObjectArb, (obj) => {
          const output = formatErrorForUser(obj);
          assertOutputIsSafe(output);
        }),
        { numRuns: 100 }
      );
    });

    it("formats objects with message property safely", () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 300 }),
          (message) => {
            const obj = { message };
            const output = formatErrorForUser(obj);
            assertOutputIsSafe(output);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe("Strings with stack trace patterns", () => {
    it("formats strings containing stack trace patterns safely", () => {
      const stackTraceString = fc
        .tuple(
          fc.string({ minLength: 0, maxLength: 100 }),
          fc.array(
            fc.tuple(
              fc.constantFrom(
                "Object.run",
                "Module._compile",
                "processTicksAndRejections",
                "async Promise.all"
              ),
              fc.constantFrom(
                "/src/app.ts",
                "/node_modules/lib/index.js",
                "/home/user/project/file.tsx",
                "C:/Users/dev/project/main.ts"
              ),
              fc.nat({ max: 9999 })
            ),
            { minLength: 1, maxLength: 8 }
          )
        )
        .map(([prefix, frames]) => {
          const stackLines = frames.map(
            ([fn, file, line]) => `    at ${fn} (${file}:${line})`
          );
          return `${prefix}\n${stackLines.join("\n")}`;
        });

      fc.assert(
        fc.property(stackTraceString, (input) => {
          const output = formatErrorForUser(input);
          assertOutputIsSafe(output);
        }),
        { numRuns: 100 }
      );
    });

    it("formats strings containing [object Object] safely", () => {
      fc.assert(
        fc.property(
          fc.tuple(
            fc.string({ minLength: 0, maxLength: 100 }),
            fc.string({ minLength: 0, maxLength: 100 })
          ),
          ([prefix, suffix]) => {
            const input = `${prefix}[object Object]${suffix}`;
            const output = formatErrorForUser(input);
            assertOutputIsSafe(output);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("formats strings with file path patterns safely", () => {
      const filePathString = fc
        .tuple(
          fc.string({ minLength: 0, maxLength: 50 }),
          fc.constantFrom(
            "/src/components/Post.tsx:42",
            "/lib/errorFormatter.ts:10",
            "/node_modules/react/index.js:556",
            "/app/(tabs)/create.tsx:99"
          ),
          fc.string({ minLength: 0, maxLength: 50 })
        )
        .map(([prefix, path, suffix]) => `${prefix}${path}${suffix}`);

      fc.assert(
        fc.property(filePathString, (input) => {
          const output = formatErrorForUser(input);
          assertOutputIsSafe(output);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe("Mixed/arbitrary inputs", () => {
    it("formats any arbitrary value safely", () => {
      fc.assert(
        fc.property(fc.anything(), (input) => {
          const output = formatErrorForUser(input);
          assertOutputIsSafe(output);
        }),
        { numRuns: 200 }
      );
    });
  });
});
