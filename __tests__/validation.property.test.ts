import * as fc from "fast-check";
import {
  LIMITS,
  validateNonEmpty,
  validateMaxLength,
  validateField,
} from "../convex/validation";

// Feature: production-readiness-p0, Property 6: Max length validation rejects oversized input
// **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.6**
describe("Property 6: Max length validation rejects oversized input", () => {
  const fields: Array<{ name: string; max: number }> = [
    { name: "caption", max: LIMITS.CAPTION_MAX },
    { name: "comment", max: LIMITS.COMMENT_MAX },
    { name: "username", max: LIMITS.USERNAME_MAX },
    { name: "bio", max: LIMITS.BIO_MAX },
  ];

  for (const field of fields) {
    it(`rejects ${field.name} exceeding ${field.max} characters`, () => {
      fc.assert(
        fc.property(
          // Generate strings with length between max+1 and max+1000
          fc.string({ minLength: field.max + 1, maxLength: field.max + 1000 }),
          (oversizedInput) => {
            expect(() =>
              validateMaxLength(oversizedInput, field.max, field.name)
            ).toThrow();

            try {
              validateMaxLength(oversizedInput, field.max, field.name);
            } catch (error: unknown) {
              const message = (error as Error).message;
              // Error message must contain field name
              expect(message).toContain(field.name);
              // Error message must contain the max length value
              expect(message).toContain(String(field.max));
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it(`rejects ${field.name} via validateField when exceeding ${field.max} characters`, () => {
      fc.assert(
        fc.property(
          // Generate non-whitespace strings exceeding max length
          fc.string({ minLength: field.max + 1, maxLength: field.max + 1000 }).filter(
            (s) => s.trim().length > 0
          ),
          (oversizedInput) => {
            expect(() =>
              validateField(oversizedInput, field.max, field.name)
            ).toThrow();

            try {
              validateField(oversizedInput, field.max, field.name);
            } catch (error: unknown) {
              const message = (error as Error).message;
              expect(message).toContain(field.name);
              expect(message).toContain(String(field.max));
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  }
});

// Feature: production-readiness-p0, Property 7: Whitespace-only content rejected
// **Validates: Requirements 5.5**
describe("Property 7: Whitespace-only content rejected", () => {
  // Generate strings composed entirely of whitespace characters
  const whitespaceArb = fc
    .array(fc.constantFrom(" ", "\t", "\n", "\r", "\f", "\v"), { minLength: 0, maxLength: 50 })
    .map((chars) => chars.join(""));

  const requiredFields: Array<{ name: string; max: number }> = [
    { name: "caption", max: LIMITS.CAPTION_MAX },
    { name: "comment", max: LIMITS.COMMENT_MAX },
    { name: "username", max: LIMITS.USERNAME_MAX },
  ];

  it("rejects empty string for any required field", () => {
    for (const field of requiredFields) {
      expect(() => validateNonEmpty("", field.name)).toThrow();
    }
  });

  for (const field of requiredFields) {
    it(`rejects whitespace-only strings for ${field.name}`, () => {
      fc.assert(
        fc.property(whitespaceArb, (whitespaceInput) => {
          expect(() =>
            validateNonEmpty(whitespaceInput, field.name)
          ).toThrow();

          try {
            validateNonEmpty(whitespaceInput, field.name);
          } catch (error: unknown) {
            const message = (error as Error).message;
            // Error message must contain field name
            expect(message).toContain(field.name);
          }
        }),
        { numRuns: 100 }
      );
    });

    it(`rejects whitespace-only strings via validateField for ${field.name}`, () => {
      fc.assert(
        fc.property(whitespaceArb, (whitespaceInput) => {
          expect(() =>
            validateField(whitespaceInput, field.max, field.name)
          ).toThrow();

          try {
            validateField(whitespaceInput, field.max, field.name);
          } catch (error: unknown) {
            const message = (error as Error).message;
            expect(message).toContain(field.name);
          }
        }),
        { numRuns: 100 }
      );
    });
  }
});
