import { useSyncExternalStore } from "react";

export type Step = "form" | "confirm" | "done";
export type Entry = { email: string; discord: string; wishlist: "yes" | "no"; consents: string[] };

// Where the applicant is in the flow, shared by every copy of the apply page. Each language is its
// own copy of the page (and Next keeps hidden copies alive), so state kept inside one copy would
// start over after switching language. It lives in memory only: gone on a refresh.
type Flow = {
  step: Step;
  // What the confirm step shows
  entry: Entry | null;
  // The captcha token (single use, valid for 5 minutes) and when it arrived
  token: string | null;
  tokenAt: number;
};

const INITIAL: Flow = { step: "form", entry: null, token: null, tokenAt: 0 };
let flow = INITIAL;
const listeners = new Set<() => void>();

export function setFlow(patch: Partial<Flow>) {
  flow = { ...flow, ...patch };
  listeners.forEach((listener) => listener());
}

export function getFlow() {
  return flow;
}

// Tokens are valid for 300s: treat one older than 4 minutes as expired
const TOKEN_MAX_AGE = 240_000;
export function hasFreshToken() {
  return flow.token !== null && Date.now() - flow.tokenAt < TOKEN_MAX_AGE;
}

export function setToken(token: string | null) {
  setFlow({ token, tokenAt: token ? Date.now() : 0 });
}

export function useFlow() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getFlow,
    () => INITIAL,
  );
}
