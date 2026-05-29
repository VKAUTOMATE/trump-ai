const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o";

function normalizeModelName(modelName) {
  const value = (modelName || "").trim();
  if (!value || value === "gpt-4.4" || value === "gpt-4o-mini" || value === "gpt-5.4-mini" || value === "gpt-5-mini") return OPENAI_MODEL;
  return value;
}

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
  if (!response.ok) {
    const details = await response.text().catch(() => "");
    let message = `${new URL(url).hostname} returned ${response.status}`;
    try {
      const parsed = JSON.parse(details);
      const parsedMessage = typeof parsed.error === "string" ? parsed.error : parsed.error?.message;
      message = parsedMessage ? `${message}: ${parsedMessage}` : message;
    } catch {
      if (details) message = `${message}: ${details.slice(0, 180)}`;
    }
    throw new Error(message);
  }
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

function stripHtml(value = "") {
  return decodeXml(value.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

function absoluteUrl(baseUrl, maybePath = "") {
  if (!maybePath) return baseUrl;
  try {
    return new URL(maybePath, baseUrl).toString();
  } catch {
    return baseUrl;
  }
}

function compactText(value = "", maxLength = 240) {
  const text = stripHtml(String(value || "")).replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}...`;
}

function sourceTypeFor(item = {}, topic = "") {
  const source = `${item.source || ""} ${item.url || ""}`.toLowerCase();
  if (/\.gov|federal register|congress|courtlistener|bureau of labor|treasury|vote\.gov|eac|oversight/.test(source)) return "official";
  if (/espn/.test(source)) return "sports data";
  if (/stooq|yahoo|market|quote/.test(source)) return "market data";
  if (/google news|gdelt|news/.test(source)) return "news feed";
  return topic ? `${topic} source` : "source";
}

function confidenceFor(item = {}, topic = "") {
  const sourceType = sourceTypeFor(item, topic);
  if (sourceType === "official" || sourceType === "sports data") return "high";
  if (sourceType === "market data") return "medium-high";
  if (sourceType === "news feed") return "medium";
  return "medium";
}

function whyItMattersFor(item = {}, topic = "") {
  const category = item.category || item.league || topic;
  const title = `${item.title || ""}`.toLowerCase();
  if (topic === "economics" || ["inflation", "labor", "rates", "consumer", "equities", "dollar", "oil", "credit"].includes(category)) {
    if (category === "inflation" || title.includes("inflation") || title.includes("cpi")) return "Helps users understand price pressure and cost-of-living trends.";
    if (category === "labor" || title.includes("jobs") || title.includes("unemployment")) return "Helps users understand hiring, wage pressure, and household income conditions.";
    if (category === "rates" || title.includes("treasury") || title.includes("rate")) return "Helps users understand borrowing costs, market stress, and Fed-sensitive conditions.";
    if (category === "oil") return "Helps users connect energy prices with inflation, transportation, and market risk.";
    if (category === "credit") return "Helps users watch financial stress and refinancing pressure.";
    return "Helps users connect market movement with the broader economic picture.";
  }
  if (topic === "politics" || ["federal", "congress", "courts", "elections", "oversight"].includes(category)) {
    if (category === "federal") return "Helps users track agency rules, notices, and public comment windows from primary sources.";
    if (category === "congress") return "Helps users follow legislation, floor activity, and official congressional actions.";
    if (category === "courts") return "Helps users monitor legal decisions and case activity that may affect policy or rights.";
    if (category === "elections") return "Helps users find election administration updates from official civic sources.";
    if (category === "oversight") return "Helps users follow inspector general reports, audits, and accountability findings.";
    return "Helps users understand government activity from primary or traceable sources.";
  }
  if (topic === "sports") return "Helps users check scores, schedules, matchups, and timing before asking the AI for analysis.";
  if (topic === "news") return "Helps users start from a sourced headline before asking for summary, context, or verification.";
  return "Helps users ask better follow-up questions with source context.";
}

function bestForFor(item = {}, topic = "") {
  if (topic === "economics") return "market context, macro questions, and watchlist briefings";
  if (topic === "politics") return "policy tracking, verification, and government-source research";
  if (topic === "sports") return "scores, schedules, matchups, and sports briefings";
  if (topic === "news") return "news summaries, claim checks, and follow-up research";
  return "source-aware AI answers";
}

function enrichItem(item = {}, topic = "general") {
  const summary = compactText(item.summary || item.text || item.title || "Source item");
  return {
    ...item,
    text: summary,
    summary,
    whyItMatters: item.whyItMatters || whyItMattersFor(item, topic),
    bestFor: item.bestFor || bestForFor(item, topic),
    sourceType: item.sourceType || sourceTypeFor(item, topic),
    confidence: item.confidence || confidenceFor(item, topic),
  };
}

function parseRssItems(xml, sourceLabel, limit = 6) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, limit).map((match) => {
    const item = match[1];
    const read = (tag) => decodeXml((item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`)) || [])[1] || "");
    const title = stripHtml(read("title")) || `${sourceLabel} item`;
    const description = stripHtml(read("description"));
    const published = stripHtml(read("pubDate")) || stripHtml(read("dc:date"));
    const link = stripHtml(read("link"));
    return {
      title,
      text: description || `${published || "Latest"} - ${sourceLabel}`,
      source: sourceLabel,
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

function economicsCategoryForItem(item) {
  const haystack = `${item.title || ""} ${item.text || ""} ${item.source || ""}`.toLowerCase();
  if (/\binflation\b|\bcpi\b/.test(haystack)) return "inflation";
  if (/jobs|payroll|unemployment|labor/.test(haystack)) return "labor";
  if (/treasury|rate|fed/.test(haystack)) return "rates";
  if (/consumer|xly/.test(haystack)) return "consumer";
  if (/s&p|nasdaq|stock quote|spy|qqq|ibm/.test(haystack)) return "equities";
  if (/dollar|uup/.test(haystack)) return "dollar";
  if (/oil|uso/.test(haystack)) return "oil";
  if (/credit|hyg|high yield/.test(haystack)) return "credit";
  return "all";
}

function uniqueEconomicsItems(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.category || "all"}:${item.title || ""}:${item.source || ""}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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

export async function loadNews(query = "breaking news") {
  const errors = [];
  try {
    const newsUrl = query === "breaking news"
      ? "https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en"
      : `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
    const xml = await fetchText(newsUrl, 7000);
    const items = parseNewsRss(xml, "Google News");
    if (items.length) return items.slice(0, 6).map((item) => enrichItem(item, "news"));
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
    if (items.length) return items.map((item) => enrichItem(item, "news"));
  } catch (error) {
    errors.push(error.message);
  }

  throw new Error(`News sources did not respond: ${errors.join("; ") || "unknown error"}`);
}

function needsGeneralLookup(prompt = "") {
  const lower = prompt.toLowerCase();
  return /\b(current|latest|today|now|club|team|plays for|player|profile|bio|age|born|family|spouse|wife|husband|children|ranking|rank|record|stats|contract|salary|net worth|where is|who is|what is)\b/.test(lower);
}

async function loadGeneralLookup(query = "") {
  const searchQuery = query.trim() || "current information";
  const settled = await Promise.allSettled([
    loadNews(searchQuery),
    fetchJson(`https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(searchQuery)}&mode=ArtList&format=json&maxrecords=8&sort=HybridRel`, undefined, 12000)
      .then((data) => (data.articles || []).slice(0, 8).map((article) => ({
        title: article.title || "Related source item",
        text: `${article.seendate || "Recent"} - ${article.domain || "source"}`,
        source: article.domain || "GDELT",
        timestamp: article.seendate || "Recent",
        url: article.url,
      }))),
  ]);
  const items = settled.flatMap((result) => result.status === "fulfilled" ? result.value : []);
  const uniqueItems = [...new Map(items.map((item) => [`${item.title}|${item.url}`, item])).values()];
  return uniqueItems.slice(0, 8).map((item) => enrichItem(item, "news"));
}

export async function loadEconomics(category = "all") {
  const marketRequests = {
    equities: [
      fetchText("https://stooq.com/q/l/?s=spy.us&f=sd2t2ohlcv&h&e=csv").then((csv) => stooqCsvToItem(csv, "spy.us", "S&P 500 ETF")),
      fetchText("https://stooq.com/q/l/?s=qqq.us&f=sd2t2ohlcv&h&e=csv").then((csv) => stooqCsvToItem(csv, "qqq.us", "Nasdaq 100 ETF")),
    ],
    dollar: [
      fetchText("https://stooq.com/q/l/?s=uup.us&f=sd2t2ohlcv&h&e=csv").then((csv) => stooqCsvToItem(csv, "uup.us", "U.S. Dollar ETF")),
    ],
    oil: [
      fetchText("https://stooq.com/q/l/?s=uso.us&f=sd2t2ohlcv&h&e=csv").then((csv) => stooqCsvToItem(csv, "uso.us", "Oil ETF")),
    ],
    credit: [
      fetchText("https://stooq.com/q/l/?s=hyg.us&f=sd2t2ohlcv&h&e=csv").then((csv) => stooqCsvToItem(csv, "hyg.us", "High yield credit ETF")),
    ],
    consumer: [
      fetchText("https://stooq.com/q/l/?s=xly.us&f=sd2t2ohlcv&h&e=csv").then((csv) => stooqCsvToItem(csv, "xly.us", "Consumer discretionary ETF")),
    ],
  };
  const blsRequest = fetchBlsSeries();
  const treasuryRequest = fetchJson("https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/avg_interest_rates?sort=-record_date&page[size]=2")
    .then((data) => (data.data || []).slice(0, 2).map((item) => ({
      title: `${item.security_desc || "Treasury security"} rate`,
      text: `${item.record_date}: average interest rate ${item.avg_interest_rate_amt || "n/a"}%.`,
      source: "U.S. Treasury Fiscal Data",
      timestamp: item.record_date,
      url: "https://fiscaldata.treasury.gov/datasets/average-interest-rates-treasury-securities/average-interest-rates",
    })));
  const requests = category === "all"
    ? [...Object.values(marketRequests).flat(), blsRequest, treasuryRequest]
    : [
      ...(marketRequests[category] || []),
      ...(category === "inflation" || category === "labor" ? [blsRequest] : []),
      ...(category === "rates" ? [treasuryRequest] : []),
    ];
  const settled = await Promise.allSettled(requests);
  const items = uniqueEconomicsItems(settled
    .flatMap((result) => result.status === "fulfilled" ? result.value : [])
    .map((item) => ({ ...item, category: economicsCategoryForItem(item) })));
  if (!items.length) throw new Error("Economics sources were unavailable.");
  const filteredItems = category === "all" ? items : items.filter((item) => item.category === category);
  return filteredItems.slice(0, 10).map((item) => enrichItem(item, "economics"));
}

export async function loadPolitics(category = "all") {
  const loaders = {
    federal: loadFederalRegister,
    congress: loadCongress,
    courts: loadCourts,
    elections: loadElections,
    oversight: loadAccountability,
  };
  const selectedLoader = loaders[category];
  const settled = await Promise.allSettled(selectedLoader
    ? [selectedLoader()]
    : [
      loadFederalRegister(),
      loadCongress(),
      loadCourts(),
      loadElections(),
      loadAccountability(),
    ]);
  const items = settled.flatMap((result) => result.status === "fulfilled" ? result.value : []);
  if (!items.length) throw new Error("Government and politics sources were unavailable.");
  return items.slice(0, 18).map((item) => enrichItem(item, "politics"));
}

export async function loadFederalRegister() {
  const data = await fetchJson("https://www.federalregister.gov/api/v1/documents.json?per_page=6&order=newest");
  return (data.results || []).slice(0, 6).map((item) => ({
    category: "federal",
    title: item.title || "Federal Register item",
    text: `${item.publication_date || "Recent"} - ${(item.agencies || []).map((agency) => agency.name).slice(0, 2).join(", ") || "Federal agency"}`,
    source: "Federal Register government data",
    timestamp: item.publication_date || "Recent",
    url: item.html_url,
  }));
}

export async function loadCongress() {
  const apiKey = process.env.CONGRESS_API_KEY || process.env.CONGRESS_GOV_API_KEY || "DEMO_KEY";
  try {
    const data = await fetchJson(`https://api.congress.gov/v3/bill?format=json&limit=8&api_key=${encodeURIComponent(apiKey)}`, undefined, 12000);
    const bills = data.bills || [];
    if (bills.length) {
      return bills.slice(0, 8).map((bill) => ({
        category: "congress",
        title: `${bill.type || "Bill"} ${bill.number || ""}: ${bill.title || "Congressional bill"}`.trim(),
        text: `${bill.latestAction?.actionDate || bill.updateDate || "Recent"} - ${bill.latestAction?.text || "Latest action from Congress.gov."}`,
        source: "Congress.gov API",
        timestamp: bill.latestAction?.actionDate || bill.updateDate || "Recent",
        url: bill.url || `https://www.congress.gov/bill/${bill.congress || "119th-congress"}/${String(bill.type || "bill").toLowerCase()}/${bill.number || ""}`,
      }));
    }
  } catch {
    // Fall through to no-key RSS feeds.
  }

  const feeds = [
    { url: "https://www.congress.gov/rss/bills-presented-to-the-president.xml", label: "Congress.gov bills presented to the President" },
    { url: "https://www.congress.gov/rss/house-floor-today.xml", label: "Congress.gov House floor" },
    { url: "https://www.congress.gov/rss/senate-floor-today.xml", label: "Congress.gov Senate floor" },
  ];
  const settled = await Promise.allSettled(feeds.map((feed) => (
    fetchText(feed.url, 9000).then((xml) => parseRssItems(xml, feed.label, 4))
  )));
  const items = settled.flatMap((result) => result.status === "fulfilled" ? result.value : []);
  if (!items.length) return [];
  return items.slice(0, 8);
}

export async function loadCourts(query = "federal court") {
  const url = `https://www.courtlistener.com/api/rest/v4/search/?q=${encodeURIComponent(query)}&type=o&order_by=dateFiled%20desc`;
  const data = await fetchJson(url, {
    headers: process.env.COURTLISTENER_API_KEY ? { Authorization: `Token ${process.env.COURTLISTENER_API_KEY}` } : {},
  }, 12000);
  const results = data.results || [];
  if (!results.length) return [];
  return results.slice(0, 6).map((item) => ({
    category: "courts",
    title: item.caseName || item.caseNameFull || "Court opinion",
    text: `${item.dateFiled || "Recent"} - ${stripHtml(item.snippet || item.court || "CourtListener result")}`,
    source: item.court || "CourtListener legal search",
    timestamp: item.dateFiled || "Recent",
    url: absoluteUrl("https://www.courtlistener.com", item.absolute_url),
  }));
}

export async function loadElections() {
  const sources = [
    { url: "https://www.eac.gov/news", label: "U.S. Election Assistance Commission news" },
    { url: "https://www.eac.gov/", label: "U.S. Election Assistance Commission" },
    { url: "https://vote.gov/", label: "Vote.gov official voter information" },
  ];
  const settled = await Promise.allSettled(sources.map((source) => fetchText(source.url, 9000).then((html) => ({ ...source, html }))));
  const items = settled.flatMap((result) => {
    if (result.status !== "fulfilled") return [];
    const { url, label, html } = result.value;
    const linkMatches = [...html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/g)]
      .map((match) => ({ href: match[1], title: stripHtml(match[2]) }))
      .filter((item) => item.title.length > 18 && !/skip|menu|search|language|breadcrumb|navigation|read more|view all|^united states election assistance commission$/i.test(item.title))
      .slice(0, 3);
    const titleMatches = linkMatches.length ? linkMatches : [...html.matchAll(/<h[123][^>]*>([\s\S]*?)<\/h[123]>/g)]
      .map((match) => ({ href: url, title: stripHtml(match[1]) }))
      .filter((item) => item.title.length > 10 && !/skip|menu|search|language|breadcrumb|navigation|^news$/i.test(item.title))
      .slice(0, 3);
    return titleMatches.map((item) => ({
      category: "elections",
      title: item.title,
      text: `Election administration source loaded from ${label}.`,
      source: label,
      timestamp: new Date().toLocaleDateString(),
      url: absoluteUrl(url, item.href),
    }));
  });
  const uniqueItems = [...new Map(items.map((item) => [`${item.title}|${item.url}`, item])).values()];
  if (!uniqueItems.length) return [];
  return uniqueItems.slice(0, 6);
}

export async function loadAccountability() {
  const sources = [
    { url: "https://www.oversight.gov/reports/all", label: "Oversight.gov reports" },
    { url: "https://www.oversight.gov/reports/investigations", label: "Oversight.gov investigations" },
  ];
  const settled = await Promise.allSettled(sources.map((source) => fetchText(source.url, 12000).then((html) => ({ ...source, html }))));
  const items = settled.flatMap((result) => {
    if (result.status !== "fulfilled") return [];
    const { url, label, html } = result.value;
    const titleMatches = [...html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/g)]
      .map((match) => ({ href: match[1], title: stripHtml(match[2]) }))
      .filter((item) => item.title.length > 30 && /report|audit|investigat|recommend|review|summary|finding/i.test(item.title))
      .slice(0, 5);
    return titleMatches.map((item) => ({
      category: "oversight",
      title: item.title,
      text: `Inspector General accountability item from ${label}.`,
      source: label,
      timestamp: new Date().toLocaleDateString(),
      url: absoluteUrl(url, item.href),
    }));
  });
  if (!items.length) return [];
  return items.slice(0, 8);
}

export async function loadSports(league = "all") {
  const today = new Date();
  const dateOffsets = [-7, -3, 0, 3, 7, 14, 21, 30];
  const dateStamp = (offset) => {
    const date = new Date(today);
    date.setDate(date.getDate() + offset);
    return date.toISOString().slice(0, 10).replace(/-/g, "");
  };
  const withDate = (url, offset) => `${url}${url.includes("?") ? "&" : "?"}dates=${dateStamp(offset)}`;
  const leagues = {
    NBA: { url: "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard", label: "ESPN NBA", home: "https://www.espn.com/nba/scoreboard" },
    NFL: { url: "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard", label: "ESPN NFL", home: "https://www.espn.com/nfl/scoreboard" },
    MLB: { url: "https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard", label: "ESPN MLB", home: "https://www.espn.com/mlb/scoreboard" },
    NHL: { url: "https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard", label: "ESPN NHL", home: "https://www.espn.com/nhl/scoreboard" },
    GOLF: { url: "https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard", label: "ESPN Golf", home: "https://www.espn.com/golf/leaderboard" },
    TENNIS: { url: "https://site.api.espn.com/apis/site/v2/sports/tennis/atp/scoreboard", label: "ESPN Tennis", home: "https://www.espn.com/tennis/schedule" },
    EPL: { url: "https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard", label: "ESPN Premier League", home: "https://www.espn.com/soccer/scoreboard/_/league/eng.1" },
    UCL: { url: "https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard", label: "ESPN Champions League", home: "https://www.espn.com/soccer/scoreboard/_/league/uefa.champions" },
    WORLDCUP: { url: "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard", label: "ESPN World Cup", home: "https://www.espn.com/soccer/scoreboard/_/league/fifa.world" },
    WWC: { url: "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.wwc/scoreboard", label: "ESPN Women's World Cup", home: "https://www.espn.com/soccer/scoreboard/_/league/fifa.wwc" },
    LALIGA: { url: "https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard", label: "ESPN La Liga", home: "https://www.espn.com/soccer/scoreboard/_/league/esp.1" },
    SERIEA: { url: "https://site.api.espn.com/apis/site/v2/sports/soccer/ita.1/scoreboard", label: "ESPN Serie A", home: "https://www.espn.com/soccer/scoreboard/_/league/ita.1" },
    BUNDESLIGA: { url: "https://site.api.espn.com/apis/site/v2/sports/soccer/ger.1/scoreboard", label: "ESPN Bundesliga", home: "https://www.espn.com/soccer/scoreboard/_/league/ger.1" },
    LIGUE1: { url: "https://site.api.espn.com/apis/site/v2/sports/soccer/fra.1/scoreboard", label: "ESPN Ligue 1", home: "https://www.espn.com/soccer/scoreboard/_/league/fra.1" },
    MLS: { url: "https://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/scoreboard", label: "ESPN MLS", home: "https://www.espn.com/soccer/scoreboard/_/league/usa.1" },
    LIGAMX: { url: "https://site.api.espn.com/apis/site/v2/sports/soccer/mex.1/scoreboard", label: "ESPN Liga MX", home: "https://www.espn.com/soccer/scoreboard/_/league/mex.1" },
    NWSL: { url: "https://site.api.espn.com/apis/site/v2/sports/soccer/usa.nwsl/scoreboard", label: "ESPN NWSL", home: "https://www.espn.com/soccer/scoreboard/_/league/usa.nwsl" },
    UEL: { url: "https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.europa/scoreboard", label: "ESPN Europa League", home: "https://www.espn.com/soccer/scoreboard/_/league/uefa.europa" },
    UFC: { url: "https://site.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard", label: "ESPN UFC", home: "https://www.espn.com/mma/fightcenter" },
    BOXING: { url: "https://site.api.espn.com/apis/site/v2/sports/boxing/boxing/scoreboard", label: "ESPN Boxing", home: "https://www.espn.com/boxing/" },
  };
  const soccerKeys = ["EPL", "UCL", "WORLDCUP", "WWC", "LALIGA", "SERIEA", "BUNDESLIGA", "LIGUE1", "MLS", "LIGAMX", "NWSL", "UEL"];
  const withKey = (key) => leagues[key] ? { ...leagues[key], key } : null;
  const targets = league === "all"
    ? Object.keys(leagues).map(withKey).filter(Boolean)
    : league === "SOCCER"
      ? soccerKeys.map(withKey).filter(Boolean)
      : [withKey(league)].filter(Boolean);
  const urlsForTarget = (target) => (
    league === "all" ? [target.url] : [target.url, ...dateOffsets.map((offset) => withDate(target.url, offset))]
  );
  const jobs = targets.flatMap((target) => (
    urlsForTarget(target).map((url) => ({ target, request: fetchJson(url).then((data) => ({ data, target })) }))
  ));
  const settled = await Promise.allSettled(jobs.map((job) => job.request));
  const perSourceLimit = league === "all" ? 2 : 4;
  const items = settled.flatMap((result, index) => {
    if (result.status !== "fulfilled") {
      return [];
    }
    const { data, target } = result.value;
    return (data.events || []).slice(0, perSourceLimit).map((event) => {
      const competitors = event.competitions?.[0]?.competitors || [];
      const names = competitors.map((team) => team.team?.shortDisplayName || team.team?.displayName).filter(Boolean).join(" vs ");
      const scores = competitors.map((team) => `${team.team?.abbreviation || "TEAM"} ${team.score || "0"}`).join(" | ");
      return {
        league: target.key,
        title: names || event.name || `${target.label} event`,
        text: `${event.status?.type?.shortDetail || "Scheduled"}${scores ? ` - ${scores}` : ""}`,
        source: "espn.com",
        timestamp: event.date ? new Date(event.date).toLocaleString() : "Schedule",
        url: event.links?.[0]?.href,
      };
    });
  });
  const seen = new Set();
  const uniqueItems = items.filter((item) => {
    const key = `${item.league}-${item.title}-${item.timestamp}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const sortedItems = uniqueItems.sort((a, b) => {
    const aTime = Date.parse(a.timestamp || "") || 0;
    const bTime = Date.parse(b.timestamp || "") || 0;
    return bTime - aTime;
  });
  if (!uniqueItems.length && league !== "all") return [];
  if (!sortedItems.length) throw new Error("Sports scoreboards were unavailable.");
  return sortedItems.slice(0, league === "all" ? 36 : 12).map((item) => enrichItem(item, "sports"));
}

function extractResponseText(data) {
  if (data.choices?.[0]?.message?.content) return data.choices[0].message.content;
  if (data.output_text) return data.output_text;
  return (data.output || []).flatMap((item) => item.content || []).map((content) => content.text || "").join("\n").trim();
}

function historyToText(history = []) {
  return history.slice(-8).map((item) => {
    const role = item.role === "assistant" ? "Assistant" : "User";
    const text = (item.content || []).map((content) => content.text || "").join(" ").trim();
    return text ? `${role}: ${text}` : "";
  }).filter(Boolean).join("\n");
}

function classifyChatPrompt(prompt = "") {
  const lower = prompt.toLowerCase();
  if (/\b(nba|basketball)\b/.test(lower)) return { topic: "sports", league: "NBA" };
  if (/\b(nfl|football)\b/.test(lower)) return { topic: "sports", league: "NFL" };
  if (/\b(mlb|baseball)\b/.test(lower)) return { topic: "sports", league: "MLB" };
  if (/\b(nhl|hockey)\b/.test(lower)) return { topic: "sports", league: "NHL" };
  if (/\b(golf|pga)\b/.test(lower)) return { topic: "sports", league: "GOLF" };
  if (/\b(tennis|atp|wta)\b/.test(lower)) return { topic: "sports", league: "TENNIS" };
  if (/\b(ufc|mma)\b/.test(lower)) return { topic: "sports", league: "UFC" };
  if (/\b(boxing|fight card)\b/.test(lower)) return { topic: "sports", league: "BOXING" };
  if (/\b(epl|premier league)\b/.test(lower)) return { topic: "sports", league: "EPL" };
  if (/\b(champions league|ucl)\b/.test(lower)) return { topic: "sports", league: "UCL" };
  if (/\b(world cup|fifa world cup|worldcup)\b/.test(lower)) return { topic: "sports", league: "WORLDCUP" };
  if (/\b(europa league|uel)\b/.test(lower)) return { topic: "sports", league: "UEL" };
  if (/\b(soccer|football club|la liga|serie a|bundesliga|ligue 1|mls|liga mx|nwsl|europa)\b/.test(lower)) return { topic: "sports", league: "SOCCER" };
  if (/\b(sports?|scores?|schedule|standings|game|match)\b/.test(lower)) return { topic: "sports", league: "all" };
  if (/\b(politics?|government|federal|agency|agencies|policy|policies|congress|senate|house|court|election|public issue|issues?|regulation|rulemaking)\b/.test(lower)) return { topic: "politics" };
  if (/\b(automation|automate|alert|alerts|schedule|scheduled|reminder|monitor|watchlist|notify|notification|email|text message|sms|daily|hourly|weekly|task|tasks)\b/.test(lower)) return { topic: "automation" };
  if (/\b(economy|economic|markets?|stocks?|inflation|jobs|fed|rates?|treasury|oil|credit)\b/.test(lower)) return { topic: "economics" };
  if (/\b(news|headlines?|breaking|latest|today)\b/.test(lower)) return { topic: "news" };
  return { topic: "general" };
}

function isSpecificSportsResultPrompt(prompt = "") {
  return /\b(who|against|opponent|score|lost|loss|beat|defeated|eliminated|knocked out|result|won|winner|final)\b/i.test(prompt);
}

function formatLiveContext(label, items = []) {
  if (!items.length) return "";
  return [
    `${label} live context:`,
    ...items.slice(0, 8).map((item, index) => (
      `${index + 1}. ${item.title || "Untitled"} - ${item.summary || item.text || ""} Why it matters: ${item.whyItMatters || "Use as source context."} Source: ${item.source || "live source"} (${item.sourceType || "source"}) Time: ${item.timestamp || "latest"}${item.url ? ` URL: ${item.url}` : ""}`
    )),
  ].join("\n");
}

async function buildBackendLiveContext(prompt = "") {
  const intent = classifyChatPrompt(prompt);
  const lower = prompt.toLowerCase();
  const requests = [];
  if (intent.topic === "sports") {
    requests.push(["Sports", loadSports(intent.league)]);
    if (needsGeneralLookup(prompt) || isSpecificSportsResultPrompt(prompt) || /\b(winner|champion|champions|won|final|latest|news|update)\b/.test(lower)) {
      requests.push(["Related sports news", loadNews(prompt)]);
    }
  }
  if (intent.topic === "politics") {
    requests.push(["Government and politics", loadPolitics()]);
    requests.push(["Related headlines", loadNews()]);
  }
  if (intent.topic === "economics") requests.push(["Economics and markets", loadEconomics()]);
  if (intent.topic === "news") requests.push(["News", loadNews()]);
  if (intent.topic === "general" && needsGeneralLookup(prompt)) {
    requests.push(["General source lookup", loadGeneralLookup(prompt)]);
  }
  if (intent.topic === "automation") {
    return [
      "Automation planning context:",
      "The app can save alerts, preferences, favorite teams, watchlists, topics, schedules, cadence, triggers, and notification routes in browser storage.",
      "When the user asks for an automation, give a clear setup with: name, goal, trigger, cadence, sources, output, notification route, and what backend/database support would strengthen it.",
      "If the automation depends on live data, recommend the matching live backend route: /api/live/news, /api/live/economics, /api/live/politics, or /api/live/sports.",
    ].join("\n");
  }
  if (!requests.length) return "";

  const settled = await Promise.allSettled(requests.map(([, request]) => request));
  const sections = settled.map((result, index) => {
    const [label] = requests[index];
    if (result.status === "fulfilled") return formatLiveContext(label, result.value);
    return `${label} live context unavailable: ${result.reason?.message || "source did not respond"}`;
  }).filter(Boolean);

  return [
    "Use this backend-fetched live context when relevant. Do not claim it covers everything; mention source limits when needed.",
    "For person, player, team, club, profile, family, or current-status questions, use General source lookup and Related sports news when present. If a direct source supports the answer, answer directly and cite the source name or URL. Do not say sources do not confirm when the provided context does confirm it.",
    "For sports result questions, answer the opponent/winner and final score first when that information appears in live context. If the opponent or score is missing, say the loaded sources do not confirm that exact detail and name the official event, league, ESPN, or tournament score page to check. Do not provide a partial result as if it is complete.",
    ...sections,
  ].join("\n\n");
}

export async function chat(body) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("The backend needs OPENAI_API_KEY before real AI answers are enabled.");
  }
  const backendLiveContext = await buildBackendLiveContext(body.prompt || "");
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/New_York",
  });
  const messages = [
    { role: "system", content: [body.systemPrompt || "You are TRUMP AI, a neutral general assistant.", `Today is ${currentDate}. Answer current-event, sports, market, and policy questions against this date. Never say "as of my last knowledge update." If the backend live context does not answer a current question, say the loaded sources do not confirm it and name the official source to check.`, "Answer any normal user question directly. News, politics, government, economics, sports, and automation are optional specialties, not limits. When live context is available, use it. When live context is insufficient, say the loaded sources do not confirm the answer and name what source should be checked. For sports result questions, do not stop at a storyline: include opponent/winner, score, round/date, and source when known.", backendLiveContext].filter(Boolean).join("\n\n") },
    ...(body.history || []).slice(-8).map((item) => ({
      role: item.role === "assistant" ? "assistant" : "user",
      content: (item.content || []).map((content) => content.text || "").join(" ").trim() || "",
    })).filter((item) => item.content),
    { role: "user", content: body.prompt || "" },
  ];
  const response = await fetchJson("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: normalizeModelName(body.modelName),
      messages,
      max_tokens: body.maxOutputTokens || 900,
    }),
  }, 45000);
  return { text: extractResponseText(response) || "I received an empty response from the model." };
}
