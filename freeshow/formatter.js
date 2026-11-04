/**
 * FreeShow Formatter for CSI Hymns Book
 * Ported faithfully from com.reyzie.hymns.presentation.FreeShowFormatter
 */

const END_MARKER_REGEX = /^\s*(\.\.\.end\.\.\.|\-\-end\-\-|\.\.\.end|--end|\*\*\*|---|___)\s*$/i;
const NUMBERED_STANZA_REGEX = /^\s*(\d+)[\.\)]+\s*/;

function generateRandomId(len = 11) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let res = '';
  for (let i = 0; i < len; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
}

export function cleanLyrics(rawLyrics) {
  if (!rawLyrics) return '';
  return rawLyrics
    .replace(/\r\n/g, '\n')
    .split('\n')
    .filter(line => !END_MARKER_REGEX.test(line.trim()))
    .join('\n')
    .trim();
}

export function splitIntoParagraphs(cleanedLyrics) {
  if (!cleanedLyrics) return [];
  return cleanedLyrics
    .split(/\n\s*\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
}

function combineBilingual(primary, secondary) {
  if (!secondary) return primary.trim();
  if (!primary) return secondary.trim();
  return `${primary.trim()}\n\n—\n${secondary.trim()}`;
}

export function parseSlides({
  number = 1,
  title = '',
  category = 'keerthane', // 'keerthane', 'hymn', 'mt'
  kannadaLyrics = '',
  englishLyrics = '',
  mode = 'kannada' // 'kannada', 'english', 'bilingual'
}) {
  const kanClean = cleanLyrics(kannadaLyrics);
  const engClean = cleanLyrics(englishLyrics);

  const kanParagraphs = kanClean ? splitIntoParagraphs(kanClean) : [];
  const engParagraphs = engClean ? splitIntoParagraphs(engClean) : [];

  let selectedParagraphs = [];
  let secondaryParagraphs = null;

  switch (mode) {
    case 'kannada':
      selectedParagraphs = kanParagraphs.length > 0 ? kanParagraphs : engParagraphs;
      secondaryParagraphs = null;
      break;
    case 'english':
      selectedParagraphs = engParagraphs.length > 0 ? engParagraphs : kanParagraphs;
      secondaryParagraphs = null;
      break;
    case 'bilingual':
      selectedParagraphs = kanParagraphs.length > 0 ? kanParagraphs : engParagraphs;
      secondaryParagraphs = kanParagraphs.length > 0 ? engParagraphs : null;
      break;
    default:
      selectedParagraphs = kanParagraphs.length > 0 ? kanParagraphs : engParagraphs;
  }

  const slides = [];
  const isKeerthane = category === 'keerthane';

  if (isKeerthane) {
    // Find where numbered stanzas start
    const firstNumberedIndex = selectedParagraphs.findIndex(p => {
      const firstLine = p.split('\n')[0] || '';
      return NUMBERED_STANZA_REGEX.test(firstLine);
    });

    let chorusParagraphs = [];
    let verseParagraphs = [];

    if (firstNumberedIndex > 0) {
      chorusParagraphs = selectedParagraphs.slice(0, firstNumberedIndex);
      verseParagraphs = selectedParagraphs.slice(firstNumberedIndex);
    } else if (firstNumberedIndex === 0) {
      chorusParagraphs = [];
      verseParagraphs = selectedParagraphs;
    } else {
      if (selectedParagraphs.length > 1) {
        chorusParagraphs = [selectedParagraphs[0]];
        verseParagraphs = selectedParagraphs.slice(1);
      } else {
        chorusParagraphs = selectedParagraphs;
        verseParagraphs = [];
      }
    }

    if (chorusParagraphs.length > 0) {
      const chorusText = chorusParagraphs.join('\n\n');
      const text = secondaryParagraphs
        ? combineBilingual(chorusText, secondaryParagraphs.slice(0, Math.max(1, firstNumberedIndex)).join('\n\n'))
        : chorusText;
      slides.push({ group: 'Chorus', content: text });
    }

    verseParagraphs.forEach((stanza, idx) => {
      const firstLine = stanza.split('\n')[0] || '';
      const match = firstLine.match(NUMBERED_STANZA_REGEX);
      const verseNum = match ? parseInt(match[1], 10) : (idx + 1);
      const text = (secondaryParagraphs && idx < secondaryParagraphs.length)
        ? combineBilingual(stanza, secondaryParagraphs[idx])
        : stanza;
      slides.push({ group: `Verse ${verseNum}`, content: text });
    });
  } else {
    // Hymn or Mangalore Tune parsing
    selectedParagraphs.forEach((stanza, idx) => {
      const firstLine = stanza.split('\n')[0] || '';
      const match = firstLine.match(NUMBERED_STANZA_REGEX);
      const isChorus = /chorus|refrain|ಪಲ್ಲವಿ/i.test(firstLine);

      const groupName = isChorus
        ? 'Chorus'
        : `Verse ${match ? parseInt(match[1], 10) : (idx + 1)}`;

      const text = (secondaryParagraphs && idx < secondaryParagraphs.length)
        ? combineBilingual(stanza, secondaryParagraphs[idx])
        : stanza;

      slides.push({ group: groupName, content: text });
    });
  }

  // If no slides parsed at all, create fallback slide with whole text
  if (slides.length === 0 && (kanClean || engClean)) {
    slides.push({ group: 'Verse 1', content: kanClean || engClean });
  }

  return slides;
}

export function formatQuickLyricsText({
  number = 1,
  title = '',
  category = 'keerthane',
  slides = []
}) {
  const prefix = category === 'keerthane' ? 'CSI Keerthane' : category === 'mt' ? 'Mangalore Tune' : 'CSI Hymn';
  const label = `${prefix} ${number}`;

  let out = `Title=${label} - ${title}\n`;
  out += `Author=CSI Hymns Book App\n`;
  out += `Copyright=By CSI Hymns Book App\n`;
  out += `Number=${number}\n\n`;

  for (const slide of slides) {
    out += `[${slide.group}]\n`;
    out += `${slide.content.trim()}\n\n`;
  }

  return out.trim();
}

export function formatFreeShowJson({
  number = 1,
  title = '',
  category = 'keerthane',
  slides = []
}) {
  const prefix = category === 'keerthane' ? 'Keerthane' : category === 'mt' ? 'M.T. Hymn' : 'Hymn';
  const showName = `${prefix} ${number} - ${title || 'Lyrics'}`;
  const showId = generateRandomId(11);
  const layoutId = 'default';
  const now = Date.now();

  const slidesMap = {};
  const layoutSlides = [];

  slides.forEach((slide, index) => {
    const slideId = `slide_${index}_${generateRandomId(6)}`;
    const linesList = slide.content.split('\n').map(line => ({
      align: 'text-align: center;',
      text: [
        {
          value: line,
          style: 'font-size: 60px;'
        }
      ]
    }));

    const itemsList = [
      {
        style: 'top: 60px; left: 80px; width: 1760px; height: 860px;',
        align: '',
        lines: linesList
      },
      {
        style: 'top: 940px; left: 80px; width: 1760px; height: 50px;',
        align: '',
        lines: [
          {
            align: 'text-align: right;',
            text: [
              {
                value: 'By CSI Hymns Book App',
                style: 'font-size: 26px; color: rgb(255 255 255 / 0.55);'
              }
            ]
          }
        ],
        decoration: true
      }
    ];

    const slideObj = {
      group: slide.group,
      color: slide.group.toLowerCase().startsWith('chorus') ? '#e0a300' : null,
      settings: {},
      notes: '',
      items: itemsList
    };

    slidesMap[slideId] = slideObj;
    layoutSlides.push({ id: slideId });
  });

  const showCategory = category === 'keerthane' ? 'keerthanes' : 'hymns';

  const showData = {
    name: showName,
    category: showCategory,
    settings: {
      activeLayout: layoutId,
      template: null
    },
    timestamps: {
      created: now,
      modified: now,
      used: null
    },
    quickAccess: {},
    meta: {
      title: title || showName,
      author: 'CSI Hymns Book App',
      copyright: 'By CSI Hymns Book App',
      number: String(number)
    },
    slides: slidesMap,
    layouts: {
      [layoutId]: {
        name: 'Default',
        notes: '',
        slides: layoutSlides
      }
    },
    media: {}
  };

  return JSON.stringify([showId, showData], null, 2);
}

