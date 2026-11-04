"use client";

import { useSyncExternalStore } from "react";
import { isApplyClosed, msUntilApplyCloses } from "@/lib/event";

// setTimeout can't wait longer than ~24.8 days, so check back at least that often
const MAX_WAIT = 2 ** 31 - 1;

function subscribe(onChange: () => void) {
  let timer: ReturnType<typeof setTimeout>;
  const schedule = () => {
    const wait = msUntilApplyCloses();
    if (wait <= 0) return;
    timer = setTimeout(() => {
      onChange();
      schedule();
    }, Math.min(wait, MAX_WAIT));
  };
  schedule();
  return () => clearTimeout(timer);
}

// True once applications have closed, and flips on its own when the deadline passes.
// Server render and hydration assume "open"; the real clock takes over right after.
export default function useApplyClosed() {
  return useSyncExternalStore(subscribe, () => isApplyClosed(), () => false);
}
