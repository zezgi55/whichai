import { Language } from '../types';

export interface PromptCleanResult {
  original: string;
  cleaned: string;
  fixes: Array<{ from: string; to: string }>;
}

const TR_TYPO_MAP: Array<[RegExp, string]> = [
  [/\bherkez\b/gi, 'herkes'],
  [/\byanlız\b/gi, 'yalnız'],
  [/\bbi\s?şey\b/gi, 'bir şey'],
  [/\bbi\s?tane\b/gi, 'bir tane'],
  [/\bbir\s+çok\b/gi, 'birçok'],
  [/\byapıcak\b/gi, 'yapacak'],
  [/\byapıcam\b/gi, 'yapacağım'],
  [/\bolucak\b/gi, 'olacak'],
  [/\byazıcak\b/gi, 'yazacak'],
  [/\bgöstercek\b/gi, 'gösterecek'],
  [/\bnapmalıyım\b/gi, 'ne yapmalıyım'],
  [/\bnapmalı\b/gi, 'ne yapılmalı'],
  [/\bnasl\b/gi, 'nasıl'],
  [/\blutfen\b/gi, 'lütfen'],
  [/\blütfn\b/gi, 'lütfen'],
  [/\btesekkur\b/gi, 'teşekkür'],
  [/\bteşekür\b/gi, 'teşekkür'],
  [/\bingilzce\b/gi, 'İngilizce'],
  [/\bingilizceye\b/gi, 'İngilizceye'],
  [/\bturkce\b/gi, 'Türkçe'],
  [/\btürkce\b/gi, 'Türkçe'],
  [/\bozetle\b/gi, 'özetle'],
  [/\bozet\b/gi, 'özet'],
  [/\barastir\b/gi, 'araştır'],
  [/\barastirma\b/gi, 'araştırma'],
  [/\bkarsilastir\b/gi, 'karşılaştır'],
  [/\bgorsel\b/gi, 'görsel'],
  [/\btasarim\b/gi, 'tasarım'],
  [/\bsayfalik\b/gi, 'sayfalık'],
  [/\bdokuman\b/gi, 'doküman'],
  [/\bguvenlik\b/gi, 'güvenlik'],
  [/\bguvenligi\b/gi, 'güvenliği'],
  [/\byazilim\b/gi, 'yazılım'],
  [/\bceviri\b/gi, 'çeviri'],
  [/\bcevir\b/gi, 'çevir'],
  [/\bmusteriye\b/gi, 'müşteriye'],
  [/\bmusteri\b/gi, 'müşteri'],
  [/\bgecikecegini\b/gi, 'gecikeceğini'],
  [/\bhazirla\b/gi, 'hazırla'],
  [/\bcikar\b/gi, 'çıkar'],
  [/\byatirimci\b/gi, 'yatırımcı'],
  [/\bdegil\b/gi, 'değil'],
  [/\bicin\b/gi, 'için'],
  [/\bcok\b/gi, 'çok'],
  [/\bsuan\b/gi, 'şu an'],
  [/\bşuan\b/gi, 'şu an'],
  [/\beposta\b/gi, 'e-posta'],
  [/\bmaıl\b/gi, 'mail'],
  [/\bprojei\b/gi, 'projeyi'],
  [/\bkodlaa+\b/gi, 'kodla'],
  [/\byazarmısın\b/gi, 'yazar mısın'],
  [/\byaparmısın\b/gi, 'yapar mısın'],
  [/\bedermisin\b/gi, 'eder misin'],
  [/\bverirmisin\b/gi, 'verir misin'],
  [/\bçevirirmisin\b/gi, 'çevirir misin'],
  [/\bözetlermisin\b/gi, 'özetler misin'],
  [/\banlatırmısın\b/gi, 'anlatır mısın'],
  [/\bhazırlarmısın\b/gi, 'hazırlar mısın'],
  [/\bçözermisin\b/gi, 'çözer misin'],
  [/\byardım\s+edermisin\b/gi, 'yardım eder misin'],
];

const EN_TYPO_MAP: Array<[RegExp, string]> = [
  [/\bteh\b/gi, 'the'],
  [/\brecieve\b/gi, 'receive'],
  [/\bseperate\b/gi, 'separate'],
  [/\bdefinately\b/gi, 'definitely'],
  [/\boccured\b/gi, 'occurred'],
  [/\blangauge\b/gi, 'language'],
  [/\barchitecure\b/gi, 'architecture'],
  [/\barchitechture\b/gi, 'architecture'],
  [/\boptimze\b/gi, 'optimize'],
  [/\banalize\b/gi, 'analyze'],
  [/\bsummarze\b/gi, 'summarize'],
  [/\bplz\b|\bpls\b/gi, 'please'],
  [/\bdont\b/gi, "don't"],
  [/\bcant\b/gi, "can't"],
  [/\bwont\b/gi, "won't"],
  [/\bim\b/gi, "I'm"],
  [/\bu\b/g, 'you'],
  [/\bwritting\b/gi, 'writing'],
  [/\bproffesional\b/gi, 'professional'],
  [/\bdatabse\b/gi, 'database'],
  [/\bperformace\b/gi, 'performance'],
  [/\bcomparision\b/gi, 'comparison'],
  [/\bstratergy\b/gi, 'strategy'],
  [/\bresponsve\b/gi, 'responsive'],
  [/\bsecruity\b/gi, 'security'],
  [/\bhelpp\b/gi, 'help'],
  [/\bcretae\b/gi, 'create'],
];

/**
 * Cleans and fixes typos, broken spacing, repeated letters, and rough phrasing
 * before feeding the user's intent into the model-aware prompt enhancer.
 */
export function cleanAndFixPrompt(rawInput: string, lang: Language): PromptCleanResult {
  const original = rawInput.trim();
  let text = original;
  const fixes: Array<{ from: string; to: string }> = [];

  // 1. Collapse 3+ repeated characters (e.g., "acillll", "pleaseeee")
  text = text.replace(/([a-zA-ZçğıöşüÇĞİÖŞÜ])\1{2,}/g, (match, char) => {
    const fixed = char;
    fixes.push({ from: match, to: fixed });
    return fixed;
  });

  // 2. Remove informal hesitation fillers
  const fillerRegex =
    lang === 'tr'
      ? /\b(yaa+|şeyy+|hmmm+|falan filan|işte öyle)\b/gi
      : /\b(uhmm+|umm+|errr+|idk|tbh)\b/gi;
  text = text.replace(fillerRegex, (m) => {
    fixes.push({ from: m, to: lang === 'tr' ? '(temizlendi)' : '(removed)' });
    return '';
  });

  // 3. Apply Turkish typo fixes
  for (const [pattern, replacement] of TR_TYPO_MAP) {
    text = text.replace(pattern, (matched) => {
      if (matched.toLocaleLowerCase('tr-TR') !== replacement.toLocaleLowerCase('tr-TR')) {
        fixes.push({ from: matched, to: replacement });
      }
      if (
        matched[0] === matched[0].toUpperCase() &&
        replacement[0] === replacement[0].toLowerCase()
      ) {
        return replacement[0].toLocaleUpperCase('tr-TR') + replacement.slice(1);
      }
      return replacement;
    });
  }

  // 4. Apply English typo fixes
  for (const [pattern, replacement] of EN_TYPO_MAP) {
    text = text.replace(pattern, (matched) => {
      if (matched.toLowerCase() !== replacement.toLowerCase()) {
        fixes.push({ from: matched, to: replacement });
      }
      return replacement;
    });
  }

  // 5. Normalize spacing and punctuation
  const beforeSpace = text;
  text = text
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/([,.;:!?])([^\s\d"'”’)\]])/g, '$1 $2')
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (beforeSpace !== text && fixes.length === 0) {
    fixes.push({
      from: lang === 'tr' ? 'boşluk / noktalama' : 'spacing / punctuation',
      to: lang === 'tr' ? 'düzenlendi' : 'normalized',
    });
  }

  // 6. Capitalize first letter & ensure ending punctuation
  if (text.length > 0) {
    const firstChar = text[0];
    const upperFirst =
      lang === 'tr' ? firstChar.toLocaleUpperCase('tr-TR') : firstChar.toUpperCase();
    if (firstChar !== upperFirst) {
      text = upperFirst + text.slice(1);
    }
    if (!/[.!?]$/.test(text)) {
      text = `${text}.`;
    }
  }

  const uniqueFixes = fixes.filter(
    (item, idx, arr) => arr.findIndex((x) => x.from === item.from && x.to === item.to) === idx
  );

  return {
    original,
    cleaned: text || original,
    fixes: uniqueFixes,
  };
}
