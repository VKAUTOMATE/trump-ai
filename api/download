import { chat } from "../backend.js";
import { applyCors, requireSharedKey, isRateLimited } from "./_utils.js";

const MAX_PROMPT_LENGTH = 4000;
const MAX_HISTORY_ITEMS = 20;

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST required" });
    return;
  }
  if (requireSharedKey(req, res)) return;
  if (isRateLimited(req)) {
    res.status(429).json({ error: "Too many requests. Please slow down and try again shortly." });
    return;
  }
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    if (typeof body.prompt === "string" && body.prompt.length > MAX_PROMPT_LENGTH) {
      res.status(413).json({ error: `Prompt is too long (max ${MAX_PROMPT_LENGTH} characters).` });
      return;
    }
    if (Array.isArray(body.history) && body.history.length > MAX_HISTORY_ITEMS) {
      body.history = body.history.slice(-MAX_HISTORY_ITEMS);
    }
    res.status(200).json(await chat(body));
  } catch (error) {
    res.status(500).json({ error: error.message || "Chat request failed" });
  }
}
