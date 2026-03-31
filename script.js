const state = {
  version: "1.3.0",
  settings: { autoPunctuate: true, showLabels: true, showConnectors: true },
  sentences: [],
  parsed: [],
  activeToken: null,
  progress: {
    total: 0,
    byType: {},
    confusions: { "adjective vs adverb": 0, "determiner vs adjective": 0 }
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
  wordDetail: document.getElementById("word-detail"),
  glossaryList: document.getElementById("glossary-list"),
  wordInput: document.getElementById("word-input"),
  grammarType: document.getElementById("grammar-type"),
  grammarExplanation: document.getElementById("grammar-explanation"),
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
    el.wordDetail.innerHTML = defaultMsg;
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
  el.wordDetail.innerHTML = detailHTML;
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
      <span class="token ${state.activeToken === item.index ? "active" : ""} ${isPunctLight ? "punct-light" : ""}" data-index="${item.index}" tabindex="0" role="button" aria-label="Open details for ${item.word}">
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
    const left = Math.min(stageRect.width - panelW - 8, Math.max(8, tokenRect.left - stageRect.left - panelW / 2 + tokenRect.width / 2));
    const top = Math.max(8, tokenRect.bottom - stageRect.top + 14);
    el.wordPopover.style.left = `${left}px`;
    el.wordPopover.style.top = `${top}px`;
  } else {
    el.wordPopover.style.left = "";
    el.wordPopover.style.top = "";
  }

  el.wordPopover.classList.add("open");
  el.wordPopover.setAttribute("aria-hidden", "false");
}

function wireTokenEvents() {
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

function checkWord(word) {
  const n = normalize(word);
  if (!n) {
    el.grammarType.textContent = "—";
    el.grammarExplanation.textContent = "Type a word to get help.";
    return;
  }
  const pos = classify(n, nlp(n));
  el.grammarType.textContent = pos;
  el.grammarExplanation.textContent = glossary[pos]?.def || glossary.unknown.def;
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

function renderPractice(parsed) {
  const words = parsed.map(p => p.word);

  // Rebuild sentence
  const shuffled = shuffle(words);
  document.getElementById("tab-rebuild").innerHTML = `
    <p>Drag words into the correct order.</p>
    <div id="rebuild-bank">${shuffled.map((w,i)=>`<span class="draggable" draggable="true" data-word="${w}">${w}</span>`).join("")}</div>
    <div id="rebuild-zone" class="dropzone"></div>
    <div class="feedback" id="rebuild-feedback"></div>
  `;

  // Sort
  const bins = ["noun","verb","adjective","adverb","other"];
  document.getElementById("tab-sort").innerHTML = `<p>Drag each word into a grammar bin.</p>${bins.map(b=>`<div class="bin" data-bin="${b}"><strong>${b}</strong></div>`).join("")}<div id="sort-bank">${parsed.map(p=>`<span class="draggable" draggable="true" data-pos="${p.pos}" data-word="${p.word}">${p.word}</span>`).join("")}</div>`;

  // Fix mistake
  document.getElementById("tab-fix").innerHTML = `<p>Fix this sentence: <strong>She run very quick.</strong></p><button class="btn secondary" id="fix-answer">Show correction</button><div class="feedback" id="fix-feedback"></div>`;

  // Identify phrase
  document.getElementById("tab-phrase").innerHTML = `<p>Find the noun phrase in: <strong>The small dog barked loudly.</strong></p><button class="btn secondary" id="phrase-answer">Reveal</button><div class="feedback" id="phrase-feedback"></div>`;

  // Compare
  document.getElementById("tab-compare").innerHTML = `<p>Choose the correct word: "She sings ____"</p><button class="btn secondary" data-choice="beautiful">beautiful</button> <button class="btn secondary" data-choice="beautifully">beautifully</button><div class="feedback" id="compare-feedback"></div>`;

  wirePractice(words);
}

function wirePractice(words) {
  // generic drag
  document.querySelectorAll('.draggable').forEach(d => {
    d.addEventListener('dragstart', e => e.dataTransfer.setData('text/plain', e.target.dataset.word));
  });

  const rebuildZone = document.getElementById('rebuild-zone');
  if (rebuildZone) {
    rebuildZone.addEventListener('dragover', e => e.preventDefault());
    rebuildZone.addEventListener('drop', e => {
      e.preventDefault();
      const word = e.dataTransfer.getData('text/plain');
      rebuildZone.innerHTML += `<span class="draggable">${word}</span> `;
      const built = rebuildZone.textContent.trim().replace(/\s+/g,' ');
      if (built === words.join(' ')) document.getElementById('rebuild-feedback').textContent = '✅ Great ordering!';
    });
  }

  document.querySelectorAll('.bin').forEach(bin => {
    bin.addEventListener('dragover', e => e.preventDefault());
    bin.addEventListener('drop', e => {
      e.preventDefault();
      const word = e.dataTransfer.getData('text/plain');
      bin.innerHTML += ` <span>${word}</span>`;
    });
  });

  const fixBtn = document.getElementById('fix-answer');
  if (fixBtn) fixBtn.onclick = () => document.getElementById('fix-feedback').textContent = '✅ Correct: "She runs very quickly."';

  const phraseBtn = document.getElementById('phrase-answer');
  if (phraseBtn) phraseBtn.onclick = () => document.getElementById('phrase-feedback').textContent = '✅ Noun phrase: "The small dog"';

  document.querySelectorAll('#tab-compare [data-choice]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('compare-feedback').textContent = btn.dataset.choice === 'beautifully' ? '✅ Yes! Adverb modifies sings.' : '❌ Try again. You need an adverb.';
    });
  });
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
  el.status.textContent = 'Sample loaded.';
}

function toggleDrawer(drawer, open) {
  drawer.classList.toggle('open', open);
  drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
}

function renderSettingsButtons() {
  document.querySelectorAll('.toggle-btn[data-setting]').forEach(btn => {
    btn.classList.toggle('is-on', !!state.settings[btn.dataset.setting]);
  });
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

function init() {
  el.historyBtn.textContent = `v${state.version}`;
  renderGlossary();
  renderDashboard();
  loadVersionHistory();
  loadSampleSentence();

  el.analyzeBtn.addEventListener('click', () => { renderAnalysis(el.input.value); renderPractice(state.parsed); });
  el.sampleBtn.addEventListener('click', loadSampleSentence);
  el.input.addEventListener('input', () => { renderAnalysis(el.input.value); renderPractice(state.parsed); });

  el.tabButtons().forEach(btn => btn.addEventListener('click', () => setTab(btn.dataset.tab)));
  document.getElementById('history-btn').addEventListener('click', () => toggleDrawer(el.historyDrawer, true));
  document.getElementById('history-close').addEventListener('click', () => toggleDrawer(el.historyDrawer, false));
  el.popoverClose.addEventListener("click", closePopover);
  document.addEventListener("click", (e) => {
    if (!el.wordPopover.classList.contains("open")) return;
    const inPopover = el.wordPopover.contains(e.target);
    const inToken = e.target.closest(".token");
    if (!inPopover && !inToken) closePopover();
  });
  window.addEventListener("resize", () => {
    if (state.activeToken !== null && el.wordPopover.classList.contains("open")) openPopoverForToken(state.activeToken);
  });
}

init();
