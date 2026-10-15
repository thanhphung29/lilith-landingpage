"use client";

import { useEffect, useRef } from "react";

const COUNT = 16;
const r = (a: number, b: number) => a + Math.random() * (b - a);

// Timing is fixed once per particle (changing duration/delay mid-run makes the
// animation jump to a new progress and the spark flashes out). Only position,
// path and size are re-randomized, at the invisible end of each cycle.
function setTiming(el: HTMLElement) {
  const dur = r(10, 16);
  const sd = r(2.5, 5);
  el.style.setProperty("--fd", `${dur.toFixed(2)}s`);
  el.style.setProperty("--fdelay", `${(-r(0, dur)).toFixed(2)}s`);
  el.style.setProperty("--sd", `${sd.toFixed(2)}s`);
  el.style.setProperty("--sdelay", `${(-r(0, sd)).toFixed(2)}s`);
}

function randomize(el: HTMLElement) {
  el.style.setProperty("--sz", `${r(2, 4.5).toFixed(1)}px`);
  el.style.left = `${r(8, 92).toFixed(1)}%`;
  el.style.top = `${r(25, 85).toFixed(1)}%`;
  el.style.setProperty("--dx", `${r(-60, 60).toFixed(0)}px`);
  el.style.setProperty("--dy", `${(-r(40, 120)).toFixed(0)}px`);
  el.style.setProperty("--wx", `${r(-25, 25).toFixed(0)}px`);
}

// Light particles drifting from the apply button. Built in an effect so
// Math.random() never runs during render (no hydration mismatch).
export default function ButtonParticles() {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    if (!box || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const sparks: HTMLElement[] = [];
    for (let i = 0; i < COUNT; i++) {
      const sp = document.createElement("span");
      sp.className = "spark";
      sp.appendChild(document.createElement("i"));
      setTiming(sp);
      randomize(sp);
      sp.addEventListener("animationiteration", (e) => {
        if (e.target === sp) randomize(sp);
      });
      box.appendChild(sp);
      sparks.push(sp);
    }
    return () => sparks.forEach((sp) => sp.remove());
  }, []);

  return <div ref={boxRef} className="btn-particles" aria-hidden="true" />;
}
