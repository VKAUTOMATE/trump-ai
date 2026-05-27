import { loadPolitics } from "../../backend.js";
import { applyCors } from "../_utils.js";

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  try {
    res.status(200).json({ items: await loadPolitics() });
  } catch (error) {
    res.status(500).json({ error: error.message || "Politics request failed" });
  }
}
