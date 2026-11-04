import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { corsHeaders } from "./lib/cors";
import { isApplyClosed } from "./lib/event";

const handleI18nRouting = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  // CORS for every API route: answer preflights here and add the headers to real responses
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const headers = corsHeaders(request);
    if (request.method === "OPTIONS") return new NextResponse(null, { status: 204, headers });

    const response = NextResponse.next();
    for (const [name, value] of Object.entries(headers)) response.headers.set(name, value);
    return response;
  }

  // Applications are over: /<locale>/apply goes back to that locale's top page
  const applyPage = request.nextUrl.pathname.match(/^\/([^/]+)\/apply\/?$/);
  if (applyPage && isApplyClosed()) {
    // Behind Docker/a reverse proxy request.url can carry the wrong host, so SITE_URL wins when set
    const base = process.env.SITE_URL?.trim() || request.url;
    return NextResponse.redirect(new URL(`/${applyPage[1]}`, base));
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: ["/api/:path*", "/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
