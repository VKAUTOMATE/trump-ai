import { chat } from "../backend.js";
import { applyCors } from "./_utils.js";

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST required" });
    return;
  }
  try {
    res.status(200).json(await chat(req.body || {}));
  } catch (error) {
    res.status(500).json({ error: error.message || "Chat request failed" });
  }
}
