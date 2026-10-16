"use client";

import { type Locale, useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import localeNames from "@/i18n/locale-names.json";
import { routing } from "@/i18n/routing";

export default function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <label className="flex h-9 w-[76px] leading-none shrink-0 items-center gap-2 rounded border border-gothic-border bg-gothic-navy/90 px-2 transition-colors sm:w-[160px] sm:px-3 hover:border-gothic-gold">
      <span className="sr-only">{t("label")}</span>
      {/* Mobile is too narrow for the full name: show the code only */}
      <select
        className="h-full w-full cursor-pointer bg-transparent text-xs text-gothic-ivory focus:outline-none sm:hidden"
        value={locale}
        onChange={(e) =>
          router.replace(pathname, { locale: e.target.value as Locale })
        }
      >
        {routing.locales.map((l) => (
          <option key={l} value={l} className="bg-gothic-navy">
            {l.toUpperCase()}
          </option>
        ))}
      </select>
      {/* Same format as the design: "EN (English)" */}
      <select
        className="hidden h-full w-full cursor-pointer bg-transparent text-xs text-gothic-ivory focus:outline-none sm:text-sm sm:block"
        value={locale}
        onChange={(e) =>
          router.replace(pathname, { locale: e.target.value as Locale })
        }
      >
        {routing.locales.map((l) => (
          <option key={l} value={l} className="bg-gothic-navy">
            {l.toUpperCase()} ({localeNames[l]})
          </option>
        ))}
      </select>
    </label>
  );
}
