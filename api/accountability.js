import { loadPolitics } from "../../backend.js";
import { applyCors } from "../_utils.js";

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  try {
    const category = typeof req.query?.category === "string" ? req.query.category : "all";
    res.status(200).json({ items: await loadPolitics(category) });
  } catch (error) {
    res.status(500).json({ error: error.message || "Politics request failed" });
  }
}
