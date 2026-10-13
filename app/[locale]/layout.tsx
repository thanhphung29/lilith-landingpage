import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Noto_Sans_JP,
  Noto_Sans_KR,
  Noto_Sans_SC,
  Noto_Sans_TC,
  Noto_Sans_Thai,
} from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, type Locale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Fonts for scripts Geist doesn't cover, exposed as --font-locale
const notoSansJP = Noto_Sans_JP({ variable: "--font-locale", subsets: ["latin"], preload: false });
const notoSansTC = Noto_Sans_TC({ variable: "--font-locale", subsets: ["latin"], preload: false });
const notoSansSC = Noto_Sans_SC({ variable: "--font-locale", subsets: ["latin"], preload: false });
const notoSansKR = Noto_Sans_KR({ variable: "--font-locale", subsets: ["latin"], preload: false });
const notoSansThai = Noto_Sans_Thai({ variable: "--font-locale", subsets: ["thai"], preload: false });

const localeFonts: Partial<Record<Locale, string>> = {
  ja: notoSansJP.variable,
  "zh-TW": notoSansTC.variable,
  "zh-CN": notoSansSC.variable,
  ko: notoSansKR.variable,
  th: notoSansThai.variable,
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: hasLocale(routing.locales, locale) ? locale : routing.defaultLocale,
    namespace: "Metadata",
  });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `/${l}`]),
      ),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const fontClasses = [
    geistSans.variable,
    geistMono.variable,
    localeFonts[locale] ?? "",
  ].join(" ");

  return (
    <html lang={locale} className={`${fontClasses} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
