import { loadSports } from "../../backend.js";
import { applyCors } from "../_utils.js";

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  try {
    res.status(200).json({ items: await loadSports(req.query.league || "all") });
  } catch (error) {
    res.status(500).json({ error: error.message || "Sports request failed" });
  }
}
