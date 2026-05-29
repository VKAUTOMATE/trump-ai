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
  { category: "us", title: "U.S. Headlines", text: "National stories, institutions, courts, weather, safety, and public-impact updates ready for source-backed refresh.", source: "GDELT backend route", timestamp: "Click Load Live News" },
  { category: "world", title: "World Desk", text: "Diplomacy, security, humanitarian developments, trade routes, and global risk signals with source labels.", source: "GDELT global news", timestamp: "Click Load Live News" },
  { category: "business", title: "Business Wire", text: "Earnings, layoffs, mergers, supply chains, labor pressure, and company statements for briefing cards.", source: "GDELT business topics", timestamp: "Click Load Live News" },
  { category: "technology", title: "Technology and AI", text: "Model releases, chips, cybersecurity, platform policy, regulation, and product launch monitoring.", source: "GDELT technology topics", timestamp: "Click Load Live News" },
  { category: "markets", title: "Energy and Commodities", text: "Oil, gas, power, metals, agriculture, shipping, and inflation-linked market pressure in one lane.", source: "GDELT market topics", timestamp: "Click Load Live News" },
  { category: "world", title: "Risk and Security", text: "Fast-moving events that may affect markets, travel, defense, supply chains, or public safety.", source: "GDELT risk topics", timestamp: "Click Load Live News" },
];

const politicsItems = [
  { category: "federal", title: "Federal Register Monitor", text: "Agency notices, proposed rules, final rules, public comment windows, and publication dates.", source: "Federal Register API", timestamp: "Not loaded yet", status: "manual" },
  { category: "federal", title: "Agency Rulemaking", text: "EPA, Treasury, Labor, HHS, DHS, Education, Commerce, and other agency action lanes.", source: "Federal Register API", timestamp: "Not loaded yet", status: "manual" },
  { category: "congress", title: "Congress and Legislation", text: "Bills, hearings, votes, amendments, committees, deadlines, and plain-English policy impact notes.", source: "Congress.gov API", timestamp: "Not loaded yet", status: "manual" },
  { category: "courts", title: "Courts and Legal Deadlines", text: "Court calendars, rulings, appeals, injunctions, and legal claims that need primary-source review.", source: "CourtListener API", timestamp: "Not loaded yet", status: "manual" },
  { category: "elections", title: "Election Administration", text: "Ballot deadlines, state election offices, turnout rules, certification dates, and nonpartisan process tracking.", source: "EAC and Vote.gov", timestamp: "Not loaded yet", status: "manual" },
  { category: "oversight", title: "Public Accountability", text: "Statements, claims, watchdog reports, source gaps, and items to send into Verify Claim mode.", source: "Oversight.gov", timestamp: "Not loaded yet", status: "manual" },
];

const sportsItems = [
  { league: "NBA", title: "NBA Prospect Watch", text: "Rookies, call-ups, injuries, rotation changes, usage spikes, and development storylines." },
  { league: "NFL", title: "NFL Prospect Watch", text: "Rookies, depth charts, quarterback health, roster moves, and weekly matchup pressure." },
  { league: "MLB", title: "MLB Prospect Watch", text: "Call-ups, probable pitchers, bullpen workload, streaks, and player development movement." },
  { league: "NHL", title: "NHL Prospect Watch", text: "Goalie confirmations, young-line usage, injuries, special teams, and playoff pressure." },
  { league: "GOLF", title: "Golf Tournament Watch", text: "Tee times, leaderboard movement, course fit, weather, and late-round pressure." },
  { league: "TENNIS", title: "Tennis Draw Watch", text: "Draws, match schedules, surface trends, injuries, form swings, and upset alerts." },
  { league: "SOCCER", title: "Soccer Global Watch", text: "Fixtures, scores, tables, injuries, transfers, and top storylines across major soccer leagues." },
  { league: "EPL", title: "Premier League Watch", text: "Fixtures, table pressure, injuries, rotation, form, and title or relegation races." },
  { league: "UCL", title: "Champions League Watch", text: "Group and knockout fixtures, squad news, travel spots, form, and tactical matchups." },
  { league: "WORLDCUP", title: "World Cup Watch", text: "World Cup fixtures, qualifiers, group stakes, squad news, injuries, and country-level storylines." },
  { league: "WWC", title: "Women's World Cup Watch", text: "Women's World Cup fixtures, knockout stakes, squad form, injuries, and tournament storylines." },
  { league: "LALIGA", title: "La Liga Watch", text: "Fixtures, standings, injuries, squad rotation, and title or European-place pressure." },
  { league: "SERIEA", title: "Serie A Watch", text: "Fixtures, defensive form, injuries, table movement, and European qualification pressure." },
  { league: "BUNDESLIGA", title: "Bundesliga Watch", text: "Fixtures, pressing matchups, form swings, injuries, and table pressure." },
  { league: "LIGUE1", title: "Ligue 1 Watch", text: "Fixtures, squad news, title race, European spots, and relegation pressure." },
  { league: "MLS", title: "MLS Watch", text: "Fixtures, playoff race, injuries, travel spots, roster moves, and form trends." },
  { league: "LIGAMX", title: "Liga MX Watch", text: "Fixtures, table pressure, squad news, rivalry spots, and knockout implications." },
  { league: "NWSL", title: "NWSL Watch", text: "Fixtures, table movement, injuries, player form, and playoff race pressure." },
  { league: "UEL", title: "Europa League Watch", text: "Fixtures, squad rotation, travel pressure, knockout path, and matchup context." },
  { league: "UFC", title: "UFC Fight Watch", text: "Fight schedules, weigh-ins, injuries, matchup styles, and card changes." },
  { league: "BOXING", title: "Boxing Fight Watch", text: "Fight cards, weigh-ins, rankings, title bouts, judging notes, and late changes." },
  { league: "NBA", title: "NBA Market Watch", text: "Lineup changes, market movement, public narratives, and stat angles without guaranteed picks." },
  { league: "MLB", title: "MLB Call-Up Watch", text: "Minor league surges, roster changes, injuries, and development storylines." },
];

const marketMetrics = [
  { category: "inflation", label: "Inflation trend", value: "Not loaded", tone: "flat", note: "Load economics to pull CPI, PCE, wage, rent, and energy source data." },
  { category: "labor", label: "Labor market", value: "Not loaded", tone: "flat", note: "Load economics to pull payrolls, claims, unemployment, quits, and participation." },
  { category: "rates", label: "Fed stance", value: "Not loaded", tone: "flat", note: "Load economics to pull rates, Treasury data, Fed signals, and credit stress." },
  { category: "consumer", label: "Consumer", value: "Not loaded", tone: "flat", note: "Load economics to pull retail, sentiment, delinquency, and savings context." },
  { category: "equities", label: "Equities", value: "Not loaded", tone: "flat", note: "Load economics to pull market quotes, breadth context, and earnings pressure." },
  { category: "dollar", label: "Dollar", value: "Not loaded", tone: "flat", note: "Load economics to pull rate differentials, dollar strength, and global stress signals." },
  { category: "oil", label: "Oil", value: "Not loaded", tone: "flat", note: "Load economics to pull commodity, inflation, and supply-demand signals." },
  { category: "credit", label: "Credit", value: "Not loaded", tone: "flat", note: "Load economics to pull spreads, refinancing pressure, and stress indicators." },
];

const defaultTasks = [
  { name: "Morning intelligence brief", cadence: "Daily", scheduleTime: "08:00", focus: "Summarize top news, economic indicators, policy events, and sports storylines by 8 AM.", channel: "dashboard", email: "", phone: "", trigger: "Daily executive brief", active: true, lastChecked: "" },
  { name: "Inflation and Fed watch", cadence: "Weekly", scheduleTime: "09:00", focus: "Track CPI, PCE, jobs, Fed speeches, treasury yields, and market expectations.", channel: "email", email: "", phone: "", trigger: "CPI, jobs, Fed decision, yield move", active: true, lastChecked: "" },
  { name: "Breaking news triage", cadence: "Hourly", scheduleTime: "", focus: "Check for urgent world, business, politics, and sports updates and rank by importance.", channel: "both", email: "", phone: "", trigger: "Breaking news or major score/policy/market shock", active: false, lastChecked: "" },
];

const defaultSettings = {
  backendApiUrl: "",
  openaiApiKey: "",
  newsSource: "",
  marketSource: "",
  sportsSource: "",
  modelName: "gpt-4.4",
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
const exportChatButton = document.querySelector("#export-chat-button");
const clearChatButton = document.querySelector("#clear-chat-button");
const viewTitle = document.querySelector("#view-title");
const dailyBrief = document.querySelector("#daily-brief");
const taskList = document.querySelector("#task-list");
const alertSummary = document.querySelector("#alert-summary");
const readinessList = document.querySelector("#readiness-list");
const integrationPlan = document.querySelector("#integration-plan");
const preferenceSummary = document.querySelector("#preference-summary");
const landingLiveGrid = document.querySelector("#landing-live-grid");

let tasks = [];
let settings = { ...defaultSettings };
let conversationHistory = [];
const liveData = {
  news: [],
  economics: [],
  politics: [],
  sports: [],
};
const productionBackendUrl = "https://trump-ai-vk.vercel.app";

function getApiBase() {
  const savedUrl = (settings.backendApiUrl || "").trim().replace(/\/$/, "");
  if (savedUrl) return savedUrl;
  const localHosts = ["127.0.0.1", "localhost"];
  const host = window.location.hostname;
  if (localHosts.includes(host) || host.endsWith("github.io")) return productionBackendUrl;
  return "";
}

async function fetchBackendJson(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
  const response = await fetch(`${getApiBase()}${path}`, {
    ...options,
    headers,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Backend returned ${response.status}`);
  return data;
}

const domainPrompts = {
  base: `You are TRUMP AI, a neutral, source-aware general assistant, research partner, tutor, writer, planner, and briefing system. You are not Donald Trump and must not impersonate any real person. The command box is open-ended: the user can ask any normal question, not only news, economics, politics, government, sports, or automation. Help with school, coding, business, writing, math, everyday decisions, travel, food, career, health education, technology, history, creativity, planning, explanations, summaries, comparisons, and general knowledge. Always answer the user's actual question first. Never say you are limited to the dashboard categories. The backend may provide live context for sports, politics, government, public issues, economics, or news; use it when present and name its limits. Do not say "as of my last knowledge update." If live context is insufficient, say the loaded sources do not confirm the answer and name the best source to check. Be clear, practical, and conversational. Ask a brief follow-up only when needed. Mark confirmed facts separately from opinion, inference, or analysis when the topic calls for it. Avoid fabricating citations, prices, scores, polls, or breaking news. For sports result questions, include the opponent or winner, final score, round/date, and source when known; if any of those details are not confirmed by loaded context, say exactly what is missing instead of giving a partial answer.`,
  news: `News mode: prioritize verified events, timestamps, source quality, affected people or institutions, and likely second-order impact. Separate confirmed facts from uncertainty. Ask for live source links when needed.`,
  economics: `Economics mode: explain macro signals, market context, inflation, labor, rates, credit, commodities, and consumer data. Avoid financial advice. Present assumptions, risks, and data that would change the view.`,
  politics: `Politics and government mode: stay nonpartisan. Explain policy, institutions, agencies, elections, legislation, courts, regulations, public issues, and public opinion with neutral framing. Flag claims that need primary-source verification.`,
  sports: `Sports mode: cover schedules, scores, injuries, matchups, standings, roster news, and betting context without guaranteeing outcomes. Clearly separate analysis from confirmed results. If the user asks who won, who lost, the opponent, or the score, answer those details first and cite the loaded source. If the loaded context does not include the score or opponent, say so and name the official league, tournament, or ESPN scoreboard to check.`,
  automation: `Automation planning mode: convert any user goal into saved alerts, monitors, reminders, triggers, cadence, sources, thresholds, notification routes, and output formats. Be specific about what can run now in this browser app versus what needs a backend scheduler, database, email, or text-message provider.`,
  verify: `Verification mode: evaluate the claim cautiously. Break the answer into Claim, What is known, What needs verification, Best sources to check, and Confidence. Do not invent citations. If live source data is missing, say that primary-source checking is required.`,
};

const DB_NAME = "trump-ai-db";
const DB_VERSION = 1;
const STORE_NAME = "records";
let dbPromise;

function normalizeModelName(modelName) {
  const value = (modelName || "").trim();
  if (!value || value === "gpt-4o-mini" || value === "gpt-5.4-mini" || value === "gpt-5-mini") return defaultSettings.modelName;
  return value;
}

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
    const [storedTasks, storedSettings, storedChat] = await Promise.all([dbGet("tasks"), dbGet("settings"), dbGet("chatHistory")]);
    const legacyTasks = JSON.parse(localStorage.getItem("trump-ai-tasks") || "null");
    const legacySettings = JSON.parse(localStorage.getItem("trump-ai-settings") || "null");
    const legacyChat = JSON.parse(localStorage.getItem("trump-ai-chat-history") || "null");
    tasks = (storedTasks || legacyTasks || defaultTasks).map(normalizeTask);
    settings = { ...defaultSettings, ...(storedSettings || legacySettings || {}) };
    settings.modelName = normalizeModelName(settings.modelName);
    conversationHistory = sanitizeChatHistory(storedChat || legacyChat || []);
    await Promise.all([dbSet("tasks", tasks), dbSet("settings", settings), dbSet("chatHistory", conversationHistory)]);
  } catch (error) {
    tasks = (JSON.parse(localStorage.getItem("trump-ai-tasks") || "null") || defaultTasks).map(normalizeTask);
    settings = { ...defaultSettings, ...(JSON.parse(localStorage.getItem("trump-ai-settings") || "null") || {}) };
    settings.modelName = normalizeModelName(settings.modelName);
    conversationHistory = sanitizeChatHistory(JSON.parse(localStorage.getItem("trump-ai-chat-history") || "[]"));
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

function sanitizeChatHistory(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry) => ["user", "ai"].includes(entry?.role) && typeof entry.text === "string" && entry.text.trim())
    .slice(-200)
    .map((entry) => ({
      role: entry.role,
      text: entry.text,
      timestamp: entry.timestamp || "",
    }));
}

async function saveChatHistory() {
  conversationHistory = sanitizeChatHistory(conversationHistory);
  localStorage.setItem("trump-ai-chat-history", JSON.stringify(conversationHistory));
  try {
    await dbSet("chatHistory", conversationHistory);
  } catch (error) {
    console.warn("Chat history saved locally, but database sync failed:", error);
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

function renderLandingCards() {
  if (!landingLiveGrid) return;
  const activeAlerts = tasks.filter((task) => task.active).length;
  const savedPreferences = splitList(settings.favoriteTeams).length + splitList(settings.marketWatchlist).length + splitList(settings.topicWatchlist).length + (settings.homeRegion ? 1 : 0);
  const lastTaskCheck = tasks.map((task) => task.lastChecked).filter(Boolean).slice(-1)[0];
  const cards = [
    {
      icon: "\u25a3",
      label: "News",
      title: liveData.news.length ? `${liveData.news.length} live headlines` : "No news loaded",
      text: liveData.news[0]?.title || "Open News and load verified headlines before using this as source context.",
      action: "news",
      status: liveData.news.length ? "Live" : "Not loaded",
      source: liveData.news[0]?.source || "No source loaded",
      time: liveData.news[0]?.timestamp || "Waiting",
    },
    {
      icon: "\u25cf",
      label: "Sports",
      title: liveData.sports.length ? `${liveData.sports.length} sports items` : "No sports loaded",
      text: liveData.sports[0]?.title || "Open Sports and load verified score or schedule data.",
      action: "sports",
      status: liveData.sports.length ? "Live" : "Not loaded",
      source: liveData.sports[0]?.source || "No source loaded",
      time: liveData.sports[0]?.timestamp || "Waiting",
    },
    {
      icon: "\u23f1",
      label: "Automation",
      title: `${activeAlerts} active alerts`,
      text: tasks.find((task) => task.active)?.focus || "Saved schedules, triggers, email/text routes, and browser database storage.",
      action: "automation",
      status: activeAlerts ? "Armed" : "Setup",
      source: "IndexedDB alerts",
      time: lastTaskCheck || "Waiting for run",
    },
    {
      icon: "\u2699",
      label: "Profile",
      title: `${savedPreferences} saved preferences`,
      text: settings.homeRegion || settings.favoriteTeams || settings.marketWatchlist || "Add teams, tickers, topics, and region.",
      action: "settings",
      status: savedPreferences ? "Saved" : "Setup",
      source: "Personal profile",
      time: savedPreferences ? "Saved in browser" : "Not configured",
    },
  ];

  landingLiveGrid.innerHTML = cards.map((card) => `
    <article class="landing-card" data-jump="${card.action}">
      <div class="landing-card-top">
        <span class="tile-icon">${card.icon}</span>
        <span class="live-pill">${card.status}</span>
      </div>
      <p class="card-label">${card.label}</p>
      <h4>${escapeHtml(card.title)}</h4>
      <p>${escapeHtml(card.text)}</p>
      <div class="dashboard-source-row">
        <span>${escapeHtml(card.source)}</span>
        <strong>${escapeHtml(card.time)}</strong>
      </div>
    </article>
  `).join("");

  landingLiveGrid.querySelectorAll("[data-jump]").forEach((card) => {
    card.addEventListener("click", () => setView(card.dataset.jump));
  });
}

function addMessage(role, text) {
  const message = document.createElement("div");
  message.className = `message ${role}`;
  const avatar = document.createElement("span");
  avatar.className = "message-avatar";
  avatar.setAttribute("aria-hidden", "true");
  avatar.textContent = role === "user" ? "YOU" : "AI";
  const bubble = document.createElement("div");
  bubble.className = "message-bubble";
  const textNode = document.createElement("p");
  textNode.className = "message-text";
  textNode.textContent = text;
  const actions = document.createElement("div");
  actions.className = "message-actions";
  const likeButton = createMessageAction("Like", "&#128077;");
  const dislikeButton = createMessageAction("Dislike", "&#128078;");
  const copyButton = document.createElement("button");
  copyButton.className = "copy-message";
  copyButton.type = "button";
  copyButton.title = "Copy";
  copyButton.setAttribute("aria-label", "Copy message");
  copyButton.innerHTML = "&#10697;";
  copyButton.addEventListener("click", () => copyMessageText(text, copyButton));
  const moreButton = createMessageAction("More", "&#8943;");
  likeButton.addEventListener("click", () => toggleMessageReaction(likeButton, dislikeButton));
  dislikeButton.addEventListener("click", () => toggleMessageReaction(dislikeButton, likeButton));
  moreButton.addEventListener("click", () => copyMessageText(text, copyButton));
  actions.append(likeButton, dislikeButton, copyButton, moreButton);
  bubble.append(textNode, actions);
  message.append(avatar, bubble);
  chatLog.classList.remove("empty");
  chatLog.append(message);
  chatLog.scrollTop = chatLog.scrollHeight;
  return message;
}

function createMessageAction(label, html) {
  const button = document.createElement("button");
  button.className = "message-action";
  button.type = "button";
  button.title = label;
  button.setAttribute("aria-label", `${label} message`);
  button.innerHTML = html;
  return button;
}

function toggleMessageReaction(activeButton, otherButton) {
  activeButton.classList.toggle("active");
  otherButton.classList.remove("active");
}

async function copyMessageText(text, button) {
  const original = button.innerHTML;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.append(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    button.innerHTML = "&#10003;";
    button.classList.add("copied");
  } catch {
    button.innerHTML = "!";
  } finally {
    setTimeout(() => {
      button.innerHTML = original;
      button.classList.remove("copied");
    }, 1400);
  }
}

function renderEmptyChatState() {
  chatLog.innerHTML = `
    <div class="chat-empty">
      <p class="card-label">Command ready</p>
      <h4>Ask, verify, write, or search live context</h4>
      <p>For current scores, markets, policy, or news, ask the exact question and I will use the backend context when it is available. If a fact is missing, I will name the source to check.</p>
    </div>
  `;
  chatLog.classList.add("empty");
}

function renderChatHistory() {
  chatLog.innerHTML = "";
  if (!conversationHistory.length) {
    renderEmptyChatState();
    return;
  }
  chatLog.classList.remove("empty");
  conversationHistory.forEach((entry) => addMessage(entry.role, entry.text));
}

async function recordChatMessage(role, text) {
  conversationHistory.push({ role, text, timestamp: new Date().toISOString() });
  await saveChatHistory();
}

function buildChatExport() {
  const entries = conversationHistory.length
    ? conversationHistory
    : [...chatLog.querySelectorAll(".message")].map((message) => ({
        role: message.classList.contains("user") ? "user" : "ai",
        text: message.querySelector(".message-text")?.textContent || message.textContent,
        timestamp: "",
      }));
  const lines = [
    "# TRUMP AI Personal Assistant Chat",
    "",
    `Exported: ${new Date().toLocaleString()}`,
    "",
    ...entries.map((entry) => {
      const speaker = entry.role === "user" ? "You" : "Assistant";
      const time = entry.timestamp ? ` (${new Date(entry.timestamp).toLocaleString()})` : "";
      return `## ${speaker}${time}\n\n${entry.text}`;
    }),
  ];
  return lines.join("\n\n");
}

function exportChatHistory() {
  const blob = new Blob([buildChatExport()], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `trump-ai-chat-${new Date().toISOString().slice(0, 10)}.md`;
  link.click();
  URL.revokeObjectURL(url);
  addMessage("ai", "Chat exported as a Markdown file.");
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

function generateOfflineReply(prompt) {
  const lower = prompt.toLowerCase();
  const activeTasks = tasks.filter((task) => task.active).length;
  const sourceCount = [settings.newsSource, settings.marketSource, settings.sportsSource].filter(Boolean).length;
  const profile = `${settings.tone.replace("-", " ")} tone, ${settings.length} depth, ${settings.citations ? "citations required" : "draft mode"}`;

  if (lower.includes("verify") || lower.includes("fact check") || lower.includes("is this true") || lower.includes("claim")) {
    return `Verify claim mode:\n\nClaim: ${prompt.replace(/^verify this claim:\s*/i, "") || "Add the claim you want checked."}\n\nWhat is known: I can structure the check and separate fact from opinion.\n\nWhat needs verification: live primary sources, dates, original documents, official data, or reputable reporting.\n\nBest sources to check: official records first, then established news or data providers.\n\nConfidence: limited until live sources or an OpenAI API key are connected.`;
  }
  if (lower.includes("setting") || lower.includes("source") || lower.includes("api") || lower.includes("connect")) {
    return `Source setup: ${sourceCount}/3 live sources are configured and the primary model is ${settings.modelName || "not set"}. Use Settings to add endpoints, then keep the current ${profile}.`;
  }
  if (lower.includes("automation") || lower.includes("task") || lower.includes("alert")) {
    return `Automation plan: ${activeTasks} monitors are active. Next, choose trigger thresholds, source priority, and output format. Strong defaults are a daily brief, hourly breaking-news triage, weekly macro monitor, and league-specific sports alerts.`;
  }
  if (lower.includes("economic") || lower.includes("market") || lower.includes("marknote") || lower.includes("market note") || lower.includes("inflation") || lower.includes("fed")) {
    return `Economics brief: watch inflation persistence, labor cooling, Fed communication, credit spreads, oil volatility, and consumer stress. Market source status: ${settings.marketSource ? "configured" : "needs endpoint"}.`;
  }
  if (lower.includes("politic") || lower.includes("election") || lower.includes("policy")) {
    return "Politics brief: track the policy calendar, legislation, court deadlines, election indicators, fundraising, and public opinion. Keep it nonpartisan and cite primary sources when live data is connected.";
  }
  if (lower.includes("sport") || lower.includes("nba") || lower.includes("nfl") || lower.includes("mlb") || lower.includes("nhl") || lower.includes("golf") || lower.includes("tennis") || lower.includes("ufc") || lower.includes("boxing")) {
    return "Sports brief: monitor injuries, schedules, rest, roster moves, weather, standings pressure, soccer fixtures, fight cards, tee times, draws, and matchup edges. Use the Sports desk for NBA, NFL, MLB, NHL, soccer, golf, tennis, UFC, and boxing.";
  }
  if (lower.includes("news") || lower.includes("brief")) {
    return `News brief: prioritize verified breaking events, business impact, geopolitical risk, technology shifts, and policy consequences. Current profile: ${profile}.`;
  }
  return `Ask-anything mode: I can help with any normal question: school, writing, coding, business ideas, math, planning, explanations, summaries, emails, recipes, travel, technology, history, and everyday decisions.\n\nThe dashboard categories are optional tools, not limits. Because the AI API is not answering yet, this is the offline helper response. Once OPENAI_API_KEY is active in Vercel, the same command box will answer like a full general AI assistant. Current profile: ${profile}.`;
}

function classifyPrompt(prompt) {
  const lower = prompt.toLowerCase();
  if (lower.includes("verify") || lower.includes("fact check") || lower.includes("is this true") || lower.includes("claim")) return "verify";
  if (lower.includes("automation") || lower.includes("task") || lower.includes("alert") || lower.includes("monitor")) return "automation";
  if (lower.includes("economic") || lower.includes("market") || lower.includes("marknote") || lower.includes("market note") || lower.includes("inflation") || lower.includes("fed") || lower.includes("stock") || lower.includes("jobs")) return "economics";
  if (lower.includes("politic") || lower.includes("election") || lower.includes("policy") || lower.includes("congress") || lower.includes("court")) return "politics";
  if (lower.includes("sport") || lower.includes("soccer") || lower.includes("football club") || lower.includes("premier league") || lower.includes("champions league") || lower.includes("la liga") || lower.includes("serie a") || lower.includes("bundesliga") || lower.includes("ligue 1") || lower.includes("mls") || lower.includes("liga mx") || lower.includes("nwsl") || lower.includes("europa league") || lower.includes("nba") || lower.includes("nfl") || lower.includes("mlb") || lower.includes("nhl") || lower.includes("golf") || lower.includes("tennis") || lower.includes("ufc") || lower.includes("boxing") || lower.includes("score")) return "sports";
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
  const recentHistory = conversationHistory.slice(-8).map((entry) => ({
    role: entry.role === "ai" ? "assistant" : "user",
    content: [{ type: "input_text", text: entry.text }],
  }));

  const data = await fetchBackendJson("/api/chat", {
    method: "POST",
    body: JSON.stringify({
      prompt,
      history: recentHistory,
      systemPrompt: buildSystemPrompt(prompt),
      modelName: settings.modelName || defaultSettings.modelName,
      maxOutputTokens: settings.length === "deep" ? 1400 : settings.length === "short" ? 450 : 900,
    }),
  });

  return data.text || "I received an empty response from the backend.";
}

function renderCards(containerSelector, items, filter = "all", filterKey = "category") {
  const container = document.querySelector(containerSelector);
  const fallbackSource = containerSelector.includes("sports") ? "sports source lane" : containerSelector.includes("politics") ? "government source lane" : "news source lane";
  const isSportsGrid = containerSelector.includes("sports");
  const statusLabels = {
    live: "Live Route",
    planned: "Planned Route",
    manual: "Manual Check",
  };
  container.innerHTML = "";
  items
    .filter((item) => filter === "all" || item[filterKey] === filter)
    .forEach((item) => {
      const card = document.createElement("article");
      const status = item.url ? "fact" : item.status || "analysis";
      const label = item.url ? "Fact Source" : statusLabels[item.status] || "Source Lane";
      const sourceText = isSportsGrid && `${item.source || ""}`.toLowerCase().includes("espn")
        ? "espn.com"
        : item.source || (isSportsGrid ? "Source not loaded" : fallbackSource);
      card.className = "data-card";
      card.innerHTML = `
        <div class="trust-row"><span class="trust-badge ${escapeHtml(status)}">${escapeHtml(label)}</span><span>${escapeHtml(item.timestamp || "Load live data")}</span></div>
        <h4>${escapeHtml(item.title)}</h4>
        <p>${escapeHtml(item.summary || item.text || "")}</p>
        ${item.whyItMatters ? `<p class="source-value">${escapeHtml(item.whyItMatters)}</p>` : ""}
        <footer><span>Source: ${escapeHtml(sourceText)}</span>${item.url ? `<a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">Open</a>` : `<span>${item.timestamp || "Load live data"}</span>`}</footer>
      `;
      container.append(card);
    });
}

function renderEmptySourceState(containerSelector, title, text, sourceLabel = "No source loaded") {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  container.hidden = false;
  container.removeAttribute("aria-hidden");
  container.innerHTML = "";
}

function renderPoliticsEmptyState() {
  if (!document.querySelector("#politics-grid")) return;
  renderEmptySourceState("#politics-grid");
}

function economicsSourceLabel(item) {
  const source = `${item.source || ""}`.toLowerCase();
  if (source.includes("bureau of labor")) return "BLS data";
  if (source.includes("treasury")) return "Treasury data";
  if (source.includes("stooq")) return "Market quote";
  return "Source data";
}

function economicsCategoryLabel(category) {
  const labels = {
    inflation: "Inflation",
    labor: "Labor",
    rates: "Rates",
    consumer: "Consumer",
    equities: "Equities",
    dollar: "Dollar",
    oil: "Oil",
    credit: "Credit",
  };
  return labels[category] || "Economics";
}

function renderEconomicsSourceCards(container, items) {
  container.innerHTML = items.map((item) => `
    <article class="data-card live-card economics-source-card">
      <div class="trust-row">
        <span class="trust-badge fact">${escapeHtml(economicsSourceLabel(item))}</span>
        <span>${escapeHtml(item.timestamp || "Latest source update")}</span>
      </div>
      <p class="card-label">${escapeHtml(economicsCategoryLabel(item.category))}</p>
      <h4>${escapeHtml(item.title)}</h4>
      <p>${escapeHtml(item.summary || item.text || "")}</p>
      ${item.whyItMatters ? `<p class="source-value">${escapeHtml(item.whyItMatters)}</p>` : ""}
      <footer>
        <span>${escapeHtml(item.source || "Economics source")}</span>
        ${item.url ? `<a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">View source</a>` : "<span>Source checked</span>"}
      </footer>
    </article>
  `).join("");
}

function renderLiveCards(topic, items) {
  const container = document.querySelector(`#${topic}-live-grid`);
  if (!container) return;
  liveData[topic] = items;
  renderLandingCards();
  if (topic === "news") {
    renderCards("#news-grid", mapNewsLiveToLanes(items));
  }
  if (topic === "sports") {
    renderCards("#sports-grid", mapSportsLiveToLanes(items), "all", "league");
  }
  const staticGrid = document.querySelector(`#${topic === "economics" ? "market" : topic}-grid`);
  if (topic === "economics") {
    if (items.length && staticGrid) {
      staticGrid.innerHTML = "";
      staticGrid.hidden = true;
      staticGrid.setAttribute("aria-hidden", "true");
    } else if (staticGrid) {
      staticGrid.hidden = false;
      staticGrid.removeAttribute("aria-hidden");
      renderMarketsFromLive(items);
    }
  }
  if (staticGrid && topic !== "sports" && topic !== "news" && topic !== "economics") {
    staticGrid.hidden = true;
    staticGrid.setAttribute("aria-hidden", "true");
  }

  if (!items.length) {
    container.innerHTML = "";
    return;
  }
  if (topic === "sports") {
    container.innerHTML = `
      <article class="live-summary">
        <div>
          <p class="card-label">Live sports</p>
          <h4>${items.length} live score and schedule item${items.length === 1 ? "" : "s"} applied to the watch cards below</h4>
        </div>
        <span>${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
      </article>
    `;
    renderReadiness();
    return;
  }
  if (topic === "economics") {
    renderEconomicsSourceCards(container, items);
    renderReadiness();
    return;
  }

  const sourceLabels = {
    news: "GDELT live news API",
    politics: "Federal Register, Congress.gov, CourtListener, EAC, and Oversight.gov",
    sports: "ESPN scoreboard APIs",
  };

  container.innerHTML = `
    <article class="live-summary">
      <div>
        <p class="card-label">Live ${topic}</p>
        <h4>${items.length} fresh item${items.length === 1 ? "" : "s"} loaded from ${sourceLabels[topic] || "live source"}</h4>
      </div>
      <span>${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
    </article>
    ${items.map((item) => `
      <article class="data-card live-card">
        <div class="trust-row"><span class="trust-badge fact">Fact Source</span><span>${escapeHtml(item.timestamp || "Live")}</span></div>
        <h4>${escapeHtml(item.title)}</h4>
        <p>${escapeHtml(item.summary || item.text || "")}</p>
        ${item.whyItMatters ? `<p class="source-value">${escapeHtml(item.whyItMatters)}</p>` : ""}
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
  const staticGrid = document.querySelector(`#${topic === "economics" ? "market" : topic}-grid`);
  if (staticGrid && topic === "politics") {
    staticGrid.hidden = true;
    staticGrid.setAttribute("aria-hidden", "true");
  } else if (staticGrid) {
    staticGrid.hidden = false;
    staticGrid.removeAttribute("aria-hidden");
  }
  container.innerHTML = `
    <article class="data-card live-card">
      <div class="trust-row"><span class="trust-badge analysis">No Live Data</span><span>Verified only</span></div>
      <h4>Live ${topic} unavailable</h4>
      <p>${escapeHtml(error.message || "The live source did not respond. Try again later.")}</p>
      <footer><span>API error</span><span>Check the backend route</span></footer>
    </article>
  `;
}

function mapNewsLiveToLanes(items = []) {
  if (!items.length) return newsItems;
  const lanes = [
    { category: "us", title: "U.S. Headlines", source: "Live news source" },
    { category: "world", title: "World Desk", source: "Live global source" },
    { category: "business", title: "Business Wire", source: "Live business source" },
    { category: "technology", title: "Technology and AI", source: "Live technology source" },
    { category: "markets", title: "Energy and Commodities", source: "Live market source" },
    { category: "world", title: "Risk and Security", source: "Live risk source" },
  ];
  return lanes.map((lane, index) => {
    const item = items[index % items.length];
    return {
      category: lane.category,
      title: item.title || lane.title,
      text: item.text || "Live news item loaded from the backend.",
      source: item.source || lane.source,
      timestamp: item.timestamp || "Live",
      url: item.url,
    };
  });
}

function mapSportsLiveToLanes(items = []) {
  if (!items.length) return sportsItems;
  const selectedLeague = document.querySelector("#league-filter")?.value || "all";
  return items.map((item) => ({
    league: item.league || selectedLeague,
    title: item.title || `${selectedLeague === "all" ? "Sports" : selectedLeague} live event`,
    text: item.text || "Live sports item loaded from the backend.",
    source: item.source || "ESPN",
    timestamp: item.timestamp || "Live",
    url: item.url,
  }));
}

async function loadLiveNews() {
  return (await fetchBackendJson("/api/live/news")).items || [];
}

async function loadLiveEconomics() {
  const selectedCategory = document.querySelector("#economics-filter")?.value || "all";
  return (await fetchBackendJson(`/api/live/economics?category=${encodeURIComponent(selectedCategory)}`)).items || [];
}

async function loadLivePolitics() {
  const selectedCategory = document.querySelector("#politics-filter")?.value || "all";
  return (await fetchBackendJson(`/api/live/politics?category=${encodeURIComponent(selectedCategory)}`)).items || [];
}

async function loadLiveSports() {
  const selectedLeague = document.querySelector("#league-filter")?.value || "all";
  return (await fetchBackendJson(`/api/live/sports?league=${encodeURIComponent(selectedLeague)}`)).items || [];
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
  if (!container) return;
  container.innerHTML = "";
}

function renderMarketsFromLive(items) {
  const container = document.querySelector("#market-grid");
  if (!container) return;
  const selectedCategory = document.querySelector("#economics-filter")?.value || "all";
  container.innerHTML = "";
  const findItem = (...patterns) => items.find((item) => {
    const haystack = `${item.title || ""} ${item.text || ""} ${item.source || ""}`.toLowerCase();
    return patterns.some((pattern) => haystack.includes(pattern));
  });
  const liveMetrics = [
    { category: "inflation", label: "Inflation trend", item: findItem("inflation", "cpi"), fallback: "Waiting on BLS inflation source." },
    { category: "labor", label: "Labor market", item: findItem("jobs", "payroll", "unemployment"), fallback: "Waiting on BLS labor source." },
    { category: "rates", label: "Fed stance", item: findItem("treasury", "rate"), fallback: "Waiting on Treasury rate source." },
    { category: "consumer", label: "Consumer", item: findItem("consumer discretionary", "xly"), fallback: "Waiting on consumer market source." },
    { category: "equities", label: "Equities", item: findItem("s&p", "nasdaq", "stock quote", "spy", "qqq", "ibm"), fallback: "Waiting on equity quote source." },
    { category: "dollar", label: "Dollar", item: findItem("dollar", "uup"), fallback: "Waiting on dollar source." },
    { category: "oil", label: "Oil", item: findItem("oil", "uso"), fallback: "Waiting on oil source." },
    { category: "credit", label: "Credit", item: findItem("credit", "hyg", "high yield"), fallback: "Waiting on credit source." },
  ];
  const visibleMetrics = liveMetrics
    .filter((metric) => selectedCategory === "all" || metric.category === selectedCategory)
    .filter((metric) => metric.item);
  if (!visibleMetrics.length) {
    container.innerHTML = "";
    return;
  }
  visibleMetrics.forEach(({ label, item }) => {
    const card = document.createElement("article");
    card.className = "metric-card live-metric-card";
    card.innerHTML = `
      <div class="trust-row"><span class="trust-badge fact">Fact Source</span><span>${escapeHtml(item.timestamp || "Live check")}</span></div>
      <h4>${escapeHtml(label)}</h4>
      <span class="metric-value up">Live</span>
      <p>${escapeHtml(`${item.title}: ${item.summary || item.text}`)}</p>
      ${item.whyItMatters ? `<p class="source-value">${escapeHtml(item.whyItMatters)}</p>` : ""}
      <footer>
        <span>${escapeHtml(item.source || "Live economics source")}</span>
        ${item.url ? `<a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">Open</a>` : "<span>Live</span>"}
      </footer>
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
  renderLandingCards();
  const activeTasks = tasks.filter((task) => task.active);
  const alertLines = activeTasks.map((task) => `${task.name}: ${task.cadence}${task.scheduleTime ? ` at ${task.scheduleTime}` : ""}; notify by ${getNotificationLabel(task)}; trigger: ${task.trigger || "any important change"}.`);
  addMessage("ai", `Automation check completed at ${checkedAt}. ${activeTasks.length} active alert${activeTasks.length === 1 ? "" : "s"} queued.\n\n${alertLines.join("\n")}\n\nEmail/text delivery is configured as routing data here; sending requires a backend notification service such as SendGrid, Twilio, or a serverless function.`);
}

function renderSettings() {
  document.querySelector("#backend-api-url").value = settings.backendApiUrl;
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
  renderLandingCards();
}

function collectSettingsFromForm() {
  return {
    backendApiUrl: document.querySelector("#backend-api-url").value.trim(),
    openaiApiKey: document.querySelector("#openai-api-key").value.trim(),
    newsSource: document.querySelector("#news-source").value.trim(),
    marketSource: document.querySelector("#market-source").value.trim(),
    sportsSource: document.querySelector("#sports-source").value.trim(),
    modelName: normalizeModelName(document.querySelector("#model-name").value),
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
  const apiBase = getApiBase();
  const checks = [
    { label: "Backend API", detail: apiBase ? `Using backend at ${apiBase}.` : "Using same-origin Vercel API routes or a saved backend URL.", state: "partial" },
    { label: "AI API", detail: "AI chat now routes through /api/chat. Put OPENAI_API_KEY in the backend environment.", state: "partial" },
    { label: "News pipeline", detail: liveData.news.length ? `${liveData.news.length} live news items loaded through backend.` : "Use Load Live News to call /api/live/news.", state: liveData.news.length ? "ready" : "partial" },
    { label: "Sports pipeline", detail: liveData.sports.length ? `${liveData.sports.length} live sports items loaded through backend.` : "Use Load Live Sports to call /api/live/sports.", state: liveData.sports.length ? "ready" : "partial" },
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
    ["Ingest", "Connect saved endpoints and normalize each item into title, time, source, topic, and source details."],
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
document.querySelectorAll("[data-jump]").forEach((item) => {
  item.addEventListener("click", () => setView(item.dataset.jump));
});
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
  await recordChatMessage("user", prompt);
  chatInput.value = "";
  chatInput.disabled = true;
  const sendButton = chatForm.querySelector("button");
  setLoadingButton(sendButton, true, "Thinking");
  const thinkingMessage = addMessage("ai", "Thinking through backend...");

  try {
    const reply = await askOpenAI(prompt);
    thinkingMessage.textContent = reply;
    await recordChatMessage("ai", reply);
  } catch (error) {
    const fallback = `${error.message}\n\nOffline fallback: ${generateOfflineReply(prompt)}`;
    thinkingMessage.textContent = fallback;
    await recordChatMessage("ai", fallback);
  } finally {
    chatInput.disabled = false;
    setLoadingButton(sendButton, false);
    chatInput.focus();
  }
});

exportChatButton.addEventListener("click", exportChatHistory);
clearChatButton.addEventListener("click", async () => {
  conversationHistory = [];
  localStorage.removeItem("trump-ai-chat-history");
  await saveChatHistory();
  renderEmptyChatState();
  chatInput.value = "";
  chatInput.focus();
});

document.querySelector("#theme-button").addEventListener("click", () => document.body.classList.toggle("dark"));
document.querySelector("#refresh-button").addEventListener("click", () => {
  refreshBrief();
  addMessage("ai", "Briefings refreshed. I updated the dashboard snapshot and kept your saved automations intact.");
});
document.querySelector("#news-filter")?.addEventListener("change", (event) => renderCards("#news-grid", newsItems, event.target.value));
document.querySelector("#economics-filter")?.addEventListener("change", () => {
  const economicsButton = document.querySelector('.live-button[data-live="economics"]');
  const economicsLiveGrid = document.querySelector("#economics-live-grid");
  if (liveData.economics.length || economicsLiveGrid?.children.length) {
    if (economicsButton) loadLiveData("economics", economicsButton);
    return;
  }
  renderMarkets();
});
document.querySelector("#politics-filter")?.addEventListener("change", (event) => {
  const politicsButton = document.querySelector('.live-button[data-live="politics"]');
  const politicsLiveGrid = document.querySelector("#politics-live-grid");
  if (liveData.politics.length || politicsLiveGrid?.children.length) {
    if (politicsButton) loadLiveData("politics", politicsButton);
    return;
  }
  renderPoliticsEmptyState();
});
document.querySelector("#league-filter")?.addEventListener("change", (event) => {
  renderCards("#sports-grid", sportsItems, event.target.value, "league");
  const sportsButton = document.querySelector('.live-button[data-live="sports"]');
  if (sportsButton) loadLiveData("sports", sportsButton);
});
document.querySelectorAll(".live-button").forEach((button) => {
  button.addEventListener("click", () => loadLiveData(button.dataset.live, button));
});
document.querySelector("#simulate-markets")?.addEventListener("click", () => {
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
  addMessage("ai", "Settings saved. The browser will call your backend for live data and AI requests.");
});

async function initializeApp() {
  await loadStoredState();
  refreshBrief();
  renderCards("#news-grid", newsItems);
  renderPoliticsEmptyState();
  renderCards("#sports-grid", sportsItems, "all", "league");
  renderMarkets();
  renderTasks();
  renderAlertSummary();
  renderSettings();
  renderLandingCards();
  wirePreferenceAutosave();
  renderChatHistory();
}

initializeApp();
