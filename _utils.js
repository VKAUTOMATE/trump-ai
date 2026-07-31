import { applyCors } from "./_utils.js";

export default function handler(req, res) {
  if (applyCors(req, res)) return;
  res.status(200).json({
    ok: true,
    service: "TRUMP AI Vercel backend",
    // Booleans only — never the actual secret values — so the frontend can show
    // real readiness status without exposing anything sensitive.
    aiConfigured: Boolean(process.env.OPENAI_API_KEY),
  });
}
