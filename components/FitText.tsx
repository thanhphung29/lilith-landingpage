"use client";

import { useEffect, useRef } from "react";

// Keeps a one-line text inside the nearest [data-fit-box]: the CSS font size is used while it fits,
// otherwise the size shrinks (width scales linearly with font size) until the line fits.
export default function FitText({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

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
    return () => observer.disconnect();
  }, [children]);

  return (
    <p ref={ref} className={className}>
      {children}
    </p>
  );
}
