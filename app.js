const views = {
  command: "Command Center",
  automation: "Automation Builder",
  news: "News Briefing",
  markets: "Economics Dashboard",
  politics: "Politics Tracker",
  sports: "Sports Desk",
  settings: "Source Settings",
};

const newsItems = [
  { category: "world", title: "Global Watch", text: "Track major diplomatic, security, and humanitarian developments with concise context and impact notes.", source: "Briefing model" },
  { category: "business", title: "Corporate Signals", text: "Summarize earnings, layoffs, mergers, supply chains, and CEO commentary into an executive-ready digest.", source: "Business desk" },
  { category: "technology", title: "AI and Tech", text: "Monitor product launches, model releases, regulation, chips, cybersecurity, and platform policy changes.", source: "Tech radar" },
  { category: "business", title: "Energy and Commodities", text: "Connect oil, gas, power, agriculture, metals, and shipping moves to inflation and market pressure.", source: "Macro desk" },
  { category: "world", title: "Risk Map", text: "Flag countries, regions, and events where policy risk could spill into markets or security planning.", source: "Risk engine" },
  { category: "technology", title: "Platform Pulse", text: "Watch search, social, streaming, and app store changes that influence media reach and consumer behavior.", source: "Media monitor" },
];

const politicsItems = [
  { title: "Policy Calendar", text: "Build weekly summaries of votes, hearings, executive actions, court deadlines, and agency rulemaking.", source: "Civic tracker" },
  { title: "Election Landscape", text: "Compare polling direction, fundraising, turnout indicators, ballot access, and district-level pressure points.", source: "Elections desk" },
  { title: "Legislation Monitor", text: "Turn bills and amendments into plain-English summaries with likely winners, losers, and open questions.", source: "Policy parser" },
  { title: "Public Opinion", text: "Separate headline noise from durable opinion shifts across economy, immigration, health care, and foreign policy.", source: "Sentiment desk" },
  { title: "Geopolitics", text: "Connect international political developments to trade, defense, supply chains, energy, and financial markets.", source: "Global policy" },
  { title: "Accountability", text: "Highlight claims that need verification and identify the primary sources needed to check them.", source: "Fact file" },
];

const sportsItems = [
  { league: "NBA", title: "NBA Nightly Edge", text: "Injuries, rest, matchups, playoff races, and star usage changes." },
  { league: "NFL", title: "NFL Board", text: "Roster moves, schedule spots, quarterback health, and divisional stakes." },
  { league: "MLB", title: "MLB Diamond Notes", text: "Probable pitchers, bullpen workload, streaks, and weather impact." },
  { league: "NHL", title: "NHL Ice Sheet", text: "Goalie confirmations, special teams, travel, and playoff intensity." },
  { league: "GOLF", title: "Golf Leaderboard Watch", text: "Tournament rounds, tee times, leaderboard movement, course fit, and weather." },
  { league: "TENNIS", title: "Tennis Match Desk", text: "Draws, match schedules, surface trends, injuries, and form swings." },
  { league: "UFC", title: "UFC Fight Card", text: "Fight schedules, weigh-ins, injuries, matchup styles, and card changes." },
  { league: "BOXING", title: "Boxing Fight Board", text: "Fight cards, weigh-ins, rankings, title bouts, judging notes, and late changes." },
  { league: "NBA", title: "Betting Context", text: "Market movement, public narratives, and stat angles without guaranteed picks." },
  { league: "MLB", title: "Prospect Watch", text: "Call-ups, minor league surges, injuries, and development storylines." },
];

const marketMetrics = [
  { label: "Inflation trend", value: "Sticky", tone: "flat", note: "Watch CPI, PCE, wage growth, rents, and energy." },
  { label: "Labor market", value: "Cooling", tone: "down", note: "Track payrolls, claims, quits, and participation." },
  { label: "Fed stance", value: "Data-led", tone: "flat", note: "Focus on speeches, minutes, dots, and credit stress." },
  { label: "Consumer", value: "Mixed", tone: "flat", note: "Retail sales, delinquencies, sentiment, and savings matter." },
  { label: "Equities", value: "Risk-on", tone: "up", note: "Breadth, earnings revisions, and rates decide durability." },
  { label: "Dollar", value: "Firm", tone: "up", note: "Rate differentials and global stress drive the move." },
  { label: "Oil", value: "Volatile", tone: "flat", note: "Supply discipline, demand data, and geopolitics lead." },
  { label: "Credit", value: "Watch", tone: "down", note: "Spreads and refinancing pressure reveal stress early." },
];

const defaultTasks = [
  { name: "Morning intelligence brief", cadence: "Daily", scheduleTime: "08:00", focus: "Summarize top news, economic indicators, policy events, and sports storylines by 8 AM.", channel: "dashboard", email: "", phone: "", trigger: "Daily executive brief", active: true, lastChecked: "" },
  { name: "Inflation and Fed watch", cadence: "Weekly", scheduleTime: "09:00", focus: "Track CPI, PCE, jobs, Fed speeches, treasury yields, and market expectations.", channel: "email", email: "", phone: "", trigger: "CPI, jobs, Fed decision, yield move", active: true, lastChecked: "" },
  { name: "Breaking news triage", cadence: "Hourly", scheduleTime: "", focus: "Check for urgent world, business, politics, and sports updates and rank by importance.", channel: "both", email: "", phone: "", trigger: "Breaking news or major score/policy/market shock", active: false, lastChecked: "" },
];

const defaultSettings = {
  openaiApiKey: "",
  newsSource: "",
  marketSource: "",
  sportsSource: "",
  modelName: "gpt-5.4-mini",
  tone: "neutral",
  length: "balanced",
  citations: true,
  alerts: true,
  favoriteTeams: "",
  marketWatchlist: "",
  topicWatchlist: "",
  homeRegion: "",
};

const chatLog = document.querySelector("#chat-log");
const chatForm = document.querySelector("#chat-form");
const chatInput = document.querySelector("#chat-input");
const viewTitle = document.querySelector("#view-title");
const dailyBrief = document.querySelector("#daily-brief");
const taskList = document.querySelector("#task-list");
const alertSummary = document.querySelector("#alert-summary");
const readinessList = document.querySelector("#readiness-list");
const integrationPlan = document.querySelector("#integration-plan");
const preferenceSummary = document.querySelector("#preference-summary");

let tasks = [];
let settings = { ...defaultSettings };
const conversationHistory = [];
const liveData = {
  news: [],
  economics: [],
  politics: [],
  sports: [],
};

const domainPrompts = {
  base: `You are TRUMP AI, a neutral, source-aware research and briefing assistant. You are not Donald Trump and must not impersonate any real person. Be direct, practical, and nonpartisan. If current/live facts are requested and no source data is provided, say what you can infer and what should be verified. Avoid fabricating citations, prices, scores, polls, or breaking news.`,
  news: `News mode: prioritize verified events, timestamps, source quality, affected people or institutions, and likely second-order impact. Separate confirmed facts from uncertainty. Ask for live source links when needed.`,
  economics: `Economics mode: explain macro signals, market context, inflation, labor, rates, credit, commodities, and consumer data. Avoid financial advice. Present assumptions, risks, and data that would change the view.`,
  politics: `Politics mode: stay nonpartisan. Explain policy, institutions, elections, legislation, courts, and public opinion with neutral framing. Flag claims that need primary-source verification.`,
  sports: `Sports mode: cover schedules, scores, injuries, matchups, standings, roster news, and betting context without guaranteeing outcomes. Clearly separate analysis from confirmed results.`,
  automation: `Automation planning mode: convert user goals into monitors, triggers, cadence, sources, thresholds, and output formats. Be specific about what can run now in this prototype versus what needs a backend scheduler.`,
};

const DB_NAME = "trump-ai-db";
const DB_VERSION = 1;
const STORE_NAME = "records";
let dbPromise;

function normalizeTask(task) {
  return {
    name: "New monitor",
    cadence: "Daily",
    scheduleTime: "",
    focus: "",
    channel: "dashboard",
    email: "",
    phone: "",
    trigger: "",
    active: true,
    lastChecked: "",
    ...task,
  };
}

function openDatabase() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB is not available in this browser."));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

async function dbGet(key) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function dbSet(key, value) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function loadStoredState() {
  try {
    const [storedTasks, storedSettings] = await Promise.all([dbGet("tasks"), dbGet("settings")]);
    const legacyTasks = JSON.parse(localStorage.getItem("trump-ai-tasks") || "null");
    const legacySettings = JSON.parse(localStorage.getItem("trump-ai-settings") || "null");
    tasks = (storedTasks || legacyTasks || defaultTasks).map(normalizeTask);
    settings = { ...defaultSettings, ...(storedSettings || legacySettings || {}) };
    await Promise.all([dbSet("tasks", tasks), dbSet("settings", settings)]);
  } catch (error) {
    tasks = (JSON.parse(localStorage.getItem("trump-ai-tasks") || "null") || defaultTasks).map(normalizeTask);
    settings = { ...defaultSettings, ...(JSON.parse(localStorage.getItem("trump-ai-settings") || "null") || {}) };
    addMessage("ai", `Database fallback active: ${error.message}`);
  }
}

async function saveTasks() {
  localStorage.setItem("trump-ai-tasks", JSON.stringify(tasks));
  try {
    await dbSet("tasks", tasks);
  } catch (error) {
    addMessage("ai", `Saved locally, but database sync failed: ${error.message}`);
  }
}

async function saveSettings() {
  localStorage.setItem("trump-ai-settings", JSON.stringify(settings));
  try {
    await dbSet("settings", settings);
  } catch (error) {
    addMessage("ai", `Settings saved locally, but database sync failed: ${error.message}`);
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function splitList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatList(value, fallback = "none saved") {
  const items = splitList(value);
  return items.length ? items.join(", ") : fallback;
}

function setView(viewName) {
  document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"));
  document.querySelector(`#${viewName}`).classList.add("active");
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === viewName));
  viewTitle.textContent = views[viewName];
}

function addMessage(role, text) {
  const message = document.createElement("div");
  message.className = `message ${role}`;
  message.textContent = text;
  chatLog.append(message);
  chatLog.scrollTop = chatLog.scrollHeight;
  return message;
}

function setLoadingButton(button, isLoading, label) {
  if (isLoading) {
    button.dataset.originalHtml = button.innerHTML;
    button.disabled = true;
    button.classList.add("is-loading");
    button.innerHTML = `<span class="spinner" aria-hidden="true"></span>${label}`;
    return;
  }
  button.disabled = false;
  button.classList.remove("is-loading");
  button.innerHTML = button.dataset.originalHtml || button.innerHTML;
  delete button.dataset.originalHtml;
}

function generatePrototypeReply(prompt) {
  const lower = prompt.toLowerCase();
  const activeTasks = tasks.filter((task) => task.active).length;
  const sourceCount = [settings.newsSource, settings.marketSource, settings.sportsSource].filter(Boolean).length;
  const profile = `${settings.tone.replace("-", " ")} tone, ${settings.length} depth, ${settings.citations ? "citations required" : "draft mode"}`;

  if (lower.includes("setting") || lower.includes("source") || lower.includes("api") || lower.includes("connect")) {
    return `Source setup: ${sourceCount}/3 live sources are configured and the primary model is ${settings.modelName || "not set"}. Use Settings to add endpoints, then keep the current ${profile}.`;
  }
  if (lower.includes("automation") || lower.includes("task") || lower.includes("alert")) {
    return `Automation plan: ${activeTasks} monitors are active. Next, choose trigger thresholds, source priority, and output format. Strong defaults are a daily brief, hourly breaking-news triage, weekly macro monitor, and league-specific sports alerts.`;
  }
  if (lower.includes("economic") || lower.includes("market") || lower.includes("inflation") || lower.includes("fed")) {
    return `Economics brief: watch inflation persistence, labor cooling, Fed communication, credit spreads, oil volatility, and consumer stress. Market source status: ${settings.marketSource ? "configured" : "needs endpoint"}.`;
  }
  if (lower.includes("politic") || lower.includes("election") || lower.includes("policy")) {
    return "Politics brief: track the policy calendar, legislation, court deadlines, election indicators, fundraising, and public opinion. Keep it nonpartisan and cite primary sources when live data is connected.";
  }
  if (lower.includes("sport") || lower.includes("nba") || lower.includes("nfl") || lower.includes("mlb") || lower.includes("nhl")) {
    return "Sports brief: monitor injuries, schedules, rest, roster moves, weather, standings pressure, and matchup edges. Add league filters so every sport has its own fast briefing lane.";
  }
  if (lower.includes("news") || lower.includes("brief")) {
    return `News brief: prioritize verified breaking events, business impact, geopolitical risk, technology shifts, and policy consequences. Current profile: ${profile}.`;
  }
  return `I can help with research, automation, news, economics, politics, and sports. I am currently set for ${profile}; connect sources in Settings when you want live data instead of prototype cards.`;
}

function classifyPrompt(prompt) {
  const lower = prompt.toLowerCase();
  if (lower.includes("automation") || lower.includes("task") || lower.includes("alert") || lower.includes("monitor")) return "automation";
  if (lower.includes("economic") || lower.includes("market") || lower.includes("inflation") || lower.includes("fed") || lower.includes("stock") || lower.includes("jobs")) return "economics";
  if (lower.includes("politic") || lower.includes("election") || lower.includes("policy") || lower.includes("congress") || lower.includes("court")) return "politics";
  if (lower.includes("sport") || lower.includes("nba") || lower.includes("nfl") || lower.includes("mlb") || lower.includes("nhl") || lower.includes("score")) return "sports";
  if (lower.includes("news") || lower.includes("headline") || lower.includes("brief") || lower.includes("breaking")) return "news";
  return "base";
}

function buildSystemPrompt(prompt) {
  const domain = classifyPrompt(prompt);
  const profile = `Tone: ${settings.tone}. Depth: ${settings.length}. Citations expected: ${settings.citations ? "yes, when sources are supplied" : "not required"}.`;
  const sources = [
    settings.newsSource ? `News source: ${settings.newsSource}` : "News source: not configured",
    settings.marketSource ? `Market source: ${settings.marketSource}` : "Market source: not configured",
    settings.sportsSource ? `Sports source: ${settings.sportsSource}` : "Sports source: not configured",
  ].join("\n");
  const activeTaskSummary = tasks
    .filter((task) => task.active)
    .map((task) => `- ${task.name} (${task.cadence}): ${task.focus}`)
    .join("\n") || "- No active automations";
  const liveSummary = Object.entries(liveData)
    .map(([topic, items]) => {
      if (!items.length) return `${topic}: no live data loaded`;
      return `${topic}: ${items.slice(0, 4).map((item) => item.title || item.value || item.text).join("; ")}`;
    })
    .join("\n");
  const userPreferences = [
    `Favorite teams: ${formatList(settings.favoriteTeams)}`,
    `Market watchlist: ${formatList(settings.marketWatchlist)}`,
    `Topics: ${formatList(settings.topicWatchlist)}`,
    `Home region: ${settings.homeRegion || "not set"}`,
  ].join("\n");

  return [
    domainPrompts.base,
    domain !== "base" ? domainPrompts[domain] : "",
    profile,
    "Current saved data source settings:",
    sources,
    "Current active automation context:",
    activeTaskSummary,
    "User saved preferences:",
    userPreferences,
    "Latest live data loaded in this browser:",
    liveSummary,
  ].filter(Boolean).join("\n\n");
}

function extractResponseText(data) {
  if (data.output_text) return data.output_text;
  const chunks = [];
  (data.output || []).forEach((item) => {
    (item.content || []).forEach((content) => {
      if (content.text) chunks.push(content.text);
    });
  });
  return chunks.join("\n").trim();
}

async function askOpenAI(prompt) {
  if (!settings.openaiApiKey) {
    throw new Error("Add your OpenAI API key in Settings first, then save settings and ask again.");
  }

  const recentHistory = conversationHistory.slice(-8).map((entry) => ({
    role: entry.role === "ai" ? "assistant" : "user",
    content: [{ type: "input_text", text: entry.text }],
  }));

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.openaiApiKey}`,
    },
    body: JSON.stringify({
      model: settings.modelName || defaultSettings.modelName,
      input: [
        { role: "developer", content: [{ type: "input_text", text: buildSystemPrompt(prompt) }] },
        ...recentHistory,
        { role: "user", content: [{ type: "input_text", text: prompt }] },
      ],
      max_output_tokens: settings.length === "deep" ? 1400 : settings.length === "short" ? 450 : 900,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.error?.message || "The AI request failed. Check your API key, model name, and billing/access settings.";
    throw new Error(message);
  }

  return extractResponseText(data) || "I received an empty response from the model.";
}

function renderCards(containerSelector, items, filter = "all", filterKey = "category") {
  const container = document.querySelector(containerSelector);
  container.innerHTML = "";
  items
    .filter((item) => filter === "all" || item[filterKey] === filter)
    .forEach((item) => {
      const card = document.createElement("article");
      card.className = "data-card";
      card.innerHTML = `
        <h4>${item.title}</h4>
        <p>${item.text}</p>
        <footer><span>${item.source || item.league}</span><span>Ready</span></footer>
      `;
      container.append(card);
    });
}

function renderLiveCards(topic, items) {
  const container = document.querySelector(`#${topic}-live-grid`);
  if (!container) return;
  liveData[topic] = items;

  if (!items.length) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <article class="live-summary">
      <div>
        <p class="card-label">Live ${topic}</p>
        <h4>${items.length} fresh item${items.length === 1 ? "" : "s"} loaded</h4>
      </div>
      <span>${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
    </article>
    ${items.map((item) => `
      <article class="data-card live-card">
        <h4>${escapeHtml(item.title)}</h4>
        <p>${escapeHtml(item.text)}</p>
        <footer>
          <span>${escapeHtml(item.source || "Live source")}</span>
          ${item.url ? `<a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">Open</a>` : "<span>Live</span>"}
        </footer>
      </article>
    `).join("")}
  `;
  renderReadiness();
}

function renderLiveError(topic, error) {
  const container = document.querySelector(`#${topic}-live-grid`);
  if (!container) return;
  container.innerHTML = `
    <article class="data-card live-card">
      <h4>Live ${topic} unavailable</h4>
      <p>${escapeHtml(error.message || "The live source did not respond. Try again later.")}</p>
      <footer><span>Fallback active</span><span>Prototype cards below</span></footer>
    </article>
  `;
}

async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Source returned ${response.status}`);
  return response.json();
}

async function fetchText(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Source returned ${response.status}`);
  return response.text();
}

function proxyUrl(url) {
  return `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
}

async function fetchTextWithProxyFallback(url) {
  try {
    return await fetchText(url);
  } catch {
    return fetchText(proxyUrl(url));
  }
}

async function fetchJsonWithProxyFallback(url) {
  try {
    return await fetchJson(url);
  } catch {
    return fetchJson(proxyUrl(url));
  }
}

async function fetchBlsSeries() {
  const seriesIds = ["CUSR0000SA0", "CES0000000001", "LNS14000000"];
  const settled = await Promise.allSettled(seriesIds.map((seriesId) => (
    fetchJsonWithProxyFallback(`https://api.bls.gov/publicAPI/v2/timeseries/data/${seriesId}?latest=true`)
  )));
  return {
    Results: {
      series: settled.flatMap((result) => {
        if (result.status !== "fulfilled") return [];
        return result.value.Results?.series || [];
      }),
    },
  };
}

function stooqCsvToItem(csv, symbol, label) {
  const [, row] = csv.trim().split(/\r?\n/);
  if (!row) throw new Error(`No market row for ${symbol}`);
  const [symbolCode, date, time, open, high, low, close, volume] = row.split(",");
  return {
    title: `${label} quote`,
    text: `${date} ${time}: close ${close}, open ${open}, high ${high}, low ${low}, volume ${volume || "n/a"}.`,
    source: `Stooq ${symbolCode || symbol}`,
    url: `https://stooq.com/q/?s=${symbol}`,
  };
}

function blsSeriesToItems(data) {
  const labels = {
    CUSR0000SA0: "Inflation CPI",
    CES0000000001: "Jobs payroll employment",
    LNS14000000: "Unemployment rate",
  };
  return (data.Results?.series || []).map((series) => {
    const point = series.data?.[0] || {};
    return {
      title: labels[series.seriesID] || series.seriesID,
      text: `${point.periodName || "Latest"} ${point.year || ""}: ${point.value || "n/a"}${point.footnotes?.[0]?.text ? ` (${point.footnotes[0].text})` : ""}.`,
      source: "U.S. Bureau of Labor Statistics",
      url: "https://www.bls.gov/data/",
    };
  });
}

function alphaVantageQuoteToItem(data) {
  const quote = data["Global Quote"] || {};
  if (!quote["01. symbol"]) throw new Error("No Alpha Vantage quote returned");
  return {
    title: `${quote["01. symbol"]} stock quote`,
    text: `Price ${quote["05. price"] || "n/a"}, change ${quote["09. change"] || "n/a"} (${quote["10. change percent"] || "n/a"}), previous close ${quote["08. previous close"] || "n/a"}.`,
    source: "Alpha Vantage demo stock API",
    url: "https://www.alphavantage.co/documentation/",
  };
}

async function loadLiveNews() {
  const data = await fetchJson("https://api.gdeltproject.org/api/v2/doc/doc?query=breaking%20news&mode=ArtList&format=json&maxrecords=6&sort=HybridRel");
  return (data.articles || []).slice(0, 6).map((article) => ({
    title: article.title || "Untitled news item",
    text: `${article.seendate || "Recent"} - ${article.domain || "news source"}`,
    source: article.domain || "GDELT",
    url: article.url,
  }));
}

async function loadLiveEconomics() {
  const requests = [
    fetchTextWithProxyFallback("https://stooq.com/q/l/?s=spy.us&f=sd2t2ohlcv&h&e=csv").then((csv) => stooqCsvToItem(csv, "spy.us", "S&P 500 ETF")),
    fetchTextWithProxyFallback("https://stooq.com/q/l/?s=qqq.us&f=sd2t2ohlcv&h&e=csv").then((csv) => stooqCsvToItem(csv, "qqq.us", "Nasdaq 100 ETF")),
    fetchJsonWithProxyFallback("https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey=demo").then(alphaVantageQuoteToItem),
    fetchBlsSeries().then(blsSeriesToItems),
    fetchJson("https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/avg_interest_rates?sort=-record_date&page[size]=3")
      .then((data) => (data.data || []).slice(0, 3).map((item) => ({
        title: `${item.security_desc || "Treasury security"} rate`,
        text: `${item.record_date}: average interest rate ${item.avg_interest_rate_amt || "n/a"}%.`,
        source: "U.S. Treasury Fiscal Data",
        url: "https://fiscaldata.treasury.gov/datasets/average-interest-rates-treasury-securities/average-interest-rates",
      }))),
  ];
  const settled = await Promise.allSettled(requests);
  const items = settled.flatMap((result) => {
    if (result.status !== "fulfilled") return [];
    return Array.isArray(result.value) ? result.value : [result.value];
  });
  if (!items.length) throw new Error("Stocks, BLS, and Treasury sources were unavailable.");
  return items.slice(0, 10);
}

async function loadLivePolitics() {
  const data = await fetchJson("https://www.federalregister.gov/api/v1/documents.json?per_page=6&order=newest");
  return (data.results || []).slice(0, 6).map((item) => ({
    title: item.title || "Federal Register item",
    text: `${item.publication_date || "Recent"} - ${(item.agencies || []).map((agency) => agency.name).slice(0, 2).join(", ") || "Federal agency"}`,
    source: "Federal Register government data",
    url: item.html_url,
  }));
}

async function loadLiveSports() {
  const selectedLeague = document.querySelector("#league-filter")?.value || "all";
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
  const targetLeagues = selectedLeague === "all" ? Object.values(leagues) : [leagues[selectedLeague]];
  const settled = await Promise.allSettled(targetLeagues.map((league) => fetchJson(league.url).then((data) => ({ data, league }))));
  const items = settled.flatMap((result) => {
    if (result.status !== "fulfilled") return [];
    const { data, league } = result.value;
    return (data.events || []).slice(0, 4).map((event) => {
      const competitors = event.competitions?.[0]?.competitors || [];
      const names = competitors.map((team) => team.team?.shortDisplayName || team.team?.displayName).filter(Boolean).join(" vs ");
      const scores = competitors.map((team) => `${team.team?.abbreviation || "TEAM"} ${team.score || "0"}`).join(" | ");
      return {
        title: names || event.name || `${league.label} event`,
        text: `${event.status?.type?.shortDetail || "Scheduled"}${scores ? ` - ${scores}` : ""}`,
        source: `${league.label} scores/schedule`,
        url: event.links?.[0]?.href,
      };
    });
  });
  if (!items.length) throw new Error("Sports scoreboards were unavailable.");
  return items.slice(0, 10);
}

async function loadLiveData(topic, button) {
  const loaders = {
    news: loadLiveNews,
    economics: loadLiveEconomics,
    politics: loadLivePolitics,
    sports: loadLiveSports,
  };
  const container = document.querySelector(`#${topic}-live-grid`);
  setLoadingButton(button, true, "Loading");
  container?.classList.add("loading");
  try {
    const items = await loaders[topic]();
    renderLiveCards(topic, items);
    addMessage("ai", `Loaded ${items.length} live ${topic} item${items.length === 1 ? "" : "s"}. I can now use that context in chat.`);
  } catch (error) {
    renderLiveError(topic, error);
    addMessage("ai", `I could not load live ${topic} data: ${error.message}`);
  } finally {
    container?.classList.remove("loading");
    setLoadingButton(button, false);
  }
}

function renderMarkets() {
  const container = document.querySelector("#market-grid");
  container.innerHTML = "";
  marketMetrics.forEach((metric) => {
    const card = document.createElement("article");
    card.className = "metric-card";
    card.innerHTML = `
      <h4>${metric.label}</h4>
      <span class="metric-value ${metric.tone}">${metric.value}</span>
      <p>${metric.note}</p>
    `;
    container.append(card);
  });
}

function renderTasks() {
  taskList.innerHTML = "";
  tasks.forEach((task, index) => {
    const template = document.querySelector("#task-template").content.cloneNode(true);
    const card = template.querySelector(".task-card");
    const name = template.querySelector(".task-name");
    const cadence = template.querySelector(".task-cadence");
    const scheduleTime = template.querySelector(".task-time");
    const focus = template.querySelector(".task-focus");
    const channel = template.querySelector(".task-channel");
    const email = template.querySelector(".task-email");
    const phone = template.querySelector(".task-phone");
    const trigger = template.querySelector(".task-trigger");
    const active = template.querySelector(".task-active");
    name.value = task.name;
    cadence.value = task.cadence;
    scheduleTime.value = task.scheduleTime;
    focus.value = task.focus;
    channel.value = task.channel;
    email.value = task.email;
    phone.value = task.phone;
    trigger.value = task.trigger;
    active.checked = task.active;
    template.querySelector(".save-task").addEventListener("click", async () => {
      tasks[index] = normalizeTask({
        name: name.value,
        cadence: cadence.value,
        scheduleTime: scheduleTime.value,
        focus: focus.value,
        channel: channel.value,
        email: email.value,
        phone: phone.value,
        trigger: trigger.value,
        active: active.checked,
        lastChecked: task.lastChecked,
      });
      await saveTasks();
      renderAlertSummary();
      renderReadiness();
      card.classList.add("saved");
      setTimeout(() => card.classList.remove("saved"), 500);
    });
    template.querySelector(".delete-task").addEventListener("click", async () => {
      tasks.splice(index, 1);
      await saveTasks();
      renderTasks();
      renderAlertSummary();
      renderReadiness();
    });
    taskList.append(template);
  });
}

function getNotificationLabel(task) {
  if (task.channel === "email") return task.email ? `Email ${task.email}` : "Email target needed";
  if (task.channel === "sms") return task.phone ? `Text ${task.phone}` : "Phone target needed";
  if (task.channel === "both") return `${task.email || "email needed"} + ${task.phone || "phone needed"}`;
  return "Dashboard only";
}

function renderAlertSummary() {
  const activeTasks = tasks.filter((task) => task.active);
  const notificationTasks = tasks.filter((task) => task.active && task.channel !== "dashboard");
  alertSummary.innerHTML = `
    <article class="alert-stat"><strong>${tasks.length}</strong><span>saved alerts</span></article>
    <article class="alert-stat"><strong>${activeTasks.length}</strong><span>active schedules</span></article>
    <article class="alert-stat"><strong>${notificationTasks.length}</strong><span>email/text targets</span></article>
    <article class="alert-stat"><strong>IndexedDB</strong><span>browser database</span></article>
  `;
}

async function runAutomationCheck() {
  const checkedAt = new Date().toLocaleString();
  tasks = tasks.map((task) => task.active ? { ...task, lastChecked: checkedAt } : task);
  await saveTasks();
  renderTasks();
  renderAlertSummary();
  renderReadiness();
  const activeTasks = tasks.filter((task) => task.active);
  const alertLines = activeTasks.map((task) => `${task.name}: ${task.cadence}${task.scheduleTime ? ` at ${task.scheduleTime}` : ""}; notify by ${getNotificationLabel(task)}; trigger: ${task.trigger || "any important change"}.`);
  addMessage("ai", `Automation check completed at ${checkedAt}. ${activeTasks.length} active alert${activeTasks.length === 1 ? "" : "s"} queued.\n\n${alertLines.join("\n")}\n\nEmail/text delivery is configured as routing data here; sending requires a backend notification service such as SendGrid, Twilio, or a serverless function.`);
}

function renderSettings() {
  document.querySelector("#openai-api-key").value = settings.openaiApiKey;
  document.querySelector("#news-source").value = settings.newsSource;
  document.querySelector("#market-source").value = settings.marketSource;
  document.querySelector("#sports-source").value = settings.sportsSource;
  document.querySelector("#model-name").value = settings.modelName;
  document.querySelector("#tone-setting").value = settings.tone;
  document.querySelector("#length-setting").value = settings.length;
  document.querySelector("#citations-setting").checked = settings.citations;
  document.querySelector("#alerts-setting").checked = settings.alerts;
  document.querySelector("#favorite-teams").value = settings.favoriteTeams;
  document.querySelector("#market-watchlist").value = settings.marketWatchlist;
  document.querySelector("#topic-watchlist").value = settings.topicWatchlist;
  document.querySelector("#home-region").value = settings.homeRegion;
  renderPreferenceSummary();
  renderReadiness();
  renderIntegrationPlan();
}

function renderPreferenceChips(label, value) {
  const items = splitList(value);
  if (!items.length) {
    return `
      <div class="preference-group">
        <strong>${label}</strong>
        <span class="empty-chip">Not saved yet</span>
      </div>
    `;
  }
  return `
    <div class="preference-group">
      <strong>${label}</strong>
      <div class="chip-row">${items.map((item) => `<span class="chip">${escapeHtml(item)}</span>`).join("")}</div>
    </div>
  `;
}

function renderPreferenceSummary() {
  preferenceSummary.innerHTML = `
    ${renderPreferenceChips("Teams", settings.favoriteTeams)}
    ${renderPreferenceChips("Watchlist", settings.marketWatchlist)}
    ${renderPreferenceChips("Topics", settings.topicWatchlist)}
    <div class="preference-group">
      <strong>Region</strong>
      <span class="chip">${escapeHtml(settings.homeRegion || "Not saved yet")}</span>
    </div>
  `;
}

function collectSettingsFromForm() {
  return {
    openaiApiKey: document.querySelector("#openai-api-key").value.trim(),
    newsSource: document.querySelector("#news-source").value.trim(),
    marketSource: document.querySelector("#market-source").value.trim(),
    sportsSource: document.querySelector("#sports-source").value.trim(),
    modelName: document.querySelector("#model-name").value.trim(),
    tone: document.querySelector("#tone-setting").value,
    length: document.querySelector("#length-setting").value,
    citations: document.querySelector("#citations-setting").checked,
    alerts: document.querySelector("#alerts-setting").checked,
    favoriteTeams: document.querySelector("#favorite-teams").value.trim(),
    marketWatchlist: document.querySelector("#market-watchlist").value.trim(),
    topicWatchlist: document.querySelector("#topic-watchlist").value.trim(),
    homeRegion: document.querySelector("#home-region").value.trim(),
  };
}

function wirePreferenceAutosave() {
  const fields = ["#favorite-teams", "#market-watchlist", "#topic-watchlist", "#home-region"];
  let autosaveTimer;
  fields.forEach((selector) => {
    document.querySelector(selector).addEventListener("input", () => {
      settings = collectSettingsFromForm();
      renderPreferenceSummary();
      renderIntegrationPlan();
      window.clearTimeout(autosaveTimer);
      autosaveTimer = window.setTimeout(() => saveSettings(), 500);
    });
  });
}

function renderReadiness() {
  const checks = [
    { label: "AI API", detail: settings.openaiApiKey ? `${settings.modelName || defaultSettings.modelName} is ready for live chat responses.` : "Add an OpenAI API key in Settings to replace preset replies.", state: settings.openaiApiKey ? "ready" : "missing" },
    { label: "News pipeline", detail: liveData.news.length ? `${liveData.news.length} live news items loaded.` : "Use Load Live News or add a custom endpoint.", state: liveData.news.length ? "ready" : settings.newsSource ? "partial" : "missing" },
    { label: "Economics pipeline", detail: liveData.economics.length ? `${liveData.economics.length} stock, inflation, jobs, and rate items loaded.` : "Use Load Live Economics or add a custom endpoint.", state: liveData.economics.length ? "ready" : settings.marketSource ? "partial" : "missing" },
    { label: "Politics pipeline", detail: liveData.politics.length ? `${liveData.politics.length} Federal Register items loaded.` : "Use Load Live Politics or add a custom endpoint.", state: liveData.politics.length ? "ready" : "missing" },
    { label: "Sports pipeline", detail: liveData.sports.length ? `${liveData.sports.length} live sports items loaded.` : "Use Load Live Sports or add a sports source.", state: liveData.sports.length ? "ready" : settings.sportsSource ? "partial" : "missing" },
    { label: "Automation database", detail: `${tasks.filter((task) => task.active).length} active alerts saved in IndexedDB.`, state: tasks.some((task) => task.active) ? "ready" : "missing" },
    { label: "Personal profile", detail: `${splitList(settings.favoriteTeams).length + splitList(settings.marketWatchlist).length + splitList(settings.topicWatchlist).length} saved teams, tickers, and topics.`, state: (settings.favoriteTeams || settings.marketWatchlist || settings.topicWatchlist || settings.homeRegion) ? "ready" : "partial" },
  ];
  readinessList.innerHTML = checks.map((check) => `
    <div class="readiness-item">
      <span class="readiness-dot ${check.state}"></span>
      <div><strong>${check.label}</strong><span>${check.detail}</span></div>
    </div>
  `).join("");
}

function renderIntegrationPlan() {
  const modelName = escapeHtml(settings.modelName || "the selected model");
  const watchedItems = [
    ...splitList(settings.favoriteTeams),
    ...splitList(settings.marketWatchlist),
    ...splitList(settings.topicWatchlist),
  ].slice(0, 6);
  const steps = [
    ["Ingest", "Connect saved endpoints and normalize each item into title, time, source, topic, and confidence fields."],
    ["Personalize", watchedItems.length ? `Prioritize ${watchedItems.join(", ")} when ranking briefs and alerts.` : "Save teams, tickers, and topics to personalize ranking."],
    ["Rank", "Score items by urgency, reliability, user relevance, and expected impact across news, economics, politics, and sports."],
    ["Summarize", `Use ${modelName} through the OpenAI Responses API with the saved tone, length, and citation requirements.`],
    ["Deliver", "Send briefs into chat first, then promote recurring monitors into scheduled jobs or notifications."],
  ];
  integrationPlan.innerHTML = steps.map(([title, detail]) => `
    <div class="integration-step">
      <span class="readiness-dot ready"></span>
      <div><strong>${title}</strong><span>${detail}</span></div>
    </div>
  `).join("");
}

function refreshBrief() {
  const date = new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
  dailyBrief.textContent = `${date}: scan top headlines, macro releases, policy events, and the sports calendar. Automations are saved in this browser and ready for API wiring.`;
}

document.querySelectorAll(".nav-item").forEach((item) => item.addEventListener("click", () => setView(item.dataset.view)));
document.querySelectorAll("[data-prompt]").forEach((button) => {
  button.addEventListener("click", () => {
    chatInput.value = button.dataset.prompt;
    chatInput.focus();
  });
});

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const prompt = chatInput.value.trim();
  if (!prompt) return;
  addMessage("user", prompt);
  conversationHistory.push({ role: "user", text: prompt });
  chatInput.value = "";
  chatInput.disabled = true;
  const sendButton = chatForm.querySelector("button");
  setLoadingButton(sendButton, true, "Thinking");
  const thinkingMessage = addMessage("ai", settings.openaiApiKey ? "Thinking..." : "API key needed. Add your OpenAI API key in Settings to get real AI answers.");

  try {
    const reply = settings.openaiApiKey ? await askOpenAI(prompt) : generatePrototypeReply(prompt);
    thinkingMessage.textContent = reply;
    conversationHistory.push({ role: "ai", text: reply });
  } catch (error) {
    const fallback = `${error.message}\n\nPrototype fallback: ${generatePrototypeReply(prompt)}`;
    thinkingMessage.textContent = fallback;
    conversationHistory.push({ role: "ai", text: fallback });
  } finally {
    chatInput.disabled = false;
    setLoadingButton(sendButton, false);
    chatInput.focus();
  }
});

document.querySelector("#theme-button").addEventListener("click", () => document.body.classList.toggle("dark"));
document.querySelector("#refresh-button").addEventListener("click", () => {
  refreshBrief();
  addMessage("ai", "Briefings refreshed. I updated the dashboard snapshot and kept your saved automations intact.");
});
document.querySelector("#news-filter").addEventListener("change", (event) => renderCards("#news-grid", newsItems, event.target.value));
document.querySelector("#league-filter").addEventListener("change", (event) => renderCards("#sports-grid", sportsItems, event.target.value, "league"));
document.querySelectorAll(".live-button").forEach((button) => {
  button.addEventListener("click", () => loadLiveData(button.dataset.live, button));
});
document.querySelector("#simulate-markets").addEventListener("click", () => {
  marketMetrics.unshift(marketMetrics.pop());
  renderMarkets();
});
document.querySelector("#add-task-button").addEventListener("click", async () => {
  tasks.unshift(normalizeTask({ name: "New alert", cadence: "Daily", scheduleTime: "08:00", focus: "Describe the topic, trigger, source, and output you want TRUMP AI to watch.", trigger: "Important change", active: true }));
  await saveTasks();
  renderTasks();
  renderAlertSummary();
  renderReadiness();
});
document.querySelector("#run-alerts-button").addEventListener("click", runAutomationCheck);
document.querySelector("#export-tasks-button").addEventListener("click", async () => {
  const { openaiApiKey, ...exportableSettings } = settings;
  const payload = JSON.stringify({ database: DB_NAME, settings: exportableSettings, alerts: tasks }, null, 2);
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(payload);
      addMessage("ai", "I copied the current settings and automations as JSON so they are ready to wire into a backend or scheduler.");
      return;
    } catch {
      addMessage("ai", payload);
      return;
    }
  }
  addMessage("ai", payload);
});
document.querySelector("#reset-tasks-button").addEventListener("click", async () => {
  tasks = defaultTasks.map(normalizeTask);
  await saveTasks();
  renderTasks();
  renderAlertSummary();
  renderReadiness();
  addMessage("ai", "Automation defaults restored.");
});
document.querySelector("#save-settings-button").addEventListener("click", async () => {
  settings = collectSettingsFromForm();
  await saveSettings();
  renderPreferenceSummary();
  renderReadiness();
  renderIntegrationPlan();
  addMessage("ai", settings.openaiApiKey ? "Settings saved. Live AI chat and personalization are enabled for new messages." : "Settings saved. Your preferences are stored in the browser database; add an OpenAI API key when you want live AI answers.");
});

async function initializeApp() {
  await loadStoredState();
  refreshBrief();
  renderCards("#news-grid", newsItems);
  renderCards("#politics-grid", politicsItems);
  renderCards("#sports-grid", sportsItems, "all", "league");
  renderMarkets();
  renderTasks();
  renderAlertSummary();
  renderSettings();
  wirePreferenceAutosave();
  addMessage("ai", "Welcome to TRUMP AI. I can draft briefings, plan saved alerts, organize research, and summarize news, economics, politics, and sports from one command center.");
}

initializeApp();
