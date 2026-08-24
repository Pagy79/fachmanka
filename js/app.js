(() => {
  const terms = window.FACHMANKA_TERMS || [];

  const categoryStyle = {
    Rozpočet: { badge: "bg-primary/10 text-primary" },
    "Hrubá stavba": { badge: "bg-secondary text-foreground" },
    Dokončovačky: { badge: "bg-[#bdd7b0]/60 text-primary" },
    Materiál: { badge: "bg-blue-50 text-blue-700" },
    Technologie: { badge: "bg-muted text-foreground" },
  };

  const categories = ["Vše", ...Object.keys(categoryStyle)];

  const tipTerms = [
    "Vícepráce",
    "Zádržné (Pozastávka)",
    "Prořez",
    "TDI (Technický dozor investora)",
  ].filter((name) => terms.some((t) => t.pojem === name));

  function normalize(str) {
    return str
      .toLocaleLowerCase("cs")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  const searchIndex = terms.map((t) => ({
    term: t,
    key: normalize([t.pojem, t.preklad, t.kategorie].join(" ")),
  }));

  function countLabel(n) {
    if (n === 1) return `${n} pojem`;
    if (n >= 2 && n <= 4) return `${n} pojmy`;
    return `${n} pojmů`;
  }

  const params = new URLSearchParams(window.location.search);
  let query = params.get("q") || "";
  let category = params.get("kat") || "Vše";
  if (!categories.includes(category)) category = "Vše";

  const cardList = document.getElementById("cardList");
  const emptyState = document.getElementById("emptyState");
  const tipChips = document.getElementById("tipChips");
  const categoryChips = document.getElementById("categoryChips");
  const resultCount = document.getElementById("resultCount");
  const searchInput = document.getElementById("searchInput");
  const clearBtn = document.getElementById("clearBtn");

  function syncUrl() {
    const next = new URLSearchParams();
    if (query.trim()) next.set("q", query.trim());
    if (category !== "Vše") next.set("kat", category);
    const qs = next.toString();
    const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }

  function renderTipChips() {
    tipChips.innerHTML = tipTerms
      .map(
        (name) => `
      <button
        type="button"
        data-tip="${escapeHtml(name)}"
        class="chip whitespace-nowrap text-xs font-semibold px-3.5 py-2 rounded-full bg-card text-foreground border-2 border-border hover:border-primary/50"
      >${escapeHtml(name)}</button>
    `
      )
      .join("");

    tipChips.querySelectorAll("button[data-tip]").forEach((btn) => {
      btn.addEventListener("click", () => {
        searchInput.value = btn.dataset.tip;
        query = btn.dataset.tip;
        renderCards();
        searchInput.focus();
      });
    });
  }

  function renderCategoryChips() {
    categoryChips.innerHTML = categories
      .map((name) => {
        const active =
          name === category
            ? "bg-primary text-primary-fg border-primary"
            : "bg-card text-muted-fg border-border hover:border-primary/50";
        return `
        <button
          type="button"
          data-kat="${escapeHtml(name)}"
          aria-pressed="${name === category}"
          class="chip whitespace-nowrap text-[11px] font-semibold px-3 py-1.5 rounded-full border-2 ${active}"
        >${escapeHtml(name)}</button>
      `;
      })
      .join("");

    categoryChips.querySelectorAll("button[data-kat]").forEach((btn) => {
      btn.addEventListener("click", () => {
        category = btn.dataset.kat;
        renderCategoryChips();
        renderCards();
      });
    });
  }

  const infoIcon = `
    <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
      <circle cx="12" cy="12" r="9"></circle>
      <line x1="12" y1="11" x2="12" y2="16.5"></line>
      <circle cx="12" cy="7.8" r="0.9" fill="currentColor" stroke="none"></circle>
    </svg>`;

  const warnIcon = `
    <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
      <path d="M12 3.5 L21.5 20 H2.5 Z" stroke-linejoin="round"></path>
      <line x1="12" y1="9.5" x2="12" y2="14"></line>
      <circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none"></circle>
    </svg>`;

  function renderCards() {
    const q = normalize(query.trim());
    syncUrl();

    clearBtn.classList.toggle("hidden", q.length === 0);
    clearBtn.classList.toggle("flex", q.length > 0);

    if (q.length === 0) {
      cardList.innerHTML = "";
      resultCount.textContent = "";
      emptyState.classList.add("hidden");
      emptyState.setAttribute("aria-hidden", "true");
      return;
    }

    const filtered = searchIndex
      .filter((entry) => {
        const matchesQuery = q.length === 0 || entry.key.includes(q);
        const matchesCat = category === "Vše" || entry.term.kategorie === category;
        return matchesQuery && matchesCat;
      })
      .map((entry) => entry.term);

    resultCount.textContent = filtered.length ? countLabel(filtered.length) : "";

    if (filtered.length === 0) {
      cardList.innerHTML = "";
      emptyState.classList.remove("hidden");
      emptyState.setAttribute("aria-hidden", "false");
      return;
    }
    emptyState.classList.add("hidden");
    emptyState.setAttribute("aria-hidden", "true");

    cardList.innerHTML = filtered
      .map((t) => {
        const style = categoryStyle[t.kategorie] || { badge: "bg-muted text-foreground" };
        const num = String(t.id).padStart(2, "0");
        return `
        <article class="card-enter bg-card rounded-2xl border-2 border-border hover:border-primary/50 shadow-sm overflow-hidden">
          <div class="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
            <div>
              <p class="text-[10px] font-semibold tracking-widest uppercase text-muted-fg mb-1">Pojem č. ${num}</p>
              <h2 class="font-serif font-bold text-2xl leading-tight text-foreground">${escapeHtml(t.pojem)}</h2>
            </div>
            <span class="shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${style.badge}">
              ${escapeHtml(t.kategorie)}
            </span>
          </div>

          <div class="px-5 py-4 flex gap-2.5 items-start bg-secondary/80 text-foreground border-t border-border">
            <span class="text-primary mt-[1px]">${infoIcon}</span>
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-wide text-primary mb-0.5">Co to znamená</p>
              <p class="text-sm text-foreground/85 leading-relaxed">${escapeHtml(t.preklad)}</p>
            </div>
          </div>

          <div class="px-5 py-4 flex gap-2.5 items-start bg-primary/5">
            <span class="text-primary mt-[1px]">${warnIcon}</span>
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-wide text-primary mb-0.5">V praxi to znamená</p>
              <p class="text-sm text-foreground/85 leading-relaxed">${escapeHtml(t.realita)}</p>
            </div>
          </div>
        </article>
      `;
      })
      .join("");
  }

  searchInput.value = query;
  searchInput.addEventListener("input", (e) => {
    query = e.target.value;
    renderCards();
  });

  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    query = "";
    renderCards();
    searchInput.focus();
  });

  renderTipChips();
  renderCategoryChips();
  renderCards();
})();
