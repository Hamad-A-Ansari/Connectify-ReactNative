import { internalAction } from "./_generated/server";
import { v } from "convex/values";

export const sendChildSafetyAlert = internalAction({
  args: {
    reporterUsername: v.string(),
    reporterEmail: v.string(),
    postId: v.string(),
    postImageUrl: v.string(),
    postOwnerUsername: v.string(),
  },
  handler: async (_ctx, args) => {
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.warn("RESEND_API_KEY not configured. Skipping child safety alert email.");
      return;
    }

    const emailBody = `
⚠️ CHILD SAFETY REPORT

A user has flagged content as a potential child safety / CSAE concern.

Reporter: ${args.reporterUsername} (${args.reporterEmail})
Post Owner: ${args.postOwnerUsername}
Post ID: ${args.postId}
Post Image: ${args.postImageUrl}

Action Required: Review this content immediately and take appropriate action per your child safety policy.

This is an automated alert from Connectify.
    `.trim();

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "Connectify Alerts <onboarding@resend.dev>",
          to: ["hamad.ansarif90@gmail.com"],
          subject: "🚨 Child Safety Report - Immediate Review Required",
          text: emailBody,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to send child safety alert email:", errorText);
      } else {
        console.log("Child safety alert email sent successfully.");
      }
    } catch (error) {
      console.error("Error sending child safety alert email:", error);
    }
  },
});
