"use client";

import { type Locale, useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import localeNames from "@/i18n/locale-names.json";
import { routing } from "@/i18n/routing";

// Japanese, English, Simplified Chinese, Traditional Chinese first; the rest in routing order
const FIRST_LOCALES: (typeof routing.locales)[number][] = ["ja", "en", "zh-CN", "zh-TW"];
const LOCALES: (typeof routing.locales)[number][] = [
  ...FIRST_LOCALES,
  ...routing.locales.filter((l) => !FIRST_LOCALES.includes(l)),
];

export default function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <label className="relative flex h-9 w-[78px] leading-none shrink-0 items-center gap-2 rounded border border-gothic-border bg-gothic-navy/90 transition-colors sm:w-[180px] hover:border-gothic-gold">
      {/* Mobile: the box is too narrow for the full name, so it shows the code only, while the
          (invisible) select on top opens a list of language names */}
      <span className="pointer-events-none flex-1 pl-2 text-xs text-gothic-ivory sm:hidden" aria-hidden="true">
        {locale.toUpperCase()}
      </span>
      <i className="fa-solid fa-chevron-down pointer-events-none pr-2 text-[10px] text-gothic-ivory/70 sm:hidden!" aria-hidden="true" />
      <select
        className="absolute inset-0 h-full w-full cursor-pointer opacity-[0.01] sm:hidden"
        value={locale}
        aria-label={t("label")}
        onChange={(e) =>
          router.replace(pathname, { locale: e.target.value as Locale })
        }
      >
        {LOCALES.map((l) => (
          <option key={l} value={l} className="bg-gothic-navy">
            {localeNames[l]}
          </option>
        ))}
      </select>
      {/* Each language's own name only, e.g. "English", "日本語" */}
      <select
        className="hidden h-full w-full cursor-pointer appearance-none bg-transparent pr-8 pl-3 text-xs text-gothic-ivory focus:outline-none sm:text-sm sm:block"
        value={locale}
        aria-label={t("label")}
        onChange={(e) =>
          router.replace(pathname, { locale: e.target.value as Locale })
        }
      >
        {LOCALES.map((l) => (
          <option key={l} value={l} className="bg-gothic-navy">
            {localeNames[l]}
          </option>
        ))}
      </select>
      {/* PC: custom arrow, 10px from the right edge */}
      <i
        className="fa-solid fa-chevron-down pointer-events-none absolute top-1/2 right-[10px] -translate-y-1/2 text-[10px] text-gothic-ivory/70 max-sm:hidden!"
        aria-hidden="true"
      />
    </label>
  );
}
