import {
  loadNews,
  loadEconomics,
  loadPolitics,
  loadCongress,
  loadCourts,
  loadElections,
  loadAccountability,
  loadSports,
} from "../../backend.js";
import { applyCors } from "../_utils.js";

const handlers = {
  news: (req) => loadNews(),
  economics: (req) => loadEconomics(typeof req.query?.category === "string" ? req.query.category : "all"),
  politics: (req) => loadPolitics(typeof req.query?.category === "string" ? req.query.category : "all"),
  congress: () => loadCongress(),
  courts: (req) => loadCourts(req.query?.query || "federal court"),
  elections: () => loadElections(),
  accountability: () => loadAccountability(),
  sports: (req) => loadSports(req.query?.league || "all"),
};

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  const type = req.query?.type;
  const loader = handlers[type];
  if (!loader) {
    res.status(404).json({ error: `Unknown live data type "${type}".` });
    return;
  }
  try {
    res.status(200).json({ items: await loader(req) });
  } catch (error) {
    res.status(500).json({ error: error.message || `${type} request failed` });
  }
}
