"use client";

export default function BackToTop({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="btn-top-img inline-flex cursor-pointer items-center justify-center gap-2 text-sm font-bold tracking-wider"
    >
      <i className="fa-solid fa-circle-up" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
