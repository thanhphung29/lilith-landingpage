// The site's public URL, from the environment: SITE_URL first, then the production domain that
// Vercel provides on its own. null when neither is set (local dev).
export function getSiteUrl(): string | null {
  const configured = process.env.SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  const vercelDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelDomain) return `https://${vercelDomain}`;
  return null;
}
