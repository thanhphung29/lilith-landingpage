"use client";

import { useEffect } from "react";

// Every logo file (see Logo.tsx). Keep in sync with LOGO_LOCALES there.
const LOGOS = ["en", "ja", "ko", "ru", "zh-tw", "zh-cn"].map((l) => `/img/logo_${l}.png`);

// The logo is a different file per language, so switching language swaps the image and it
// flashes while the new file loads. Fetch them all once the page is idle so they are already
// in the browser cache (and decoded) by the time the visitor switches.
const keep: HTMLImageElement[] = [];

export default function LogoPreload() {
  useEffect(() => {
    const load = () => {
      for (const src of LOGOS) {
        const img = new Image();
        img.decoding = "async";
        img.src = src;
        keep.push(img); // hold a reference so the decoded image is not dropped
      }
    };
    const idle = window.requestIdleCallback;
    if (idle) {
      const id = idle(load, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(load, 500);
    return () => clearTimeout(id);
  }, []);

  return null;
}
