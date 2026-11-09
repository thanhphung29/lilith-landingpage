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

  // Applications are over: /<locale>/cbt/apply goes back to that locale's top page (/<locale>/cbt)
  const applyPage = request.nextUrl.pathname.match(/^\/([^/]+)\/cbt\/apply\/?$/);
  if (applyPage && isApplyClosed()) {
    // Behind Docker/a reverse proxy request.url can carry the wrong host, so SITE_URL wins when set
    const base = process.env.SITE_URL?.trim() || request.url;
    return NextResponse.redirect(new URL(`/${applyPage[1]}/cbt`, base));
  }

  // The top page is /<locale>/cbt: the bare /<locale> goes there ...
  const bareLocale = request.nextUrl.pathname.match(/^\/([^/]+)\/?$/);
  if (bareLocale && (routing.locales as readonly string[]).includes(bareLocale[1])) {
    const target = request.nextUrl.clone();
    target.pathname = `/${bareLocale[1]}/cbt`;
    return NextResponse.redirect(target);
  }

  // ... and so does "/": next-intl sends it to /<locale> (by cookie / Accept-Language), so point
  // that redirect at /<locale>/cbt directly instead of going through a second redirect
  const response = handleI18nRouting(request);
  const location = response.headers.get("location");
  if (location) {
    const target = new URL(location, request.url);
    if (/^\/[^/]+\/?$/.test(target.pathname)) {
      target.pathname = `${target.pathname.replace(/\/$/, "")}/cbt`;
      response.headers.set("location", target.toString());
    }
  }
  return response;
}

export const config = {
  matcher: ["/api/:path*", "/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
