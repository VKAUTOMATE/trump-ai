import { loadNews } from "../../backend.js";

export default async function handler(req, res) {
  try {
    res.status(200).json({ items: await loadNews() });
  } catch (error) {
    res.status(500).json({ error: error.message || "News request failed" });
  }
}
