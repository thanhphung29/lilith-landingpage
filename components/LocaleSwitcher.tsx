"use client";

import { useEffect, useRef, useState } from "react";
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

// A custom dropdown list instead of a native <select>: the list gets the same border, radius and
// background as the box, and behaves the same on every browser (iOS Safari needed a second tap
// to reopen a native select).
export default function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on a tap/click outside or Escape
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (l: Locale) => {
    setOpen(false);
    if (l !== locale) router.replace(pathname, { locale: l });
  };

  return (
    <div ref={rootRef} className="relative h-9 w-[78px] shrink-0 leading-none sm:w-[180px]">
      <button
        ref={buttonRef}
        type="button"
        aria-label={t("label")}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-full w-full cursor-pointer items-center rounded border border-gothic-border bg-gothic-navy/90 pr-[10px] pl-2 text-xs text-gothic-ivory transition-colors hover:border-gothic-gold focus-visible:border-gothic-gold focus-visible:outline-none sm:pl-3 sm:text-sm"
      >
        {/* Mobile: the box is too narrow for the full name, so only the code */}
        <span className="flex-1 truncate text-left">
          <span className="sm:hidden">{locale.toUpperCase()}</span>
          <span className="max-sm:hidden">{localeNames[locale as keyof typeof localeNames]}</span>
        </span>
        <i
          className={`fa-solid fa-chevron-down text-[10px] text-gothic-ivory/70 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("label")}
          className="absolute top-full right-0 z-50 dropdown-scroll mt-1 max-h-[65vh] w-[180px] overflow-y-auto rounded border border-gothic-border bg-gothic-navy py-1 shadow-lg"
        >
          {LOCALES.map((l) => (
            <li key={l} role="option" aria-selected={l === locale}>
              <button
                type="button"
                onClick={() => choose(l)}
                className={`block w-full cursor-pointer px-3 py-2 text-left text-sm transition-colors hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none ${
                  l === locale ? "text-gothic-gold" : "text-gothic-ivory"
                }`}
              >
                {localeNames[l]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
