(() => {
  "use strict";

  const dict = window.__aussieI18nDict || {};
  const STORAGE_KEY = "aussie-lang";
  let originalMap = null;

  function walkTextNodes(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (parent.closest("script, style, svg")) return NodeFilter.FILTER_REJECT;
        if (!node.textContent || !node.textContent.trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const nodes = [];
    let n;
    while ((n = walker.nextNode())) nodes.push(n);
    return nodes;
  }

  function applyLanguage(lang) {
    if (!originalMap) originalMap = new WeakMap();
    const nodes = walkTextNodes(document.body);
    nodes.forEach((node) => {
      if (!originalMap.has(node)) originalMap.set(node, node.textContent);
      const original = originalMap.get(node);
      if (lang === "en") {
        const trimmed = original.trim();
        const translated = dict[trimmed];
        if (translated) {
          const leading = original.match(/^\s*/)[0];
          const trailing = original.match(/\s*$/)[0];
          node.textContent = leading + translated + trailing;
        }
      } else {
        node.textContent = original;
      }
    });

    document.querySelectorAll("[placeholder]").forEach((el) => {
      if (!el.dataset.i18nPh) el.dataset.i18nPh = el.getAttribute("placeholder");
      const orig = el.dataset.i18nPh;
      const translated = lang === "en" ? dict[orig] : null;
      el.setAttribute("placeholder", translated || orig);
    });

    document.documentElement.lang = lang === "en" ? "en" : "pt-BR";
    document.querySelectorAll(".lang-switch button").forEach((btn) => {
      const isEnBtn = btn.textContent.trim() === "EN";
      btn.setAttribute("aria-pressed", String((lang === "en") === isEnBtn));
    });
    if (typeof window.__aussieRerenderHero === "function") window.__aussieRerenderHero();
  }

  function wireButtons() {
    document.querySelectorAll(".lang-switch button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const isEnBtn = btn.textContent.trim() === "EN";
        const lang = isEnBtn ? "en" : "pt";
        try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }
        applyLanguage(lang);
      });
    });
  }

  function init() {
    wireButtons();
    let saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* ignore */ }
    if (saved === "en") applyLanguage("en");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
