import { internalAction } from "./_generated/server";
import { v } from "convex/values";

// Internal action to moderate an image using an external moderation API.
// On API failure or timeout, defaults to safe (fail-open) and logs a warning.
export const moderateImage = internalAction({
  args: { imageUrl: v.string() },
  handler: async (_ctx, args): Promise<{ safe: boolean; reason?: string }> => {
    const moderationApiUrl = process.env.MODERATION_API_URL;

    if (!moderationApiUrl) {
      console.warn(
        "MODERATION_API_URL not configured. Skipping moderation check."
      );
      return { safe: true };
    }

    const TIMEOUT_MS = 10_000;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch(moderationApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl: args.imageUrl }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(
          `Moderation API returned status ${response.status}. Allowing image for manual review.`
        );
        return { safe: true };
      }

      const result = await response.json();

      // Expected response shape: { safe: boolean, reason?: string }
      if (typeof result.safe === "boolean") {
        if (!result.safe) {
          return { safe: false, reason: result.reason ?? "Content policy violation" };
        }
        return { safe: true };
      }

      // Unexpected response format — fail open
      console.warn(
        "Moderation API returned unexpected response format. Allowing image for manual review."
      );
      return { safe: true };
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") {
        console.warn(
          "Moderation API request timed out. Allowing image for manual review."
        );
      } else {
        console.warn(
          "Moderation API request failed. Allowing image for manual review.",
          error
        );
      }
      return { safe: true };
    }
  },
});
