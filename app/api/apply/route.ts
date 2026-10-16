import { DISCORD_RE, EMAIL_RE, normalizeDiscord } from "@/lib/validation";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function POST(request: Request) {
  let body: { email?: unknown; discord?: unknown; token?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "invalid_request" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const discord = typeof body.discord === "string" ? normalizeDiscord(body.discord) : "";
  const token = typeof body.token === "string" ? body.token : "";

  if (!EMAIL_RE.test(email) || !DISCORD_RE.test(discord)) {
    return Response.json({ ok: false, error: "invalid_request" }, { status: 400 });
  }
  if (!token) {
    return Response.json({ ok: false, error: "captcha_required" }, { status: 400 });
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error("TURNSTILE_SECRET_KEY is not set");
    return Response.json({ ok: false, error: "server_error" }, { status: 500 });
  }

  const params = new URLSearchParams({ secret, response: token });
  const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (ip) params.set("remoteip", ip);

  let verified = false;
  try {
    const res = await fetch(VERIFY_URL, { method: "POST", body: params });
    const result: { success?: boolean } = await res.json();
    verified = result.success === true;
  } catch (err) {
    console.error("Turnstile verification request failed", err);
    return Response.json({ ok: false, error: "server_error" }, { status: 502 });
  }

  if (!verified) {
    return Response.json({ ok: false, error: "captcha_failed" }, { status: 400 });
  }

  // TODO: store the application (email, discord)
  return Response.json({ ok: true });
}
