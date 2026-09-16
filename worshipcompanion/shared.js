function tableForLang(lang) {
  if (lang === "english") return "english_data";
  if (lang === "kannada") return "kannada_data";
  return "other_data";
}

function langForCategory(category) {
  const c = (category || "").replace(/_data$/, "");
  if (c === "english" || c === "kannada") return c;
  return "other";
}

function createClient() {
  return window.supabase.createClient(
    window.WC_CONFIG.supabaseUrl,
    window.WC_CONFIG.supabaseAnonKey,
    { realtime: { params: { eventsPerSecond: 2 } } }
  );
}

function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function langChip(lang) {
  if (lang === "english") return "EN";
  if (lang === "kannada") return "KN";
  return "OT";
}

function langFullName(lang) {
  if (lang === "english") return "English";
  if (lang === "kannada") return "Kannada";
  return "Other";
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function upsertMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function absoluteUrl(pathOrUrl) {
  try {
    return new URL(pathOrUrl, location.href).href;
  } catch (_) {
    return pathOrUrl;
  }
}

/**
 * Update share / preview metadata.
 */
function setShareMeta({ title, description, url, image, type }) {
  const pageTitle = title || "Worship Companion";
  const desc =
    description ||
    "Open lyrics, playlists, and worship songs with Worship Companion.";
  const pageUrl = absoluteUrl(url || location.href);
  const imageUrl = absoluteUrl(
    image || window.WC_CONFIG.ogImage || "../og-card.png"
  );

  document.title = pageTitle;
  upsertMeta("name", "description", desc);
  upsertMeta("property", "og:site_name", "Worship Companion");
  upsertMeta("property", "og:type", type || "website");
  upsertMeta("property", "og:title", pageTitle);
  upsertMeta("property", "og:description", desc);
  upsertMeta("property", "og:url", pageUrl);
  upsertMeta("property", "og:image", imageUrl);
  upsertMeta("name", "twitter:card", "summary_large_image");
  upsertMeta("name", "twitter:title", pageTitle);
  upsertMeta("name", "twitter:description", desc);
  upsertMeta("name", "twitter:image", imageUrl);

  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", pageUrl);
}

/**
 * Shows an accessible floating toast notification.
 */
function showToast(message) {
  let toast = document.getElementById("globalToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "globalToast";
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.appendChild(toast);
  }
  toast.innerHTML = `
    <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
    <span>${escapeHtml(message)}</span>
  `;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

/**
 * Renders the top app banner with rich styling.
 */
function renderOpenAppBanner(container) {
  if (!container) return;
  container.innerHTML = `
    <div class="app-launch">
      <div class="app-launch-content">
        <div class="app-launch-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
          </svg>
        </div>
        <p>Open in app for chords, transpose, playlists, and offline lyrics.</p>
      </div>
      <a href="#" class="btn tonal" id="openAppBtn">Open In App</a>
    </div>
  `;
  const btn = document.getElementById("openAppBtn");
  if (btn) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      tryOpenApp({ userInitiated: true });
    });
  }
}

/**
 * Renders store buttons in the bottom download bar.
 */
function storeButtons(container) {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const url = isIOS ? window.WC_CONFIG.appStoreUrl : window.WC_CONFIG.playStoreUrl;
  const label = isIOS ? "Get iOS App" : "Get Android App";
  container.innerHTML = `
    <p>Get Worship Companion for chords, transpose, and offline lyrics.</p>
    <a class="btn" href="${url}" target="_blank" rel="noopener noreferrer">
      <svg viewBox="0 0 24 24" style="width:16px;height:16px;"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"/></svg>
      <span>${label}</span>
    </a>
  `;
}

/**
 * Open the installed app upon explicit user interaction.
 */
function tryOpenApp(options = {}) {
  const { userInitiated = false } = options;
  if (!userInitiated) return;

  try {
    if (sessionStorage.getItem("wc_open_app_attempted") === "1") return;
    sessionStorage.setItem("wc_open_app_attempted", "1");
  } catch (_) {}

  const ua = navigator.userAgent || "";
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const params = new URLSearchParams(location.search);
  const path = location.pathname.toLowerCase();

  let customUrl = "worshipcompanion://lyrics";
  if (path.includes("/playlist")) {
    customUrl =
      "worshipcompanion://playlist?id=" + encodeURIComponent(params.get("id") || "");
  } else {
    const lang = encodeURIComponent((params.get("l") || "english").toLowerCase());
    const id = encodeURIComponent(params.get("id") || "");
    customUrl = "worshipcompanion://lyrics?l=" + lang + "&id=" + id;
  }

  if (isAndroid || isIOS) {
    const started = Date.now();
    location.href = customUrl;
    setTimeout(() => {
      if (document.hidden) return;
      if (Date.now() - started < 2200) {
        try {
          sessionStorage.removeItem("wc_open_app_attempted");
        } catch (_) {}
      }
    }, 1800);
    return;
  }
}

/**
 * Displays an interactive Share QR modal matching the native app dialog.
 */
function openShareQrModal({ title, subtitle, url, caption, detail }) {
  let backdrop = document.getElementById("shareQrBackdrop");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.id = "shareQrBackdrop";
    backdrop.className = "qr-modal-backdrop";
    backdrop.innerHTML = `
      <div class="qr-modal" role="dialog" aria-modal="true" aria-labelledby="qrModalTitle">
        <button class="qr-modal-close" id="qrModalClose" aria-label="Close dialog">
          <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
        <div class="qr-modal-header">
          <h2 class="qr-modal-title" id="qrModalTitle"></h2>
          <p class="qr-modal-subtitle" id="qrModalSubtitle"></p>
        </div>
        <div class="qr-canvas-box" id="qrContainer"></div>
        <div class="qr-caption" id="qrCaption"></div>
        <div class="qr-detail" id="qrDetail"></div>
        <div class="qr-url-pill" id="qrUrlPill"></div>
        <div class="qr-actions">
          <button class="btn" id="qrCopyBtn" type="button">
            <svg viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>
            <span>Copy Link</span>
          </button>
          <button class="btn tonal" id="qrShareBtn" type="button">
            <svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>
            <span>Share</span>
          </button>
        </div>
        <button class="qr-done-btn" id="qrDoneBtn" type="button">Done</button>
      </div>
    `;
    document.body.appendChild(backdrop);

    const close = () => {
      backdrop.classList.remove("open");
      document.removeEventListener("keydown", onKeyDown);
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") close();
    };

    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) close();
    });
    document.getElementById("qrModalClose").addEventListener("click", close);
    document.getElementById("qrDoneBtn").addEventListener("click", close);
    backdrop._close = close;
    backdrop._onKeyDown = onKeyDown;
  }

  document.getElementById("qrModalTitle").textContent = title || "Share QR";
  document.getElementById("qrModalSubtitle").textContent =
    subtitle || "Anyone can scan this code to open immediately";
  document.getElementById("qrCaption").textContent = caption || "";
  
  const detailEl = document.getElementById("qrDetail");
  if (detail) {
    detailEl.textContent = detail;
    detailEl.style.display = "block";
  } else {
    detailEl.textContent = "";
    detailEl.style.display = "none";
  }

  const qrUrlPill = document.getElementById("qrUrlPill");
  qrUrlPill.textContent = url;

  const qrContainer = document.getElementById("qrContainer");
  qrContainer.innerHTML = "";

  if (typeof QRCode !== "undefined") {
    new QRCode(qrContainer, {
      text: url,
      width: 200,
      height: 200,
      colorDark: "#0b3d91",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M,
    });
  } else {
    qrContainer.innerHTML = `<div style="padding: 24px 12px; color: #444; font-size: 0.85rem;">Scan URL below</div>`;
  }

  const copyBtn = document.getElementById("qrCopyBtn");
  copyBtn.onclick = async () => {
    try {
      await navigator.clipboard.writeText(url);
      if (navigator.vibrate) navigator.vibrate(20);
      showToast("Link copied to clipboard");
    } catch (_) {
      showToast("Could not copy link");
    }
  };

  const shareBtn = document.getElementById("qrShareBtn");
  shareBtn.onclick = async () => {
    const shareText = detail ? `${caption}\n${detail}\n${url}` : `${caption}\n${url}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: caption || title,
          text: shareText,
          url: url,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          await navigator.clipboard.writeText(url);
          showToast("Link copied to clipboard");
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        showToast("Link copied to clipboard");
      } catch (_) {
        showToast("Sharing not supported");
      }
    }
  };

  backdrop.classList.add("open");
  document.addEventListener("keydown", backdrop._onKeyDown);
}

function subscribeFiltered(client, channelName, table, filter, onChange) {
  const channel = client
    .channel(channelName)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table, filter },
      onChange
    )
    .subscribe();
  return channel;
}
