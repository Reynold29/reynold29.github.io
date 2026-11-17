// CSI Hymns Book — small progressive enhancements. Every page works without this file.
(function () {
  "use strict";

  const SCROLL_BORDER_OFFSET = 8;

  function initNav() {
    const nav = document.querySelector(".site-nav");
    const toggle = document.querySelector(".nav-toggle");
    const links = document.getElementById("nav-links");
    if (!nav) return;

    const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > SCROLL_BORDER_OFFSET);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (!toggle || !links) return;

    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      links.classList.toggle("is-open", open);
    };

    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    links.addEventListener("click", (e) => {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && links.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  // Hero hymn page: switch the stanza between English and Kannada.
  function initLanguageToggle() {
    const group = document.querySelector("[data-lang-toggle]");
    if (!group) return;
    const buttons = group.querySelectorAll("button[data-show]");
    const stanzas = document.querySelectorAll("[data-stanza]");

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.show;
        buttons.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        stanzas.forEach((s) => { s.hidden = s.dataset.stanza !== target; });
      });
    });
  }

  function initGallery() {
    const track = document.querySelector("[data-gallery]");
    const prev = document.querySelector("[data-gallery-prev]");
    const next = document.querySelector("[data-gallery-next]");
    if (!track || !prev || !next) return;

    const step = () => {
      const item = track.querySelector("li");
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return item ? (item.getBoundingClientRect().width + gap) * 2 : track.clientWidth * 0.8;
    };

    const update = () => {
      const max = track.scrollWidth - track.clientWidth - 2;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max;
    };

    prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
    next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  // Support form posts to FormSubmit, which redirects back with ?sent=1.
  function initSupportNotice() {
    const notice = document.getElementById("support-sent");
    if (!notice) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("sent") !== "1") return;
    notice.hidden = false;
    // Drop the flag so a refresh doesn't show the message again.
    const url = new URL(window.location.href);
    url.searchParams.delete("sent");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  }

  // Launch video: play muted while on screen, but only on larger screens where the
  // visitor hasn't asked for reduced motion or data saving. Otherwise it waits for a tap.
  const AUTOPLAY_MIN_WIDTH = "(min-width: 900px)";

  function initLaunchVideo() {
    const video = document.querySelector("[data-launch-video]");
    if (!video || !("IntersectionObserver" in window)) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = Boolean(navigator.connection && navigator.connection.saveData);
    const wideScreen = window.matchMedia(AUTOPLAY_MIN_WIDTH).matches;
    if (reducedMotion || saveData || !wideScreen) return;

    let userPaused = false;
    let autoPausing = false;
    video.addEventListener("pause", () => {
      if (autoPausing) { autoPausing = false; return; }
      userPaused = true;
    });
    video.addEventListener("play", () => { userPaused = false; });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !userPaused) {
          video.play().catch(() => { /* Autoplay blocked: the poster and controls stay available. */ });
        } else if (!entry.isIntersecting && !video.paused) {
          autoPausing = true;
          video.pause();
        }
      });
    }, { threshold: 0.4 });
    observer.observe(video);
  }

  initNav();
  initLanguageToggle();
  initLaunchVideo();
  initGallery();
  initSupportNotice();
})();
