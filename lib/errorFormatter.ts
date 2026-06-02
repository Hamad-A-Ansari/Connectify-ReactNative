const GENERIC_MESSAGE = "Something went wrong. Please try again.";

/**
 * Patterns that indicate stack traces or file paths in error messages.
 */
const STACK_TRACE_LINE = /^\s*at\s+.*/;
const FILE_PATH_PATTERN = /\/[\w./:-]+\.\w+:\d+/;

/**
 * Known error message mappings. If the raw message contains the key pattern,
 * the corresponding friendly message is returned.
 */
const KNOWN_ERROR_MAPPINGS: Array<{ pattern: RegExp; message: string }> = [
  {
    pattern: /network|fetch/i,
    message: "Check your internet connection and try again.",
  },
  {
    pattern: /unauthorized|Unauthorized/,
    message: "You need to sign in to do that.",
  },
];

/**
 * Patterns that indicate the message is already user-friendly and should pass through.
 */
const PASSTHROUGH_PATTERNS: RegExp[] = [
  /cannot be empty/,
  /exceeds maximum length/,
  /cannot interact/,
];

/**
 * Sanitize a raw error string by removing stack traces, file paths,
 * "[object Object]", and "Error: " prefixes.
 */
function sanitize(message: string): string {
  // Replace "[object Object]" with generic message
  if (message.includes("[object Object]")) {
    return GENERIC_MESSAGE;
  }

  // Remove lines that look like stack traces
  const lines = message.split("\n");
  const cleaned = lines.filter(
    (line) => !STACK_TRACE_LINE.test(line) && !FILE_PATH_PATTERN.test(line)
  );

  let result = cleaned.join("\n").trim();

  // Remove "Error: " prefix
  if (result.startsWith("Error: ")) {
    result = result.slice(7);
  }

  return result || GENERIC_MESSAGE;
}

/**
 * Format an error into a user-friendly message string.
 *
 * Handles:
 * - Error objects (extracts message, strips stack traces)
 * - Plain objects (avoids "[object Object]")
 * - Strings (sanitizes directly)
 * - Unknown types (returns generic message)
 */
export function formatErrorForUser(error: unknown): string {
  let rawMessage: string;

  if (error instanceof Error) {
    rawMessage = error.message;
  } else if (typeof error === "string") {
    rawMessage = error;
  } else if (
    error !== null &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    rawMessage = (error as { message: string }).message;
  } else {
    return GENERIC_MESSAGE;
  }

  // Check passthrough patterns first (already user-friendly messages)
  for (const pattern of PASSTHROUGH_PATTERNS) {
    if (pattern.test(rawMessage)) {
      return sanitize(rawMessage);
    }
  }

  // Check known error mappings
  for (const { pattern, message } of KNOWN_ERROR_MAPPINGS) {
    if (pattern.test(rawMessage)) {
      return message;
    }
  }

  // Sanitize and return, falling back to generic if empty
  const sanitized = sanitize(rawMessage);
  return sanitized || GENERIC_MESSAGE;
}
