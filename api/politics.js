export function applyCors(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }
  return false;
}

// Optional shared-secret check for expensive endpoints (like /api/chat, which spends
// your OpenAI quota). If BACKEND_SHARED_KEY is not set in the Vercel environment, this
// is a no-op so nothing breaks for existing deployments. Once you set BACKEND_SHARED_KEY
// in Vercel, the frontend must send it back as an `Authorization: Bearer <key>` header
// (see settings.backendSharedKey in app.js) or requests are rejected.
export function requireSharedKey(req, res) {
  const expected = process.env.BACKEND_SHARED_KEY;
  if (!expected) return false; // not configured yet, allow through
  const header = req.headers.authorization || "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (provided !== expected) {
    res.status(401).json({ error: "Missing or invalid backend key." });
    return true;
  }
  return false;
}

// Very small in-memory rate limiter. This resets whenever the serverless function
// cold-starts, so it's a cheap deterrent against casual abuse, not a hard guarantee —
// for real protection at scale, use Vercel's Edge Config / Upstash rate limiting instead.
const hits = new Map();
export function isRateLimited(req, { windowMs = 60_000, max = 20 } = {}) {
  const key = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown";
  const now = Date.now();
  const entry = hits.get(key) || { count: 0, resetAt: now + windowMs };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }
  entry.count += 1;
  hits.set(key, entry);
  return entry.count > max;
}
