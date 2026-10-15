import type { CSSProperties } from "react";

const RINGS = [
  { src: "effect_circle_01", dur: 180, reverse: false, width: 20, opacity: 0.35, left: 20, top: 40 },
  { src: "circle_line", dur: 120, reverse: true, width: 10, opacity: 0.3, left: 15, top: 40 },
  { src: "effect_circle_02", dur: 150, reverse: false, width: 25, opacity: 0.4, left: 82, top: 65 },
  { src: "effect_circle_04", dur: 200, reverse: true, width: 22, opacity: 0.35, left: 92, top: 65 },
];

export default function Background() {
  return (
    <>
      <div className="fixed inset-0 celestial-grid pointer-events-none z-0" />
      <div className="bg-rings" aria-hidden="true">
        {RINGS.map((r) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={r.src}
            src={`/img/background/${r.src}.png`}
            alt=""
            className="bg-ring"
            style={
              {
                "--dur": `${r.dur}s`,
                "--dir": r.reverse ? "reverse" : "normal",
                width: `${r.width}vmax`,
                opacity: r.opacity,
                left: `${r.left}%`,
                top: `${r.top}%`,
              } as CSSProperties
            }
          />
        ))}
      </div>
    </>
  );
}
