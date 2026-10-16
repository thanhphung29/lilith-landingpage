import type { Metadata } from "next";
import {
  Cinzel,
  Noto_Serif,
  Noto_Serif_JP,
  Noto_Serif_KR,
  Noto_Serif_SC,
  Noto_Serif_TC,
  Noto_Serif_Thai,
  Share_Tech_Mono,
} from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, type Locale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import Background from "@/components/Background";
import Header from "@/components/Header";
import { routing } from "@/i18n/routing";
import "../globals.css";

const notoSerifJP = Noto_Serif_JP({
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

// Scripts Noto Serif JP lacks, exposed as --font-locale
const notoSerifTC = Noto_Serif_TC({ variable: "--font-locale", subsets: ["latin"], preload: false });
const notoSerifSC = Noto_Serif_SC({ variable: "--font-locale", subsets: ["latin"], preload: false });
const notoSerifKR = Noto_Serif_KR({ variable: "--font-locale", subsets: ["latin"], preload: false });
const notoSerifThai = Noto_Serif_Thai({ variable: "--font-locale", subsets: ["thai", "latin"], preload: false });
// latin-ext covers Polish letters (ą ć ę ł ń ó ś ź ż)
const notoSerif = Noto_Serif({ variable: "--font-locale", subsets: ["latin", "latin-ext"], preload: false });

const localeFonts: Partial<Record<Locale, string>> = {
  "zh-TW": notoSerifTC.variable,
  "zh-CN": notoSerifSC.variable,
  ko: notoSerifKR.variable,
  th: notoSerifThai.variable,
  pl: notoSerif.variable,
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
    namespace: "Landing",
  });

  return {
    title: t("title_game"),
    description: t("description_game"),
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
    notoSerifJP.variable,
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
