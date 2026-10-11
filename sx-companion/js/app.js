/**
 * SXG Companion — Interactive App Logic
 * Powers the Arranger Simulator, FAQ toggles, and live previews.
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initArrangerSimulator();
  initFaqAccordion();
  initAirSyncToggle();
  initBetaSignupModal();
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

/* ── Beta Signup Modal & Secure Supabase Integration ──────────────────── */
function initBetaSignupModal() {
  const backdrop = document.getElementById('alphaModalBackdrop');
  const closeBtn = document.getElementById('closeAlphaModalBtn');
  const formView = document.getElementById('alphaModalFormView');
  const successView = document.getElementById('alphaModalSuccessView');
  const form = document.getElementById('betaSignupForm');
  const errorAlert = document.getElementById('formErrorMessage');
  const submitBtn = document.getElementById('submitBetaBtn');
  const successDoneBtn = document.getElementById('successDoneBtn');
  const successDetail = document.getElementById('successMessageDetail');

  const openButtons = [
    document.getElementById('openAlphaNavBtn'),
    document.getElementById('openAlphaHeroBtn'),
    document.getElementById('openAlphaCtaBtn')
  ].filter(Boolean);

  if (!backdrop || !form) return;

  // Supabase Configuration
  const SUPABASE_URL = 'https://mpindkfkwuioezetrcib.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1waW5ka2Zrd3Vpb2V6ZXRyY2liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3MDEyOTIsImV4cCI6MjEwNjI3NzI5Mn0.JeNZodZQElXArOjHZgDvRSa2AKyK73iISsg62E0i8Yg';

  let supabase = null;
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  // Open Modal
  function openModal() {
    backdrop.removeAttribute('hidden');
    requestAnimationFrame(() => {
      backdrop.classList.add('open');
    });
    document.body.style.overflow = 'hidden';

    // If user already signed up previously on this device, display status
    const savedEmail = localStorage.getItem('sxg_beta_signed_up');
    if (savedEmail) {
      if (successDetail) {
        successDetail.textContent = `You are already registered for early access with ${savedEmail}. We will send your invite as soon as the next testing cohort opens.`;
      }
      formView.style.display = 'none';
      successView.style.display = 'block';
    } else {
      formView.style.display = 'block';
      successView.style.display = 'none';
      errorAlert.style.display = 'none';
    }
  }

  // Close Modal
  function closeModal() {
    backdrop.classList.remove('open');
    setTimeout(() => {
      backdrop.setAttribute('hidden', '');
      document.body.style.overflow = '';
    }, 250);
  }

  openButtons.forEach(btn => btn.addEventListener('click', openModal));
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (successDoneBtn) successDoneBtn.addEventListener('click', closeModal);

  // Close on outside backdrop click
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      closeModal();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.classList.contains('open')) {
      closeModal();
    }
  });

  // Dynamic Platform Switching (iOS Apple ID vs Android Play Email)
  const platformRadios = form.querySelectorAll('input[name="platform"]');
  const appleGroup = document.getElementById('appleEmailGroup');
  const playGroup = document.getElementById('playEmailGroup');

  function updatePlatformFields() {
    const selected = form.querySelector('input[name="platform"]:checked')?.value || 'ios';
    if (appleGroup) {
      appleGroup.style.display = (selected === 'ios' || selected === 'both') ? 'flex' : 'none';
    }
    if (playGroup) {
      playGroup.style.display = (selected === 'android' || selected === 'both') ? 'flex' : 'none';
    }
  }

  platformRadios.forEach(r => r.addEventListener('change', updatePlatformFields));
  updatePlatformFields();

  // Dynamic Keyboard Selection ("Other" requires mandatory text input)
  const keyboardSelect = form.elements['keyboard_model'];
  const otherKeyboardGroup = document.getElementById('otherKeyboardGroup');
  const otherKeyboardInput = document.getElementById('otherKeyboardModel');

  function updateKeyboardFields() {
    const isOther = keyboardSelect?.value === 'other';
    if (otherKeyboardGroup) {
      otherKeyboardGroup.style.display = isOther ? 'flex' : 'none';
    }
    if (otherKeyboardInput) {
      otherKeyboardInput.required = isOther;
      if (!isOther) {
        otherKeyboardInput.value = '';
      }
    }
  }

  if (keyboardSelect) {
    keyboardSelect.addEventListener('change', updateKeyboardFields);
    updateKeyboardFields();
  }

  // Form Submission Handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorAlert.style.display = 'none';
    errorAlert.textContent = '';

    // Bot honeypot verification
    const honeypot = form.elements['b_trap']?.value;
    if (honeypot) {
      // Fake success for automated bot scrapers
      formView.style.display = 'none';
      successView.style.display = 'block';
      return;
    }

    const name = form.elements['name']?.value?.trim() || '';
    const email = form.elements['email']?.value?.trim() || '';
    const platform = form.querySelector('input[name="platform"]:checked')?.value || 'ios';
    const appleEmail = form.elements['apple_email']?.value?.trim() || '';
    const playEmail = form.elements['play_email']?.value?.trim() || '';
    const keyboardModel = form.elements['keyboard_model']?.value || '';
    const notes = form.elements['notes']?.value?.trim() || '';
    const consent = form.elements['consent']?.checked;

    // Validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!name) {
      showError('Please enter your full name.');
      return;
    }
    if (!email || !emailRegex.test(email)) {
      showError('Please enter a valid contact email address.');
      return;
    }
    if (appleEmail && !emailRegex.test(appleEmail)) {
      showError('Please enter a valid Apple ID email address.');
      return;
    }
    if (playEmail && !emailRegex.test(playEmail)) {
      showError('Please enter a valid Google Play email address.');
      return;
    }
    if (!keyboardModel) {
      showError('Please select your Yamaha keyboard model.');
      return;
    }

    // Mandatory specification if "Other" is chosen
    let finalKeyboardModel = keyboardModel;
    if (keyboardModel === 'other') {
      const customModel = otherKeyboardInput?.value?.trim() || '';
      if (!customModel) {
        showError('Please type and specify your keyboard brand and model.');
        otherKeyboardInput?.focus();
        return;
      }
      finalKeyboardModel = `Other: ${customModel}`;
    }

    if (!consent) {
      showError('Please agree to receive testing invites to continue.');
      return;
    }

    // Prepare Payload
    const payload = {
      name: name,
      email: email.toLowerCase(),
      platform: platform,
      apple_email: (platform === 'ios' || platform === 'both') ? (appleEmail || email).toLowerCase() : null,
      play_email: (platform === 'android' || platform === 'both') ? (playEmail || email).toLowerCase() : null,
      keyboard_model: finalKeyboardModel.substring(0, 100),
      notes: notes || null,
      consent: true,
      status: 'pending'
    };

    // UI Loading state
    setLoading(true);

    try {
      if (!supabase) {
        throw new Error('Database connection is initializing. If this persists, please contact reynold29clare@gmail.com.');
      }

      // Safe INSERT to Supabase (Row Level Security enforces public INSERT only, no public SELECT)
      const { data, error } = await supabase
        .from('beta_signups')
        .insert([payload]);

      if (error) {
        // Unique key constraint violation: email already registered
        if (error.code === '23505' || (error.message && error.message.includes('unique'))) {
          localStorage.setItem('sxg_beta_signed_up', email);
          if (successDetail) {
            successDetail.textContent = `You're already registered for early access with ${email}! We have your request saved and will dispatch your invite soon.`;
          }
          formView.style.display = 'none';
          successView.style.display = 'block';
          return;
        }

        throw error;
      }

      // Success
      localStorage.setItem('sxg_beta_signed_up', email);
      if (successDetail) {
        const platformLabel = platform === 'both' ? 'iOS (TestFlight) & Android (Google Play)' : (platform === 'ios' ? 'iOS (TestFlight)' : 'Android (Google Play)');
        successDetail.textContent = `Thank you, ${name}! Your early access invitation for ${platformLabel} will be sent to ${email} as soon as the next testing cohort opens.`;
      }
      formView.style.display = 'none';
      successView.style.display = 'block';
    } catch (err) {
      showError(err.message || 'An unexpected error occurred while saving your request. Please try again.');
    } finally {
      setLoading(false);
    }
  });

  function showError(msg) {
    if (errorAlert) {
      errorAlert.textContent = msg;
      errorAlert.style.display = 'block';
      errorAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function setLoading(loading) {
    if (!submitBtn) return;
    submitBtn.disabled = loading;
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.btn-spinner');
    if (loading) {
      if (btnText) btnText.textContent = 'Submitting safely...';
      if (spinner) spinner.style.display = 'inline-block';
    } else {
      if (btnText) btnText.textContent = 'Submit Request →';
      if (spinner) spinner.style.display = 'none';
    }
  }
}
