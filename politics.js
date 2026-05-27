import { loadPolitics } from "../../backend.js";

export default async function handler(req, res) {
  try {
    res.status(200).json({ items: await loadPolitics() });
  } catch (error) {
    res.status(500).json({ error: error.message || "Politics request failed" });
  }
}
