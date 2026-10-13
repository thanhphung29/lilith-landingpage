"use client";

import { type Locale, useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export default function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
      {t("label")}
      <select
        className="rounded-md border border-black/[.08] bg-transparent px-2 py-1 dark:border-white/[.145]"
        value={locale}
        onChange={(e) =>
          router.replace(pathname, { locale: e.target.value as Locale })
        }
      >
        {routing.locales.map((l) => (
          <option key={l} value={l}>
            {/* ICU select keys can't contain "-", so zh-TW → zh_TW */}
            {t("locale", { locale: l.replace("-", "_") })}
          </option>
        ))}
      </select>
    </label>
  );
}
