/**
 * SXG Companion — Interactive App Logic
 * Powers the Arranger Simulator, FAQ toggles, and live previews.
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initArrangerSimulator();
  initFaqAccordion();
  initAirSyncToggle();
});

/* ── Mobile Menu Toggle ────────────────────────────────────────────────── */
function initMobileMenu() {
  const toggle = document.querySelector('.mobile-toggle');
  const menu = document.querySelector('.nav-menu');

  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    menu.classList.toggle('open');
    const isOpen = menu.classList.contains('open');
    toggle.setAttribute('aria-expanded', isOpen);
  });

  // Close menu when clicking outside or clicking any link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ── Interactive Arranger Simulator ────────────────────────────────────── */
function initArrangerSimulator() {
  const sectionButtons = document.querySelectorAll('[data-section]');
  const lcdSection = document.getElementById('lcdSection');
  const lcdChord = document.getElementById('lcdChord');
  const lcdTempo = document.getElementById('lcdTempo');
  const tapTempoBtn = document.getElementById('tapTempoBtn');

  if (!lcdSection) return;

  const chordsBySection = {
    'intro': ['C', 'Dm7', 'G7', 'C'],
    'main-a': ['C', 'G/B', 'Am7', 'Fadd9'],
    'main-b': ['Am7', 'F', 'C', 'G'],
    'main-c': ['Fmaj7', 'G/F', 'Em7', 'Am7'],
    'main-d': ['Bb', 'F/A', 'Gm7', 'C7'],
    'break': ['G7sus4', 'G7', '—', '—'],
    'ending': ['Dm7', 'G7', 'Cmaj9', 'Fin.']
  };

  let currentSection = 'main-a';
  let chordIndex = 0;
  let chordTimer = null;

  function setSection(sectionKey, displayName) {
    currentSection = sectionKey;
    lcdSection.textContent = displayName;

    sectionButtons.forEach(btn => {
      if (btn.dataset.section === sectionKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Reset chord cycle for this section
    chordIndex = 0;
    updateChordDisplay();
  }

  function updateChordDisplay() {
    const list = chordsBySection[currentSection] || ['C', 'F', 'G'];
    lcdChord.textContent = list[chordIndex % list.length];
    chordIndex++;
  }

  // Auto-cycle simulated chords every 3 seconds to emulate a live band
  function startChordCycling() {
    if (chordTimer) clearInterval(chordTimer);
    chordTimer = setInterval(() => {
      updateChordDisplay();
    }, 2800);
  }

  sectionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const sectionKey = btn.dataset.section;
      const label = btn.dataset.label || btn.textContent.trim();
      setSection(sectionKey, label);
    });
  });

  startChordCycling();

  // Tap Tempo Logic
  let tapTimes = [];
  if (tapTempoBtn && lcdTempo) {
    tapTempoBtn.addEventListener('click', () => {
      const now = performance.now();
      tapTimes.push(now);

      // Keep only last 4 taps within 2.5 seconds
      if (tapTimes.length > 1) {
        const lastInterval = tapTimes[tapTimes.length - 1] - tapTimes[tapTimes.length - 2];
        if (lastInterval > 2500) {
          tapTimes = [now];
        }
      }

      if (tapTimes.length > 4) tapTimes.shift();

      if (tapTimes.length >= 2) {
        const intervals = [];
        for (let i = 1; i < tapTimes.length; i++) {
          intervals.push(tapTimes[i] - tapTimes[i - 1]);
        }
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const bpm = Math.round(60000 / avgInterval);
        const clampedBpm = Math.max(40, Math.min(260, bpm));
        lcdTempo.textContent = clampedBpm;
      }

      tapTempoBtn.classList.add('active');
      setTimeout(() => tapTempoBtn.classList.remove('active'), 120);
    });
  }
}

/* ── FAQ Accordion ─────────────────────────────────────────────────────── */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all other open items
      faqItems.forEach(other => {
        if (other !== item) other.classList.remove('open');
      });

      item.classList.toggle('open', !isOpen);
    });
  });
}

/* ── Air Sync Interactive Role Demo ────────────────────────────────────── */
function initAirSyncToggle() {
  const hostBtn = document.getElementById('roleHostBtn');
  const clientBtn = document.getElementById('roleClientBtn');
  const roleDisplay = document.getElementById('roleDisplay');

  if (!hostBtn || !clientBtn || !roleDisplay) return;

  hostBtn.addEventListener('click', () => {
    hostBtn.classList.add('active');
    clientBtn.classList.remove('active');
    roleDisplay.innerHTML = `
      <div class="node-main">
        <div class="node-icon">📱</div>
        <div>
          <div class="node-title">Host Device (Phone)</div>
          <div class="node-subtitle">Connected to PSR-SX via USB cable &bull; Hotspot broadcast active</div>
        </div>
      </div>
      <span class="node-badge host">Foreground Service Active</span>
    `;
  });

  clientBtn.addEventListener('click', () => {
    clientBtn.classList.add('active');
    hostBtn.classList.remove('active');
    roleDisplay.innerHTML = `
      <div class="node-main">
        <div class="node-icon">📋</div>
        <div>
          <div class="node-title">Remote Controller (iPad / Tablet)</div>
          <div class="node-subtitle">Connected to Host's Hotspot &bull; Paired via 4-digit PIN</div>
        </div>
      </div>
      <span class="node-badge client">Wireless Control Active</span>
    `;
  });
}
