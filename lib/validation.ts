export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Discord usernames (https://discord.com/blog/usernames, https://docs.discord.com/developers/resources/user):
// 2-32 chars, only lowercase a-z, 0-9, "_" and "."; no two "." in a row;
// cannot contain "discord" and cannot be "everyone" or "here".
export const DISCORD_RE = /^(?!.*\.\.)[a-z0-9_.]{2,32}$/;
const DISCORD_RESERVED_NAMES = ["everyone", "here"];

export function isValidDiscord(value: string) {
  return (
    DISCORD_RE.test(value) && !value.includes("discord") && !DISCORD_RESERVED_NAMES.includes(value)
  );
}

// Only trims whitespace and a leading "@" (a common paste); the case is NOT changed,
// because uppercase letters mean a display name, not a username.
export function normalizeDiscord(value: string) {
  return value.trim().replace(/^@/, "");
}
