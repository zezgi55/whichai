import {
  AIToolDefinition,
  AnalysisResult,
  ComboStep,
  ComplexityLevel,
  EnhancedPromptData,
  Language,
  LiveApiConfig,
  PlanTierOption,
  PriorityMode,
  QuotaSkippedNotice,
  RankedModelItem,
  StrategySectionData,
  SubModelEffort,
  SubModelOption,
  TaskDomain,
  UserPlanSelection,
  UserStackOption,
} from '../types';
import { DEFAULT_AI_CATALOG } from '../data/aiCatalog';
import { cleanAndFixPrompt } from './promptCleaner';

interface DomainSignal {
  domain: TaskDomain;
  labelTr: string;
  labelEn: string;
  weight: number;
}

const DOMAIN_KEYWORDS: Record<
  TaskDomain,
  { labelTr: string; labelEn: string; keywords: string[] }
> = {
  coding: {
    labelTr: 'Kodlama & Yazılım Mimarisi',
    labelEn: 'Coding & Architecture',
    keywords: [
      'kod', 'code', 'react', 'next.js', 'nextjs', 'typescript', 'javascript', 'python', 'sql',
      'api', 'backend', 'frontend', 'bug', 'hata', 'refactor', 'mimari', 'architecture', 'database',
      'postgresql', 'docker', 'kubernetes', 'saas', 'webhook', 'fonksiyon', 'algoritma', 'script',
      'html', 'css', 'tailwind', 'git', 'test', 'unit test', 'deploy', 'node', 'java', 'c#', 'rust',
      'uygulama', 'app', 'servis', 'service', 'veritabanı', 'endpoint', 'auth', 'jwt', 'stripe',
    ],
  },
  research: {
    labelTr: 'Güncel Web & Literatür Araştırması',
    labelEn: 'Live Web & Market Research',
    keywords: [
      'araştır', 'research', 'güncel', '2025', '2026', 'kaynak', 'kaynakça', 'makale', 'literatür',
      'rakip', 'competitor', 'pazar', 'market', 'trend', 'karşılaştır', 'compare', 'comparison',
      'fiyat', 'pricing', 'haber', 'istatistik', 'rapor', 'report', 'regülasyon', 'yasa',
      'sektör', 'analiz et', 'incele', 'benchmark', 'web', 'doğrula', 'verify',
    ],
  },
  visual: {
    labelTr: 'Görsel Üretim & Tasarım',
    labelEn: 'Visual Art & Design',
    keywords: [
      'görsel', 'resim', 'fotoğraf', 'image', 'photo', 'afiş', 'poster', 'logo', 'illüstrasyon',
      'illustration', 'midjourney', 'render', '3d', 'konsept', 'concept', 'tasarım', 'design',
      'sinematik', 'cinematic', 'reklam görseli', 'kapak', 'thumbnail', 'estetik', 'aesthetic',
      'şişe', 'ürün çekimi', 'wallpaper', 'ui tasarım', 'mockup', 'bulutlu', 'pastel',
    ],
  },
  long_context: {
    labelTr: 'Uzun Doküman & PDF Analizi',
    labelEn: 'Long Docs & PDF Analysis',
    keywords: [
      'pdf', 'doküman', 'document', 'belge', 'sayfa', 'sayfalık', 'page', 'kitap', 'book', 'tez',
      'sözleşme', 'contract', 'transkript', 'transcript', 'video', 'toplantı kaydı', 'ders notu',
      'raporunu', 'özetle', 'summarize', 'dosya', 'file', 'uzun metin', 'tüm proje', 'repo',
      'codebase', 'klasör', 'yüzlerce',
    ],
  },
  data_math: {
    labelTr: 'Veri Analizi & Matematik',
    labelEn: 'Data Analysis & Math',
    keywords: [
      'excel', 'csv', 'tablo', 'table', 'grafik', 'chart', 'matematik', 'math', 'formül',
      'istatistik', 'statistics', 'olasılık', 'finans', 'financial', 'bütçe', 'hesapla',
      'modelleme', 'regresyon', 'veri', 'data', 'pandas', 'optimizasyon', 'roi', 'metrik', 'kpi',
    ],
  },
  writing: {
    labelTr: 'İçerik & Yaratıcı Yazım',
    labelEn: 'Content & Creative Writing',
    keywords: [
      'yaz', 'write', 'makale', 'article', 'blog', 'hikaye', 'story', 'senaryo', 'metin',
      'copywriting', 'reklam metni', 'linkedin', 'instagram', 'tweet', 'sunum', 'pitch',
      'yatırımcı', 'investor', 'bülten', 'newsletter', 'kampanya', 'campaign', 'ton', 'ikna',
      'slogan', 'cv', 'resume', 'memo',
    ],
  },
  simple_edit: {
    labelTr: 'Hızlı Metin / Çeviri / Düzenleme',
    labelEn: 'Quick Edit / Email / Translation',
    keywords: [
      'çevir', 'translate', 'ingilizce', 'türkçe', 'english', 'turkish', 'düzelt', 'fix', 'imla',
      'gramer', 'grammar', 'kısalt', 'shorten', 'mail', 'e-posta', 'email', 'mesaj', 'message',
      'kibar', 'polite', 'resmi', 'formal', 'basitçe', 'özet', 'summary', 'madde madde',
      'başlık öner', 'yeniden yaz', 'rewrite', 'paraphrase',
    ],
  },
  reasoning: {
    labelTr: 'Derin Muhakeme & Problem Çözme',
    labelEn: 'Deep Reasoning & System Design',
    keywords: [
      'neden', 'why', 'strateji', 'strategy', 'mimari', 'tasarla', 'design', 'trade-off',
      'avantaj', 'dezavantaj', 'karmaşık', 'complex', 'güvenlik', 'security', 'ölçeklenebilir',
      'scalable', 'idempotency', 'optimizasyon', 'karar', 'kök neden', 'root cause', 'risk',
      'kritik', 'sistem tasarımı', 'system design', 'derin', 'multi-tenant',
    ],
  },
  strategy: {
    labelTr: 'Çok Aşamalı Plan & Strateji',
    labelEn: 'Multi-Step Strategy & Roadmap',
    keywords: [
      'plan', 'yol haritası', 'roadmap', 'iş planı', 'launch', 'lansman', 'girişim', 'startup',
      'büyüme', 'growth', 'pazarlama stratejisi', 'adım adım', 'step by step', 'süreç', 'workflow',
    ],
  },
};

function getAllCatalogTools(userPlans: UserPlanSelection[]): AIToolDefinition[] {
  const customTools = userPlans
    .filter((p) => p.customTool)
    .map((p) => p.customTool as AIToolDefinition);
  const existingIds = new Set(DEFAULT_AI_CATALOG.map((t) => t.id));
  return [...DEFAULT_AI_CATALOG, ...customTools.filter((t) => !existingIds.has(t.id))];
}

function getTierLabel(tier: PlanTierOption, lang: Language): string {
  return lang === 'tr' ? tier.labelTr : tier.labelEn;
}

function resolveTier(
  tool: AIToolDefinition,
  lang: Language,
  selection?: UserPlanSelection
): { tier: PlanTierOption; label: string } {
  if (!selection) {
    const fallback = tool.tiers[0];
    return { tier: fallback, label: getTierLabel(fallback, lang) };
  }
  const found = tool.tiers.find((t) => t.id === selection.tierId) ?? tool.tiers[0];
  const label = selection.customTierName?.trim()
    ? selection.customTierName.trim()
    : getTierLabel(found, lang);
  return { tier: found, label };
}

function desiredEffort(complexity: ComplexityLevel, mode: PriorityMode): SubModelEffort {
  if (mode === 'speed') {
    return complexity === 'expert' ? 'balanced' : 'light';
  }
  if (mode === 'credit_saver') {
    if (complexity === 'low' || complexity === 'medium') return 'light';
    return 'balanced';
  }
  // quality mode
  if (complexity === 'low') return 'light';
  if (complexity === 'medium') return 'balanced';
  return 'heavy';
}

function pickSubModelForTool(
  tool: AIToolDefinition,
  complexity: ComplexityLevel,
  mode: PriorityMode,
  lang: Language,
  tier?: PlanTierOption,
  selection?: UserPlanSelection
): { chosen: SubModelOption; guidance: string } {
  const targetEffort = desiredEffort(complexity, mode);

  // Build available sub-models for this tool (respecting user selections & custom sub-models)
  let pool: SubModelOption[] = [...tool.subModels];

  if (selection?.customSubModels && selection.customSubModels.length > 0) {
    const customSubs: SubModelOption[] = selection.customSubModels
      .filter((s) => s.trim())
      .map((name, idx) => ({
        id: `custom_sub_${idx}`,
        name: name.trim(),
        effort: idx === 0 ? 'balanced' : idx === 1 ? 'heavy' : 'light',
        minPaid: false,
        creditTagTr: 'Özel Alt Model',
        creditTagEn: 'Custom Sub-Model',
        bestForTr: 'Kullanıcı tarafından tanımlanan alt model',
        bestForEn: 'User-defined custom sub-model',
      }));
    pool = [...pool, ...customSubs];
  }

  if (selection?.enabledSubModelIds && selection.enabledSubModelIds.length > 0) {
    const filtered = pool.filter(
      (sm) =>
        selection.enabledSubModelIds!.includes(sm.id) || sm.id.startsWith('custom_sub_')
    );
    if (filtered.length > 0) pool = filtered;
  } else if (tier && !tier.isPaid) {
    const freeSubs = pool.filter((sm) => !sm.minPaid);
    if (freeSubs.length > 0) pool = freeSubs;
  }

  // Find closest effort match
  const effortRank: Record<SubModelEffort, number> = { light: 0, balanced: 1, heavy: 2 };
  const targetNum = effortRank[targetEffort];
  const sorted = [...pool].sort(
    (a, b) => Math.abs(effortRank[a.effort] - targetNum) - Math.abs(effortRank[b.effort] - targetNum)
  );
  const chosen = sorted[0] ?? tool.subModels[0];

  // Heavy alternative (if we consciously saved credits by avoiding it)
  const heavyModel = tool.subModels.find((sm) => sm.effort === 'heavy');
  const lightModel = tool.subModels.find((sm) => sm.effort === 'light');

  let guidance = '';
  if (lang === 'tr') {
    if (chosen.effort !== 'heavy' && heavyModel && heavyModel.id !== chosen.id) {
      guidance = `Bu görev için ${tool.name} tarafında ${heavyModel.name} kredini yakma — ${chosen.name} fazlasıyla yeterli ve çok daha verimli.`;
    } else if (chosen.effort === 'heavy') {
      guidance = `Görevin zorluğu yüksek; ${tool.name} içinde doğrudan ${chosen.name} alt modeline geçmek tek seferde doğru sonuç almanı sağlar.`;
    } else if (lightModel && chosen.id === lightModel.id) {
      guidance = `${tool.name} tarafında hızlı ve ekonomik ${chosen.name} alt modelini seçerek ilerle.`;
    } else {
      guidance = `${tool.name} içinde ${chosen.name} alt modeli bu görev için en dengeli seçimdir.`;
    }
  } else {
    if (chosen.effort !== 'heavy' && heavyModel && heavyModel.id !== chosen.id) {
      guidance = `Don't burn ${heavyModel.name} credits on this task — ${chosen.name} is more than enough and protects your quota.`;
    } else if (chosen.effort === 'heavy') {
      guidance = `High task complexity — switching directly to ${chosen.name} inside ${tool.name} avoids costly retry loops.`;
    } else if (lightModel && chosen.id === lightModel.id) {
      guidance = `Select the fast, low-cost ${chosen.name} sub-model inside ${tool.name} for this task.`;
    } else {
      guidance = `${chosen.name} inside ${tool.name} offers the best balance of accuracy and quota for this prompt.`;
    }
  }

  return { chosen, guidance };
}

function detectDomains(prompt: string): DomainSignal[] {
  const lower = prompt.toLocaleLowerCase('tr-TR');
  const results: DomainSignal[] = [];

  (Object.keys(DOMAIN_KEYWORDS) as TaskDomain[]).forEach((domain) => {
    const { labelTr, labelEn, keywords } = DOMAIN_KEYWORDS[domain];
    let hits = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        hits += kw.includes(' ') ? 2 : 1;
      }
    }
    if (hits > 0) {
      results.push({ domain, labelTr, labelEn, weight: hits });
    }
  });

  if (results.length === 0) {
    results.push({
      domain: prompt.length < 95 ? 'simple_edit' : 'writing',
      labelTr: prompt.length < 95 ? 'Genel Hızlı Soru' : 'Genel İçerik & Analiz',
      labelEn: prompt.length < 95 ? 'Quick Everyday Prompt' : 'General Writing & Analysis',
      weight: 1,
    });
  }

  return results.sort((a, b) => b.weight - a.weight);
}

function assessComplexity(
  prompt: string,
  domains: DomainSignal[]
): {
  level: ComplexityLevel;
  score: number;
  isMultiStep: boolean;
} {
  const lower = prompt.toLocaleLowerCase('tr-TR');
  const wordCount = prompt.trim().split(/\s+/).length;

  const multiStepSignals = [
    've ', 'and ', 'then', 'ardından', 'sonra', 'önce', 'hem ', 'adım adım', 'step by step',
    'tasarla', 'design', 'karşılaştır', 'compare', 'tablo', 'table', 'rapor', 'report',
    'mimari', 'architecture', 'kodunu yaz', 'strateji', 'strategy', 'planla',
  ];
  const multiHits = multiStepSignals.filter((s) => lower.includes(s)).length;

  const domainSet = new Set(domains.map((d) => d.domain));
  const heavyDomains: TaskDomain[] = [
    'coding',
    'reasoning',
    'research',
    'data_math',
    'long_context',
    'strategy',
  ];
  const heavyCount = heavyDomains.filter((d) => domainSet.has(d)).length;

  let score = 22;
  score += Math.min(28, wordCount * 1.15);
  score += heavyCount * 14;
  score += multiHits * 7;

  if (
    domains[0].domain === 'simple_edit' &&
    heavyCount === 0 &&
    wordCount < 30 &&
    multiHits <= 1
  ) {
    score = Math.min(score, 26);
  }

  score = Math.max(12, Math.min(98, Math.round(score)));

  let level: ComplexityLevel = 'medium';
  if (score < 36) level = 'low';
  else if (score < 62) level = 'medium';
  else if (score < 82) level = 'high';
  else level = 'expert';

  const isMultiStep =
    level === 'expert' ||
    (level === 'high' && (domains.length >= 2 || multiHits >= 2)) ||
    (domains.length >= 2 &&
      ((domainSet.has('research') &&
        (domainSet.has('writing') || domainSet.has('coding') || domainSet.has('strategy'))) ||
        (domainSet.has('coding') && domainSet.has('reasoning')) ||
        (domainSet.has('visual') && (domainSet.has('writing') || domainSet.has('strategy')))));

  return { level, score, isMultiStep };
}

function scoreToolForTask(
  tool: AIToolDefinition,
  domains: DomainSignal[],
  complexity: ComplexityLevel,
  mode: PriorityMode,
  tier?: PlanTierOption
): number {
  const s = tool.scores;
  const primary = domains[0]?.domain ?? 'writing';
  const secondary = domains[1]?.domain;

  const domainScore = (d: TaskDomain): number => {
    switch (d) {
      case 'coding':
        return s.coding * 0.65 + s.reasoning * 0.25 + s.long_context * 0.1;
      case 'research':
        return s.research * 0.65 + s.reasoning * 0.2 + s.writing * 0.15;
      case 'visual':
        return s.visual * 0.85 + s.writing * 0.1 + s.speed * 0.05;
      case 'long_context':
        return s.long_context * 0.65 + s.reasoning * 0.2 + s.research * 0.15;
      case 'data_math':
        return s.data_math * 0.6 + s.reasoning * 0.3 + s.coding * 0.1;
      case 'writing':
        return s.writing * 0.65 + s.reasoning * 0.2 + s.speed * 0.15;
      case 'simple_edit':
        return s.writing * 0.35 + s.speed * 0.35 + s.valueFree * 0.3;
      case 'reasoning':
        return s.reasoning * 0.65 + s.data_math * 0.2 + s.coding * 0.15;
      case 'strategy':
        return s.reasoning * 0.45 + s.research * 0.3 + s.writing * 0.25;
    }
  };

  let raw = domainScore(primary);
  if (secondary) {
    raw = raw * 0.72 + domainScore(secondary) * 0.28;
  }

  if (tool.id === 'midjourney' && !domains.some((d) => d.domain === 'visual')) {
    return 12;
  }

  if (tier) {
    raw += tier.qualityBoost * (complexity === 'low' ? 0.2 : 0.65);
  }

  if (mode === 'speed') {
    raw = raw * 0.66 + s.speed * 0.34;
    if (tier && tier.creditWeight === 3) raw -= 0.4;
  } else if (mode === 'credit_saver') {
    raw = raw * 0.62 + s.valueFree * 0.38;
    if (tier) {
      if (!tier.isPaid) raw += 0.9;
      else if (tier.creditWeight >= 3) raw -= 1.25;
      else if (tier.creditWeight === 2) raw -= 0.55;
    }
    if (complexity === 'low' && tier?.isPaid) {
      raw -= 0.65;
    }
  } else {
    if (complexity === 'high' || complexity === 'expert') {
      raw = raw * 0.8 + s.reasoning * 0.2;
      if (tier?.isPaid) raw += 0.45;
    }
  }

  return Math.round(Math.max(45, Math.min(99, raw * 9.35)));
}

function buildReasonsForTool(
  tool: AIToolDefinition,
  subModel: SubModelOption,
  domains: DomainSignal[],
  mode: PriorityMode,
  lang: Language
): string[] {
  const primary = domains[0]?.domain ?? 'writing';
  const reasons: string[] = [];

  if (lang === 'tr') {
    if (tool.id === 'claude') {
      reasons.push(
        primary === 'coding'
          ? `${subModel.name}, temiz kod mimarisi ve düşük hata oranında en güçlü seçenektir.`
          : `${subModel.name}, doğal, insansı üslup ve incelikli talimat takibinde öne çıkar.`
      );
    } else if (tool.id === 'gemini') {
      reasons.push(
        primary === 'long_context'
          ? `${subModel.name}, 1M+ token bağlamıyla dev PDF ve proje analizinde rakipsizdir.`
          : `${subModel.name}, hız, güncel bilgi ve çoklu ortam dengesinde çok verimlidir.`
      );
    } else if (tool.id === 'chatgpt') {
      reasons.push(
        primary === 'reasoning' || primary === 'data_math'
          ? `${subModel.name}, adım adım mantık yürütme ve veri/tablo analizinde çok kararlıdır.`
          : `${subModel.name}, genel amaçlı üretim ve net yapılandırılmış yanıtlarda güvenilirdir.`
      );
    } else if (tool.id === 'perplexity') {
      reasons.push(`${subModel.name}, canlı web taraması yapıp her veriyi güncel kaynakla doğrular.`);
    } else if (tool.id === 'deepseek') {
      reasons.push(`${subModel.name}, teknik muhakeme ve kodlamada Pro kredisi yakmadan yüksek kalite verir.`);
    } else if (tool.id === 'midjourney') {
      reasons.push(`${subModel.name}, ışık, doku ve kompozisyon estetiğinde piyasa lideridir.`);
    } else if (tool.id === 'cursor') {
      reasons.push(`${subModel.name}, tüm proje dosyalarını görerek çoklu dosya düzenlemesi yapar.`);
    } else if (tool.id === 'notebooklm') {
      reasons.push(`${subModel.name}, yalnızca yüklediğin kaynaklara sadık kalarak halüsinasyonu önler.`);
    } else if (tool.id === 'grok') {
      reasons.push(`${subModel.name}, anlık gündem ve sosyal medya trendlerinde yüksek güncellik sunar.`);
    } else {
      reasons.push(`${subModel.name}, bu görev profili için tanımlı özel aracınla uyumlu.`);
    }

    if (mode === 'speed' && tool.scores.speed >= 9) {
      reasons.push('Hız Odaklı modda düşük gecikmeyle anında yanıt üretir.');
    } else if (mode === 'credit_saver' && tool.scores.valueFree >= 8.5) {
      reasons.push('Kredi Tasarrufu modunda pahalı Pro/Opus limitlerini korur.');
    } else {
      reasons.push(`${subModel.bestForTr}.`);
    }
  } else {
    if (tool.id === 'claude') {
      reasons.push(
        primary === 'coding'
          ? `${subModel.name} leads in clean software architecture and low-bug code output.`
          : `${subModel.name} excels at natural human tone and nuanced instruction following.`
      );
    } else if (tool.id === 'gemini') {
      reasons.push(
        primary === 'long_context'
          ? `${subModel.name} offers a massive 1M+ token window ideal for huge PDFs and codebases.`
          : `${subModel.name} balances speed, multimodal inputs, and high quality efficiently.`
      );
    } else if (tool.id === 'chatgpt') {
      reasons.push(
        primary === 'reasoning' || primary === 'data_math'
          ? `${subModel.name} excels at structured reasoning, math, and tabular data workflows.`
          : `${subModel.name} delivers dependable all-around execution and crisp structure.`
      );
    } else if (tool.id === 'perplexity') {
      reasons.push(`${subModel.name} searches the live web and attaches clickable citations to every claim.`);
    } else if (tool.id === 'deepseek') {
      reasons.push(`${subModel.name} delivers strong technical reasoning without spending paid Pro credits.`);
    } else if (tool.id === 'midjourney') {
      reasons.push(`${subModel.name} leads in lighting, texture, and editorial visual direction.`);
    } else if (tool.id === 'cursor') {
      reasons.push(`${subModel.name} indexes your full repo for cohesive multi-file edits.`);
    } else if (tool.id === 'notebooklm') {
      reasons.push(`${subModel.name} stays strictly grounded in your uploaded sources.`);
    } else if (tool.id === 'grok') {
      reasons.push(`${subModel.name} captures real-time social sentiment and breaking trends.`);
    } else {
      reasons.push(`${subModel.name} aligns cleanly with your custom tool strengths.`);
    }

    if (mode === 'speed' && tool.scores.speed >= 9) {
      reasons.push('Low-latency response ideal for Speed First mode.');
    } else if (mode === 'credit_saver' && tool.scores.valueFree >= 8.5) {
      reasons.push('Protects premium Pro/Opus credits in Credit Saver mode.');
    } else {
      reasons.push(`${subModel.bestForEn}.`);
    }
  }

  return reasons.slice(0, 2);
}

function buildPlanConstraintNote(
  tool: AIToolDefinition,
  tier: PlanTierOption,
  domains: DomainSignal[],
  complexity: ComplexityLevel,
  lang: Language
): string | undefined {
  const domainSet = new Set(domains.map((d) => d.domain));
  const tierLabel = getTierLabel(tier, lang);

  if (lang === 'tr') {
    if (!tier.isPaid && domainSet.has('long_context')) {
      return `${tool.name} ${tierLabel} planında büyük dosya/PDF bağlam limiti kısıtlı olabilir. Dosyayı böl veya geniş bağlamlı bir alt modele yönel.`;
    }
    if (!tier.isPaid && (complexity === 'high' || complexity === 'expert')) {
      return `${tool.name} ${tierLabel} planında mesaj kotası bu ağırlıktaki görevde çabuk dolabilir. Promptu tek seferde eksiksiz gönder.`;
    }
    if (tier.creditWeight >= 3 && complexity === 'low') {
      return `${tool.name} ${tierLabel} yüksek değerli kredi kullanır; bu basit işte hafif/hızlı alt modeli seç.`;
    }
    return tier.constraintsTr[0];
  } else {
    if (!tier.isPaid && domainSet.has('long_context')) {
      return `${tool.name} ${tierLabel} has tighter file/context caps. Split large documents or use a 1M-context sub-model.`;
    }
    if (!tier.isPaid && (complexity === 'high' || complexity === 'expert')) {
      return `${tool.name} ${tierLabel} message quota can deplete fast on heavy tasks — send one complete prompt.`;
    }
    if (tier.creditWeight >= 3 && complexity === 'low') {
      return `${tool.name} ${tierLabel} uses premium quota; switch to its lightweight sub-model for this easy task.`;
    }
    return tier.constraintsEn[0];
  }
}

function buildComplexityBadge(
  complexity: { level: ComplexityLevel; score: number; isMultiStep: boolean },
  domains: DomainSignal[],
  mode: PriorityMode,
  lang: Language
): AnalysisResult['complexityBadge'] {
  const detectedDomains = domains.slice(0, 3).map((d) => (lang === 'tr' ? d.labelTr : d.labelEn));

  if (lang === 'tr') {
    if (complexity.level === 'low') {
      return {
        level: 'low',
        label: 'Düşük Efor',
        headline: 'Düşük Efor — Hafif / Ücretsiz Alt Model Yeterli, Pro Kredini Yakma',
        summary:
          mode === 'quality'
            ? 'Maksimum Kalite seçili olsa da görev oldukça sade. Flash, Haiku veya GPT-4o mini ile aynı kaliteyi alıp Pro/Opus kotanı zor görevlere sakla.'
            : 'Tek adımlı ve düşük muhakeme gerektiren bir görev. Ücretsiz veya hafif alt modelle saniyeler içinde kredi israfı olmadan çözebilirsin.',
        creditAdvice: 'save_credits',
        detectedDomains,
        estimatedEffortScore: complexity.score,
      };
    }
    if (complexity.level === 'medium') {
      return {
        level: 'medium',
        label: 'Orta Efor',
        headline:
          mode === 'credit_saver'
            ? 'Orta Efor — Dengeli Ücretsiz / Hafif Alt Model Önerilir'
            : 'Orta Efor — Dengeli Alt Model Yeterli, Opus/Thinking Kredisine Gerek Yok',
        summary:
          'Net yapılandırma ve orta düzey analiz gerektiriyor. Sonnet 4, Gemini 2.5 Pro (Karbon) veya GPT-4o tek seferde temiz sonuç verir.',
        creditAdvice: 'balanced',
        detectedDomains,
        estimatedEffortScore: complexity.score,
      };
    }
    if (complexity.level === 'high') {
      return {
        level: 'high',
        label: 'Ağır Muhakeme',
        headline: 'Ağır Muhakeme — Pro / Thinking Alt Model Kredisi Harcamaya Değer',
        summary:
          'Yüksek doğruluk, mimari tutarlılık ve derin mantık gerektiriyor. Küçük modellerle defalarca düzeltme yapmak yerine güçlü bir alt modelle ilk seferde doğru sonuca ulaş.',
        creditAdvice: 'worth_pro',
        detectedDomains,
        estimatedEffortScore: complexity.score,
      };
    }
    return {
      level: 'expert',
      label: 'Uzman / Çok Aşamalı',
      headline: 'Çok Aşamalı Uzman Görev — Güçlü Alt Model + Combo İş Akışı Önerilir',
      summary:
        'Birden fazla uzmanlık alanını birleştiriyor. Görevi aşağıdaki Combo zincirine bölerek her adımda tam doğru alt modeli kullan.',
      creditAdvice: 'worth_pro',
      detectedDomains,
      estimatedEffortScore: complexity.score,
    };
  }

  // English
  if (complexity.level === 'low') {
    return {
      level: 'low',
      label: 'Low Effort',
      headline: 'Low Effort — Lightweight / Free Sub-Model Is Enough, Save Pro Credits',
      summary:
        mode === 'quality'
          ? 'Even in Max Quality mode, this task is straightforward. Flash, Haiku, or GPT-4o mini will match top quality without burning Pro/Opus credits.'
          : 'Single-step lightweight request. Solve it in seconds with a fast or free sub-model and zero credit waste.',
      creditAdvice: 'save_credits',
      detectedDomains,
      estimatedEffortScore: complexity.score,
    };
  }
  if (complexity.level === 'medium') {
    return {
      level: 'medium',
      label: 'Medium Effort',
      headline:
        mode === 'credit_saver'
          ? 'Medium Effort — Credit-Friendly Balanced Sub-Model Recommended'
          : 'Medium Effort — Balanced Sub-Model Suffices, Skip Opus/Thinking Quota',
      summary:
        'Needs clean structure and moderate reasoning. Sonnet 4, Gemini 2.5 Pro, or GPT-4o handles this cleanly in one pass.',
      creditAdvice: 'balanced',
      detectedDomains,
      estimatedEffortScore: complexity.score,
    };
  }
  if (complexity.level === 'high') {
    return {
      level: 'high',
      label: 'Heavy Reasoning',
      headline: 'Heavy Reasoning — Worth Spending Pro / Thinking Sub-Model Credits',
      summary:
        'Requires deep consistency and careful logic. Using a top reasoning sub-model upfront saves multiple failed retry loops.',
      creditAdvice: 'worth_pro',
      detectedDomains,
      estimatedEffortScore: complexity.score,
    };
  }
  return {
    level: 'expert',
    label: 'Expert / Multi-Step',
    headline: 'Multi-Step Expert Task — Use Top Sub-Models + Combo Pipeline',
    summary:
      'Combines multiple specialized domains. Split the work into the Combo pipeline below so each stage uses its ideal sub-model.',
    creditAdvice: 'worth_pro',
    detectedDomains,
    estimatedEffortScore: complexity.score,
  };
}

function buildStrategySection(
  cleanedPrompt: string,
  complexity: { level: ComplexityLevel; score: number; isMultiStep: boolean },
  domains: DomainSignal[],
  userBest: UserStackOption[],
  marketTop5: RankedModelItem[],
  lang: Language
): StrategySectionData {
  const shortTopic =
    cleanedPrompt.length > 96 ? `${cleanedPrompt.slice(0, 94)}...` : cleanedPrompt;

  const topUser = userBest[0];
  const topMarket = marketTop5[0];

  const finalVerdictLine = topUser
    ? lang === 'tr'
      ? `${topUser.name} (${topUser.tierLabel}) → "${topUser.subModelName}" alt modelini seç. ${topUser.subModelGuidance}`
      : `Use ${topUser.name} (${topUser.tierLabel}) → "${topUser.subModelName}". ${topUser.subModelGuidance}`
    : lang === 'tr'
    ? `Aktif planın yok — piyasa lideri ${topMarket.name} → "${topMarket.subModelName}" veya ücretsiz DeepSeek-V3 ile ilerle.`
    : `No active plan enabled — start with market #1 ${topMarket.name} → "${topMarket.subModelName}" or free DeepSeek-V3.`;

  if (!complexity.isMultiStep && complexity.level === 'low') {
    const eqNames = Array.from(
      new Set([
        ...userBest.slice(0, 3).map((u) => `${u.name} · ${u.subModelName}`),
        'Gemini 2.5 Flash (Hidrojen)',
        'GPT-4o mini',
        'DeepSeek-V3',
      ])
    ).slice(0, 4);

    return {
      mode: 'simple_equivalent',
      headline:
        lang === 'tr'
          ? 'Tek Adımda Çözüm — Hafif Alt Modeller Eşdeğer'
          : 'One-Step Solution — Lightweight Sub-Models Perform Equally Well',
      description:
        lang === 'tr'
          ? 'Bu görev için üst seviye Pro/Opus/Thinking kredisi harcamana gerek yok. Elindeki en hızlı ücretsiz veya hafif alt modeli açıp aşağıdaki düzeltilmiş promptu yapıştırman yeterli.'
          : 'No need to burn Pro/Opus/Thinking credits here. Open any lightweight/free sub-model below and paste the polished prompt.',
      equivalentModels: eqNames,
      finalVerdictLine,
    };
  }

  const pickModelForRole = (preferredIds: string[]) => {
    for (const id of preferredIds) {
      const owned = userBest.find((u) => u.toolId === id);
      if (owned) {
        return {
          toolId: owned.toolId,
          name: `${owned.name} (${owned.tierLabel})`,
          subModel: owned.subModelName,
          url: owned.url,
          fromUser: true,
        };
      }
    }
    if (userBest.length > 0) {
      const fb = userBest[0];
      return {
        toolId: fb.toolId,
        name: `${fb.name} (${fb.tierLabel})`,
        subModel: fb.subModelName,
        url: fb.url,
        fromUser: true,
      };
    }
    const mfb = marketTop5.find((m) => preferredIds.includes(m.toolId)) ?? marketTop5[0];
    return {
      toolId: mfb.toolId,
      name: `${mfb.name} (${mfb.recommendedTierLabel})`,
      subModel: mfb.subModelName,
      url: mfb.url,
      fromUser: false,
    };
  };

  const domainSet = new Set(domains.map((d) => d.domain));
  const steps: ComboStep[] = [];

  if (domainSet.has('visual')) {
    const planner = pickModelForRole(['chatgpt', 'claude', 'gemini']);
    const generator = pickModelForRole(['midjourney', 'chatgpt', 'gemini']);
    steps.push(
      {
        stepNumber: 1,
        title: lang === 'tr' ? 'Sanat Yönetimi & Sahne Tarifi' : 'Art Direction & Scene Blueprint',
        recommendedModelName: planner.name,
        recommendedSubModel: planner.subModel,
        recommendedToolId: planner.toolId,
        recommendedUrl: planner.url,
        isFromUserStack: planner.fromUser,
        rationale:
          lang === 'tr'
            ? 'Renk paleti, ışık açısı, doku ve kompozisyon detaylarını netleştirir.'
            : 'Clarifies palette, lighting, texture, and composition before image generation.',
        stepPrompt:
          lang === 'tr'
            ? `Şu görsel fikri için 3 farklı sanat yönetimi varyasyonu (ışık, renk paleti, kompozisyon) ve İngilizce görsel üretim promptu hazırla:\n"${shortTopic}"`
            : `Create 3 art-direction variations (lighting, palette, composition) and a ready-to-paste image prompt for:\n"${shortTopic}"`,
      },
      {
        stepNumber: 2,
        title: lang === 'tr' ? 'Nihai Görsel Üretimi' : 'Final Visual Rendering',
        recommendedModelName: generator.name,
        recommendedSubModel: generator.subModel,
        recommendedToolId: generator.toolId,
        recommendedUrl: generator.url,
        isFromUserStack: generator.fromUser,
        rationale:
          lang === 'tr'
            ? '1. adımdaki sahneyi en yüksek estetik doğrulukla üretir.'
            : 'Renders the refined concept with maximum aesthetic polish.',
        stepPrompt:
          lang === 'tr'
            ? '1. adımdan seçtiğin İngilizce promptu yapıştır; Midjourney kullanıyorsan "--ar 4:5 --stylize 250 --v 6.1" ekle.'
            : 'Paste your chosen prompt from Step 1; add "--ar 4:5 --stylize 250 --v 6.1" if using Midjourney.',
      }
    );
  } else if (domainSet.has('research') || domainSet.has('long_context')) {
    const researcher = pickModelForRole(['perplexity', 'notebooklm', 'gemini']);
    const synthesizer = pickModelForRole(['claude', 'chatgpt', 'gemini']);
    steps.push(
      {
        stepNumber: 1,
        title: lang === 'tr' ? 'Kaynak Tarama & Doğrulanmış Veri' : 'Source Gathering & Fact Extraction',
        recommendedModelName: researcher.name,
        recommendedSubModel: researcher.subModel,
        recommendedToolId: researcher.toolId,
        recommendedUrl: researcher.url,
        isFromUserStack: researcher.fromUser,
        rationale:
          lang === 'tr'
            ? 'Halüsinasyonsuz, tarih ve kaynak doğrulanmış ham verileri toplar.'
            : 'Collects grounded, citation-backed facts without hallucination.',
        stepPrompt:
          lang === 'tr'
            ? `Aşağıdaki konu hakkında en güncel verileri, somut rakamları ve karşılaştırmalı maddeleri kaynak URL'leriyle çıkar:\n"${shortTopic}"`
            : `Gather the latest verified data, concrete figures, and comparative points with source links for:\n"${shortTopic}"`,
      },
      {
        stepNumber: 2,
        title: lang === 'tr' ? 'Stratejik Sentez & Nihai Rapor' : 'Strategic Synthesis & Final Polish',
        recommendedModelName: synthesizer.name,
        recommendedSubModel: synthesizer.subModel,
        recommendedToolId: synthesizer.toolId,
        recommendedUrl: synthesizer.url,
        isFromUserStack: synthesizer.fromUser,
        rationale:
          lang === 'tr'
            ? 'Doğrulanmış notları okunabilir ve ikna edici nihai çıktıya dönüştürür.'
            : 'Turns raw research notes into a crisp, executive-ready deliverable.',
        stepPrompt:
          lang === 'tr'
            ? 'Aşağıdaki doğrulanmış notları kullanarak yönetici özeti, karşılaştırma tablosu ve 5 aksiyon maddesi üret. [1. Adım çıktısını yapıştır]'
            : 'Using the verified notes below, draft an executive summary, comparison table, and 5 action items. [Paste Step 1 output]',
      }
    );
  } else if (domainSet.has('coding')) {
    const architect = pickModelForRole(['claude', 'chatgpt', 'deepseek', 'gemini']);
    const builder = pickModelForRole(['cursor', 'claude', 'chatgpt', 'deepseek']);
    const reviewer = pickModelForRole(['deepseek', 'gemini', 'chatgpt']);
    steps.push(
      {
        stepNumber: 1,
        title: lang === 'tr' ? 'Mimari & Edge-Case Kilitleme' : 'Architecture & Edge-Case Spec',
        recommendedModelName: architect.name,
        recommendedSubModel: architect.subModel,
        recommendedToolId: architect.toolId,
        recommendedUrl: architect.url,
        isFromUserStack: architect.fromUser,
        rationale:
          lang === 'tr'
            ? 'Koda geçmeden veri şeması ve güvenlik sınırlarını netleştirip boşa refactor kredisi yakmanı önler.'
            : 'Locks down data schemas and security edge cases before coding to avoid costly refactors.',
        stepPrompt:
          lang === 'tr'
            ? `Kod yazmadan önce şu görev için veri modeli, klasör yapısı, güvenlik riskleri ve 5 kritik edge-case'i maddelerle tasarla:\n"${shortTopic}"`
            : `Before writing code, design the data model, folder layout, security risks, and top 5 edge cases for:\n"${shortTopic}"`,
      },
      {
        stepNumber: 2,
        title: lang === 'tr' ? 'Modüler & Tip Güvenli Kodlama' : 'Production-Ready Implementation',
        recommendedModelName: builder.name,
        recommendedSubModel: builder.subModel,
        recommendedToolId: builder.toolId,
        recommendedUrl: builder.url,
        isFromUserStack: builder.fromUser,
        rationale:
          lang === 'tr'
            ? 'Onaylanan plana birebir sadık kalarak temiz, çalışır kodu üretir.'
            : 'Implements clean, typed, production-ready code strictly following Step 1.',
        stepPrompt:
          lang === 'tr'
            ? 'Onaylanan şu mimari plana sadık kalarak tip güvenli ve hata yönetimli kodu yaz. [1. Adım planını yapıştır]'
            : 'Implement clean, type-safe code with error handling strictly following this architecture. [Paste Step 1 plan]',
      },
      {
        stepNumber: 3,
        title: lang === 'tr' ? 'Ekonomik Çapraz Kod Denetimi' : 'Low-Cost Cross-Model Code Review',
        recommendedModelName: reviewer.name,
        recommendedSubModel: reviewer.subModel,
        recommendedToolId: reviewer.toolId,
        recommendedUrl: reviewer.url,
        isFromUserStack: reviewer.fromUser,
        rationale:
          lang === 'tr'
            ? 'Farklı ve ekonomik bir alt modelle güvenlik/performans kör noktalarını yakalar.'
            : 'Catches blind spots and race conditions using an economical second model.',
        stepPrompt:
          lang === 'tr'
            ? 'Bu kodu güvenlik açıkları, yarış durumları ve performans darboğazları açısından denetle; yalnızca gerçek hataları listele. [2. Adım kodunu yapıştır]'
            : 'Audit this code for security flaws, race conditions, and bottlenecks; list only concrete bugs & fixes. [Paste Step 2 code]',
      }
    );
  } else {
    const strategist = pickModelForRole(['gemini', 'chatgpt', 'claude']);
    const finisher = pickModelForRole(['claude', 'chatgpt', 'gemini']);
    steps.push(
      {
        stepNumber: 1,
        title: lang === 'tr' ? 'Çerçeve & Taslak Çıkarımı' : 'Structure & Draft Angles',
        recommendedModelName: strategist.name,
        recommendedSubModel: strategist.subModel,
        recommendedToolId: strategist.toolId,
        recommendedUrl: strategist.url,
        isFromUserStack: strategist.fromUser,
        rationale:
          lang === 'tr'
            ? 'Ana mesajı ve alternatif yaklaşımları hızlıca masaya koyar.'
            : 'Quickly frames the core message and structural options.',
        stepPrompt:
          lang === 'tr'
            ? `Şu görev için hedef kitle, ana mesaj ve 3 farklı yapısal taslağı kısa maddelerle çıkar:\n"${shortTopic}"`
            : `Outline the target audience, core takeaway, and 3 structural drafts for:\n"${shortTopic}"`,
      },
      {
        stepNumber: 2,
        title: lang === 'tr' ? 'Üslup Cilalama & Nihai Çıktı' : 'Tone Polish & Final Delivery',
        recommendedModelName: finisher.name,
        recommendedSubModel: finisher.subModel,
        recommendedToolId: finisher.toolId,
        recommendedUrl: finisher.url,
        isFromUserStack: finisher.fromUser,
        rationale:
          lang === 'tr'
            ? 'Seçilen taslağı doğal, akıcı ve doğrudan kullanıma hazır hale getirir.'
            : 'Polishes the selected outline into crisp, natural final prose.',
        stepPrompt:
          lang === 'tr'
            ? 'Seçtiğim taslağı kullanarak gereksiz dolgulardan arınmış, doğal ve doğrudan kullanıma hazır nihai metni yaz. [1. Adım taslağını yapıştır]'
            : 'Turn my selected outline into natural, fluff-free, ready-to-use final copy. [Paste Step 1 outline]',
      }
    );
  }

  return {
    mode: 'combo_workflow',
    headline:
      lang === 'tr'
        ? `Akıllı Combo (Zincirleme) İş Akışı — ${steps.length} Adımda Maksimum Verim`
        : `Smart Combo Pipeline — ${steps.length} Focused Steps for Peak Efficiency`,
    description:
      lang === 'tr'
        ? 'Görevi tek bir devasa promptla tek modele yüklemek yerine uzman alt modellere bölmek hem kaliteyi artırır hem de pahalı Pro/Opus kredi tekrarlarını azaltır.'
        : 'Splitting multi-part work across specialized sub-models raises output quality while avoiding expensive Pro/Opus retry loops.',
    comboSteps: steps,
    finalVerdictLine,
  };
}

function generateModelAwarePrompt(
  cleanedPrompt: string,
  modelName: string,
  subModelName: string,
  promptStyle: AIToolDefinition['promptStyle'],
  domains: DomainSignal[],
  complexity: ComplexityLevel,
  mode: PriorityMode,
  lang: Language
): { formatStyleLabel: string; whyThisFormat: string; enhancedPrompt: string } {
  const primaryDomain =
    lang === 'tr'
      ? domains[0]?.labelTr ?? 'Genel Görev'
      : domains[0]?.labelEn ?? 'General Task';

  const directive =
    lang === 'tr'
      ? mode === 'speed'
        ? 'Gereksiz giriş/çıkış cümlelerini atla, doğrudan uygulanabilir ve özlü sonuç ver.'
        : mode === 'credit_saver'
        ? 'Tek yanıtta eksiksiz ve ek takip sorusu gerektirmeyecek kadar net bir çıktı üret (mesaj kotasını koru).'
        : 'Derinlemesine düşün, uç durumları (edge-case) gözden kaçırma ve en yüksek kalite standardında üret.'
      : mode === 'speed'
      ? 'Skip filler intro/outro text; deliver concise, immediately actionable output.'
      : mode === 'credit_saver'
      ? 'Deliver a complete, self-contained answer in a single turn to minimize follow-up credit usage.'
      : 'Think thoroughly, cover edge cases, and aim for production-grade quality.';

  if (lang === 'en') {
    switch (promptStyle) {
      case 'claude_xml':
        return {
          formatStyleLabel: `Claude XML Structured Format (${subModelName})`,
          whyThisFormat:
            'Claude sub-models follow XML-delimited sections (<role>, <task>, <constraints>) with exceptional precision.',
          enhancedPrompt: `<role>
You are a senior specialist in ${primaryDomain}. You produce crisp, structured, immediately usable solutions.
</role>

<task>
${cleanedPrompt}
</task>

<constraints>
- ${directive}
- State any assumptions briefly at the very top.
- Use concrete examples, clear headings, and actionable steps.${
            complexity === 'high' || complexity === 'expert'
              ? '\n- Summarize the top 3 risks and key design trade-offs before presenting the final solution.'
              : ''
          }
</constraints>

<output_format>
1. Brief Approach Summary
2. Main Solution (clean, structured, ready to use)
3. Quick Verification Checklist
</output_format>`,
        };

      case 'gemini_structured':
        return {
          formatStyleLabel: `Gemini Structured Markdown + Output Schema (${subModelName})`,
          whyThisFormat:
            'Gemini sub-models respond most accurately to a clear expert persona, bold Markdown headers, and explicit output schema.',
          enhancedPrompt: `**Role:** Act as a senior consultant and practitioner in ${primaryDomain}.

**Task:**
${cleanedPrompt}

**Priorities & Guardrails:**
- ${directive}
- Avoid fluff; every bullet must be directly actionable.
- Use a clean Markdown table whenever comparing options or metrics.

**Required Output Structure:**
### 1. Executive Summary
### 2. Detailed Solution
### 3. Key Risks & Recommended Next Step`,
        };

      case 'chatgpt_spec':
        return {
          formatStyleLabel: `ChatGPT Task Spec + Self-Check (${subModelName})`,
          whyThisFormat:
            'OpenAI models perform best with numbered execution rules and an explicit final self-check section.',
          enhancedPrompt: `Role: Senior ${primaryDomain} Expert

Objective:
"${cleanedPrompt}"

Execution Rules:
1. ${directive}
2. Provide concrete, ready-to-use output instead of generic advice.
3. Briefly justify key decisions in one sentence.

Output Format:
- 2-sentence overview
- Structured main deliverable with clear headings
- "Edge-Case & Quality Check" (3 concise checkpoints at the end)`,
        };

      case 'perplexity_research':
        return {
          formatStyleLabel: `Perplexity Citation-First Research Query (${subModelName})`,
          whyThisFormat:
            'Specifying recency, source quality, and a comparison table helps Perplexity pull the strongest live references.',
          enhancedPrompt: `Run an up-to-date, citation-backed research brief on the following topic:

Topic: ${cleanedPrompt}

Source & Scope Rules:
- Prioritize official documentation, 2025–2026 primary reports, and reputable industry sources.
- Attach clickable source citations to every key claim and figure.
- ${directive}

Output Format:
1. Key Findings (3–4 bullets)
2. Comparative Table (Criteria | Details | Source)
3. Practical Takeaways & Caveats`,
        };

      case 'midjourney_visual':
        return {
          formatStyleLabel: `Midjourney Visual Art & Parameters (${subModelName})`,
          whyThisFormat:
            'Midjourney excels with vivid visual descriptors (subject, lighting, lens, mood) plus aspect & stylize flags.',
          enhancedPrompt: `/imagine prompt: Editorial high-craft visual concept for: ${cleanedPrompt} — soft daylight studio atmosphere, balanced baby-blue and periwinkle palette with delicate pink accent highlights, crisp composition, ultra-clean textures, soft atmospheric depth, shot on 85mm lens --ar 4:5 --stylize 250 --v 6.1`,
        };

      case 'deepseek_reasoning':
        return {
          formatStyleLabel: `DeepSeek Analytical Reasoning Spec (${subModelName})`,
          whyThisFormat:
            'Explicit decomposition and verification steps unlock peak mathematical and algorithmic accuracy in DeepSeek.',
          enhancedPrompt: `Task (${primaryDomain}):
${cleanedPrompt}

Reasoning Instructions:
- Break the problem into core components and identify edge cases first.
- ${directive}
- If code, formulas, or calculations are involved, verify them with a concrete sanity check.
- Present the final answer cleanly and ready to copy.`,
        };

      default:
        return {
          formatStyleLabel: `${subModelName} Structured Expert Prompt`,
          whyThisFormat:
            'Clarifies role, cleaned task intent, constraints, and output layout for one-shot accuracy.',
          enhancedPrompt: `Role: ${primaryDomain} Expert
Task: ${cleanedPrompt}

Constraints:
- ${directive}
- Deliver concrete, immediately usable results.

Output Format:
1. Summary
2. Main Deliverable
3. Suggested Next Step`,
        };
    }
  }

  // Turkish prompts
  switch (promptStyle) {
    case 'claude_xml':
      return {
        formatStyleLabel: `Claude XML Yapılandırılmış Format (${subModelName})`,
        whyThisFormat:
          'Claude alt modelleri `<role>`, `<task>`, `<constraints>` gibi XML etiketleriyle ayrılmış yönergeleri yüksek sadakatle izler.',
        enhancedPrompt: `<role>
Sen ${primaryDomain} alanında kıdemli bir uzmansın. Temiz, yapılandırılmış ve doğrudan uygulanabilir çözümler üretirsin.
</role>

<task>
${cleanedPrompt}
</task>

<constraints>
- ${directive}
- Varsayım yapman gerekiyorsa yanıtın en başında kısaca listele.
- Somut örnekler, net başlıklar ve uygulanabilir adımlar kullan.${
          complexity === 'high' || complexity === 'expert'
            ? '\n- Nihai çözüme geçmeden önce kritik riskleri ve tasarım kararlarını 3 maddede özetle.'
            : ''
        }
</constraints>

<output_format>
1. Kısa Yaklaşım Özeti
2. Ana Çözüm (yapılandırılmış ve doğrudan kullanılabilir)
3. Kontrol Listesi & İyileştirme Önerileri
</output_format>`,
      };

    case 'gemini_structured':
      return {
        formatStyleLabel: `Gemini Markdown Persona + Çıktı Şeması (${subModelName})`,
        whyThisFormat:
          'Gemini alt modelleri net bir uzman rolü, kalın Markdown başlıkları ve açık çıktı şeması verildiğinde bağlamı çok keskin işler.',
        enhancedPrompt: `**Rol:** ${primaryDomain} konusunda uzman bir danışman ve uygulayıcı gibi davran.

**Görev:**
${cleanedPrompt}

**Öncelik ve Kısıtlar:**
- ${directive}
- Bilgi kirliliği yaratma; her madde doğrudan uygulanabilir olsun.
- Karşılaştırma veya çoklu seçenek varsa Markdown tablosu kullan.

**İstenen Çıktı Yapısı:**
### 1. Hızlı Özet
### 2. Detaylı Çözüm
### 3. Dikkat Edilmesi Gerekenler & Sonraki Adım`,
      };

    case 'chatgpt_spec':
      return {
        formatStyleLabel: `ChatGPT Görev Şartnamesi + Öz-Denetim (${subModelName})`,
        whyThisFormat:
          'OpenAI alt modelleri numaralı kurallar ve yanıt sonu öz-kontrol listesi verildiğinde en tutarlı sonucu üretir.',
        enhancedPrompt: `Rol: Kıdemli ${primaryDomain} Uzmanı

Amaç:
"${cleanedPrompt}"

Çalışma Kuralları:
1. ${directive}
2. Yüzeysel genellemeler yerine somut, doğrudan kullanıma hazır çıktı üret.
3. Önemli kararların gerekçesini tek cümleyle açıkla.

Çıktı Formatı:
- Önce 2 cümlelik özet
- Ardından net başlıklarla yapılandırılmış ana çıktı
- En sonda "Eksik / Risk Kontrolü" altında 3 kısa kontrol maddesi`,
      };

    case 'perplexity_research':
      return {
        formatStyleLabel: `Perplexity Kaynak Odaklı Araştırma Sorgusu (${subModelName})`,
        whyThisFormat:
          'Zaman aralığı, kaynak kalitesi ve tablo formatı belirtmek Perplexity alt modellerinden en güvenilir referansları getirir.',
        enhancedPrompt: `Aşağıdaki konuda güncel ve doğrulanabilir kaynaklara dayalı derin bir araştırma yap:

Araştırma Konusu: ${cleanedPrompt}

Kaynak ve Kapsam Kuralları:
- Öncelikle resmi dokümanlar, 2025–2026 güncel raporları ve güvenilir sektör kaynaklarını kullan.
- Her temel veriyi tıklanabilir kaynak linkiyle destekle.
- ${directive}

Çıktı Formatı:
1. Yönetici Özeti (3–4 madde)
2. Karşılaştırmalı Veri Tablosu (Kriter | Detay | Kaynak)
3. Öne Çıkan Riskler ve Pratik Çıkarımlar`,
      };

    case 'midjourney_visual':
      return {
        formatStyleLabel: `Midjourney Görsel Kompozisyon & Parametreler (${subModelName})`,
        whyThisFormat:
          'Midjourney, sohbet cümlesi yerine görsel tarifler (ışık, kamera, palet, doku) ve --ar/--stylize parametreleriyle en iyi sonucu verir.',
        enhancedPrompt: `/imagine prompt: Editorial ultra-detailed visual concept for: ${cleanedPrompt} — soft sky daylight studio aesthetic, balanced baby-blue and periwinkle palette with delicate pink accent touches, crisp micro-textures, clean composition, shot on 85mm lens --ar 4:5 --stylize 250 --v 6.1

[İpucu: Yatay afiş için --ar 16:9, kare sosyal medya için --ar 1:1 kullanabilirsin.]`,
      };

    case 'deepseek_reasoning':
      return {
        formatStyleLabel: `DeepSeek Analitik Muhakeme Formatı (${subModelName})`,
        whyThisFormat:
          'DeepSeek alt modelleri net sınır durumları ve sağlamasını yapma talimatı verildiğinde teknik doğrulukta zirveye çıkar.',
        enhancedPrompt: `Görev (${primaryDomain}):
${cleanedPrompt}

Çözüm Yönergeleri:
- Problemi önce temel bileşenlerine ayır ve olası sınır durumlarını tespit et.
- ${directive}
- Kod, formül veya hesaplama varsa somut bir örnekle sağlamasını yap.
- Çıktıyı sade, net ve doğrudan kopyalanabilir formatta sun.`,
      };

    default:
      return {
        formatStyleLabel: `${subModelName} Yapılandırılmış Uzman Promptu`,
        whyThisFormat:
          'Rol, temizlenmiş görev amacı, kısıtlar ve çıktı şemasını netleştirerek ilk seferde isabetli sonuç almanı sağlar.',
        enhancedPrompt: `Rol: ${primaryDomain} Uzmanı
Görev: ${cleanedPrompt}

Kısıtlar:
- ${directive}
- Somut, net ve doğrudan kullanılabilir çıktı üret.

Çıktı Formatı:
1. Kısa Özet
2. Ana Çözüm
3. Sonraki Önerilen Adım`,
      };
  }
}

export function runLocalAnalysis(
  rawPrompt: string,
  priorityMode: PriorityMode,
  userPlans: UserPlanSelection[],
  lang: Language
): AnalysisResult {
  // 0. Clean & fix typos/phrasing first!
  const cleanedResult = cleanAndFixPrompt(rawPrompt, lang);
  const workingPrompt = cleanedResult.cleaned;

  const catalog = getAllCatalogTools(userPlans);
  const domains = detectDomains(workingPrompt);
  const complexity = assessComplexity(workingPrompt, domains);

  // 1. Market Top 5 (with exact sub-model recommendations)
  const marketScored: RankedModelItem[] = catalog
    .map((tool) => {
      const idealTier =
        priorityMode === 'credit_saver'
          ? tool.tiers.find((t) => !t.isPaid) ?? tool.tiers[0]
          : tool.tiers[tool.tiers.length - 1];
      const { chosen: subModel } = pickSubModelForTool(
        tool,
        complexity.level,
        priorityMode,
        lang,
        idealTier
      );
      const score = scoreToolForTask(tool, domains, complexity.level, priorityMode, idealTier);
      return {
        toolId: tool.id,
        name: tool.name,
        subModelName: subModel.name,
        provider: tool.provider,
        recommendedTierLabel: getTierLabel(idealTier, lang),
        url: tool.url,
        score,
        accentColor: tool.accentColor,
        reasons: buildReasonsForTool(tool, subModel, domains, priorityMode, lang),
        isPaidTier: idealTier.isPaid,
        promptStyle: tool.promptStyle,
      };
    })
    .filter((item) => item.score > 25)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  // 2. User's Active Stack (strictly enabled & !quotaReached + exact sub-model & guidance)
  const quotaSkippedModels: QuotaSkippedNotice[] = [];
  const activeUserOptions: UserStackOption[] = [];

  for (const selection of userPlans) {
    if (!selection.enabled) continue;
    const tool = catalog.find((t) => t.id === selection.toolId);
    if (!tool) continue;

    const { tier, label: tierLabel } = resolveTier(tool, lang, selection);

    if (selection.quotaReached) {
      quotaSkippedModels.push({
        toolId: tool.id,
        name: tool.name,
        tierLabel,
      });
      continue;
    }

    const score = scoreToolForTask(tool, domains, complexity.level, priorityMode, tier);
    if (score <= 25 && tool.id === 'midjourney') continue;

    const { chosen: subModel, guidance } = pickSubModelForTool(
      tool,
      complexity.level,
      priorityMode,
      lang,
      tier,
      selection
    );

    const creditCostLabel =
      lang === 'tr'
        ? !tier.isPaid
          ? '0 Pro Kredi (Ücretsiz)'
          : subModel.effort === 'light'
          ? 'Düşük Kota (Hafif Alt Model)'
          : subModel.effort === 'balanced'
          ? 'Dengeli Pro Kredi'
          : 'Yüksek Pro/Thinking Kredi'
        : !tier.isPaid
        ? '0 Pro Credits (Free)'
        : subModel.effort === 'light'
        ? 'Low Quota (Light Sub-Model)'
        : subModel.effort === 'balanced'
        ? 'Balanced Pro Credit'
        : 'Heavy Pro/Thinking Credit';

    activeUserOptions.push({
      toolId: tool.id,
      name: tool.name,
      subModelName: subModel.name,
      subModelGuidance: guidance,
      tierLabel,
      url: tool.url,
      score,
      accentColor: tool.accentColor,
      reasons: buildReasonsForTool(tool, subModel, domains, priorityMode, lang),
      planConstraintNote: buildPlanConstraintNote(tool, tier, domains, complexity.level, lang),
      creditCostLabel,
      promptStyle: tool.promptStyle,
    });
  }

  activeUserOptions.sort((a, b) => b.score - a.score);

  // 3. Complexity Badge
  const complexityBadge = buildComplexityBadge(complexity, domains, priorityMode, lang);

  // 4. Smart Strategy & Combo
  const strategy = buildStrategySection(
    workingPrompt,
    complexity,
    domains,
    activeUserOptions,
    marketScored,
    lang
  );

  // 5. Typo-Fixing & Model-Aware Prompt Enhancer
  const primaryTarget = activeUserOptions[0]
    ? {
        toolId: activeUserOptions[0].toolId,
        name: activeUserOptions[0].name,
        subModelName: activeUserOptions[0].subModelName,
        url: activeUserOptions[0].url,
        tierLabel: activeUserOptions[0].tierLabel,
        promptStyle: activeUserOptions[0].promptStyle,
      }
    : {
        toolId: marketScored[0].toolId,
        name: marketScored[0].name,
        subModelName: marketScored[0].subModelName,
        url: marketScored[0].url,
        tierLabel: marketScored[0].recommendedTierLabel,
        promptStyle: marketScored[0].promptStyle,
      };

  const primaryEnhanced = generateModelAwarePrompt(
    workingPrompt,
    primaryTarget.name,
    primaryTarget.subModelName,
    primaryTarget.promptStyle,
    domains,
    complexity.level,
    priorityMode,
    lang
  );

  let marketTopAlternative: EnhancedPromptData['marketTopAlternative'] | undefined;
  if (
    activeUserOptions[0] &&
    marketScored[0] &&
    (activeUserOptions[0].toolId !== marketScored[0].toolId ||
      activeUserOptions[0].subModelName !== marketScored[0].subModelName)
  ) {
    const marketAlt = generateModelAwarePrompt(
      workingPrompt,
      marketScored[0].name,
      marketScored[0].subModelName,
      marketScored[0].promptStyle,
      domains,
      complexity.level,
      priorityMode,
      lang
    );
    marketTopAlternative = {
      targetToolId: marketScored[0].toolId,
      targetModelName: marketScored[0].name,
      targetSubModelName: marketScored[0].subModelName,
      targetUrl: marketScored[0].url,
      formatStyleLabel: marketAlt.formatStyleLabel,
      enhancedPrompt: marketAlt.enhancedPrompt,
    };
  }

  return {
    id: `analysis_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    language: lang,
    priorityMode,
    engineSource: 'smart_local',
    complexityBadge,
    marketTop5: marketScored,
    userBestOptions: activeUserOptions,
    quotaSkippedModels,
    strategy,
    promptEnhancer: {
      targetToolId: primaryTarget.toolId,
      targetModelName: primaryTarget.name,
      targetSubModelName: primaryTarget.subModelName,
      targetUrl: primaryTarget.url,
      targetTierLabel: primaryTarget.tierLabel,
      formatStyleLabel: primaryEnhanced.formatStyleLabel,
      whyThisFormat: primaryEnhanced.whyThisFormat,
      originalInput: cleanedResult.original,
      cleanedInput: cleanedResult.cleaned,
      typoFixesCount: cleanedResult.fixes.length,
      typoFixesList: cleanedResult.fixes,
      enhancedPrompt: primaryEnhanced.enhancedPrompt,
      marketTopAlternative,
    },
  };
}

export async function analyzeUserTask(
  prompt: string,
  priorityMode: PriorityMode,
  userPlans: UserPlanSelection[],
  lang: Language,
  liveApiConfig?: LiveApiConfig
): Promise<AnalysisResult> {
  const localResult = runLocalAnalysis(prompt, priorityMode, userPlans, lang);

  if (!liveApiConfig?.enabled || !liveApiConfig.apiKey.trim()) {
    await new Promise((resolve) => setTimeout(resolve, 360));
    return localResult;
  }

  try {
    const langInstruction = lang === 'tr' ? 'Türkçe' : 'English';
    const systemPrompt = `You are WhichAI, an expert AI Router and Prompt Engineer.
1. First fix all typos, grammar mistakes, and awkward phrasing in the user's input.
2. Rewrite it into a crystal-clear, structured prompt optimized for the target sub-model.
Respond ONLY with valid JSON in ${langInstruction}:
{
  "cleanedInput": "string",
  "complexityHeadline": "string",
  "complexitySummary": "string",
  "enhancedPrompt": "string"
}`;

    const userContext = `Raw Task: ${prompt}
Priority Mode: ${priorityMode}
Target Sub-Model: ${localResult.promptEnhancer.targetModelName} -> ${localResult.promptEnhancer.targetSubModelName} (${localResult.promptEnhancer.formatStyleLabel})`;

    let rawText = '';

    if (liveApiConfig.provider === 'gemini') {
      const model = liveApiConfig.modelName?.trim() || 'gemini-2.5-flash';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        model
      )}:generateContent?key=${encodeURIComponent(liveApiConfig.apiKey.trim())}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\n${userContext}` }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      });
      if (!res.ok) throw new Error('Gemini API error');
      const data = await res.json();
      rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    } else {
      const base = (liveApiConfig.baseUrl?.trim() || 'https://api.openai.com/v1').replace(/\/$/, '');
      const model = liveApiConfig.modelName?.trim() || 'gpt-4o-mini';
      const res = await fetch(`${base}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${liveApiConfig.apiKey.trim()}`,
        },
        body: JSON.stringify({
          model,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContext },
          ],
        }),
      });
      if (!res.ok) throw new Error('OpenAI-compatible API error');
      const data = await res.json();
      rawText = data?.choices?.[0]?.message?.content ?? '';
    }

    const parsed = JSON.parse(rawText);
    return {
      ...localResult,
      engineSource: 'live_llm',
      complexityBadge: {
        ...localResult.complexityBadge,
        headline: parsed.complexityHeadline || localResult.complexityBadge.headline,
        summary: parsed.complexitySummary || localResult.complexityBadge.summary,
      },
      promptEnhancer: {
        ...localResult.promptEnhancer,
        cleanedInput: parsed.cleanedInput || localResult.promptEnhancer.cleanedInput,
        enhancedPrompt: parsed.enhancedPrompt || localResult.promptEnhancer.enhancedPrompt,
      },
    };
  } catch {
    return localResult;
  }
}
