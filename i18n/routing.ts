import { defineRouting } from "next-intl/routing";

// Locale detection order (handled by next-intl's proxy):
// 1. NEXT_LOCALE cookie (set when the user picks a language)
// 2. Browser `Accept-Language` header
// 3. `defaultLocale` when none of the browser's languages are supported
export const routing = defineRouting({
  // Keep in sync with LANGUAGES in lang.js. Order = column order of the Google Sheet
  // (also the order of the language select).
  locales: [
    "en",
    "ja",
    "zh-TW",
    "ko",
    "zh-CN",
    "vi",
    "ru",
    "es",
    "pt-BR",
    "de",
    "fr",
    "pl",
    "th",
    "it",
    "id",
  ],
  defaultLocale: "en",
  localeCookie: {
    // Persist the user's choice instead of a session-only cookie
    maxAge: 60 * 60 * 24 * 365,
  },
});
