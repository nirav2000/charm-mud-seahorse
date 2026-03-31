const POS_ORDER = [
  "article", "noun", "pronoun", "verb", "adjective", "adverb",
  "determiner", "preposition", "conjunction", "interjection", "unknown"
];

const POS_INFO = {
  article: "Introduces a noun.", noun: "Names a person/place/thing/idea.", pronoun: "Replaces a noun.",
  verb: "Shows action or state.", adjective: "Describes a noun/pronoun.", adverb: "Modifies verb/adjective/adverb.",
  determiner: "Specifies which noun.", preposition: "Shows relation in space/time.", conjunction: "Connects words/clauses.",
  interjection: "Expresses emotion.", unknown: "Could not confidently classify."
};

const manualRules = {
  prepositions: ["to","in","on","at","by","with","about","against","between","into","through","past","under","over","near"],
  conjunctions: ["and","or","but","so","yet","for","nor"],
  determiners: ["this","that","these","those","my","your","his","her","its","our","their"],
  interjections: ["wow","oops","hey","ouch","bravo","alas"]
};

const state = {
  version: "1.2.0",
  settings: {
    autoPunctuate: true,
    showLabels: true,
    showConnectors: true
  },
  sentences: []
};

const el = {
  input: document.getElementById("sentence-input"),
  analyzeBtn: document.getElementById("analyze-btn"),
  sampleBtn: document.getElementById("sample-btn"),
  status: document.getElementById("status"),
  tokenLayer: document.getElementById("token-layer"),
  labelLayer: document.getElementById("label-layer"),
  connectorLayer: document.getElementById("connector-layer"),
  wordInput: document.getElementById("word-input"),
  grammarType: document.getElementById("grammar-type"),
  grammarExplanation: document.getElementById("grammar-explanation"),
  settingsBtn: document.getElementById("settings-btn"),
  settingsDrawer: document.getElementById("settings-drawer"),
  settingsClose: document.getElementById("settings-close"),
  settingButtons: () => document.querySelectorAll(".toggle-btn[data-setting]"),
  historyBtn: document.getElementById("history-btn"),
  historyDrawer: document.getElementById("history-drawer"),
  historyClose: document.getElementById("history-close"),
  timeline: document.getElementById("version-timeline")
};

const normalizeWord = (word) => word.toLowerCase().replace(/^[^a-z']+|[^a-z']+$/g, "");

function autoPunctuate(text) {
  let t = text.trim().replace(/\s+/g, " ");
  if (!t) return t;
  t = t.charAt(0).toUpperCase() + t.slice(1).replace(/\bi\b/g, "I");
  t = t.replace(/\b(\w+)\s+(and|but|so|because)\s+(I|you|he|she|they|we)\b/g, "$1, $2 $3");
  t = t.replace(/\b(he said|she said|they said|he asked|she asked|they asked)\s+([^".!?]+)([.!?])?/i, (m, v, s, p) => `${v}, "${s.trim()}${p || "."}"`);
  if (!/[.!?]$/.test(t)) {
    if (/\b(wow|amazing|oops|great)\b/i.test(t)) t += "!";
    else if (/^(who|what|when|where|why|how)\b/i.test(t)) t += "?";
    else t += ".";
  }
  return t;
}

function classifyWord(word, doc) {
  const n = normalizeWord(word);
  if (!n) return "unknown";
  if (doc.match(n).has("#Pronoun")) return "pronoun";
  if (doc.match(n).has("#Verb")) return "verb";
  if (doc.match(n).has("#Noun")) return "noun";
  if (doc.match(n).has("#Adjective")) return "adjective";
  if (doc.match(n).has("#Adverb")) return "adverb";
  if (["the", "a", "an"].includes(n)) return "article";
  if (manualRules.prepositions.includes(n)) return "preposition";
  if (manualRules.conjunctions.includes(n)) return "conjunction";
  if (manualRules.determiners.includes(n)) return "determiner";
  if (manualRules.interjections.includes(n)) return "interjection";
  return "unknown";
}

function parseSentence(sentence) {
  const words = sentence.match(/\S+/g) || [];
  const doc = nlp(sentence);
  return words.map((word, idx) => ({ idx, word, pos: classifyWord(word, doc) }));
}

function renderTokens(items) {
  el.tokenLayer.innerHTML = items.map((item) => `
    <span class="token" data-index="${item.idx}">
      <span class="token-word pos-${item.pos}">${item.word}</span>
      <span class="token-sub">${state.settings.showLabels ? item.pos : ""}</span>
    </span>
  `).join("");
}

function renderLabels(items) {
  el.labelLayer.innerHTML = items.map((item) => `<span class="label-chip">${item.pos}</span>`).join("");
}

function renderConnectors(items) {
  el.connectorLayer.innerHTML = "";
  if (!state.settings.showConnectors) return;

  const tokenNodes = [...el.tokenLayer.querySelectorAll(".token")];
  const labelNodes = [...el.labelLayer.querySelectorAll(".label-chip")];
  const hostRect = el.connectorLayer.getBoundingClientRect();

  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
  marker.setAttribute("id", "arrowhead");
  marker.setAttribute("markerWidth", "7");
  marker.setAttribute("markerHeight", "7");
  marker.setAttribute("refX", "6");
  marker.setAttribute("refY", "3.5");
  marker.setAttribute("orient", "auto");
  const markerPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  markerPath.setAttribute("d", "M0,0 L7,3.5 L0,7");
  markerPath.setAttribute("fill", "#7f8db2");
  marker.appendChild(markerPath);
  defs.appendChild(marker);
  el.connectorLayer.appendChild(defs);

  items.forEach((item, i) => {
    const tokenRect = tokenNodes[i].getBoundingClientRect();
    const labelRect = labelNodes[i].getBoundingClientRect();
    const sx = labelRect.left - hostRect.left + labelRect.width / 2;
    const sy = labelRect.bottom - hostRect.top;
    const ex = tokenRect.left - hostRect.left + tokenRect.width / 2;
    const ey = tokenRect.top - hostRect.top;
    const cx = (sx + ex) / 2;
    const cy = sy + 26;

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "#8d9bbd");
    path.setAttribute("stroke-width", "1.5");
    path.setAttribute("marker-end", "url(#arrowhead)");
    el.connectorLayer.appendChild(path);
  });
}

function renderAnalysis(rawText) {
  const text = state.settings.autoPunctuate ? autoPunctuate(rawText) : rawText.trim();
  if (!text) {
    el.tokenLayer.innerHTML = "";
    el.labelLayer.innerHTML = "";
    el.connectorLayer.innerHTML = "";
    return;
  }
  const parsed = parseSentence(text);
  renderLabels(parsed);
  renderTokens(parsed);
  requestAnimationFrame(() => renderConnectors(parsed));
}

function checkWord(value) {
  const v = normalizeWord(value);
  if (!v) {
    el.grammarType.textContent = "—";
    el.grammarExplanation.textContent = "Enter a word to see grammar guidance.";
    return;
  }
  const pos = classifyWord(v, nlp(v));
  el.grammarType.textContent = pos;
  el.grammarExplanation.textContent = POS_INFO[pos];
}

async function loadSampleSentence() {
  if (!state.sentences.length) {
    const res = await fetch("sentences.json");
    const data = await res.json();
    state.sentences = data.sentences || [];
  }
  const pick = state.sentences[Math.floor(Math.random() * state.sentences.length)] || "";
  el.input.value = pick;
  renderAnalysis(pick);
  el.status.textContent = "Loaded sample sentence.";
}

function toggleDrawer(drawer, open) {
  drawer.classList.toggle("open", open);
  drawer.setAttribute("aria-hidden", open ? "false" : "true");
}

function renderSettingsButtons() {
  el.settingButtons().forEach((btn) => {
    const key = btn.dataset.setting;
    btn.classList.toggle("is-on", Boolean(state.settings[key]));
  });
}

async function loadVersionHistory() {
  const res = await fetch("version-history.md");
  const text = await res.text();
  const sections = [...text.matchAll(/^##\s+([0-9]+\.[0-9]+\.[0-9]+)\s+-\s+([0-9-]+)\n([\s\S]*?)(?=\n##\s|$)/gm)];

  el.timeline.innerHTML = sections.map((m) => {
    const [, version, date, body] = m;
    const firstBullet = (body.match(/^-\s+(.+)/m) || ["", "No summary"])[1];
    const href = version === state.version ? "index.html" : `versions/${version}/index.html`;
    return `
      <article class="timeline-item">
        <a href="${href}">v${version}</a>
        <div class="timeline-date">${date}</div>
        <p class="timeline-summary">${firstBullet}</p>
      </article>
    `;
  }).join("");
}

function init() {
  renderSettingsButtons();
  loadVersionHistory();
  loadSampleSentence();

  el.analyzeBtn.addEventListener("click", () => renderAnalysis(el.input.value));
  el.sampleBtn.addEventListener("click", loadSampleSentence);
  el.input.addEventListener("input", () => renderAnalysis(el.input.value));
  el.wordInput.addEventListener("input", (e) => checkWord(e.target.value));

  el.settingsBtn.addEventListener("click", () => toggleDrawer(el.settingsDrawer, true));
  el.settingsClose.addEventListener("click", () => toggleDrawer(el.settingsDrawer, false));
  el.settingsDrawer.addEventListener("mouseleave", () => toggleDrawer(el.settingsDrawer, false));

  el.historyBtn.addEventListener("click", () => toggleDrawer(el.historyDrawer, true));
  el.historyClose.addEventListener("click", () => toggleDrawer(el.historyDrawer, false));

  el.settingButtons().forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.setting;
      state.settings[key] = !state.settings[key];
      renderSettingsButtons();
      renderAnalysis(el.input.value);
    });
  });
}

init();
