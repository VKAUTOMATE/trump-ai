import { applyCors } from "./_utils.js";

export default function handler(req, res) {
  if (applyCors(req, res)) return;
  res.status(200).json({ ok: true, service: "TRUMP AI Vercel backend" });
}
