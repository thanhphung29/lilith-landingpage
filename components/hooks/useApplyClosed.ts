"use client";

import { useSyncExternalStore } from "react";

// The deadline is judged with the SERVER's clock (GET /api/time), never the visitor's:
// the response says how many ms are left, and the time since the response is counted with
// performance.now(), which keeps running correctly even if the visitor changes the system clock.
// (The server itself still enforces the deadline in proxy.ts and /api/apply.)

// setTimeout can't wait longer than ~24.8 days, so check back at least that often
const MAX_WAIT = 2 ** 31 - 1;

type Sync = { msUntilClose: number; perfAt: number };

let sync: Sync | null = null;
let fetching = false;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | undefined;

function msLeft() {
  return sync ? sync.msUntilClose - (performance.now() - sync.perfAt) : Infinity;
}

function emit() {
  for (const listener of listeners) listener();
}

function schedule() {
  clearTimeout(timer);
  const wait = msLeft();
  if (wait <= 0 || !Number.isFinite(wait)) return;
  timer = setTimeout(() => {
    emit();
    schedule();
  }, Math.min(wait, MAX_WAIT));
}

async function syncWithServer() {
  if (fetching) return;
  fetching = true;
  try {
    const started = performance.now();
    const res = await fetch("/api/time", { cache: "no-store" });
    if (!res.ok) return;
    const data: { msUntilClose?: unknown } = await res.json();
    if (typeof data.msUntilClose !== "number") return;
    // The server answered about halfway through the round trip
    sync = { msUntilClose: data.msUntilClose, perfAt: (started + performance.now()) / 2 };
    emit();
    schedule();
  } catch {
    // Offline or blocked: keep the last known state (the server still enforces the deadline)
  } finally {
    fetching = false;
  }
}

function onVisible() {
  if (document.visibilityState === "visible") void syncWithServer();
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  if (listeners.size === 1) document.addEventListener("visibilitychange", onVisible);
  void syncWithServer();
  schedule();
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0) {
      document.removeEventListener("visibilitychange", onVisible);
      clearTimeout(timer);
    }
  };
}

// True once the server says applications have closed, and flips on its own when the deadline passes.
// Server render, hydration and the moment before the server answers all assume "open".
export default function useApplyClosed() {
  return useSyncExternalStore(subscribe, () => msLeft() <= 0, () => false);
}
