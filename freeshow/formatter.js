/**
 * FreeShow Formatter for CSI Hymns Book
 * Ported faithfully from com.reyzie.hymns.presentation.FreeShowFormatter
 * Universal script support (works with file://, http://, CommonJS & ES)
 */

(function (global) {
  'use strict';

  const END_MARKER_REGEX = /^\s*(\.\.\.end\.\.\.|\-\-end\-\-|\.\.\.end|--end|\*\*\*|---|___)\s*$/i;
  const NUMBERED_STANZA_REGEX = /^\s*(\d+)[\.\)]+\s*/;

  // 32x32 Base64 PNG App Logo for FreeShow .show file watermark
  const APP_LOGO_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAIKADAAQAAAABAAAAIAAAAACshmLzAAAE4klEQVRYCe2WfUxVZRzHP+ec+0Jc9MpAXtR8IUAFFUUkQZvaNLMttW6zYZqrWdmam27FXLVpW5m15T9t2SScUYk1Lar1orlIHE40AxMkkAhUlm+gCVy4b+f0O4e5qZv3tMXmP/7uztnznPPc5/t9vuf7+z2PYkhwB0O9g9gW9F0CdxVw/BcTnm5tY0d5BecvX0HBkJ8Z5l2xLkUSyTDbZldaqq6zcF4hy5Y+Yj6IGrYEWlrbeWjNa7R1+iE7FyWvACMcGYBWVfSItDUNIrpACykBVxSDHe/vwUzwJx+LTsKWQNkX39CenocnPUI49T70ufMhCA6ZXP2yFKWxFr1oLcHM8SToBq+MVbjc3ceWiMq+qiO2BGxNeKnbj/p7DcGqfaa4GP2idFgW3H6G9FNHeLUgnf59FUTk+YI4HX/5R+za9BaaqqErooxN2BIgImgpo4kpXCDSh3H29OIq3cKQkk2kxMeRkZ3FsMYaYt9Zj9ZUh+pNoGD5Uxa46Re7sP0EqA7UYD+BX6tQfVmE/2ohp+MkG9Y9S1LycNJGj6LszXV8v/8gJ3aVEjNtMocPNaCm5WMoliujcrAnoEcIXenCkzGFcDCAK30idc5EfKuLmf3ADF4oWsLzxW/jiPUwakQifaEIDy4vouxomyTEYCggrnbOW4zS3yPpJT7/8XNSjF5mrlrG1Y4OrnX3MGFGHktWFTEhyUvNwWrKyz5BySiIuvLrL+09YMrodIn5/FbKJU/Nw7dyGWFJu/7+gLxy0dJwit0fbOfwgUoSU5KYu3IFhpma9gKIre1CwPVD3xGs/BrNHUPX8SPs372XYd6hxHk81gSZk7LxPfcMU2fmc+lcBz/tLEMJiXkHxQOSBXpYJ3bqLIKBIMk5+eRnDCXd4+TP2joOVFZT39BEzKe70ApzOawlc2mhZMzZFlmavQT2JhQjuSZNJ3SuBUVV+Od4Ndd6mvE+vpiLs5ZSWXuCtOItVDwxkV4dSmpk5WE3tJ8eqMw2CtsSUBwOApXf4oqJITxxFuPmPMzHj66mzq9yxh1CyVnE2XAI3/EAFwJwTp5rLgOzWBuGMLIJWwJI8VHz56FK3Te6LtLcpzFjbyvnQ9AdFqOJR6VJ5d+m3NJRZJwp/bFfGD9njA28lHTbEZoTvbaaMcleYt1iyL31hCIGKfLHEbLpOMXtFrnrn1uMp4hvCrLHsHb1CtvpbQn0ifGKZuewfXMx98S4iZimlHqgmEDiifo/WrnQ2WX1TTRT9sR4LyFRv7PrqmRKbFQStgRcTo0pudOJi/Pw+nvb+LmqhiHeIYwdmcqHmzdw9GQjNXX1aOIVoSRbR5iszHG4pT7saetg68b1/4+Ab9FcNry7jax7h7P/0DF+a2xjY/EaJqQmcvREAwW52RTmTbZATAJmBEMhNm0tYf7sfKsf7SaHmdsX7IgcNvr8fkrLv6K84gea2zu4cvUaI5ITSBuVQkhWa+W65b8BcLMZkSp5/7QpvPHyi8THx6OZVfE2EZVAZ2cnzU1NA+kk331ryWdclGPZyNQkXnraR9AicOPMAxqY3nC73OIRlYzMTBISEm4cdFM7KgFzZFhAAoEAwWCQ3l6/ddwKiDE1My2viyeGNPvmSh3iBXN/cMnldrut/k2It3RsCdwyftC79pvRoEPePOFdAndcgX8BsF3fiVEJPDgAAAAASUVORK5CYII=';

  function generateRandomId(len = 11) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let res = '';
    for (let i = 0; i < len; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  }

  function cleanLyrics(rawLyrics) {
    if (!rawLyrics) return '';
    return rawLyrics
      .replace(/\r\n/g, '\n')
      .split('\n')
      .filter(line => !END_MARKER_REGEX.test(line.trim()))
      .join('\n')
      .trim();
  }

  function splitIntoParagraphs(cleanedLyrics) {
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

  function parseSlides(options) {
    const number = options.number || 1;
    const title = options.title || '';
    const category = options.category || 'keerthane'; // 'keerthane', 'hymn', 'mt'
    const kannadaLyrics = options.kannadaLyrics || '';
    const englishLyrics = options.englishLyrics || '';
    const mode = options.mode || 'kannada'; // 'kannada', 'english', 'bilingual'

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
      // Hymn or Mangalore Tune
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

    if (slides.length === 0 && (kanClean || engClean)) {
      slides.push({ group: 'Verse 1', content: kanClean || engClean });
    }

    return slides;
  }

  function formatQuickLyricsText(options) {
    const number = options.number || 1;
    const title = options.title || '';
    const category = options.category || 'keerthane';
    const slides = options.slides || [];

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

  function formatFreeShowJson(options) {
    const number = options.number || 1;
    const title = options.title || '';
    const category = options.category || 'keerthane';
    const slides = options.slides || [];

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
        // Watermark Prefix: "By"
        {
          style: 'top: 940px; left: 1430px; width: 45px; height: 50px;',
          align: '',
          lines: [
            {
              align: 'text-align: right;',
              text: [
                {
                  value: 'By',
                  style: 'font-size: 28px; color: rgb(255 255 255 / 0.55);'
                }
              ]
            }
          ],
          decoration: true
        },
        // Watermark Logo: 30x30 base64 icon
        {
          type: 'media',
          style: 'top: 950px; left: 1485px; width: 30px; height: 30px; border-radius: 6px;',
          src: APP_LOGO_BASE64,
          fit: 'contain',
          decoration: true
        },
        // Watermark Suffix: "CSI Hymns Book App"
        {
          style: 'top: 940px; left: 1525px; width: 315px; height: 50px;',
          align: '',
          lines: [
            {
              align: 'text-align: left;',
              text: [
                {
                  value: 'CSI Hymns Book App',
                  style: 'font-size: 28px; color: rgb(255 255 255 / 0.55);'
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

  const Formatter = {
    cleanLyrics,
    splitIntoParagraphs,
    parseSlides,
    formatQuickLyricsText,
    formatFreeShowJson
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Formatter;
  }
  if (typeof global !== 'undefined') {
    global.FreeShowFormatter = Formatter;
  }
})(typeof window !== 'undefined' ? window : this);
