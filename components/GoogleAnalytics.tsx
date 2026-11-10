import Script from "next/script";

// Google Analytics 4 measurement ID from the environment (NEXT_PUBLIC_GA_ID, e.g. G-XXXXXXXXXX).
// Only loaded in production builds, so local development never counts as a visit. The ID is checked
// against the GA4 format because it ends up inside an inline script.
const rawId = process.env.NEXT_PUBLIC_GA_ID?.trim();
const GA_ID = process.env.NODE_ENV === "production" && rawId && /^G-[A-Z0-9]+$/.test(rawId) ? rawId : null;

// Standard gtag.js setup: loads the library, creates window.dataLayer and sends the first page view.
// Later page views (the app navigates without reloading) come from GA4's "page changes based on
// browser history events" enhanced measurement, which is on by default for web streams.
export default function GoogleAnalytics() {
  if (!GA_ID) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
      </Script>
    </>
  );
}
