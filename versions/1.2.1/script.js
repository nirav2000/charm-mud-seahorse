const POS_INFO = {
  article: "Introduces a noun and signals specificity.",
  noun: "Names a person, place, thing, or idea.",
  pronoun: "Replaces a noun phrase.",
  verb: "Expresses action or state.",
  adjective: "Describes a noun/pronoun.",
  adverb: "Modifies a verb, adjective, or adverb.",
  determiner: "Specifies reference of a noun.",
  preposition: "Shows relationship in time/space.",
  conjunction: "Connects words or clauses.",
  interjection: "Expresses sudden emotion.",
  unknown: "Could not confidently classify in this context."
};

const manualRules = {
  prepositions: ["to","in","on","at","by","with","about","against","between","into","through","past","under","over","near"],
  conjunctions: ["and","or","but","so","yet","for","nor"],
  determiners: ["this","that","these","those","my","your","his","her","its","our","their"],
  interjections: ["wow","oops","hey","ouch","bravo","alas"]
};

const state = {
  version: "1.2.1",
  settings: { autoPunctuate: true, showLabels: true, showConnectors: true },
  sentences: [],
  activeIndex: null,
  parsed: []
};

const el = {
  input: document.getElementById("sentence-input"),
  analyzeBtn: document.getElementById("analyze-btn"),
  sampleBtn: document.getElementById("sample-btn"),
  status: document.getElementById("status"),
  tokenLayer: document.getElementById("token-layer"),
  connectorLayer: document.getElementById("connector-layer"),
  wordInput: document.getElementById("word-input"),
  grammarType: document.getElementById("grammar-type"),
  grammarExplanation: document.getElementById("grammar-explanation"),
  popover: document.getElementById("word-popover"),
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

function roleForPos(pos) {
  const roleMap = {
    article: "signals noun reference", noun: "main content word", pronoun: "noun substitute", verb: "action/state core",
    adjective: "describes noun", adverb: "modifies action/quality", determiner: "limits noun reference",
    preposition: "links phrase relation", conjunction: "joins units", interjection: "expressive insertion", unknown: "context-sensitive"
  };
  return roleMap[pos] || "contextual role";
}

function phraseMembership(index, items) {
  const prev = items[index - 1]?.pos;
  const next = items[index + 1]?.pos;
  if ((prev === "article" || prev === "determiner") && (items[index].pos === "adjective" || items[index].pos === "noun")) return "likely noun phrase";
  if (items[index].pos === "preposition") return "prepositional phrase starter";
  if (items[index].pos === "verb" && (next === "noun" || next === "pronoun")) return "verb phrase core";
  return "standalone or mixed phrase";
}

function altUse(pos) {
  const map = {
    noun: "Many nouns can act as adjectives in compounds.",
    verb: "Some verbs can also be nouns (e.g., run).",
    adjective: "Some adjectives may be used as nouns in fixed expressions.",
    adverb: "Adverbs can also function as discourse markers.",
    unknown: "This token may change class in another sentence."
  };
  return map[pos] || "Can vary by context.";
}

function exampleForPos(pos) {
  const e = {
    article: "The apple fell.", noun: "Music matters.", pronoun: "They arrived.", verb: "Birds fly.", adjective: "Bright light.",
    adverb: "She spoke softly.", determiner: "Those books.", preposition: "Under the bridge.", conjunction: "Tea and coffee.",
    interjection: "Oops! I dropped it.", unknown: "Meaning depends on context."
  };
  return e[pos] || "Example depends on context.";
}

function autoPunctuate(text) {
  let t = text.trim().replace(/\s+/g, " ");
  if (!t) return t;
  t = t.charAt(0).toUpperCase() + t.slice(1).replace(/\bi\b/g, "I");
  t = t.replace(/\b(\w+)\s+(and|but|so|because)\s+(I|you|he|she|they|we)\b/g, "$1, $2 $3");
  if (!/[.!?]$/.test(t)) t += /^(who|what|when|where|why|how)\b/i.test(t) ? "?" : ".";
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
    <button class="token ${state.activeIndex === item.idx ? "is-active" : ""}" data-index="${item.idx}">
      <span class="token-word pos-${item.pos}">${item.word}</span>
      <span class="token-sub">${state.settings.showLabels ? item.pos : ""}</span>
    </button>
  `).join("");
}

function renderConnectors(items) {
  el.connectorLayer.innerHTML = "";
  if (!state.settings.showConnectors) return;
  const hostRect = el.connectorLayer.getBoundingClientRect();
  const tokenNodes = [...el.tokenLayer.querySelectorAll(".token")];

  items.forEach((item, i) => {
    const node = tokenNodes[i];
    const wordNode = node.querySelector(".token-word").getBoundingClientRect();
    const labelNode = node.querySelector(".token-sub").getBoundingClientRect();
    const sx = wordNode.left - hostRect.left + wordNode.width / 2;
    const sy = wordNode.bottom - hostRect.top;
    const ex = labelNode.left - hostRect.left + labelNode.width / 2;
    const ey = labelNode.top - hostRect.top;
    const cx = (sx + ex) / 2;
    const cy = sy + 8;

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "#c1cde6");
    path.setAttribute("stroke-width", "1.2");
    el.connectorLayer.appendChild(path);
  });
}

function hidePopover() {
  el.popover.hidden = true;
}

function showPopover(index, targetEl) {
  const item = state.parsed[index];
  if (!item) return;
  state.activeIndex = index;

  el.popover.innerHTML = `
    <h4>${item.word}</h4>
    <p><strong>Part of speech:</strong> ${item.pos}</p>
    <p><strong>Role in sentence:</strong> ${roleForPos(item.pos)}</p>
    <p><strong>Why this classification:</strong> ${POS_INFO[item.pos]}</p>
    <p><strong>Phrase membership:</strong> ${phraseMembership(index, state.parsed)}</p>
    <p><strong>Alternative uses:</strong> ${altUse(item.pos)}</p>
    <p class="meta"><strong>Extra example:</strong> ${exampleForPos(item.pos)}</p>
  `;
  el.popover.hidden = false;

  const rect = targetEl.getBoundingClientRect();
  if (window.innerWidth <= 980) {
    el.popover.style.left = "0px";
    el.popover.style.top = "auto";
    el.popover.style.bottom = "0px";
  } else {
    el.popover.style.bottom = "auto";
    el.popover.style.left = `${Math.min(window.innerWidth - 380, rect.left + 12)}px`;
    el.popover.style.top = `${Math.max(14, rect.bottom + 10)}px`;
  }

  renderTokens(state.parsed);
  requestAnimationFrame(() => renderConnectors(state.parsed));
}

function wireTokenInteractions() {
  el.tokenLayer.querySelectorAll(".token").forEach((node) => {
    const index = Number(node.dataset.index);
    node.addEventListener("mouseenter", (ev) => {
      if (!window.matchMedia("(hover: hover)").matches) return;
      showPopover(index, ev.currentTarget);
    });
    node.addEventListener("click", (ev) => showPopover(index, ev.currentTarget));
  });
}

function renderAnalysis(rawText) {
  const text = state.settings.autoPunctuate ? autoPunctuate(rawText) : rawText.trim();
  state.activeIndex = null;
  hidePopover();

  if (!text) {
    state.parsed = [];
    el.tokenLayer.innerHTML = "";
    el.connectorLayer.innerHTML = "";
    return;
  }

  state.parsed = parseSentence(text);
  renderTokens(state.parsed);
  requestAnimationFrame(() => {
    renderConnectors(state.parsed);
    wireTokenInteractions();
  });
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
    return `<article class="timeline-item"><a href="${href}">v${version}</a><div class="timeline-date">${date}</div><p class="timeline-summary">${firstBullet}</p></article>`;
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

  document.addEventListener("click", (e) => {
    if (!el.popover.hidden && !el.popover.contains(e.target) && !e.target.closest(".token")) {
      hidePopover();
      state.activeIndex = null;
      renderTokens(state.parsed);
      requestAnimationFrame(() => renderConnectors(state.parsed));
    }
  });
}

init();
