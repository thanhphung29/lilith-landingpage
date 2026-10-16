import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { corsHeaders } from "./lib/cors";

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

  return handleI18nRouting(request);
}

export const config = {
  matcher: ["/api/:path*", "/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
