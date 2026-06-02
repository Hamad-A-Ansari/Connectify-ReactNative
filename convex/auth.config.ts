const clerkIssuerUrl = process.env.CLERK_ISSUER_URL;

if (!clerkIssuerUrl) {
  throw new Error(
    "Missing CLERK_ISSUER_URL environment variable. " +
    "Set it in your Convex dashboard under Environment Variables."
  );
}

export default {
  providers: [
    {
      domain: clerkIssuerUrl,
      applicationID: "convex",
    },
  ]
};
