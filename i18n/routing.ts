import { defineRouting } from "next-intl/routing";

// Locale detection order (handled by next-intl's proxy):
// 1. NEXT_LOCALE cookie (set when the user picks a language)
// 2. Browser `Accept-Language` header
// 3. `defaultLocale` when none of the browser's languages are supported
export const routing = defineRouting({
  // Keep in sync with LANGUAGES in lang.js
  locales: [
    "ja",
    "en",
    "zh-TW",
    "zh-CN",
    "ko",
    "vi",
    "th",
    "id",
    "ru",
    "es",
    "pt-BR",
    "de",
    "fr",
    "it",
    "pl",
  ],
  defaultLocale: "ja",
  localeCookie: {
    // Persist the user's choice instead of a session-only cookie
    maxAge: 60 * 60 * 24 * 365,
  },
});
