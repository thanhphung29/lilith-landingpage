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
import ClickSound from "@/components/ClickSound";
import Header from "@/components/Header";
import { routing } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/site";
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

// Needed to turn the relative thumbnail path below into the absolute URL social sites require.
// Comes from the SITE_URL env var (see lib/site.ts); localhost when it is not set.
const SITE_URL = getSiteUrl() ?? "http://localhost:3000";

// Open Graph wants language_TERRITORY
const OG_LOCALES: Record<Locale, string> = {
  en: "en_US",
  ja: "ja_JP",
  "zh-TW": "zh_TW",
  ko: "ko_KR",
  "zh-CN": "zh_CN",
  vi: "vi_VN",
  ru: "ru_RU",
  es: "es_ES",
  "pt-BR": "pt_BR",
  de: "de_DE",
  fr: "fr_FR",
  pl: "pl_PL",
  th: "th_TH",
  it: "it_IT",
  id: "id_ID",
};

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: hasLocale(routing.locales, locale) ? locale : routing.defaultLocale,
    namespace: "Landing",
  });

  const title = t("title_game");
  const description = t("description_game");
  const thumbnail = { url: "/img/thumb-op.png", width: 1200, height: 630, alt: title };

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    openGraph: { type: "website", title, description, siteName: title, locale: OG_LOCALES[locale as Locale] ?? OG_LOCALES.en, images: [thumbnail] },
    twitter: { card: "summary_large_image", title, description, images: [thumbnail] },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      ],
      apple: { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    },
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
          <ClickSound />
          <Header />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
