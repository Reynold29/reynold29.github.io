const getFormatter = () => (typeof window !== 'undefined' && window.FreeShowFormatter) || {};
const getSampleSongs = () => (typeof window !== 'undefined' && (window.SAMPLE_SONGS || (typeof window.getSampleSongs === 'function' ? window.getSampleSongs() : {}))) || {};

// Configuration Defaults
const DEFAULT_SUPABASE_URL = 'https://vvecgfmnbhlfbtsemlnt.supabase.co/functions/v1/csi-hymns-presenter-api';
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2ZWNnZm1uYmhsZmJ0c2VtbG50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2Njk1NTksImV4cCI6MjA3MDI0NTU1OX0.5OZKfvef8z-5zQ3KRbKwl0hBOT5FqDSIUW1SS7qYO0o';
const MAX_SETLIST_SIZE = 5;

class FreeShowApp {
  constructor() {
    const savedUrl = localStorage.getItem('csi_freeshow_api_url');
    if (!savedUrl || savedUrl.includes('/functions/v1/lyrics')) {
      this.apiUrl = DEFAULT_SUPABASE_URL;
      localStorage.setItem('csi_freeshow_api_url', DEFAULT_SUPABASE_URL);
    } else {
      this.apiUrl = savedUrl;
    }
    this.apiKey = localStorage.getItem('csi_freeshow_api_key') || DEFAULT_ANON_KEY;

    // Single Generator State
    this.category = 'keerthane'; // 'keerthane' | 'hymn' | 'mt'
    this.number = 214;
    this.languageMode = 'kannada'; // 'kannada' | 'english' | 'bilingual'
    this.currentSong = null;
    this.currentSlides = [];
    this.activeSlideIdx = 0;

    // Bulk Setlist State (Max 5)
    this.setlist = this.loadSetlist();

    // DOM Elements
    this.cacheDom();
    this.bindEvents();

    // Initial Load
    this.updateCategoryLimits();
    this.updateSetlistUi();
    this.loadCurrentSong();
  }

  cacheDom() {
    // Nav Pills
    this.navPills = document.querySelectorAll('.nav-pill-btn');
    this.tabPanes = document.querySelectorAll('.tab-pane');

    // Section 1: Single Generator
    this.catRadios = document.querySelectorAll('input[name="songCategory"]');
    this.catLabels = document.querySelectorAll('.category-radio-label');
    this.numberInput = document.getElementById('songNumberInput');
    this.btnStepDown = document.getElementById('btnStepDown');
    this.btnStepUp = document.getElementById('btnStepUp');
    this.quickChips = document.querySelectorAll('.quick-chip');
    this.langChips = document.querySelectorAll('.lang-chip-btn');
    this.btnDownloadSingleShow = document.getElementById('btnDownloadSingleShow');
    this.btnAddToSetlistSingle = document.getElementById('btnAddToSetlistSingle');

    // Slide Preview
    this.slideBadge = document.getElementById('slideBadge');
    this.slideCounter = document.getElementById('slideCounter');
    this.slideLyricsText = document.getElementById('slideLyricsText');
    this.slideSongInfo = document.getElementById('slideSongInfo');
    this.btnPrevSlide = document.getElementById('btnPrevSlide');
    this.btnNextSlide = document.getElementById('btnNextSlide');
    this.deckThumbs = document.getElementById('deckThumbs');

    // Section 2: Setlist
    this.setlistCounterBadge = document.getElementById('setlistCounterBadge');
    this.setlistNavBadge = document.getElementById('setlistNavBadge');
    this.setlistMeterFill = document.getElementById('setlistMeterFill');
    this.setlistItemsStack = document.getElementById('setlistItemsStack');
    this.setlistAddBar = document.getElementById('setlistAddBar');
    this.setlistCatSelect = document.getElementById('setlistCatSelect');
    this.setlistNumInput = document.getElementById('setlistNumInput');
    this.setlistLangSelect = document.getElementById('setlistLangSelect');
    this.btnSetlistAdd = document.getElementById('btnSetlistAdd');
    this.btnDownloadZip = document.getElementById('btnDownloadZip');
    this.btnDownloadSeparate = document.getElementById('btnDownloadSeparate');
    this.btnClearSetlist = document.getElementById('btnClearSetlist');

    // Section 3: Paste Studio
    this.pasteTitleInput = document.getElementById('pasteTitleInput');
    this.pasteCatSelect = document.getElementById('pasteCatSelect');
    this.pasteTextarea = document.getElementById('pasteTextarea');
    this.btnLoadPasteSample = document.getElementById('btnLoadPasteSample');
    this.btnConvertPasteShow = document.getElementById('btnConvertPasteShow');

    // Settings Modal
    this.btnOpenSettings = document.getElementById('btnOpenSettings');
    this.settingsModal = document.getElementById('settingsModal');
    this.btnCloseSettings = document.getElementById('btnCloseSettings');
    this.apiEndpointInput = document.getElementById('apiEndpointInput');
    this.apiKeyInput = document.getElementById('apiKeyInput');
    this.btnSaveSettings = document.getElementById('btnSaveSettings');
    this.btnPingApi = document.getElementById('btnPingApi');
    this.pingStatusText = document.getElementById('pingStatusText');

    // Toast Container
    this.toastContainer = document.getElementById('toastContainer');
  }

  bindEvents() {
    // Navigation Tabs
    this.navPills.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        this.switchTab(targetTab);
      });
    });

    // Category Selector
    this.catRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.category = e.target.value;
        this.catLabels.forEach(l => l.classList.remove('checked'));
        e.target.closest('.category-radio-label').classList.add('checked');
        this.updateCategoryLimits();
        this.loadCurrentSong();
      });
    });

    // Number Stepper
    this.btnStepDown.addEventListener('click', () => {
      this.stepNumber(-1);
    });
    this.btnStepUp.addEventListener('click', () => {
      this.stepNumber(1);
    });
    this.numberInput.addEventListener('change', () => {
      const val = parseInt(this.numberInput.value, 10);
      if (!isNaN(val) && val > 0) {
        this.number = val;
        this.loadCurrentSong();
      }
    });

    // Quick Chips
    this.quickChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const cat = chip.getAttribute('data-cat');
        const num = parseInt(chip.getAttribute('data-num'), 10);
        if (cat) {
          this.category = cat;
          this.catRadios.forEach(r => {
            r.checked = (r.value === cat);
            r.closest('.category-radio-label').classList.toggle('checked', r.value === cat);
          });
        }
        this.number = num;
        this.numberInput.value = num;
        this.loadCurrentSong();
      });
    });

    // Language Chips
    this.langChips.forEach(btn => {
      btn.addEventListener('click', () => {
        this.langChips.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.languageMode = btn.getAttribute('data-lang');
        this.rebuildSlides();
      });
    });

    // Slide Deck Carousel
    this.btnPrevSlide.addEventListener('click', () => this.navigateSlide(-1));
    this.btnNextSlide.addEventListener('click', () => this.navigateSlide(1));

    // Single Generator Actions
    this.btnDownloadSingleShow.addEventListener('click', () => this.downloadSingleShow());
    this.btnAddToSetlistSingle.addEventListener('click', () => this.addCurrentToSetlist());

    // Setlist Actions
    this.btnSetlistAdd.addEventListener('click', () => this.handleSetlistAdd());
    this.btnDownloadZip.addEventListener('click', () => this.downloadSetlistZip());
    this.btnDownloadSeparate.addEventListener('click', () => this.downloadSetlistSeparate());
    this.btnClearSetlist.addEventListener('click', () => this.clearSetlist());

    // Paste Studio
    this.pasteTextarea.addEventListener('input', () => this.updatePasteLivePreview());
    this.pasteCatSelect.addEventListener('change', () => this.updatePasteLivePreview());
    this.btnLoadPasteSample.addEventListener('click', () => {
      this.loadPasteSample();
      this.updatePasteLivePreview();
    });
    this.btnConvertPasteShow.addEventListener('click', () => this.convertPasteToShow());

    // Settings
    this.btnOpenSettings.addEventListener('click', () => this.openSettings());
    this.btnCloseSettings.addEventListener('click', () => this.closeSettings());
    this.settingsModal.addEventListener('click', (e) => {
      if (e.target === this.settingsModal) this.closeSettings();
    });
    this.btnSaveSettings.addEventListener('click', () => this.saveSettings());
    this.btnPingApi.addEventListener('click', () => this.pingApi());
  }

  switchTab(tabId) {
    this.navPills.forEach(b => b.classList.toggle('active', b.getAttribute('data-tab') === tabId));
    this.tabPanes.forEach(pane => pane.classList.toggle('active', pane.id === tabId));
    const promo = document.getElementById('bottomPromoStrip');
    if (promo) promo.style.display = (tabId === 'tabApp') ? 'none' : 'flex';
  }

  updateCategoryLimits() {
    let max = 234;
    if (this.category === 'hymn') max = 368;
    if (this.category === 'mt') max = 410;
    this.numberInput.setAttribute('max', max);
    if (this.number > max) {
      this.number = 1;
      this.numberInput.value = 1;
    }
  }

  stepNumber(delta) {
    let max = 234;
    if (this.category === 'hymn') max = 368;
    if (this.category === 'mt') max = 410;

    let next = this.number + delta;
    if (next < 1) next = 1;
    if (next > max) next = max;
    this.number = next;
    this.numberInput.value = next;
    this.loadCurrentSong();
  }

  async fetchSong(category, number) {
    // 1. Try Live Supabase Edge Function
    try {
      const url = `${this.apiUrl}?type=${category}&number=${number}`;
      const headers = { 'Accept': 'application/json' };
      if (this.apiKey) {
        headers['apikey'] = this.apiKey;
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data && (data.lyrics || data.kannadaLyrics)) {
          return data;
        }
      }
    } catch (err) {
      console.warn('Live API request failed, falling back to local vault samples:', err);
    }

    // 2. Fallback to authentic pre-loaded samples
    const sampleKey = `${category}_${number}`;
    if (getSampleSongs()[sampleKey]) {
      return getSampleSongs()[sampleKey];
    }

    // Fallback stub if neither live nor exact sample (English only for errors/status)
    const fallbackNotice = `Song #${number} (${category}) is not loaded. If this is a live hymnal lookup, verify the Supabase Edge Function deployment in Settings.`;
    return {
      number,
      title: `${category.toUpperCase()} #${number}`,
      lyrics: `1. ${fallbackNotice}`,
      kannadaLyrics: `1. ${fallbackNotice}`
    };
  }

  async loadCurrentSong() {
    this.slideLyricsText.textContent = 'Loading lyrics from vault...';
    try {
      const song = await this.fetchSong(this.category, this.number);
      this.currentSong = song;
      this.rebuildSlides();
    } catch (err) {
      this.slideLyricsText.textContent = `Unable to load song #${this.number}: ${err.message}`;
    }
  }

  rebuildSlides() {
    if (!this.currentSong) return;

    this.currentSlides = getFormatter().parseSlides({
      number: this.number,
      title: this.currentSong.title || '',
      category: this.category,
      kannadaLyrics: this.currentSong.kannadaLyrics || '',
      englishLyrics: this.currentSong.lyrics || '',
      mode: this.languageMode
    });

    this.activeSlideIdx = 0;
    this.renderCurrentSlide();
    this.renderThumbnails();
  }

  renderCurrentSlide() {
    if (!this.currentSlides || this.currentSlides.length === 0) {
      this.slideBadge.textContent = 'Empty';
      this.slideCounter.textContent = '0 / 0';
      this.slideLyricsText.textContent = 'No lyrics found for this song';
      return;
    }

    const slide = this.currentSlides[this.activeSlideIdx];
    this.slideBadge.textContent = slide.group;
    this.slideBadge.classList.toggle('chorus', slide.group.toLowerCase().startsWith('chorus'));
    this.slideCounter.textContent = `${this.activeSlideIdx + 1} / ${this.currentSlides.length}`;
    this.slideLyricsText.textContent = slide.content;

    const prefix = this.category === 'keerthane' ? 'Keerthane' : this.category === 'mt' ? 'M.T.' : 'Hymn';
    this.slideSongInfo.textContent = `${prefix} #${this.number} • ${this.currentSong?.title || ''}`;

    this.btnPrevSlide.disabled = (this.activeSlideIdx === 0);
    this.btnNextSlide.disabled = (this.activeSlideIdx === this.currentSlides.length - 1);
  }

  renderThumbnails() {
    this.deckThumbs.innerHTML = '';
    this.currentSlides.forEach((slide, idx) => {
      const btn = document.createElement('button');
      btn.className = `thumb-card spring-tactile ${idx === this.activeSlideIdx ? 'active' : ''}`;
      btn.textContent = slide.group;
      btn.addEventListener('click', () => {
        this.activeSlideIdx = idx;
        this.renderCurrentSlide();
        this.renderThumbnails();
      });
      this.deckThumbs.appendChild(btn);
    });
  }

  navigateSlide(delta) {
    const next = this.activeSlideIdx + delta;
    if (next >= 0 && next < this.currentSlides.length) {
      this.activeSlideIdx = next;
      this.renderCurrentSlide();
      this.renderThumbnails();
    }
  }

  downloadSingleShow() {
    if (!this.currentSong || this.currentSlides.length === 0) {
      this.showToast('Please select a valid song first', true);
      return;
    }

    const showJson = getFormatter().formatFreeShowJson({
      number: this.number,
      title: this.currentSong.title || '',
      category: this.category,
      slides: this.currentSlides
    });

    const prefix = this.category === 'keerthane' ? 'Keerthane' : this.category === 'mt' ? 'MT_Hymn' : 'Hymn';
    const filename = `${prefix}_${this.number}_${(this.currentSong.title || 'Lyrics').replace(/[^a-zA-Z0-9]/g, '_')}.show`;

    this.triggerDownload(filename, showJson, 'application/json');
    this.showToast(`Downloaded ${filename}`);
  }

  copySingleQuickLyrics() {
    if (!this.currentSong || this.currentSlides.length === 0) {
      this.showToast('No lyrics to copy', true);
      return;
    }

    const ql = getFormatter().formatQuickLyricsText({
      number: this.number,
      title: this.currentSong.title || '',
      category: this.category,
      slides: this.currentSlides
    });

    navigator.clipboard.writeText(ql).then(() => {
      this.showToast('Copied Quick Lyrics to clipboard');
    }).catch(() => {
      this.showToast('Failed to copy to clipboard', true);
    });
  }

  addCurrentToSetlist() {
    if (!this.currentSong || this.currentSlides.length === 0) return;

    this.addItemToSetlist({
      category: this.category,
      number: this.number,
      title: this.currentSong.title || '',
      language: this.languageMode,
      slides: this.currentSlides,
      kannadaLyrics: this.currentSong.kannadaLyrics,
      lyrics: this.currentSong.lyrics
    });
  }

  /* ==========================================================================
     Bulk Sunday Service Setlist Management (Strict Max 5)
     ========================================================================== */

  loadSetlist() {
    try {
      const saved = localStorage.getItem('csi_freeshow_setlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  saveSetlist() {
    localStorage.setItem('csi_freeshow_setlist', JSON.stringify(this.setlist));
    this.updateSetlistUi();
  }

  async handleSetlistAdd() {
    const cat = this.setlistCatSelect.value;
    const num = parseInt(this.setlistNumInput.value, 10);
    const lang = this.setlistLangSelect.value;

    if (isNaN(num) || num < 1) {
      this.showToast('Please enter a valid song number', true);
      return;
    }

    this.btnSetlistAdd.disabled = true;
    this.btnSetlistAdd.textContent = 'Adding...';

    try {
      const song = await this.fetchSong(cat, num);
      const slides = getFormatter().parseSlides({
        number: num,
        title: song.title || '',
        category: cat,
        kannadaLyrics: song.kannadaLyrics || '',
        englishLyrics: song.lyrics || '',
        mode: lang
      });

      this.addItemToSetlist({
        category: cat,
        number: num,
        title: song.title || '',
        language: lang,
        slides: slides,
        kannadaLyrics: song.kannadaLyrics,
        lyrics: song.lyrics
      });
    } catch (err) {
      this.showToast(`Error adding song: ${err.message}`, true);
    } finally {
      this.btnSetlistAdd.disabled = false;
      this.btnSetlistAdd.textContent = 'Add to Setlist (+)';
    }
  }

  addItemToSetlist(item) {
    // Enforce Strict 5-Song Limit
    if (this.setlist.length >= MAX_SETLIST_SIZE) {
      const heroCard = document.querySelector('.setlist-hero-card');
      if (heroCard) {
        heroCard.classList.remove('animate-shake');
        void heroCard.offsetWidth; // retrigger
        heroCard.classList.add('animate-shake');
      }
      this.showToast('Setlist cap reached: Maximum 5 songs allowed per service pack', true);
      return;
    }

    // Check duplicate
    const exists = this.setlist.some(s => s.category === item.category && s.number === item.number);
    if (exists) {
      this.showToast(`Song #${item.number} is already in the setlist!`, true);
      return;
    }

    this.setlist.push({
      id: `song_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ...item
    });

    this.saveSetlist();
    this.showToast(`Added ${item.category.toUpperCase()} #${item.number} to Sunday setlist`);
  }

  removeFromSetlist(index) {
    this.setlist.splice(index, 1);
    this.saveSetlist();
    this.showToast('Removed song from setlist');
  }

  clearSetlist() {
    if (this.setlist.length === 0) return;
    this.setlist = [];
    this.saveSetlist();
    this.showToast('Cleared setlist');
  }

  updateSetlistUi() {
    const count = this.setlist.length;
    const isMaxed = count >= MAX_SETLIST_SIZE;

    // Badges & Meter
    this.setlistCounterBadge.textContent = `${count} / ${MAX_SETLIST_SIZE} songs`;
    this.setlistCounterBadge.classList.toggle('maxed', isMaxed);
    this.setlistNavBadge.textContent = `${count} / ${MAX_SETLIST_SIZE}`;

    const percent = (count / MAX_SETLIST_SIZE) * 100;
    this.setlistMeterFill.style.width = `${percent}%`;
    this.setlistMeterFill.classList.toggle('maxed', isMaxed);

    // Disable add button when maxed
    if (isMaxed) {
      this.btnSetlistAdd.disabled = true;
      this.btnSetlistAdd.textContent = 'Setlist Full (Max 5)';
      this.btnAddToSetlistSingle.disabled = true;
      this.btnAddToSetlistSingle.textContent = 'Setlist Full (5/5)';
    } else {
      this.btnSetlistAdd.disabled = false;
      this.btnSetlistAdd.textContent = 'Add to Setlist (+)';
      this.btnAddToSetlistSingle.disabled = false;
      this.btnAddToSetlistSingle.textContent = 'Add to Sunday Setlist (+)';
    }

    this.btnDownloadZip.disabled = (count === 0);
    this.btnDownloadSeparate.disabled = (count === 0);
    this.btnClearSetlist.disabled = (count === 0);

    // Render list
    if (count === 0) {
      this.setlistItemsStack.innerHTML = `
        <div class="empty-setlist-state animate-pop">
          <h4>Your Sunday setlist is currently empty</h4>
          <p>Add up to 5 hymns, keerthanes, or Mangalore tunes above to bundle your church service slides.</p>
        </div>
      `;
      return;
    }

    this.setlistItemsStack.innerHTML = '';
    this.setlist.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'setlist-item-card animate-pop';

      const catLabel = item.category === 'keerthane' ? 'Keerthane' : item.category === 'mt' ? 'M.T. Hymn' : 'CSI Hymn';

      card.innerHTML = `
        <div class="setlist-item-left">
          <div class="setlist-order-num">${index + 1}</div>
          <div class="setlist-item-info">
            <h4>${catLabel} #${item.number} — ${item.title || 'Untitled'}</h4>
            <p>
              <span>🌐 Mode: ${item.language.toUpperCase()}</span>
              <span>•</span>
              <span>📽️ ${item.slides?.length || 0} Slides</span>
            </p>
          </div>
        </div>
        <div class="setlist-item-actions">
          <button class="icon-btn-danger spring-tactile" title="Remove song" data-idx="${index}">✕</button>
        </div>
      `;

      card.querySelector('.icon-btn-danger').addEventListener('click', () => {
        this.removeFromSetlist(index);
      });

      this.setlistItemsStack.appendChild(card);
    });
  }

  async downloadSetlistZip() {
    if (this.setlist.length === 0) return;
    if (typeof JSZip === 'undefined') {
      this.showToast('JSZip library loading, please wait...', true);
      return;
    }

    this.btnDownloadZip.disabled = true;
    this.btnDownloadZip.textContent = 'Packaging Zip...';

    try {
      const zip = new JSZip();
      const folder = zip.folder('Sunday-Service-FreeShow');

      this.setlist.forEach((item, idx) => {
        const showJson = getFormatter().formatFreeShowJson({
          number: item.number,
          title: item.title,
          category: item.category,
          slides: item.slides
        });

        const prefix = item.category === 'keerthane' ? 'Keerthane' : item.category === 'mt' ? 'MT' : 'Hymn';
        const cleanTitle = (item.title || 'Lyrics').replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `0${idx + 1}_${prefix}_${item.number}_${cleanTitle}.show`;

        folder.file(filename, showJson);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const now = new Date().toISOString().split('T')[0];
      const zipName = `CSI-Sunday-Service-${now}.zip`;

      this.triggerDownload(zipName, blob, 'application/zip');
      this.showToast(`Downloaded Service Pack (${this.setlist.length} songs)`);
    } catch (err) {
      this.showToast(`Failed to generate zip: ${err.message}`, true);
    } finally {
      this.btnDownloadZip.disabled = false;
      this.btnDownloadZip.textContent = '📦 Download Service Pack (.zip)';
    }
  }

  downloadSetlistSeparate() {
    if (this.setlist.length === 0) return;

    this.setlist.forEach((item, idx) => {
      setTimeout(() => {
        const showJson = getFormatter().formatFreeShowJson({
          number: item.number,
          title: item.title,
          category: item.category,
          slides: item.slides
        });

        const prefix = item.category === 'keerthane' ? 'Keerthane' : item.category === 'mt' ? 'MT' : 'Hymn';
        const filename = `${prefix}_${item.number}_${(item.title || 'Lyrics').replace(/[^a-zA-Z0-9]/g, '_')}.show`;
        this.triggerDownload(filename, showJson, 'application/json');
      }, idx * 250);
    });

    this.showToast(`Downloading all ${this.setlist.length} .show files...`);
  }

  /* ==========================================================================
     Section 3: Paste Studio
     ========================================================================== */

  updatePasteLivePreview() {
    const raw = this.pasteTextarea.value.trim();
    const lyricsEl = document.getElementById('pasteLyricsText');
    const badgeEl = document.getElementById('pasteSlideBadge');
    const counterEl = document.getElementById('pasteSlideCounter');
    if (!lyricsEl) return;

    if (!raw) {
      lyricsEl.textContent = 'Paste lyrics on the left or click "Load Sample" to preview slides here.';
      if (badgeEl) {
        badgeEl.textContent = 'Verse 1';
        badgeEl.classList.remove('chorus');
      }
      if (counterEl) counterEl.textContent = '1 / 1';
      return;
    }

    const title = this.pasteTitleInput.value.trim() || 'Custom Presentation';
    const category = this.pasteCatSelect.value;
    const slides = getFormatter().parseSlides({
      number: 1,
      title: title,
      category: category,
      kannadaLyrics: raw,
      englishLyrics: '',
      mode: 'kannada'
    });

    if (slides && slides.length > 0) {
      lyricsEl.textContent = slides[0].content;
      if (badgeEl) {
        badgeEl.textContent = slides[0].group;
        badgeEl.classList.toggle('chorus', slides[0].group.toLowerCase().startsWith('chorus'));
      }
      if (counterEl) counterEl.textContent = '1 / ' + slides.length;
    }
  }

  loadPasteSample() {
    this.pasteTitleInput.value = 'Mahimeyu Ninage Prabhuvē';
    this.pasteCatSelect.value = 'keerthane';
    this.pasteTextarea.value = `ಮಹಿಮೆಯು ನಿನಗೆ ಪ್ರಭುವೇ
ಸ್ತುತಿಯು ನಿನಗೆ ಕರ್ತನೇ

1. ಪರಿಶುದ್ಧಾತ್ಮ ದೇವಾ
ನಮ್ಮ ಮಧ್ಯದಲ್ಲಿ ಇಳಿದು ಬಾ
ಪಾವನ ಪ್ರೇಮದಿಂದ
ನಮ್ಮ ಹೃದಯ ತುಂಬಿಸು

2. ನಿನ್ನಯ ಕೃಪೆಯು ಸಾಕು
ನಿತ್ಯವೂ ನಮ್ಮನ್ನು ಕಾಯು
ಸದಾ ನಿನ್ನ ನಾಮವ
ಸ್ತೋತ್ರ ಮಾಡುತ್ತೇವೆ`;
    this.showToast('Loaded sample Keerthane lyrics');
  }

  convertPasteToShow() {
    const raw = this.pasteTextarea.value.trim();
    if (!raw) {
      this.showToast('Please paste lyrics first', true);
      return;
    }

    const title = this.pasteTitleInput.value.trim() || 'Custom Presentation';
    const category = this.pasteCatSelect.value;

    const slides = getFormatter().parseSlides({
      number: 1,
      title: title,
      category: category,
      kannadaLyrics: raw,
      englishLyrics: '',
      mode: 'kannada'
    });

    const showJson = getFormatter().formatFreeShowJson({
      number: 1,
      title: title,
      category: category,
      slides: slides
    });

    const filename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.show`;
    this.triggerDownload(filename, showJson, 'application/json');
    this.showToast(`Converted & downloaded ${filename} (${slides.length} slides)`);
  }

  copyPasteQuickLyrics() {
    const raw = this.pasteTextarea.value.trim();
    if (!raw) {
      this.showToast('Please paste lyrics first', true);
      return;
    }

    const title = this.pasteTitleInput.value.trim() || 'Custom Presentation';
    const category = this.pasteCatSelect.value;

    const slides = getFormatter().parseSlides({
      number: 1,
      title: title,
      category: category,
      kannadaLyrics: raw,
      englishLyrics: '',
      mode: 'kannada'
    });

    const ql = getFormatter().formatQuickLyricsText({
      number: 1,
      title: title,
      category: category,
      slides: slides
    });

    navigator.clipboard.writeText(ql).then(() => {
      this.showToast('Copied formatted Quick Lyrics to clipboard');
    }).catch(() => {
      this.showToast('Failed to copy to clipboard', true);
    });
  }

  /* ==========================================================================
     Settings Modal & API Ping
     ========================================================================== */

  openSettings() {
    this.apiEndpointInput.value = this.apiUrl;
    this.apiKeyInput.value = this.apiKey;
    this.pingStatusText.textContent = '';
    this.settingsModal.classList.add('open');
  }

  closeSettings() {
    this.settingsModal.classList.remove('open');
  }

  saveSettings() {
    this.apiUrl = this.apiEndpointInput.value.trim() || DEFAULT_SUPABASE_URL;
    this.apiKey = this.apiKeyInput.value.trim() || DEFAULT_ANON_KEY;
    localStorage.setItem('csi_freeshow_api_url', this.apiUrl);
    localStorage.setItem('csi_freeshow_api_key', this.apiKey);
    this.closeSettings();
    this.showToast('Saved API configuration');
    this.loadCurrentSong();
  }

  async pingApi() {
    this.pingStatusText.textContent = 'Testing connection...';
    this.pingStatusText.style.color = '#94a3b8';

    try {
      const url = `${this.apiEndpointInput.value.trim()}?type=keerthane&number=1`;
      const headers = { 'Accept': 'application/json' };
      const key = this.apiKeyInput.value.trim();
      if (key) {
        headers['apikey'] = key;
        headers['Authorization'] = `Bearer ${key}`;
      }

      const res = await fetch(url, { headers });
      if (res.ok) {
        this.pingStatusText.textContent = '✅ Connected successfully! Supabase Edge is responding.';
        this.pingStatusText.style.color = '#10b981';
      } else {
        this.pingStatusText.textContent = `⚠️ Edge function returned HTTP ${res.status}. Check function deployment.`;
        this.pingStatusText.style.color = '#f59e0b';
      }
    } catch (err) {
      this.pingStatusText.textContent = `❌ Connection failed: ${err.message}.`;
      this.pingStatusText.style.color = '#f43f5e';
    }
  }

  /* ==========================================================================
     Helper Utilities
     ========================================================================== */

  triggerDownload(filename, content, mimeType) {
    const blob = (content instanceof Blob) ? content : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  showToast(message, isError = false) {
    const pill = document.createElement('div');
    pill.className = `toast-pill ${isError ? 'error' : ''}`;
    pill.innerHTML = `<span>${isError ? '⚠️' : '✅'}</span><span>${message}</span>`;
    this.toastContainer.appendChild(pill);

    setTimeout(() => {
      pill.style.opacity = '0';
      pill.style.transform = 'translateY(8px) scale(0.95)';
      pill.style.transition = 'all 0.25s ease';
      setTimeout(() => pill.remove(), 250);
    }, 2800);
  }
}

// Bootstrap App
document.addEventListener('DOMContentLoaded', () => {
  new FreeShowApp();
});

