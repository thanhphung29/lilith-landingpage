// Origins allowed to call the API from a browser: local dev and the production site
const ALLOWED_ORIGINS = ["https://lilith-landingpage.vercel.app"];
const LOCAL_ORIGIN_RE = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

export function corsHeaders(request: Request): Record<string, string> {
  // The response depends on the Origin header, so caches must key on it
  const headers: Record<string, string> = { Vary: "Origin" };
  const origin = request.headers.get("origin");
  if (origin && (ALLOWED_ORIGINS.includes(origin) || LOCAL_ORIGIN_RE.test(origin))) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type";
    headers["Access-Control-Max-Age"] = "86400";
  }
  return headers;
}
