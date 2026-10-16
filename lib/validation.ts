export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Discord usernames: 6-32 chars of a-z, 0-9, "_" and "."; no two "." in a row
export const DISCORD_RE = /^(?!.*\.\.)[a-z0-9_.]{6,32}$/;

export function normalizeDiscord(value: string) {
  return value.trim().replace(/^@/, "").toLowerCase();
}
