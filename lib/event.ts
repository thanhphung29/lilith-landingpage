// Applications close at the end of 2026-11-18 (23:59:59 JST), i.e. from 2026-11-19 00:00:00 JST
const APPLY_CLOSES_AT = Date.parse("2026-11-19T00:00:00+09:00");

export function isApplyClosed(now: number = Date.now()) {
  return now >= APPLY_CLOSES_AT;
}

// Milliseconds until applications close (negative once closed)
export function msUntilApplyCloses(now: number = Date.now()) {
  return APPLY_CLOSES_AT - now;
}
