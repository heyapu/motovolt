import "server-only";

// Best-effort in-memory rate limiter for the public checkout endpoint.
// Enough to stop casual abuse at this traffic level (4 admins, one store).
// Note: state is per server instance — resets on redeploy, and on
// multi-instance serverless each instance counts separately. If the store
// ever scales, swap this for Upstash Redis with the same interface.
const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit = 10, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count += 1;

  // Opportunistic cleanup so the map can't grow unbounded.
  if (hits.size > 5_000) {
    for (const [k, v] of hits) if (now > v.resetAt) hits.delete(k);
  }
  return entry.count <= limit;
}
