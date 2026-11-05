import { isApplyClosed, msUntilApplyCloses } from "@/lib/event";

// The server's view of the deadline, so the browser never has to trust its own clock.
// `msUntilClose` is relative to the moment of the response (negative once closed).
export async function GET() {
  return Response.json(
    { now: Date.now(), closed: isApplyClosed(), msUntilClose: msUntilApplyCloses() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
