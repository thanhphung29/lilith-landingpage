"use client";

import { useEffect, useRef } from "react";

type TurnstileApi = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let scriptPromise: Promise<TurnstileApi> | null = null;

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  scriptPromise ??= new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve(window.turnstile as TurnstileApi);
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Failed to load Turnstile"));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

// Re-renders (a fresh token) whenever `resetKey` changes. The token is single use, so bump it
// after every submit attempt.
export default function Turnstile({
  onToken,
  resetKey = 0,
  keepToken,
}: {
  onToken: (token: string | null) => void;
  resetKey?: number;
  // Asked when this copy of the widget starts: true means a usable token is already held (carried
  // over from another copy of the page), so no new widget or token is needed
  keepToken?: () => boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const onTokenRef = useRef(onToken);
  const keepTokenRef = useRef(keepToken);
  const lastKey = useRef<number | null>(null);

  // Keep the latest callback without re-rendering the widget
  useEffect(() => {
    onTokenRef.current = onToken;
    keepTokenRef.current = keepToken;
  });

  useEffect(() => {
    const el = ref.current;
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!el || !siteKey) return;

    // Same request as last time (this effect also re-runs when the page is shown again, or on
    // first start in a new copy of the page) and a usable token is in hand: keep it. A new
    // resetKey always asks for a fresh one.
    if ((lastKey.current === null || lastKey.current === resetKey) && keepTokenRef.current?.()) {
      lastKey.current = resetKey;
      return;
    }
    lastKey.current = resetKey;

    let widgetId: string | undefined;
    let cancelled = false;
    onTokenRef.current(null);

    loadTurnstile()
      .then((turnstile) => {
        if (cancelled) return;
        widgetId = turnstile.render(el, {
          sitekey: siteKey,
          theme: "dark",
          callback: (token: string) => onTokenRef.current(token),
          "expired-callback": () => onTokenRef.current(null),
          "error-callback": () => onTokenRef.current(null),
        });
      })
      .catch(() => onTokenRef.current(null));

    return () => {
      cancelled = true;
      if (widgetId !== undefined) window.turnstile?.remove(widgetId);
    };
  }, [resetKey]);

  return <div ref={ref} />;
}
