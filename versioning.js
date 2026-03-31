(function () {
  function compareVersions(a, b) {
    const pa = a.split(".").map(Number);
    const pb = b.split(".").map(Number);
    if (pa[0] !== pb[0]) return pb[0] - pa[0];
    if (pa[1] !== pb[1]) return pb[1] - pa[1];
    return pb[2] - pa[2];
  }

  async function ensureMarked() {
    if (window.marked && typeof window.marked.parse === "function") return;
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/marked/marked.min.js";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function fallbackMarkdown(markdown) {
    return markdown
      .replace(/^### (.*)$/gm, "<h3>$1</h3>")
      .replace(/^## (.*)$/gm, "<h2>$1</h2>")
      .replace(/^# (.*)$/gm, "<h1>$1</h1>")
      .replace(/^- (.*)$/gm, "<li>$1</li>")
      .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\n\n/g, "<br><br>");
  }

  window.initVersioning = async function initVersioning(options) {
    const { currentVersion, rootPrefix = "" } = options;
    const modal = document.getElementById("version-modal");
    const historyContainer = document.getElementById("version-history-rendered");
    const label = document.getElementById("version-label");
    const prevBtn = document.getElementById("prev-version");
    const nextBtn = document.getElementById("next-version");
    const openBtn = document.getElementById("version-button") || document.getElementById("history-btn");
    const closeBtn = document.getElementById("close-modal") || document.getElementById("history-close");

    if (!historyContainer || !openBtn) return;
    if (label) label.textContent = currentVersion;
    let versions = [];

    function getVersionPath(version) {
      return version === currentVersion ? `${rootPrefix}index.html` : `${rootPrefix}versions/${version}/index.html`;
    }

    function openAdjacent(offset) {
      const sorted = [...versions].sort(compareVersions);
      const currentIdx = sorted.indexOf(currentVersion);
      if (currentIdx === -1) return;
      const target = sorted[currentIdx + offset];
      if (!target) return;
      window.location.href = getVersionPath(target);
    }

    function decorateVersionHeadings() {
      historyContainer.querySelectorAll("h2").forEach((h2) => {
        const match = h2.textContent.match(/(\d+\.\d+\.\d+)/);
        if (!match) return;
        const version = match[1];
        const link = document.createElement("a");
        link.href = getVersionPath(version);
        link.textContent = h2.textContent;
        link.style.textDecoration = "none";
        link.style.color = "#2346a0";
        h2.textContent = "";
        h2.appendChild(link);
      });
    }

    function styleMarkdown() {
      historyContainer.style.padding = "6px 2px";
      historyContainer.querySelectorAll("h1").forEach((el) => {
        el.style.marginBottom = "10px";
      });
      historyContainer.querySelectorAll("h2").forEach((el) => {
        el.style.marginTop = "16px";
        el.style.marginBottom = "8px";
        el.style.paddingBottom = "6px";
        el.style.borderBottom = "1px solid #e6ecff";
      });
      historyContainer.querySelectorAll("ul").forEach((el) => {
        el.style.marginTop = "6px";
        el.style.marginBottom = "12px";
        el.style.paddingLeft = "20px";
      });
      historyContainer.querySelectorAll("p, li").forEach((el) => {
        el.style.lineHeight = "1.5";
      });
    }

    if (modal) {
      openBtn.addEventListener("click", () => modal.classList.add("open"));
      if (closeBtn) closeBtn.addEventListener("click", () => modal.classList.remove("open"));
      modal.addEventListener("click", (event) => {
        if (event.target === modal) modal.classList.remove("open");
      });
    }
    if (prevBtn) prevBtn.addEventListener("click", () => openAdjacent(1));
    if (nextBtn) nextBtn.addEventListener("click", () => openAdjacent(-1));

    try {
      const response = await fetch(`${rootPrefix}version-history.md`);
      if (!response.ok) throw new Error(`Unable to load version-history.md (${response.status})`);
      const markdown = await response.text();
      versions = [...markdown.matchAll(/^##\s+([0-9]+\.[0-9]+\.[0-9]+)/gm)].map((m) => m[1]);

      await ensureMarked();
      historyContainer.innerHTML = window.marked?.parse ? window.marked.parse(markdown) : fallbackMarkdown(markdown);
      decorateVersionHeadings();
      styleMarkdown();
    } catch (error) {
      historyContainer.textContent = `Could not load version history: ${error.message}`;
    }
  };
})();
