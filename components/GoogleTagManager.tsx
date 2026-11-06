import Script from "next/script";

// Google Tag Manager container ID from the environment (NEXT_PUBLIC_GTM_ID, e.g. GTM-XXXXXXX).
// Only loaded in production builds, so local development never counts as a visit. The ID is checked
// against the GTM format because it ends up inside an inline script.
const rawId = process.env.NEXT_PUBLIC_GTM_ID?.trim();
const GTM_ID = process.env.NODE_ENV === "production" && rawId && /^GTM-[A-Z0-9]+$/.test(rawId) ? rawId : null;

// Standard GTM bootstrap: creates window.dataLayer, pushes gtm.start and loads gtm.js
export default function GoogleTagManager() {
  if (!GTM_ID) return null;
  return (
    <Script id="gtm" strategy="afterInteractive">
      {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
    </Script>
  );
}

// For visitors without JavaScript: goes right after the opening <body> tag
export function GoogleTagManagerNoScript() {
  if (!GTM_ID) return null;
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}
