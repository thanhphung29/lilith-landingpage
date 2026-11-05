"use client";

import { useEffect, useRef } from "react";

// Keeps a one-line text inside the nearest [data-fit-box]: the CSS font size is used while it fits,
// otherwise the size shrinks (width scales linearly with font size) until the line fits.
export default function FitText({
  children,
  className,
  as: Tag = "p",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "p" | "span";
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    const box = el?.closest<HTMLElement>("[data-fit-box]");
    if (!el || !box) return;

    const fit = () => {
      el.style.fontSize = "";
      const style = getComputedStyle(box);
      const available = box.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      const needed = el.scrollWidth;
      if (needed > available) {
        el.style.fontSize = `${(parseFloat(getComputedStyle(el).fontSize) * available) / needed - 0.25}px`;
      }
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    // The web font changes the text width once it has loaded
    document.fonts?.ready.then(fit);
    document.fonts?.addEventListener("loadingdone", fit);
    return () => {
      observer.disconnect();
      document.fonts?.removeEventListener("loadingdone", fit);
    };
  }, [children]);

  return (
    <Tag ref={ref as React.Ref<never>} className={className}>
      {children}
    </Tag>
  );
}
