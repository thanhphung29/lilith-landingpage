"use client";

import useApplyClosed from "./hooks/useApplyClosed";

export default function HeroTitle({ title, closedTitle }: { title: string; closedTitle: string }) {
  const closed = useApplyClosed();

  return (
    <h1 className="mb-8 text-4xl font-black tracking-wide text-gothic-ivory sm:text-6xl [text-shadow:0_2px_14px_rgba(0,0,0,.9)]">
      {closed ? closedTitle : title}
    </h1>
  );
}
