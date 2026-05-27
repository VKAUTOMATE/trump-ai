import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 4173);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.4-mini";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

function json(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(data));
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 9000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchJson(url, options) {
  const response = await fetchWithTimeout(url, options);
  if (!response.ok) throw new Error(`Source returned ${response.status}`);
  return response.json();
}

async function fetchText(url) {
  const response = await fetchWithTimeout(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Source returned ${response.status}`);
  return response.text();
}

function stooqCsvToItem(csv, symbol, label) {
  const [, row] = csv.trim().split(/\r?\n/);
  if (!row) throw new Error(`No market row for ${symbol}`);
  const [symbolCode, date, time, open, high, low, close, volume] = row.split(",");
  return {
    title: `${label} quote`,
    text: `${date} ${time}: close ${close}, open ${open}, high ${high}, low ${low}, volume ${volume || "n/a"}.`,
    source: `Stooq ${symbolCode || symbol}`,
    timestamp: `${date} ${time}`,
    url: `https://stooq.com/q/?s=${symbol}`,
  };
}

async function fetchBlsSeries() {
  const labels = {
    CUSR0000SA0: "Inflation CPI",
    CES0000000001: "Jobs payroll employment",
    LNS14000000: "Unemployment rate",
  };
  const ids = Object.keys(labels);
  const settled = await Promise.allSettled(ids.map((id) => (
    fetchJson(`https://api.bls.gov/publicAPI/v2/timeseries/data/${id}?latest=true`)
  )));
  return settled.flatMap((result) => {
    if (result.status !== "fulfilled") return [];
    return (result.value.Results?.series || []).map((series) => {
      const point = series.data?.[0] || {};
      return {
        title: labels[series.seriesID] || series.seriesID,
        text: `${point.periodName || "Latest"} ${point.year || ""}: ${point.value || "n/a"}${point.footnotes?.[0]?.text ? ` (${point.footnotes[0].text})` : ""}.`,
        source: "U.S. Bureau of Labor Statistics",
        timestamp: `${point.periodName || "Latest"} ${point.year || ""}`.trim(),
        url: "https://www.bls.gov/data/",
      };
    });
  });
}

function alphaVantageQuoteToItem(data) {
  const quote = data["Global Quote"] || {};
  if (!quote["01. symbol"]) throw new Error("No Alpha Vantage quote returned");
  return {
    title: `${quote["01. symbol"]} stock quote`,
    text: `Price ${quote["05. price"] || "n/a"}, change ${quote["09. change"] || "n/a"} (${quote["10. change percent"] || "n/a"}), previous close ${quote["08. previous close"] || "n/a"}.`,
    source: "Alpha Vantage stock API",
    timestamp: quote["07. latest trading day"] || "Latest",
    url: "https://www.alphavantage.co/documentation/",
  };
}

function yahooChartToItem(data, symbol, label) {
  const result = data.chart?.result?.[0];
  const quote = result?.meta || {};
  const close = quote.regularMarketPrice ?? quote.previousClose ?? "n/a";
  const previous = quote.previousClose ?? "n/a";
  const time = quote.regularMarketTime ? new Date(quote.regularMarketTime * 1000).toLocaleString() : "Latest";
  if (!result || close === "n/a") throw new Error(`No Yahoo market row for ${symbol}`);
  return {
    title: `${label} market quote`,
    text: `${time}: price ${close}, previous close ${previous}, exchange ${quote.exchangeName || "n/a"}.`,
    source: `Yahoo Finance ${symbol}`,
    timestamp: time,
    url: `https://finance.yahoo.com/quote/${symbol}`,
  };
}

async function loadNews() {
  const data = await fetchJson("https://api.gdeltproject.org/api/v2/doc/doc?query=breaking%20news&mode=ArtList&format=json&maxrecords=6&sort=HybridRel");
  return (data.articles || []).slice(0, 6).map((article) => ({
    title: article.title || "Untitled news item",
    text: `${article.seendate || "Recent"} - ${article.domain || "news source"}`,
    source: article.domain || "GDELT",
    timestamp: article.seendate || "Recent",
    url: article.url,
  }));
}

async function loadEconomics() {
  const requests = [
    fetchJson("https://query1.finance.yahoo.com/v8/finance/chart/SPY?range=1d&interval=1m").then((data) => yahooChartToItem(data, "SPY", "S&P 500 ETF")),
    fetchJson("https://query1.finance.yahoo.com/v8/finance/chart/UUP?range=1d&interval=1m").then((data) => yahooChartToItem(data, "UUP", "U.S. Dollar ETF")),
    fetchJson("https://query1.finance.yahoo.com/v8/finance/chart/USO?range=1d&interval=1m").then((data) => yahooChartToItem(data, "USO", "Oil ETF")),
    fetchJson("https://query1.finance.yahoo.com/v8/finance/chart/HYG?range=1d&interval=1m").then((data) => yahooChartToItem(data, "HYG", "High yield credit ETF")),
    fetchJson("https://query1.finance.yahoo.com/v8/finance/chart/XLY?range=1d&interval=1m").then((data) => yahooChartToItem(data, "XLY", "Consumer discretionary ETF")),
    fetchText("https://stooq.com/q/l/?s=spy.us&f=sd2t2ohlcv&h&e=csv").then((csv) => stooqCsvToItem(csv, "spy.us", "S&P 500 ETF")),
    fetchText("https://stooq.com/q/l/?s=qqq.us&f=sd2t2ohlcv&h&e=csv").then((csv) => stooqCsvToItem(csv, "qqq.us", "Nasdaq 100 ETF")),
    fetchText("https://stooq.com/q/l/?s=uup.us&f=sd2t2ohlcv&h&e=csv").then((csv) => stooqCsvToItem(csv, "uup.us", "U.S. Dollar ETF")),
    fetchText("https://stooq.com/q/l/?s=uso.us&f=sd2t2ohlcv&h&e=csv").then((csv) => stooqCsvToItem(csv, "uso.us", "Oil ETF")),
    fetchText("https://stooq.com/q/l/?s=hyg.us&f=sd2t2ohlcv&h&e=csv").then((csv) => stooqCsvToItem(csv, "hyg.us", "High yield credit ETF")),
    fetchText("https://stooq.com/q/l/?s=xly.us&f=sd2t2ohlcv&h&e=csv").then((csv) => stooqCsvToItem(csv, "xly.us", "Consumer discretionary ETF")),
    fetchJson(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey=${process.env.ALPHA_VANTAGE_API_KEY || "demo"}`).then(alphaVantageQuoteToItem),
    fetchBlsSeries(),
    fetchJson("https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/avg_interest_rates?sort=-record_date&page[size]=3")
      .then((data) => (data.data || []).slice(0, 3).map((item) => ({
        title: `${item.security_desc || "Treasury security"} rate`,
        text: `${item.record_date}: average interest rate ${item.avg_interest_rate_amt || "n/a"}%.`,
        source: "U.S. Treasury Fiscal Data",
        timestamp: item.record_date,
        url: "https://fiscaldata.treasury.gov/datasets/average-interest-rates-treasury-securities/average-interest-rates",
      }))),
  ];
  const settled = await Promise.allSettled(requests);
  const items = settled.flatMap((result) => result.status === "fulfilled" ? result.value : []);
  if (!items.length) throw new Error("Economics sources were unavailable.");
  return items.slice(0, 14);
}

async function loadPolitics() {
  const data = await fetchJson("https://www.federalregister.gov/api/v1/documents.json?per_page=6&order=newest");
  return (data.results || []).slice(0, 6).map((item) => ({
    title: item.title || "Federal Register item",
    text: `${item.publication_date || "Recent"} - ${(item.agencies || []).map((agency) => agency.name).slice(0, 2).join(", ") || "Federal agency"}`,
    source: "Federal Register government data",
    timestamp: item.publication_date || "Recent",
    url: item.html_url,
  }));
}

async function loadSports(league = "all") {
  const leagues = {
    NBA: { url: "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard", label: "ESPN NBA" },
    NFL: { url: "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard", label: "ESPN NFL" },
    MLB: { url: "https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard", label: "ESPN MLB" },
    NHL: { url: "https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard", label: "ESPN NHL" },
    GOLF: { url: "https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard", label: "ESPN Golf" },
    TENNIS: { url: "https://site.api.espn.com/apis/site/v2/sports/tennis/atp/scoreboard", label: "ESPN Tennis" },
    UFC: { url: "https://site.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard", label: "ESPN UFC" },
    BOXING: { url: "https://site.api.espn.com/apis/site/v2/sports/boxing/boxing/scoreboard", label: "ESPN Boxing" },
  };
  const targets = league === "all" ? Object.values(leagues) : [leagues[league]].filter(Boolean);
  const settled = await Promise.allSettled(targets.map((target) => fetchJson(target.url).then((data) => ({ data, target }))));
  const items = settled.flatMap((result) => {
    if (result.status !== "fulfilled") return [];
    const { data, target } = result.value;
    return (data.events || []).slice(0, 4).map((event) => {
      const competitors = event.competitions?.[0]?.competitors || [];
      const names = competitors.map((team) => team.team?.shortDisplayName || team.team?.displayName).filter(Boolean).join(" vs ");
      const scores = competitors.map((team) => `${team.team?.abbreviation || "TEAM"} ${team.score || "0"}`).join(" | ");
      return {
        title: names || event.name || `${target.label} event`,
        text: `${event.status?.type?.shortDetail || "Scheduled"}${scores ? ` - ${scores}` : ""}`,
        source: `${target.label} scores/schedule`,
        timestamp: event.date ? new Date(event.date).toLocaleString() : "Schedule",
        url: event.links?.[0]?.href,
      };
    });
  });
  if (!items.length) throw new Error("Sports scoreboards were unavailable.");
  return items.slice(0, 10);
}

function extractResponseText(data) {
  if (data.output_text) return data.output_text;
  return (data.output || []).flatMap((item) => item.content || []).map((content) => content.text || "").join("\n").trim();
}

async function chat(body) {
  if (!OPENAI_API_KEY) {
    throw new Error("The backend needs OPENAI_API_KEY before real AI answers are enabled.");
  }
  const response = await fetchJson("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: body.modelName || OPENAI_MODEL,
      input: [
        { role: "developer", content: [{ type: "input_text", text: body.systemPrompt || "You are TRUMP AI, a neutral research assistant." }] },
        ...(body.history || []),
        { role: "user", content: [{ type: "input_text", text: body.prompt || "" }] },
      ],
      max_output_tokens: body.maxOutputTokens || 900,
    }),
  });
  return { text: extractResponseText(response) || "I received an empty response from the model." };
}

async function handleApi(req, res, url) {
  try {
    if (req.method === "OPTIONS") return json(res, 204, {});
    if (url.pathname === "/api/health") return json(res, 200, { ok: true, service: "TRUMP AI backend" });
    if (url.pathname === "/api/live/news") return json(res, 200, { items: await loadNews() });
    if (url.pathname === "/api/live/economics") return json(res, 200, { items: await loadEconomics() });
    if (url.pathname === "/api/live/politics") return json(res, 200, { items: await loadPolitics() });
    if (url.pathname === "/api/live/sports") return json(res, 200, { items: await loadSports(url.searchParams.get("league") || "all") });
    if (url.pathname === "/api/chat" && req.method === "POST") return json(res, 200, await chat(await readBody(req)));
    return json(res, 404, { error: "API route not found" });
  } catch (error) {
    return json(res, 500, { error: error.message || "Backend request failed" });
  }
}

async function serveStatic(res, pathname) {
  const cleanPath = pathname === "/" ? "/index.html" : pathname;
  const filePath = normalize(join(root, cleanPath));
  if (!filePath.startsWith(root)) return json(res, 403, { error: "Forbidden" });
  try {
    const data = await readFile(filePath);
    res.writeHead(200, {
      "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(data);
  } catch {
    const data = await readFile(join(root, "index.html"));
    res.writeHead(200, { "Content-Type": mimeTypes[".html"], "Cache-Control": "no-store" });
    res.end(data);
  }
}

http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  if (url.pathname.startsWith("/api/")) return handleApi(req, res, url);
  return serveStatic(res, url.pathname);
}).listen(port, () => {
  console.log(`TRUMP AI running at http://localhost:${port}`);
});
