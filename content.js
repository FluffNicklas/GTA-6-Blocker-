(function () {
  const h = location.hostname;
  const site = h.endsWith("youtube.com") ? "yt" : h.endsWith("twitch.tv") ? "tw"
    : h.endsWith("instagram.com") ? "ig" : h.endsWith("tiktok.com") ? "tt" : "";
  if (!site) return;

  // ---------- Einstellungen ----------
  let enabled = true, blockPages = true, keywords = [], loaded = false;
  let lastHref = location.href, lastScan = 0, scheduled = false, unresolved = false;
  let holdActive = false, holdUntil = 0, ytFresh = true, styleEl = null;
  const seen = new WeakMap();
  const dirty = new Set();

  // ---------- Selektoren ----------
  const CARDS = {
    yt: [
      "ytd-rich-item-renderer", "ytd-video-renderer", "ytd-compact-video-renderer",
      "ytd-grid-video-renderer", "yt-lockup-view-model", "ytd-reel-item-renderer",
      "ytm-shorts-lockup-view-model", "ytm-shorts-lockup-view-model-v2",
      "[class*='shortsLockupViewModelHost']", "ytd-playlist-renderer", "yt-chip-cloud-chip-renderer"
    ],
    tw: [
      "article", ".tw-tower > div", "[data-test-selector='shelf-card']",
      ".side-nav-card", "[data-target='directory-first-item']"
    ],
    ig: ["article", "main a[href*='/reel/']", "main a[href*='/p/']"],
    tt: [
      "[data-e2e='recommend-list-item-container']", "[data-e2e='search_top-item']",
      "[data-e2e='search-card-item']", "[data-e2e='user-post-item']",
      "[data-e2e='explore-item']", "div[class*='DivItemContainer']"
    ]
  }[site];
  const JOINED = CARDS.join(",");
  const PENDING = CARDS.map(s => `${s}:not([data-gta6-ok]):not([data-gta6-hidden])`).join(",");

  const PLAYER = {
    yt: "#movie_player, ytd-player, video",
    tw: "[data-a-target='video-player'], .video-player, .video-player__container, video"
  }[site];

  const TWITCH_CARD = "article, .side-nav-card, .tw-tower > div, [data-test-selector='shelf-card'], [data-target='directory-first-item']";
  const TWITCH_CAT = [
    "a[href*='/directory/category/grand-theft-auto-vi' i]",
    "a[href*='/directory/category/gta-vi' i]",
    "a[href*='/directory/game/Grand%20Theft%20Auto%20VI' i]"
  ].join(",");
  const TWITCH_INFO_LINK = "a[data-a-target='stream-game-link'], a[data-a-target='video-info-game-boxart-link']";

  // ---------- Hilfsfunktionen ----------
  // Groß-/Kleinschreibung, Sonderzeichen und Leerzeichen sind egal: "GTA6" = "gta 6" = "GTA-6"
  const norm = s => " " + String(s).toLowerCase().replace(/[^a-z0-9äöüß]+/g, " ").trim() + " ";
  const toRegex = k => {
    const chars = Array.from(norm(k).replace(/ /g, ""));
    return chars.length ? new RegExp("(?:^| )" + chars.join(" ?") + "(?: |$)") : null;
  };
  const isMatch = t => { const n = norm(t); return keywords.some(re => re.test(n)); };

  function elementText(el) {
    let t = (el.getAttribute("aria-label") || "") + " " + (el.textContent || "").slice(0, 2000);
    el.querySelectorAll("img[alt]").forEach(i => { t += " " + i.alt; });
    return t;
  }

  // ---------- CSS: Inhalte bleiben unsichtbar, bis sie geprüft sind ----------
  function injectStyle() {
    if (styleEl) return;
    styleEl = document.createElement("style");
    styleEl.textContent =
      `${PENDING}{visibility:hidden!important}` +
      `[data-gta6-hidden]{display:none!important}` +
      (PLAYER ? `html[data-gta6-hold] :is(${PLAYER}){visibility:hidden!important}` : "");
    document.documentElement.appendChild(styleEl);
  }
  function removeStyle() { if (styleEl) { styleEl.remove(); styleEl = null; } }

  // ---------- Seitenerkennung ----------
  function pageCandidates() {
    let p = location.pathname;
    try { p = decodeURIComponent(p); } catch (e) {}
    const q = new URLSearchParams(location.search);
    const c = [];
    let m;
    if (site === "yt") {
      if ((m = p.match(/^\/hashtag\/([^/]+)/))) c.push(m[1]);
      if (p === "/results") c.push(q.get("search_query") || "");
      if ((p === "/watch" || p.startsWith("/shorts/")) && ytFresh) c.push(document.title.replace(/ - YouTube$/, ""));
    } else if (site === "tw") {
      if ((m = p.match(/^\/directory\/(?:category|game)\/([^/]+)/))) c.push(m[1]);
      if (p === "/search") c.push(q.get("term") || "");
    } else if (site === "ig") {
      if ((m = p.match(/^\/explore\/tags\/([^/]+)/))) c.push(m[1]);
    } else if (site === "tt") {
      if ((m = p.match(/^\/tag\/([^/]+)/))) c.push(m[1]);
      if (p.startsWith("/search")) c.push(q.get("q") || "");
    }
    return c;
  }

  const TW_RESERVED = "directory|search|settings|downloads|p|subscriptions|wallet|drops|friends|inventory|turbo|jobs|store|moderator|u|popout|prime|team|bits";
  const TW_CHANNEL = new RegExp(`^/(?!(?:${TW_RESERVED})(?:/|$))[^/]+(?:/(?:about|schedule|videos|clips|home|squad))?/?$`, "i");
  function isTwitchWatchPath() { return TW_CHANNEL.test(location.pathname) || /^\/videos\/\d+/.test(location.pathname); }

  function pageBlocked() {
    if (pageCandidates().some(isMatch)) return true;
    if (site === "tw" && isTwitchWatchPath()) {
      for (const a of document.querySelectorAll(TWITCH_CAT)) if (!a.closest(TWITCH_CARD)) return true;
      const g = document.querySelector(TWITCH_INFO_LINK);
      if (g && isMatch(g.textContent)) return true;
      const t = document.querySelector("[data-a-target='stream-title']");
      if (t && isMatch(t.textContent)) return true;
      for (const a of document.querySelectorAll("a[data-a-target='tag'], a[href*='/directory/all/tags/']")) {
        if (isMatch(a.textContent)) return true;
      }
    }
    return false;
  }

  function redirectIfBlocked() {
    if (blockPages && location.pathname !== "/" && pageBlocked()) {
      location.replace(location.origin + "/");
      return true;
    }
    return false;
  }

  // ---------- Player-Sperre (Bild + Ton), bis die Seite geprüft ist ----------
  function wantHold() {
    if (!blockPages) return false;
    if (site === "tw") return isTwitchWatchPath();
    if (site === "yt") return location.pathname === "/watch";
    return false;
  }
  function muteVideos(on) {
    document.querySelectorAll("video").forEach(v => {
      if (on) {
        if (v.dataset.gta6Muted === undefined) { v.dataset.gta6Muted = v.muted ? "0" : "1"; v.muted = true; }
      } else if (v.dataset.gta6Muted !== undefined) {
        if (v.dataset.gta6Muted === "1") v.muted = false;
        delete v.dataset.gta6Muted;
      }
    });
  }
  function startHold() {
    if (enabled && wantHold()) {
      holdActive = true;
      holdUntil = Date.now() + 3000;
      document.documentElement.setAttribute("data-gta6-hold", "1");
      muteVideos(true);
    } else endHold();
  }
  function endHold() {
    holdActive = false;
    document.documentElement.removeAttribute("data-gta6-hold");
    muteVideos(false);
  }
  function holdReady() {
    if (Date.now() > holdUntil) return true;
    if (site === "tw") return !!document.querySelector(TWITCH_INFO_LINK);
    if (site === "yt") return ytFresh && / - YouTube$/.test(document.title);
    return true;
  }

  // ---------- Karten prüfen ----------
  function check(el) {
    const text = elementText(el);
    if (isMatch(text)) { el.setAttribute("data-gta6-hidden", "1"); return; }
    if (!seen.has(el)) seen.set(el, Date.now());
    if (text.trim().length > 3 || Date.now() - seen.get(el) > 800) el.setAttribute("data-gta6-ok", "1");
    else unresolved = true;
  }

  // Fallback für YouTube: findet Karten über ihre Video-Links, egal wie das Element heißt
  const VIDEO_LINK = "a[href^='/shorts/'], a[href^='/watch']";
  const vidId = a => (a.getAttribute("href") || "").split("&")[0].split("#")[0];
  let lastLinkScan = 0;
  function hideByLinks() {
    const now = Date.now();
    if (now - lastLinkScan < 300) { unresolved = true; return; }
    lastLinkScan = now;
    document.querySelectorAll(VIDEO_LINK).forEach(a => {
      if (a.closest("[data-gta6-hidden]")) return;
      const t = (a.getAttribute("aria-label") || "") + " " + (a.getAttribute("title") || "") + " " + (a.textContent || "").slice(0, 300);
      if (!isMatch(t)) return;
      let box = a;
      for (let i = 0; i < 10; i++) {
        const p = box.parentElement;
        if (!p || /^(YTD-APP|YTD-PAGE-MANAGER|BODY|HTML)$/i.test(p.tagName)) break;
        const ids = new Set();
        p.querySelectorAll(VIDEO_LINK).forEach(x => ids.add(vidId(x)));
        if (ids.size > 1) break;
        box = p;
      }
      box.setAttribute("data-gta6-hidden", "1");
    });
  }

  function scan() {
    scheduled = false;
    lastScan = Date.now();
    if (!enabled || !loaded) return;
    if (redirectIfBlocked()) return;

    unresolved = false;
    document.querySelectorAll(PENDING).forEach(check);
    if (site === "yt") hideByLinks();

    dirty.forEach(el => {
      if (el.isConnected && el.hasAttribute("data-gta6-ok") && isMatch(elementText(el))) {
        el.removeAttribute("data-gta6-ok");
        el.setAttribute("data-gta6-hidden", "1");
      }
    });
    dirty.clear();

    if (site === "tw") {
      document.querySelectorAll(TWITCH_CAT).forEach(a => {
        (a.closest(TWITCH_CARD) || a).setAttribute("data-gta6-hidden", "1");
      });
    }

    if (holdActive && holdReady()) endHold();
  }

  function request() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(scan, Math.max(0, 50 - (Date.now() - lastScan)));
  }

  // ---------- Start / Ende ----------
  function clearMarks() {
    document.querySelectorAll("[data-gta6-ok],[data-gta6-hidden]").forEach(el => {
      el.removeAttribute("data-gta6-ok");
      el.removeAttribute("data-gta6-hidden");
    });
  }

  function load() {
    chrome.storage.local.get({ enabled: true, blockPages: true, keywords: GTA6_DEFAULTS }, r => {
      enabled = r.enabled;
      blockPages = r.blockPages;
      keywords = r.keywords.map(toRegex).filter(Boolean);
      loaded = true;
      if (enabled) { injectStyle(); startHold(); request(); }
      else { removeStyle(); endHold(); clearMarks(); }
    });
  }

  // Sofort sperren, bevor die Einstellungen geladen sind
  injectStyle();
  startHold();
  load();

  chrome.storage.onChanged.addListener(() => { clearMarks(); load(); });

  new MutationObserver(recs => {
    if (!enabled) return;
    for (const r of recs) {
      const n = r.target.nodeType === 1 ? r.target : r.target.parentElement;
      if (n && n.closest) {
        const c = n.closest(JOINED);
        if (c && c.hasAttribute("data-gta6-ok")) dirty.add(c);
      }
    }
    request();
  }).observe(document.documentElement, { childList: true, subtree: true, characterData: true });

  if (site === "yt") {
    document.addEventListener("yt-navigate-start", () => { ytFresh = false; });
    document.addEventListener("yt-navigate-finish", () => { ytFresh = true; request(); });
  }

  // Seitenwechsel ohne Neuladen erkennen + Wiederholungen
  setInterval(() => {
    if (!enabled || !loaded) return;
    if (location.href !== lastHref) { lastHref = location.href; startHold(); request(); }
    if (holdActive) { muteVideos(true); request(); }
    else if (unresolved) request();
  }, 100);
})();
