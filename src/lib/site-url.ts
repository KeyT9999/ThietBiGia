export function getSiteUrl(): URL {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
    "https://profile-tgb.vercel.app",
  ];

  for (const candidate of candidates) {
    if (!candidate?.trim()) continue;
    try {
      const value = candidate.trim();
      const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
      if (url.protocol === "https:" || url.protocol === "http:") return url;
    } catch {
      // Skip invalid configuration and use the next deployment URL.
    }
  }
  return new URL("https://profile-tgb.vercel.app");
}
