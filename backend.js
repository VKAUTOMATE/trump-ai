const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.4-mini";

async function fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchJson(url, options, timeoutMs) {
  const response = await fetchWithTimeout(url, options, timeoutMs);
  if (!response.ok) throw new Error(`Source returned ${response.status}`);
  return response.json();
}

async function fetchText(url, timeoutMs) {
  const response = await fetchWithTimeout(url, { cache: "no-store" }, timeoutMs);
  if (!response.ok) throw new Error(`Source returned ${response.status}`);
  return response.text();
}

function decodeXml(value = "") {
  return value
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function parseNewsRss(xml, sourceLabel) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 8).map((match) => {
    const item = match[1];
    const read = (tag) => decodeXml((item.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`)) || [])[1] || "");
    const title = read("title").replace(/\s+-\s+[^-]+$/, "").trim() || "Live news item";
    const published = read("pubDate");
    const source = read("source") || sourceLabel;
    const link = read("link");
    return {
      title,
      text: `${published || "Latest"} - ${source}`,
      source,
      timestamp: published ? new Date(published).toLocaleString() : "Latest",
      url: link,
    };
  });
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
  const settled = await Promise.allSettled(Object.keys(labels).map((id) => (
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

export async function loadNews() {
  const errors = [];
  try {
    const xml = await fetchText("https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en", 7000);
    const items = parseNewsRss(xml, "Google News");
    if (items.length) return items.slice(0, 6);
  } catch (error) {
    errors.push(error.message);
  }

  try {
    const data = await fetchJson("https://api.gdeltproject.org/api/v2/doc/doc?query=breaking%20news&mode=ArtList&format=json&maxrecords=6&sort=HybridRel", undefined, 12000);
    const items = (data.articles || []).slice(0, 6).map((article) => ({
      title: article.title || "Untitled news item",
      text: `${article.seendate || "Recent"} - ${article.domain || "news source"}`,
      source: article.domain || "GDELT",
      timestamp: article.seendate || "Recent",
      url: article.url,
    }));
    if (items.length) return items;
  } catch (error) {
    errors.push(error.message);
  }

  throw new Error(`News sources did not respond: ${errors.join("; ") || "unknown error"}`);
}

export async function loadEconomics() {
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

export async function loadPolitics() {
  const data = await fetchJson("https://www.federalregister.gov/api/v1/documents.json?per_page=6&order=newest");
  return (data.results || []).slice(0, 6).map((item) => ({
    title: item.title || "Federal Register item",
    text: `${item.publication_date || "Recent"} - ${(item.agencies || []).map((agency) => agency.name).slice(0, 2).join(", ") || "Federal agency"}`,
    source: "Federal Register government data",
    timestamp: item.publication_date || "Recent",
    url: item.html_url,
  }));
}

export async function loadSports(league = "all") {
  const leagues = {
    NBA: { url: "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard", label: "ESPN NBA" },
    NFL: { url: "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard", label: "ESPN NFL" },
    MLB: { url: "https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard", label: "ESPN MLB" },
    NHL: { url: "https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard", label: "ESPN NHL" },
    GOLF: { url: "https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard", label: "ESPN Golf" },
    TENNIS: { url: "https://site.api.espn.com/apis/site/v2/sports/tennis/atp/scoreboard", label: "ESPN Tennis" },
    EPL: { url: "https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard", label: "ESPN Premier League" },
    UCL: { url: "https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard", label: "ESPN Champions League" },
    LALIGA: { url: "https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard", label: "ESPN La Liga" },
    SERIEA: { url: "https://site.api.espn.com/apis/site/v2/sports/soccer/ita.1/scoreboard", label: "ESPN Serie A" },
    BUNDESLIGA: { url: "https://site.api.espn.com/apis/site/v2/sports/soccer/ger.1/scoreboard", label: "ESPN Bundesliga" },
    LIGUE1: { url: "https://site.api.espn.com/apis/site/v2/sports/soccer/fra.1/scoreboard", label: "ESPN Ligue 1" },
    MLS: { url: "https://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/scoreboard", label: "ESPN MLS" },
    LIGAMX: { url: "https://site.api.espn.com/apis/site/v2/sports/soccer/mex.1/scoreboard", label: "ESPN Liga MX" },
    NWSL: { url: "https://site.api.espn.com/apis/site/v2/sports/soccer/usa.nwsl/scoreboard", label: "ESPN NWSL" },
    UEL: { url: "https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.europa/scoreboard", label: "ESPN Europa League" },
    UFC: { url: "https://site.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard", label: "ESPN UFC" },
    BOXING: { url: "https://site.api.espn.com/apis/site/v2/sports/boxing/boxing/scoreboard", label: "ESPN Boxing" },
  };
  const soccerKeys = ["EPL", "UCL", "LALIGA", "SERIEA", "BUNDESLIGA", "LIGUE1", "MLS", "LIGAMX", "NWSL", "UEL"];
  const targets = league === "all"
    ? Object.values(leagues)
    : league === "SOCCER"
      ? soccerKeys.map((key) => leagues[key])
      : [leagues[league]].filter(Boolean);
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

export async function chat(body) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("The backend needs OPENAI_API_KEY before real AI answers are enabled.");
  }
  const response = await fetchJson("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
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
