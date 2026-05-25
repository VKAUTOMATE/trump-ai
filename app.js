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
  { name: "Morning intelligence brief", cadence: "Daily", focus: "Summarize top news, economic indicators, policy events, and sports storylines by 8 AM.", active: true },
  { name: "Inflation and Fed watch", cadence: "Weekly", focus: "Track CPI, PCE, jobs, Fed speeches, treasury yields, and market expectations.", active: true },
  { name: "Breaking news triage", cadence: "Hourly", focus: "Check for urgent world, business, politics, and sports updates and rank by importance.", active: false },
];

const defaultSettings = {
  newsSource: "",
  marketSource: "",
  sportsSource: "",
  modelName: "gpt-4.1-mini",
  tone: "neutral",
  length: "balanced",
  citations: true,
  alerts: true,
};

const chatLog = document.querySelector("#chat-log");
const chatForm = document.querySelector("#chat-form");
const chatInput = document.querySelector("#chat-input");
const viewTitle = document.querySelector("#view-title");
const dailyBrief = document.querySelector("#daily-brief");
const taskList = document.querySelector("#task-list");
const readinessList = document.querySelector("#readiness-list");
const integrationPlan = document.querySelector("#integration-plan");

let tasks = (JSON.parse(localStorage.getItem("trump-ai-tasks") || "null") || defaultTasks).map((task) => ({ active: true, ...task }));
let settings = { ...defaultSettings, ...(JSON.parse(localStorage.getItem("trump-ai-settings") || "null") || {}) };

function saveTasks() {
  localStorage.setItem("trump-ai-tasks", JSON.stringify(tasks));
}

function saveSettings() {
  localStorage.setItem("trump-ai-settings", JSON.stringify(settings));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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
}

function generateReply(prompt) {
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
    const focus = template.querySelector(".task-focus");
    const active = template.querySelector(".task-active");
    name.value = task.name;
    cadence.value = task.cadence;
    focus.value = task.focus;
    active.checked = task.active;
    template.querySelector(".save-task").addEventListener("click", () => {
      tasks[index] = { name: name.value, cadence: cadence.value, focus: focus.value, active: active.checked };
      saveTasks();
      renderReadiness();
      card.classList.add("saved");
      setTimeout(() => card.classList.remove("saved"), 500);
    });
    template.querySelector(".delete-task").addEventListener("click", () => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
      renderReadiness();
    });
    taskList.append(template);
  });
}

function renderSettings() {
  document.querySelector("#news-source").value = settings.newsSource;
  document.querySelector("#market-source").value = settings.marketSource;
  document.querySelector("#sports-source").value = settings.sportsSource;
  document.querySelector("#model-name").value = settings.modelName;
  document.querySelector("#tone-setting").value = settings.tone;
  document.querySelector("#length-setting").value = settings.length;
  document.querySelector("#citations-setting").checked = settings.citations;
  document.querySelector("#alerts-setting").checked = settings.alerts;
  renderReadiness();
  renderIntegrationPlan();
}

function renderReadiness() {
  const checks = [
    { label: "News pipeline", detail: settings.newsSource ? "Endpoint configured for briefing ingestion." : "Add a news feed or API endpoint.", state: settings.newsSource ? "ready" : "missing" },
    { label: "Market pipeline", detail: settings.marketSource ? "Macro and market source configured." : "Add a market or economics source.", state: settings.marketSource ? "ready" : "missing" },
    { label: "Sports pipeline", detail: settings.sportsSource ? "Scores and league source configured." : "Add a sports schedule or scores source.", state: settings.sportsSource ? "ready" : "missing" },
    { label: "Automation queue", detail: `${tasks.filter((task) => task.active).length} active monitors saved locally.`, state: tasks.some((task) => task.active) ? "partial" : "missing" },
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
  const steps = [
    ["Ingest", "Connect the saved endpoints and normalize each item into title, time, source, topic, and confidence fields."],
    ["Rank", "Score items by urgency, reliability, user relevance, and expected impact across news, economics, politics, and sports."],
    ["Summarize", `Use ${modelName} with the saved tone, length, and citation requirements.`],
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

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const prompt = chatInput.value.trim();
  if (!prompt) return;
  addMessage("user", prompt);
  chatInput.value = "";
  window.setTimeout(() => addMessage("ai", generateReply(prompt)), 250);
});

document.querySelector("#theme-button").addEventListener("click", () => document.body.classList.toggle("dark"));
document.querySelector("#refresh-button").addEventListener("click", () => {
  refreshBrief();
  addMessage("ai", "Briefings refreshed. I updated the dashboard snapshot and kept your saved automations intact.");
});
document.querySelector("#news-filter").addEventListener("change", (event) => renderCards("#news-grid", newsItems, event.target.value));
document.querySelector("#league-filter").addEventListener("change", (event) => renderCards("#sports-grid", sportsItems, event.target.value, "league"));
document.querySelector("#simulate-markets").addEventListener("click", () => {
  marketMetrics.unshift(marketMetrics.pop());
  renderMarkets();
});
document.querySelector("#add-task-button").addEventListener("click", () => {
  tasks.unshift({ name: "New monitor", cadence: "Daily", focus: "Describe the topic, trigger, source, and output you want TRUMP AI to watch.", active: true });
  saveTasks();
  renderTasks();
  renderReadiness();
});
document.querySelector("#export-tasks-button").addEventListener("click", async () => {
  const payload = JSON.stringify({ settings, tasks }, null, 2);
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
document.querySelector("#reset-tasks-button").addEventListener("click", () => {
  tasks = defaultTasks.map((task) => ({ ...task }));
  saveTasks();
  renderTasks();
  renderReadiness();
  addMessage("ai", "Automation defaults restored.");
});
document.querySelector("#save-settings-button").addEventListener("click", () => {
  settings = {
    newsSource: document.querySelector("#news-source").value.trim(),
    marketSource: document.querySelector("#market-source").value.trim(),
    sportsSource: document.querySelector("#sports-source").value.trim(),
    modelName: document.querySelector("#model-name").value.trim(),
    tone: document.querySelector("#tone-setting").value,
    length: document.querySelector("#length-setting").value,
    citations: document.querySelector("#citations-setting").checked,
    alerts: document.querySelector("#alerts-setting").checked,
  };
  saveSettings();
  renderReadiness();
  renderIntegrationPlan();
  addMessage("ai", "Settings saved. I updated the readiness panel and integration plan.");
});

refreshBrief();
renderCards("#news-grid", newsItems);
renderCards("#politics-grid", politicsItems);
renderCards("#sports-grid", sportsItems, "all", "league");
renderMarkets();
renderTasks();
renderSettings();
addMessage("ai", "Welcome to TRUMP AI. I can draft briefings, plan automations, organize research, and summarize news, economics, politics, and sports from one command center.");
