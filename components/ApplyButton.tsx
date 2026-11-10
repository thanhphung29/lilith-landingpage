"use client";

import { Link } from "@/i18n/navigation";
import ButtonParticles from "./ButtonParticles";
import useApplyClosed from "./hooks/useApplyClosed";

export default function ApplyButton({ label }: { label: string }) {
  const closed = useApplyClosed();

  if (closed) {
    return (
      <div className="btn-wrap">
        <button
          type="button"
          disabled
          className="btn-img flex cursor-not-allowed items-center justify-center gap-3 text-lg font-black uppercase tracking-wider opacity-60 grayscale"
        >
          {label}
        </button>
      </div>
    );
  }

  return (
    <div className="btn-wrap">
      <div className="btn-glow" aria-hidden="true" />
      <ButtonParticles />
      <Link
        href="/cbt/apply"
        className="btn-img flex items-center justify-center gap-3 text-lg font-black uppercase tracking-wider"
      >
        {label}
      </Link>
    </div>
  );
}
