(function () {
  function escapeHtml(text) {
    return text
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function renderMarkdown(markdown) {
    const lines = markdown.split(/\r?\n/);
    let html = "";
    let inList = false;

    const closeList = () => {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
    };

    for (const raw of lines) {
      const line = raw.trimEnd();

      if (!line.trim()) {
        closeList();
        continue;
      }

      if (line.startsWith("## ")) {
        closeList();
        html += `<h2>${escapeHtml(line.slice(3))}</h2>`;
        continue;
      }

      if (line.startsWith("# ")) {
        closeList();
        html += `<h1>${escapeHtml(line.slice(2))}</h1>`;
        continue;
      }

      if (line.startsWith("- ")) {
        if (!inList) {
          html += "<ul>";
          inList = true;
        }
        const item = escapeHtml(line.slice(2)).replace(/`([^`]+)`/g, "<code>$1</code>");
        html += `<li>${item}</li>`;
        continue;
      }

      closeList();
      const paragraph = escapeHtml(line).replace(/`([^`]+)`/g, "<code>$1</code>");
      html += `<p>${paragraph}</p>`;
    }

    closeList();
    return html;
  }

  function compareVersions(a, b) {
    const pa = a.split(".").map(Number);
    const pb = b.split(".").map(Number);
    if (pa[0] !== pb[0]) return pb[0] - pa[0];
    if (pa[1] !== pb[1]) return pb[1] - pa[1];
    return pb[2] - pa[2];
  }

  window.initVersioning = async function initVersioning(options) {
    const { currentVersion, rootPrefix = "" } = options;
    const modal = document.getElementById("version-modal");
    const historyContainer = document.getElementById("version-history-rendered");
    const label = document.getElementById("version-label");
    const prevBtn = document.getElementById("prev-version");
    const nextBtn = document.getElementById("next-version");

    label.textContent = currentVersion;

    let versions = [];

    function getVersionPath(version) {
      if (version === currentVersion) return `${rootPrefix}index.html`;
      return `${rootPrefix}versions/${version}/index.html`;
    }

    function openAdjacent(offset) {
      const sorted = [...versions].sort(compareVersions);
      const currentIdx = sorted.indexOf(currentVersion);
      if (currentIdx === -1) return;
      const target = sorted[currentIdx + offset];
      if (!target) return;
      window.location.href = getVersionPath(target);
    }

    document.getElementById("version-button").addEventListener("click", () => {
      modal.classList.add("open");
    });
    document.getElementById("close-modal").addEventListener("click", () => {
      modal.classList.remove("open");
    });
    modal.addEventListener("click", (event) => {
      if (event.target === modal) modal.classList.remove("open");
    });

    prevBtn.addEventListener("click", () => openAdjacent(1));
    nextBtn.addEventListener("click", () => openAdjacent(-1));

    try {
      const response = await fetch(`${rootPrefix}version-history.md`);
      if (!response.ok) {
        throw new Error(`Unable to load version-history.md (${response.status})`);
      }
      const markdown = await response.text();
      versions = [...markdown.matchAll(/^##\s+([0-9]+\.[0-9]+\.[0-9]+)/gm)].map((m) => m[1]);
      historyContainer.innerHTML = renderMarkdown(markdown);
      if (!versions.includes(currentVersion)) {
        historyContainer.innerHTML += `<p><strong>Warning:</strong> ${escapeHtml(currentVersion)} is not listed in version-history.md.</p>`;
      }
    } catch (error) {
      historyContainer.textContent = `Could not load version history: ${error.message}`;
    }
  };
})();
