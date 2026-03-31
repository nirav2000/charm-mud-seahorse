const state = {
  version: "1.3.5",
  settings: { autoPunctuate: true, showLabels: true, showConnectors: true },
  sentences: [],
  parsed: [],
  activeToken: null,
  progress: {
    total: 0,
    byType: {},
    confusions: { "adjective vs adverb": 0, "determiner vs adjective": 0 }
  },
  ui: {
    popoverOpen: false,
    historyOpen: false
  }
};

const glossary = {
  noun: { def: "A naming word.", does: "Names people, places, things, or ideas.", spot: "Can often follow an article like ‘the’.", mistakes: "Mixing nouns with verbs.", links: "pronoun, adjective" },
  verb: { def: "An action or state word.", does: "Tells what happens.", spot: "Can change tense (play/played).", mistakes: "Missing helping verbs.", links: "adverb" },
  adjective: { def: "A describing word.", does: "Describes a noun.", spot: "Often before a noun.", mistakes: "Using adjective when adverb is needed.", links: "noun, adverb" },
  adverb: { def: "A how/when/where word.", does: "Adds detail to verbs/adjectives.", spot: "Often ends in -ly (not always).", mistakes: "Confusing with adjectives.", links: "verb, adjective" },
  pronoun: { def: "A noun replacer.", does: "Replaces a noun phrase.", spot: "Words like he, she, they.", mistakes: "Unclear reference.", links: "noun" },
  article: { def: "A noun starter.", does: "Introduces a noun.", spot: "a, an, the.", mistakes: "Using ‘a’ before vowel sounds.", links: "noun, determiner" },
  determiner: { def: "A pointer word.", does: "Shows which noun.", spot: "this, that, my, those.", mistakes: "Treating all as adjectives.", links: "article, adjective" },
  preposition: { def: "A position/link word.", does: "Shows relation in place/time.", spot: "in, on, under, between.", mistakes: "Dropping needed prepositions.", links: "noun" },
  conjunction: { def: "A joining word.", does: "Connects words or clauses.", spot: "and, but, or.", mistakes: "Comma misuse with conjunctions.", links: "verb" },
  interjection: { def: "An emotion word.", does: "Shows feeling suddenly.", spot: "wow!, oops!", mistakes: "Using in formal writing too often.", links: "punctuation" },
  unknown: { def: "Needs more context.", does: "Could belong to multiple classes.", spot: "Ambiguous in this sentence.", mistakes: "Assuming one fixed type.", links: "all" }
};

const manualRules = {
  prepositions: ["to","in","on","at","by","with","about","against","between","into","through","past","under","over","near"],
  conjunctions: ["and","or","but","so","yet","for","nor"],
  determiners: ["this","that","these","those","my","your","his","her","its","our","their"],
  interjections: ["wow","oops","hey","ouch","bravo","alas"]
};

const el = {
  input: document.getElementById("sentence-input"),
  analyzeBtn: document.getElementById("analyze-btn"),
  sampleBtn: document.getElementById("sample-btn"),
  status: document.getElementById("status"),
  tokenLine: document.getElementById("token-line"),
  analysisStage: document.getElementById("analysis-stage"),
  arrowLayer: document.getElementById("arrow-layer"),
  wordPopover: document.getElementById("word-popover"),
  popoverContent: document.getElementById("popover-content"),
  popoverClose: document.getElementById("popover-close"),
  glossaryList: document.getElementById("glossary-list"),
  glossaryWrap: document.getElementById("glossary-wrap"),
  glossaryToggle: document.getElementById("glossary-toggle"),
  practiceCard: document.querySelector(".practice-card"),
  tabButtons: () => document.querySelectorAll(".tab-btn"),
  tabPanels: () => document.querySelectorAll(".tab-panel"),
  dashboard: document.getElementById("dashboard"),
  historyBtn: document.getElementById("history-btn"),
  historyDrawer: document.getElementById("history-drawer"),
  historyClose: document.getElementById("history-close"),
  timeline: document.getElementById("version-timeline")
};

const normalize = (w) => w.toLowerCase().replace(/^[^a-z']+|[^a-z']+$/g, "");

function autoPunctuate(text) {
  let t = text.trim().replace(/\s+/g, " ");
  if (!t) return t;
  t = t.charAt(0).toUpperCase() + t.slice(1).replace(/\bi\b/g, "I");
  t = t.replace(/\b(\w+)\s+(and|but|so|because)\s+(I|you|he|she|they|we)\b/g, "$1, $2 $3");
  if (!/[.!?]$/.test(t)) t += /^(who|what|when|where|why|how)\b/i.test(t) ? "?" : ".";
  return t;
}

function classify(word, doc) {
  const n = normalize(word);
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
  return words.map((word, i) => ({ index: i, word, pos: classify(word, doc) }));
}

function roleInSentence(item, items) {
  const prev = items[item.index - 1]?.pos;
  if (item.pos === "verb") return "This is the action word in this sentence.";
  if (item.pos === "noun" && (prev === "article" || prev === "determiner")) return "This is likely the head noun in a noun phrase.";
  if (item.pos === "adjective") return "This describes the noun nearby.";
  if (item.pos === "adverb") return "This adds extra detail to an action or description.";
  return `This works as a ${item.pos} in this sentence.`;
}

function phraseMembership(item, items) {
  const prev = items[item.index - 1]?.pos;
  const next = items[item.index + 1]?.pos;
  if ((prev === "article" || prev === "determiner") && (item.pos === "adjective" || item.pos === "noun")) return "Likely part of a noun phrase.";
  if (item.pos === "preposition") return "Starts a prepositional phrase.";
  if (item.pos === "verb" && (next === "noun" || next === "pronoun")) return "Part of a verb phrase.";
  return "Standalone or mixed phrase context.";
}

function extraExample(pos) {
  const map = {
    noun: "The puppy chased the ball.", verb: "They laughed loudly.", adjective: "A bright kite flew.", adverb: "He answered quickly.",
    pronoun: "She waved politely.", article: "The moon is bright.", determiner: "Those apples are ripe.", preposition: "The book is on the desk.",
    conjunction: "I tried, but I slipped.", interjection: "Oops! I forgot.", unknown: "Meaning changes by context."
  };
  return map[pos] || "Try another sentence for more context.";
}

function renderWordDetail(item) {
  const defaultMsg = "Tap or hover a word to see its learning card.";
  if (!item) {
    el.popoverContent.innerHTML = defaultMsg;
    return defaultMsg;
  }
  const info = glossary[item.pos] || glossary.unknown;
  const detailHTML = `
    <p><span class="k">Word:</span> ${item.word}</p>
    <p><span class="k">Grammar type:</span> ${item.pos}</p>
    <p><span class="k">Simple definition:</span> ${info.def}</p>
    <p><span class="k">Job in this sentence:</span> ${roleInSentence(item, state.parsed)}</p>
    <p><span class="k">Phrase membership:</span> ${phraseMembership(item, state.parsed)}</p>
    <p><span class="k">Common confusion:</span> ${info.mistakes}</p>
    <p><span class="k">Another example:</span> ${extraExample(item.pos)}</p>
  `;
  el.popoverContent.innerHTML = detailHTML;
  return detailHTML;
}

function renderGlossary() {
  el.glossaryList.innerHTML = Object.entries(glossary).map(([term, g]) => `
    <div class="gloss-item">
      <h4>${term}</h4>
      <p><strong>Simple definition:</strong> ${g.def}</p>
      <p><strong>What it does:</strong> ${g.does}</p>
      <p><strong>How to spot it:</strong> ${g.spot}</p>
      <p><strong>Common mistakes:</strong> ${g.mistakes}</p>
      <p><strong>Linked terms:</strong> ${g.links}</p>
    </div>
  `).join("");
}

// Sentence renderer: keep words reading as a natural sentence while still
// giving each token its own label lane for worksheet-style analysis.
function renderTokens(parsed) {
  el.tokenLine.innerHTML = parsed.map((item) => {
    const isPunctLight = /[,:;]$/.test(item.word);
    return `
      <span class="token ${state.activeToken === item.index ? "active" : ""} ${isPunctLight ? "punct-light" : ""}" data-index="${item.index}" tabindex="0" role="button" draggable="true" aria-label="Open details for ${item.word}">
        <span class="word pos-${item.pos}">${item.word}</span>
        <span class="label">${item.pos}</span>
      </span>
    `;
  }).join("");
}

// Connector system: draw soft worksheet-style curves behind text/labels.
function renderConnectors(parsed) {
  el.arrowLayer.innerHTML = "";
  if (!state.settings.showConnectors) return;

  const stageRect = el.analysisStage.getBoundingClientRect();
  const nodes = [...el.tokenLine.querySelectorAll(".token")];
  parsed.forEach((_, i) => {
    const n = nodes[i];
    if (!n) return;
    const wordRect = n.querySelector(".word").getBoundingClientRect();
    const labelRect = n.querySelector(".label").getBoundingClientRect();
    const sx = wordRect.left - stageRect.left + wordRect.width / 2;
    const sy = wordRect.bottom - stageRect.top + 1;
    const ex = labelRect.left - stageRect.left + labelRect.width / 2;
    const ey = labelRect.top - stageRect.top - 1;
    const bendY = Math.min(ey - 3, sy + 10);

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", `M ${sx} ${sy} C ${sx - 4} ${bendY}, ${ex + 4} ${bendY}, ${ex} ${ey}`);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "#a7b5d9");
    path.setAttribute("stroke-width", "1.15");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("class", "connector");
    el.arrowLayer.appendChild(path);
  });
}

function closePopover() {
  state.ui.popoverOpen = false;
  el.wordPopover.classList.remove("open");
  el.wordPopover.setAttribute("aria-hidden", "true");
}

// Word detail component: open near token on desktop, bottom-sheet style on touch layouts.
function openPopoverForToken(idx) {
  const token = el.tokenLine.querySelector(`.token[data-index="${idx}"]`);
  if (!token) return;
  const tokenRect = token.getBoundingClientRect();
  const stageRect = el.analysisStage.getBoundingClientRect();
  const mobileSheet = window.matchMedia("(max-width: 980px)").matches;

  if (!mobileSheet) {
    const panelW = 320;
    const panelH = 270;
    const centeredLeft = tokenRect.left - stageRect.left - panelW / 2 + tokenRect.width / 2;
    const left = Math.min(stageRect.width - panelW - 8, Math.max(8, centeredLeft));
    const topAbove = tokenRect.top - stageRect.top - panelH - 12;
    const topBelow = tokenRect.bottom - stageRect.top + 16;
    const top = topAbove >= 8 ? topAbove : Math.min(Math.max(8, topBelow), Math.max(8, stageRect.height - panelH - 8));
    el.wordPopover.style.left = `${left}px`;
    el.wordPopover.style.top = `${top}px`;
  } else {
    el.wordPopover.style.left = "";
    el.wordPopover.style.top = "";
  }

  el.wordPopover.classList.add("open");
  el.wordPopover.setAttribute("aria-hidden", "false");
  state.ui.popoverOpen = true;
}

function wireTokenEvents() {
  let dragIndex = null;
  const applyReorder = (toIndex) => {
    if (dragIndex === null || dragIndex === toIndex) return;
    const moved = [...state.parsed];
    const [item] = moved.splice(dragIndex, 1);
    moved.splice(toIndex, 0, item);
    state.parsed = moved.map((p, i) => ({ ...p, index: i }));
    renderTokens(state.parsed);
    requestAnimationFrame(() => {
      renderConnectors(state.parsed);
      wireTokenEvents();
    });
    closePopover();
  };

  el.tokenLine.addEventListener("dragover", (e) => e.preventDefault());
  el.tokenLine.addEventListener("drop", (e) => {
    e.preventDefault();
    applyReorder(state.parsed.length - 1);
  }, { once: true });

  el.tokenLine.querySelectorAll(".token").forEach((token) => {
    const idx = Number(token.dataset.index);
    const setPreview = (on) => token.classList.toggle("preview", on && idx !== state.activeToken);
    const activate = () => {
      state.activeToken = idx;
      renderTokens(state.parsed);
      requestAnimationFrame(() => renderConnectors(state.parsed));
      renderWordDetail(state.parsed[idx]);
      openPopoverForToken(idx);
      trackInteraction(state.parsed[idx].pos);
      wireTokenEvents();
    };

    token.addEventListener("mouseenter", () => {
      if (window.matchMedia("(hover: hover)").matches) setPreview(true);
    });
    token.addEventListener("mouseleave", () => setPreview(false));
    token.addEventListener("click", activate);
    token.addEventListener("dragstart", (e) => {
      dragIndex = idx;
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(idx));
    });
    token.addEventListener("dragover", (e) => e.preventDefault());
    token.addEventListener("drop", (e) => {
      e.preventDefault();
      applyReorder(idx);
    });
    token.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        activate();
      }
    });
  });
}

function renderAnalysis(rawText) {
  const text = state.settings.autoPunctuate ? autoPunctuate(rawText) : rawText.trim();
  if (!text) {
    state.parsed = [];
    el.tokenLine.innerHTML = "";
    el.arrowLayer.innerHTML = "";
    closePopover();
    renderWordDetail(null);
    return;
  }
  state.parsed = parseSentence(text);
  state.activeToken = null;
  renderTokens(state.parsed);
  requestAnimationFrame(() => {
    renderConnectors(state.parsed);
    wireTokenEvents();
  });
  renderWordDetail(null);
  closePopover();
}

function trackInteraction(pos) {
  state.progress.total += 1;
  state.progress.byType[pos] = (state.progress.byType[pos] || 0) + 1;
  if (pos === "adjective" || pos === "adverb") state.progress.confusions["adjective vs adverb"] += 1;
  if (pos === "determiner" || pos === "adjective") state.progress.confusions["determiner vs adjective"] += 1;
  renderDashboard();
}

function renderDashboard() {
  const topType = Object.entries(state.progress.byType).sort((a,b) => b[1]-a[1])[0] || ["noun",0];
  const total = Math.max(state.progress.total, 1);
  const confidence = Math.min(100, Math.round((topType[1] / total) * 100));

  el.dashboard.innerHTML = `
    <div class="metric"><strong>Confidence by grammar type</strong><p>${topType[0]}: ${confidence}%</p><div class="bar"><div class="fill" style="width:${confidence}%"></div></div></div>
    <div class="metric"><strong>Common confusions</strong><p>Adj vs Adv: ${state.progress.confusions["adjective vs adverb"]}</p><p>Det vs Adj: ${state.progress.confusions["determiner vs adjective"]}</p></div>
    <div class="metric"><strong>Recent progress</strong><p>Interactions: ${state.progress.total}</p><p>Most practiced: ${topType[0]}</p></div>
    <div class="metric"><strong>Recommended next practice</strong><p>${state.progress.confusions["adjective vs adverb"] > state.progress.confusions["determiner vs adjective"] ? "Try adjective vs adverb compare mode." : "Try determiner-focused sorting mode."}</p></div>
  `;
}

function setTab(name) {
  el.tabButtons().forEach((b) => b.classList.toggle("active", b.dataset.tab === name));
  el.tabPanels().forEach((p) => p.classList.toggle("active", p.id === `tab-${name}`));
}

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }
function removeFirst(arr, value) {
  const i = arr.indexOf(value);
  if (i > -1) arr.splice(i, 1);
}

function initPracticeState(parsed) {
  state.practice = {
    selectedWord: null,
    dragWord: null,
    rebuildTarget: [],
    rebuildBank: shuffle(parsed.map((p) => p.word)),
    sortBank: parsed.map((p) => ({ word: p.word, pos: p.pos })),
    sortBins: { noun: [], verb: [], adjective: [], adverb: [], other: [] }
  };
}

function renderRebuildTab() {
  const target = state.practice.rebuildTarget.join(" ");
  document.getElementById("tab-rebuild").innerHTML = `
    <p>Tap words to move them into order (drag also works on desktop).</p>
    <div id="rebuild-bank">${state.practice.rebuildBank.map((w)=>`<span class="draggable" draggable="true" data-practice="rebuild-bank" data-word="${w}">${w}</span>`).join("")}</div>
    <div id="rebuild-zone" class="dropzone">${state.practice.rebuildTarget.map((w)=>`<span class="draggable" data-practice="placed-word" data-word="${w}">${w}</span>`).join("")}</div>
    <div class="actions">
      <button class="btn secondary" data-action="rebuild-check">Check</button>
      <button class="btn ghost" data-action="rebuild-reset">Reset</button>
    </div>
    <div class="feedback" id="rebuild-feedback">${target ? "" : "Build the sentence in the correct order."}</div>
  `;
  wirePracticeDropZones();
}

function renderSortTab() {
  const bins = ["noun","verb","adjective","adverb","other"];
  document.getElementById("tab-sort").innerHTML = `
    <p>Tap a word, then tap a grammar bin (drag also works on desktop).</p>
    ${bins.map((b)=>`<div class="bin" data-bin="${b}"><strong>${b}</strong> ${state.practice.sortBins[b].map(w => `<span>${w}</span>`).join("")}</div>`).join("")}
    <div id="sort-bank">${state.practice.sortBank.map((p)=>`<span class="draggable" draggable="true" data-practice="sort-bank" data-word="${p.word}" data-pos="${p.pos}">${p.word}</span>`).join("")}</div>
    <div class="actions">
      <button class="btn secondary" data-action="sort-check">Check</button>
      <button class="btn ghost" data-action="sort-reset">Reset</button>
    </div>
    <div class="feedback" id="sort-feedback">Sort each word into the best bin.</div>
  `;
  wirePracticeDropZones();
}

function renderPractice(parsed) {
  initPracticeState(parsed);
  renderRebuildTab();
  renderSortTab();

  // Fix mistake
  document.getElementById("tab-fix").innerHTML = `<p>Fix this sentence: <strong>She run very quick.</strong></p><button class="btn secondary" id="fix-answer">Show correction</button><div class="feedback" id="fix-feedback"></div>`;

  // Identify phrase
  document.getElementById("tab-phrase").innerHTML = `<p>Find the noun phrase in: <strong>The small dog barked loudly.</strong></p><button class="btn secondary" id="phrase-answer">Reveal</button><div class="feedback" id="phrase-feedback"></div>`;

  // Compare
  document.getElementById("tab-compare").innerHTML = `<p>Choose the correct word: "She sings ____"</p><button class="btn secondary" data-choice="beautiful">beautiful</button> <button class="btn secondary" data-choice="beautifully">beautifully</button><div class="feedback" id="compare-feedback"></div>`;
}

async function loadSampleSentence() {
  if (!state.sentences.length) {
    const res = await fetch('sentences.json');
    const data = await res.json();
    state.sentences = data.sentences || [];
  }
  const sentence = state.sentences[Math.floor(Math.random() * state.sentences.length)] || '';
  el.input.value = sentence;
  renderAnalysis(sentence);
  renderPractice(state.parsed);
  el.status.textContent = 'Try touching or dragging words to explore grammar.';
}

function openHistoryDrawer() {
  state.ui.historyOpen = true;
  el.historyDrawer.classList.add("open");
  el.historyDrawer.setAttribute("aria-hidden", "false");
}

function closeHistoryDrawer() {
  state.ui.historyOpen = false;
  el.historyDrawer.classList.remove("open");
  el.historyDrawer.setAttribute("aria-hidden", "true");
}

async function loadVersionHistory() {
  const res = await fetch('version-history.md');
  const text = await res.text();
  const sections = [...text.matchAll(/^##\s+([0-9]+\.[0-9]+\.[0-9]+)\s+-\s+([0-9-]+)\n([\s\S]*?)(?=\n##\s|$)/gm)];
  el.timeline.innerHTML = sections.map(m => {
    const [, version, date, body] = m;
    const summary = (body.match(/^-\s+(.+)/m) || ['', 'No summary'])[1];
    const href = version === state.version ? 'index.html' : `versions/${version}/index.html`;
    return `<article class="timeline-item"><a href="${href}">v${version}</a><div class="timeline-date">${date}</div><p class="timeline-summary">${summary}</p></article>`;
  }).join('');
}

async function syncVersionFromSource() {
  try {
    const res = await fetch("VERSION");
    if (!res.ok) return;
    const version = (await res.text()).trim();
    if (/^\d+\.\d+\.\d+$/.test(version)) state.version = version;
  } catch (_) {
    // Keep bundled fallback if VERSION cannot be fetched.
  }
}

async function init() {
  await syncVersionFromSource();
  el.historyBtn.textContent = `v${state.version}`;
  renderGlossary();
  el.glossaryToggle.addEventListener("click", () => {
    const collapsed = el.glossaryWrap.classList.toggle("is-collapsed");
    el.glossaryToggle.textContent = collapsed ? "Show" : "Hide";
    el.glossaryToggle.setAttribute("aria-expanded", String(!collapsed));
  });
  renderDashboard();
  loadVersionHistory();
  loadSampleSentence();
  initPracticeInteractions();

  el.analyzeBtn.addEventListener('click', () => { renderAnalysis(el.input.value); renderPractice(state.parsed); });
  el.sampleBtn.addEventListener('click', loadSampleSentence);
  el.input.addEventListener('input', () => { renderAnalysis(el.input.value); renderPractice(state.parsed); });

  el.tabButtons().forEach(btn => btn.addEventListener('click', () => setTab(btn.dataset.tab)));
  document.getElementById('history-btn').addEventListener('click', () => {
    closePopover();
    openHistoryDrawer();
  });
  document.getElementById('history-close').addEventListener('click', closeHistoryDrawer);
  el.popoverClose.addEventListener("click", closePopover);
  document.addEventListener("click", (e) => {
    if (state.ui.popoverOpen) {
      const inPopover = el.wordPopover.contains(e.target);
      const inToken = e.target.closest(".token");
      if (!inPopover && !inToken) closePopover();
    }
    if (state.ui.historyOpen) {
      const inDrawer = el.historyDrawer.contains(e.target);
      const trigger = e.target.closest("#history-btn");
      if (!inDrawer && !trigger) closeHistoryDrawer();
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (state.ui.popoverOpen) closePopover();
    if (state.ui.historyOpen) closeHistoryDrawer();
  });
  window.addEventListener("resize", () => {
    if (state.activeToken !== null && state.ui.popoverOpen) openPopoverForToken(state.activeToken);
    if (window.matchMedia("(max-width: 980px)").matches && state.ui.historyOpen) closeHistoryDrawer();
  });
  window.addEventListener("scroll", () => {
    if (state.ui.popoverOpen && !window.matchMedia("(max-width: 980px)").matches) openPopoverForToken(state.activeToken);
  }, { passive: true });
}

function checkRebuild() {
  const built = state.practice.rebuildTarget.join(" ");
  const actual = state.parsed.map((p) => p.word).join(" ");
  document.getElementById("rebuild-feedback").textContent = built === actual ? "✅ Great ordering!" : "Keep going — compare with the original sentence.";
}

function resetRebuild() {
  state.practice.rebuildTarget = [];
  state.practice.rebuildBank = shuffle(state.parsed.map((p) => p.word));
  renderRebuildTab();
}

function checkSort() {
  let correct = 0;
  const total = state.parsed.length;
  Object.entries(state.practice.sortBins).forEach(([bin, words]) => {
    words.forEach((word) => {
      const item = state.parsed.find((p) => p.word === word);
      const expected = ["noun","verb","adjective","adverb"].includes(item?.pos) ? item.pos : "other";
      if (bin === expected) correct += 1;
    });
  });
  document.getElementById("sort-feedback").textContent = `You placed ${correct}/${total} words in the best bin.`;
}

function resetSort() {
  state.practice.sortBank = state.parsed.map((p) => ({ word: p.word, pos: p.pos }));
  state.practice.sortBins = { noun: [], verb: [], adjective: [], adverb: [], other: [] };
  state.practice.selectedWord = null;
  renderSortTab();
}

function initPracticeInteractions() {
  let dragPayload = null;
  const placeIntoRebuild = (word) => {
    if (!state.practice.rebuildBank.includes(word)) return;
    removeFirst(state.practice.rebuildBank, word);
    state.practice.rebuildTarget.push(word);
    renderRebuildTab();
  };
  const placeIntoSortBin = (word, binName) => {
    const entry = state.practice.sortBank.find((p) => p.word === word);
    if (!entry) return;
    state.practice.sortBank = state.practice.sortBank.filter((p) => !(p.word === word && p.pos === entry.pos));
    state.practice.sortBins[binName].push(word);
    renderSortTab();
  };

  el.practiceCard.addEventListener("dragstart", (e) => {
    const chip = e.target.closest(".draggable[data-word]");
    if (!chip) return;
    dragPayload = { word: chip.dataset.word, pos: chip.dataset.pos, source: chip.dataset.practice };
    state.practice.dragWord = chip.dataset.word;
    e.dataTransfer.effectAllowed = "copyMove";
    e.dataTransfer.setData("text/plain", chip.dataset.word);
  });
  el.practiceCard.addEventListener("dragover", (e) => {
    const targetEl = e.target.nodeType === 1 ? e.target : e.target.parentElement;
    if (targetEl?.closest(".bin, #rebuild-zone")) e.preventDefault();
  });
  el.practiceCard.addEventListener("drop", (e) => {
    const targetEl = e.target.nodeType === 1 ? e.target : e.target.parentElement;
    const targetBin = targetEl?.closest(".bin");
    const rebuildZone = targetEl?.closest("#rebuild-zone");
    if (!targetBin && !rebuildZone) return;
    e.preventDefault();
    const draggedWord = dragPayload?.word || state.practice.dragWord || e.dataTransfer.getData("text/plain");
    if (!draggedWord) return;
    if (rebuildZone) {
      placeIntoRebuild(draggedWord);
    }
    if (targetBin) {
      placeIntoSortBin(draggedWord, targetBin.dataset.bin);
    }
    dragPayload = null;
    state.practice.dragWord = null;
  });

  el.practiceCard.addEventListener("click", (e) => {
    const chip = e.target.closest(".draggable[data-word]");
    const bin = e.target.closest(".bin");
    const action = e.target.closest("[data-action]")?.dataset.action;
    const choice = e.target.closest("[data-choice]")?.dataset.choice;

    if (action === "rebuild-check") return checkRebuild();
    if (action === "rebuild-reset") return resetRebuild();
    if (action === "sort-check") return checkSort();
    if (action === "sort-reset") return resetSort();

    if (e.target.id === "fix-answer") {
      document.getElementById("fix-feedback").textContent = '✅ Correct: "She runs very quickly."';
      return;
    }
    if (e.target.id === "phrase-answer") {
      document.getElementById("phrase-feedback").textContent = '✅ Noun phrase: "The small dog"';
      return;
    }
    if (choice) {
      document.getElementById('compare-feedback').textContent = choice === 'beautifully' ? '✅ Yes! Adverb modifies sings.' : '❌ Try again. You need an adverb.';
      return;
    }

    if (chip && chip.dataset.practice === "rebuild-bank") {
      placeIntoRebuild(chip.dataset.word);
      return;
    }
    if (chip && chip.dataset.practice === "sort-bank") {
      state.practice.selectedWord = { word: chip.dataset.word, pos: chip.dataset.pos };
      el.practiceCard.querySelectorAll(".draggable[data-practice='sort-bank']").forEach((n) => n.classList.toggle("active", n.dataset.word === chip.dataset.word));
      return;
    }
    if (bin && state.practice.selectedWord) {
      placeIntoSortBin(state.practice.selectedWord.word, bin.dataset.bin);
      state.practice.selectedWord = null;
    }
  });
}

function wirePracticeDropZones() {
  const rebuildZone = document.getElementById("rebuild-zone");
  if (rebuildZone) {
    rebuildZone.addEventListener("dragover", (e) => e.preventDefault());
  }
  document.querySelectorAll(".bin").forEach((bin) => {
    bin.addEventListener("dragover", (e) => e.preventDefault());
  });
}

init();
