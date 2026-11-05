// Email: RFC 5321 limits (also what Gmail/Google follow): whole address <= 254 chars, local part <= 64.
// ASCII only; local part uses RFC 5322 "atext" characters with no leading/trailing/double dots;
// domain labels are letters/digits/hyphens (not starting or ending with "-", <= 63 chars) and the
// last label (TLD) is letters only (or punycode "xn--"), at least 2 chars.
export const EMAIL_MAX_LENGTH = 254;
const EMAIL_LOCAL_RE = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/;
const EMAIL_LABEL_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/;
const EMAIL_TLD_RE = /^(?:[A-Za-z]{2,63}|xn--[A-Za-z0-9-]{1,59})$/;

export function isValidEmail(value: string) {
  if (value.length > EMAIL_MAX_LENGTH) return false;
  const at = value.indexOf("@");
  if (at < 1 || at !== value.lastIndexOf("@")) return false;
  const local = value.slice(0, at);
  const labels = value.slice(at + 1).split(".");
  return (
    local.length <= 64 &&
    EMAIL_LOCAL_RE.test(local) &&
    labels.length >= 2 &&
    labels.every((label) => EMAIL_LABEL_RE.test(label)) &&
    EMAIL_TLD_RE.test(labels[labels.length - 1])
  );
}

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
