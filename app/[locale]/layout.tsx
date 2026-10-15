import type { Metadata } from "next";
import {
  Cinzel,
  Noto_Sans_JP,
  Noto_Sans_KR,
  Noto_Sans_SC,
  Noto_Sans_TC,
  Noto_Sans_Thai,
  Share_Tech_Mono,
} from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, type Locale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import Background from "@/components/Background";
import Header from "@/components/Header";
import { routing } from "@/i18n/routing";
import "../globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  preload: false,
});

const cinzel = Cinzel({
  variable: "--font-cinzel-face",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
});

const shareTechMono = Share_Tech_Mono({
  variable: "--font-share-tech-mono",
  subsets: ["latin"],
  weight: "400",
});

// Scripts Noto Sans JP lacks, exposed as --font-locale
const notoSansTC = Noto_Sans_TC({ variable: "--font-locale", subsets: ["latin"], preload: false });
const notoSansSC = Noto_Sans_SC({ variable: "--font-locale", subsets: ["latin"], preload: false });
const notoSansKR = Noto_Sans_KR({ variable: "--font-locale", subsets: ["latin"], preload: false });
// const notoSansThai = Noto_Sans_Thai({ variable: "--font-locale", subsets: ["thai", "latin"], preload: false });

const localeFonts: Partial<Record<Locale, string>> = {
  "zh-TW": notoSansTC.variable,
  "zh-CN": notoSansSC.variable,
  ko: notoSansKR.variable,
  // th: notoSansThai.variable,
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
    notoSansJP.variable,
    cinzel.variable,
    shareTechMono.variable,
    localeFonts[locale] ?? "",
  ].join(" ");

  return (
    <html lang={locale} className={`${fontClasses} h-full`}>
      <head>
        {/* Font Awesome has no next/font equivalent, so it stays on the CDN */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body className="relative min-h-full flex flex-col selection:bg-gothic-gold selection:text-gothic-deep">
        <NextIntlClientProvider>
          <Background />
          <Header />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
