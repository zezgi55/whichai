import {
  AIToolDefinition,
  AnalysisResult,
  ComboStep,
  ComplexityLevel,
  EnhancedPromptData,
  LiveApiConfig,
  PlanTierOption,
  PriorityMode,
  QuotaSkippedNotice,
  RankedModelItem,
  StrategySectionData,
  TaskDomain,
  UserPlanSelection,
  UserStackOption,
} from '../types';
import { DEFAULT_AI_CATALOG } from '../data/aiCatalog';

interface DomainSignal {
  domain: TaskDomain;
  labelTr: string;
  weight: number;
}

const DOMAIN_KEYWORDS: Record<TaskDomain, { labelTr: string; keywords: string[] }> = {
  coding: {
    labelTr: 'Kodlama & Yazılım Mimarisi',
    keywords: [
      'kod', 'code', 'react', 'next.js', 'nextjs', 'typescript', 'javascript', 'python', 'sql',
      'api', 'backend', 'frontend', 'bug', 'hata', 'refactor', 'mimari', 'architecture', 'database',
      'postgresql', 'docker', 'kubernetes', 'saas', 'webhook', 'fonksiyon', 'algoritma', 'script',
      'html', 'css', 'tailwind', 'git', 'test', 'unit test', 'deploy', 'node', 'java', 'c#', 'rust',
      'uygulama', 'app', 'servis', 'veritabanı', 'endpoint', 'auth', 'jwt', 'stripe',
    ],
  },
  research: {
    labelTr: 'Güncel Web & Literatür Araştırması',
    keywords: [
      'araştır', 'research', 'güncel', '2025', '2026', 'kaynak', 'kaynakça', 'makale', 'literatür',
      'rakip', 'pazar', 'trend', 'karşılaştır', 'compare', 'fiyat', 'haber', 'istatistik', 'rapor',
      'regülasyon', 'yasa', 'sektör', 'analiz et', 'incele', 'benchmark', 'web', 'doğrula',
    ],
  },
  visual: {
    labelTr: 'Görsel Üretim & Tasarım',
    keywords: [
      'görsel', 'resim', 'fotoğraf', 'image', 'photo', 'afiş', 'poster', 'logo', 'illüstrasyon',
      'illustration', 'midjourney', 'render', '3d', 'konsept', 'tasarım', 'sinematik', 'reklam görseli',
      'kapak', 'thumbnail', 'estetik', 'şişe', 'ürün çekimi', 'wallpaper', 'ui tasarım', 'mockup',
    ],
  },
  long_context: {
    labelTr: 'Uzun Doküman & PDF Analizi',
    keywords: [
      'pdf', 'doküman', 'belge', 'sayfa', 'sayfalık', 'kitap', 'tez', 'sözleşme', 'transkript',
      'video', 'toplantı kaydı', 'ders notu', 'raporunu', 'özetle', 'dosya', 'ekli', 'uzun metin',
      'tüm proje', 'repo', 'codebase', 'klasör', 'yüzlerce',
    ],
  },
  data_math: {
    labelTr: 'Veri Analizi & Matematik',
    keywords: [
      'excel', 'csv', 'tablo', 'grafik', 'matematik', 'formül', 'istatistik', 'olasılık', 'finans',
      'bütçe', 'hesapla', 'modelleme', 'regresyon', 'veri', 'data', 'pandas', 'ekonometri', 'türev',
      'integral', 'optimizasyon', 'roi', 'metrik', 'kpi',
    ],
  },
  writing: {
    labelTr: 'İçerik & Yaratıcı Yazım',
    keywords: [
      'yaz', 'makale', 'blog', 'hikaye', 'senaryo', 'metin', 'copywriting', 'reklam metni', 'linkedin',
      'instagram', 'tweet', 'sunum', 'pitch', 'yatırımcı', 'bülten', 'newsletter', 'kampanya', 'ton',
      'ikna', 'şiir', 'slogan', 'ürün açıklaması', 'cv', 'özgeçmiş', 'ön yazı',
    ],
  },
  simple_edit: {
    labelTr: 'Hızlı Metin / Çeviri / Düzenleme',
    keywords: [
      'çevir', 'translate', 'ingilizceye', 'türkçeye', 'düzelt', 'imla', 'gramer', 'kısalt',
      'mail', 'e-posta', 'email', 'mesaj', 'kibar', 'resmi', 'basitçe', 'özet', 'madde madde',
      'başlık öner', 'yeniden yaz', 'paraphrase',
    ],
  },
  reasoning: {
    labelTr: 'Derin Muhakeme & Problem Çözme',
    keywords: [
      'neden', 'strateji', 'mimari', 'tasarla', 'trade-off', 'avantaj', 'dezavantaj', 'karmaşık',
      'güvenlik', 'ölçeklenebilir', 'idempotency', 'optimizasyon', 'karar', 'kök neden', 'root cause',
      'senaryo analizi', 'risk', 'kritik', 'sistem tasarımı', 'system design', 'derin',
    ],
  },
  strategy: {
    labelTr: 'Çok Aşamalı Plan & Strateji',
    keywords: [
      'plan', 'yol haritası', 'roadmap', 'iş planı', 'launch', 'lansman', 'girişim', 'startup',
      'büyüme', 'growth', 'pazarlama stratejisi', 'adım adım', 'süreç', 'workflow', 'iş akışı',
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

function resolveTier(tool: AIToolDefinition, selection?: UserPlanSelection): { tier: PlanTierOption; label: string } {
  if (!selection) {
    const fallback = tool.tiers[0];
    return { tier: fallback, label: fallback.label };
  }
  const found = tool.tiers.find((t) => t.id === selection.tierId) ?? tool.tiers[0];
  const label = selection.customTierName?.trim() ? selection.customTierName.trim() : found.label;
  return { tier: found, label };
}

function detectDomains(prompt: string): DomainSignal[] {
  const lower = prompt.toLocaleLowerCase('tr-TR');
  const results: DomainSignal[] = [];

  (Object.keys(DOMAIN_KEYWORDS) as TaskDomain[]).forEach((domain) => {
    const { labelTr, keywords } = DOMAIN_KEYWORDS[domain];
    let hits = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        hits += kw.includes(' ') ? 2 : 1;
      }
    }
    if (hits > 0) {
      results.push({ domain, labelTr, weight: hits });
    }
  });

  if (results.length === 0) {
    results.push({
      domain: prompt.length < 95 ? 'simple_edit' : 'writing',
      labelTr: prompt.length < 95 ? 'Genel Hızlı Soru' : 'Genel İçerik & Analiz',
      weight: 1,
    });
  }

  return results.sort((a, b) => b.weight - a.weight);
}

function assessComplexity(prompt: string, domains: DomainSignal[]): {
  level: ComplexityLevel;
  score: number;
  isMultiStep: boolean;
} {
  const lower = prompt.toLocaleLowerCase('tr-TR');
  const wordCount = prompt.trim().split(/\s+/).length;

  const multiStepSignals = [
    've ', 'ardından', 'sonra', 'önce', 'hem ', 'hem de', 'adım adım', 'tasarla',
    'karşılaştır', 'tablo çıkar', 'rapor', 'mimari', 'kodunu yaz', 'strateji', 'planla',
  ];
  const multiHits = multiStepSignals.filter((s) => lower.includes(s)).length;

  const domainSet = new Set(domains.map((d) => d.domain));
  const heavyDomains = ['coding', 'reasoning', 'research', 'data_math', 'long_context', 'strategy'];
  const heavyCount = heavyDomains.filter((d) => domainSet.has(d as TaskDomain)).length;

  let score = 22;
  score += Math.min(28, wordCount * 1.15);
  score += heavyCount * 14;
  score += multiHits * 7;

  // Penalize score if strictly simple edit / short translation
  if (
    domains[0].domain === 'simple_edit' &&
    heavyCount === 0 &&
    wordCount < 28 &&
    multiHits <= 1
  ) {
    score = Math.min(score, 28);
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
      ((domainSet.has('research') && (domainSet.has('writing') || domainSet.has('coding') || domainSet.has('strategy'))) ||
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

  // Filter out pure visual tool for non-visual prompts
  if (tool.id === 'midjourney' && !domains.some((d) => d.domain === 'visual')) {
    return 12;
  }

  // Apply tier boost if evaluating a specific user tier
  if (tier) {
    raw += tier.qualityBoost * (complexity === 'low' ? 0.2 : 0.65);
  }

  // Apply priority mode adjustments
  if (mode === 'speed') {
    raw = raw * 0.66 + s.speed * 0.34;
    if (tier && tier.creditWeight === 3) raw -= 0.4; // Ultra/Max slower
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
    // quality mode
    if (complexity === 'high' || complexity === 'expert') {
      raw = raw * 0.8 + s.reasoning * 0.2;
      if (tier?.isPaid) raw += 0.45;
    }
  }

  // Normalize roughly to 52 - 99
  const normalized = Math.round(Math.max(45, Math.min(99, raw * 9.35)));
  return normalized;
}

function buildReasonsForTool(
  tool: AIToolDefinition,
  domains: DomainSignal[],
  mode: PriorityMode,
  complexity: ComplexityLevel,
  tierLabel: string
): string[] {
  const primary = domains[0]?.domain ?? 'writing';
  const reasons: string[] = [];

  if (tool.id === 'claude') {
    if (primary === 'coding') reasons.push('Temiz mimari, düşük hata oranı ve okunabilir kod üretiminde sektör lideri.');
    else if (primary === 'writing') reasons.push('Doğal, akıcı ve robotik olmayan üslupta en dengeli metin kalitesini sunar.');
    else reasons.push('Adım adım yapılandırılmış muhakeme ve nüanslı talimat takibinde çok güçlü.');
  } else if (tool.id === 'gemini') {
    if (primary === 'long_context') reasons.push('1M+ token dev bağlam penceresiyle uzun PDF, doküman ve proje analizinde rakipsiz.');
    else if (primary === 'research') reasons.push('Google arama ekosistemi ve Deep Research entegrasyonuyla hızlı bilgi sentezler.');
    else reasons.push('Hız, çoklu ortam (görsel/dosya) ve yüksek kaliteyi en dengeli sunan ekosistem.');
  } else if (tool.id === 'chatgpt') {
    if (primary === 'reasoning' || primary === 'data_math') reasons.push('Gelişmiş muhakeme ve kod yorumlayıcı (veri analizi) kabiliyetinde son derece güçlü.');
    else if (primary === 'visual') reasons.push('Doğal dilde tarif edilen görselleri ve metin içeren afişleri yüksek tutarlılıkla üretir.');
    else reasons.push('Çok yönlü görev yönetimi, yapılandırılmış çıktı ve uçtan uca problem çözmede çok kararlı.');
  } else if (tool.id === 'perplexity') {
    reasons.push('Canlı web taraması yapar ve her iddiayı tıklanabilir güncel kaynaklarla doğrular.');
    if (mode === 'speed') reasons.push('Araştırma + özetleme süresini saniyelere indirerek zaman kazandırır.');
  } else if (tool.id === 'deepseek') {
    reasons.push('Algoritma, matematik ve teknik muhakemede Pro modellere yakın performansı ücretsiz/çok düşük maliyetle verir.');
    if (mode === 'credit_saver') reasons.push('Ücretli Pro abonelik kredilerini korurken yüksek mantıksal doğruluk sağlar.');
  } else if (tool.id === 'midjourney') {
    reasons.push('Işık, kompozisyon, doku ve sanatsal estetik kalitesinde piyasadaki en üst seviye görsel motoru.');
    reasons.push('Parametre kontrolü (--ar, --stylize) ile reklam ve konsept kalitesinde sonuç verir.');
  } else if (tool.id === 'cursor') {
    reasons.push('Tüm proje dosyalarını indeksleyerek bağlam kaybı olmadan çoklu dosya kod düzenlemesi yapar.');
  } else if (tool.id === 'notebooklm') {
    reasons.push('Yalnızca yüklediğin belgelere bağlı kalarak halüsinasyonu neredeyse sıfıra indirir.');
  } else if (tool.id === 'grok') {
    reasons.push('Anlık gündem, sosyal medya akışları ve hızlı bilgi taramasında yüksek güncellik sunar.');
  } else {
    reasons.push(`${tool.tagline || 'Özel tanımlı yapay zeka aracın'} bu görev profiliyle uyumlu.`);
  }

  if (mode === 'speed' && tool.scores.speed >= 9) {
    reasons.push('Düşük yanıt gecikmesiyle Hız Odaklı mod için ideal.');
  } else if (mode === 'credit_saver' && tool.scores.valueFree >= 8.5) {
    reasons.push('Kredi Tasarrufu modunda ücretli limitlerini yakmadan yüksek verim sağlar.');
  } else if (complexity === 'high' || complexity === 'expert') {
    reasons.push(`${tierLabel} katmanı karmaşık gereksinimleri tek seferde karşılama şansını artırır.`);
  } else {
    reasons.push(`${tierLabel} seviyesi bu görevin karmaşıklığı için yeterli ve pratik.`);
  }

  return reasons.slice(0, 2);
}

function buildPlanConstraintNote(
  tool: AIToolDefinition,
  tier: PlanTierOption,
  domains: DomainSignal[],
  complexity: ComplexityLevel
): string | undefined {
  const domainSet = new Set(domains.map((d) => d.domain));

  if (!tier.isPaid && domainSet.has('long_context')) {
    return `${tool.name} ${tier.label} planında büyük dosya/PDF boyutu ve bağlam limiti kısıtlı olabilir. Dosyayı bölümlere ayırarak yükle veya yüksek bağlamlı bir araca yönel.`;
  }
  if (!tier.isPaid && (complexity === 'high' || complexity === 'expert')) {
    return `${tool.name} ${tier.label} planında gelişmiş muhakeme / mesaj kotası bu ağırlıktaki görevde çabuk dolabilir. Promptu tek seferde eksiksiz göndererek tur sayısını azalt.`;
  }
  if (tool.id === 'perplexity' && !tier.isPaid && domainSet.has('research')) {
    return 'Perplexity Free planında günlük Pro Search (derin araştırma) hakkı sınırlıdır; soruyu tek bir kapsamlı aramada birleştir.';
  }
  if (tier.creditWeight >= 3 && complexity === 'low') {
    return `${tool.name} ${tier.label} yüksek değerli kredi kullanır; bu basit görevde hızlı/hafif modeli seçerek Pro kotanı koruyabilirsin.`;
  }
  return tier.constraints[0];
}

function buildComplexityBadge(
  complexity: { level: ComplexityLevel; score: number; isMultiStep: boolean },
  domains: DomainSignal[],
  mode: PriorityMode
): AnalysisResult['complexityBadge'] {
  const detectedDomains = domains.slice(0, 3).map((d) => d.labelTr);

  if (complexity.level === 'low') {
    return {
      level: 'low',
      label: 'Düşük Efor',
      headline: 'Düşük Efor — Ücretsiz Model Yeterli, Pro Kredini Yakma',
      summary:
        mode === 'quality'
          ? 'Maksimum Kalite modunu seçtin ancak bu görev oldukça doğrudan. Ücretsiz veya hızlı bir modelle de neredeyse aynı kaliteyi elde edip Pro limitini zor görevlere saklayabilirsin.'
          : 'Bu görev tek adımlı ve düşük muhakeme gerektiriyor. Ücretsiz veya yüksek hızlı bir modelle saniyeler içinde kredi israfı olmadan çözebilirsin.',
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
          ? 'Orta Efor — Kredi Tasarrufu İçin Güçlü Ücretsiz / Hafif Model Önerilir'
          : 'Orta Efor — Dengeli Model Yeterli, Ultra Krediye Gerek Yok',
      summary:
        'Görev net yapılandırma ve orta düzey analiz gerektiriyor. Standart bir Plus/Pro modeli ya da güçlü bir ücretsiz model (Gemini / DeepSeek) tek seferde kaliteli sonuç verir.',
      creditAdvice: 'balanced',
      detectedDomains,
      estimatedEffortScore: complexity.score,
    };
  }

  if (complexity.level === 'high') {
    return {
      level: 'high',
      label: 'Ağır Muhakeme',
      headline: 'Ağır Muhakeme — Pro Kredi Harcamaya Değer',
      summary:
        'Bu görev yüksek doğruluk, bağlam tutarlılığı ve derin mantık zinciri istiyor. Zayıf modellerle defalarca düzeltme yapmak yerine en güçlü aktif modelinle ilk seferde temiz sonuç almak daha verimli.',
      creditAdvice: 'worth_pro',
      detectedDomains,
      estimatedEffortScore: complexity.score,
    };
  }

  return {
    level: 'expert',
    label: 'Uzman / Çok Aşamalı',
    headline: 'Ağır Çok Aşamalı Görev — Pro Kredi + Combo İş Akışı Önerilir',
    summary:
      'Görev birden fazla uzmanlık alanını (örn. araştırma + mimari/kodlama veya strateji + üretim) birleştiriyor. Tek bir modele yüklenmek yerine aşağıdaki Combo zinciriyle hem kaliteyi zirveye çıkar hem kota verimliliği sağla.',
    creditAdvice: 'worth_pro',
    detectedDomains,
    estimatedEffortScore: complexity.score,
  };
}

function buildStrategySection(
  prompt: string,
  complexity: { level: ComplexityLevel; score: number; isMultiStep: boolean },
  domains: DomainSignal[],
  userBest: UserStackOption[],
  marketTop5: RankedModelItem[]
): StrategySectionData {
  const shortTopic = prompt.length > 90 ? `${prompt.slice(0, 88)}...` : prompt;

  if (!complexity.isMultiStep && complexity.level === 'low') {
    const eqNames = Array.from(
      new Set([
        ...userBest.slice(0, 3).map((u) => `${u.name} (${u.tierLabel})`),
        'Gemini Ücretsiz',
        'ChatGPT Free',
        'DeepSeek Ücretsiz',
      ])
    ).slice(0, 4);

    return {
      mode: 'simple_equivalent',
      headline: 'Tek Adımda Çözüm — Neredeyse Her Güncel AI Eşdeğer',
      description:
        'Bu görev için modeller arasında kalite farkı minimaldir. Ücretli Pro/Ultra kredini harcamak yerine elindeki ücretsiz veya kotası en rahat olan modeli açıp aşağıdaki hazır promptu yapıştırman yeterli.',
      equivalentModels: eqNames,
    };
  }

  const pickModelForRole = (preferredIds: string[]): {
    toolId: string;
    name: string;
    url: string;
    fromUser: boolean;
  } => {
    for (const id of preferredIds) {
      const owned = userBest.find((u) => u.toolId === id);
      if (owned) {
        return {
          toolId: owned.toolId,
          name: `${owned.name} (${owned.tierLabel})`,
          url: owned.url,
          fromUser: true,
        };
      }
    }
    if (userBest.length > 0) {
      const fallbackUser = userBest[0];
      return {
        toolId: fallbackUser.toolId,
        name: `${fallbackUser.name} (${fallbackUser.tierLabel})`,
        url: fallbackUser.url,
        fromUser: true,
      };
    }
    const marketFallback = marketTop5.find((m) => preferredIds.includes(m.toolId)) ?? marketTop5[0];
    return {
      toolId: marketFallback.toolId,
      name: `${marketFallback.name} (${marketFallback.recommendedTierLabel})`,
      url: marketFallback.url,
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
        title: 'Sanat Yönetimi & Detaylı Görsel Senaryosu',
        recommendedModelName: planner.name,
        recommendedToolId: planner.toolId,
        recommendedUrl: planner.url,
        isFromUserStack: planner.fromUser,
        rationale: 'Işık, lens, renk paleti ve kompozisyon detaylarını metin olarak netleştirir.',
        stepPrompt: `Şu görsel konsepti için 3 farklı sanat yönetimi varyasyonu (ışık açısı, arka plan dokusu, renk paleti, kamera lensi) ve İngilizce görsel üretim promptu hazırla:\n"${shortTopic}"`,
      },
      {
        stepNumber: 2,
        title: 'Yüksek Kaliteli Görsel Üretimi',
        recommendedModelName: generator.name,
        recommendedToolId: generator.toolId,
        recommendedUrl: generator.url,
        isFromUserStack: generator.fromUser,
        rationale: '1. adımdaki sahne tarifini en yüksek estetik doğrulukla görsele dönüştürür.',
        stepPrompt: `1. adımdan seçtiğin İngilizce promptu yapıştır; ürün/odak netliği için "--ar 4:5 --stylize 250 --v 6.1" (Midjourney) veya yüksek çözünürlüklü stüdyo ışığı talimatını ekle.`,
      }
    );
  } else if (domainSet.has('research') || domainSet.has('long_context')) {
    const researcher = pickModelForRole(['perplexity', 'notebooklm', 'gemini']);
    const synthesizer = pickModelForRole(['claude', 'chatgpt', 'gemini']);
    steps.push(
      {
        stepNumber: 1,
        title: 'Güncel Kaynak Tarama & Ham Veri Çıkarımı',
        recommendedModelName: researcher.name,
        recommendedToolId: researcher.toolId,
        recommendedUrl: researcher.url,
        isFromUserStack: researcher.fromUser,
        rationale: 'Halüsinasyonsuz, tarih ve kaynak doğrulanmış ham verileri toplar.',
        stepPrompt: `Aşağıdaki konu hakkında en güncel verileri, somut istatistikleri ve karşılaştırmalı maddeleri kaynak URL'leriyle birlikte yapılandırılmış bir özet halinde çıkar:\n"${shortTopic}"`,
      },
      {
        stepNumber: 2,
        title: 'Stratejik Sentez, Yapılandırma & Nihai Çıktı',
        recommendedModelName: synthesizer.name,
        recommendedToolId: synthesizer.toolId,
        recommendedUrl: synthesizer.url,
        isFromUserStack: synthesizer.fromUser,
        rationale: 'Doğrulanmış verileri ikna edici, okunabilir nihai rapor veya koda dönüştürür.',
        stepPrompt: `Aşağıdaki doğrulanmış araştırma notlarını kullanarak yönetici özeti, karşılaştırma tablosu ve somut aksiyon önerilerinden oluşan nihai çıktıyı üret. [1. Adım çıktısını buraya yapıştır]`,
      }
    );
  } else if (domainSet.has('coding')) {
    const architect = pickModelForRole(['claude', 'chatgpt', 'deepseek', 'gemini']);
    const builder = pickModelForRole(['cursor', 'claude', 'chatgpt', 'deepseek']);
    const reviewer = pickModelForRole(['deepseek', 'gemini', 'chatgpt']);
    steps.push(
      {
        stepNumber: 1,
        title: 'Sistem Mimarisi & Edge-Case Tasarımı',
        recommendedModelName: architect.name,
        recommendedToolId: architect.toolId,
        recommendedUrl: architect.url,
        isFromUserStack: architect.fromUser,
        rationale: 'Koda geçmeden önce veri şeması, güvenlik ve sınır durumlarını kilitler; gereksiz refactor kredisi yakmanı önler.',
        stepPrompt: `Kod yazmadan önce şu görev için veri modeli, klasör mimarisi, güvenlik riskleri ve 5 kritik edge-case'i kısa maddelerle tasarla:\n"${shortTopic}"`,
      },
      {
        stepNumber: 2,
        title: 'Üretime Hazır Modüler Kod Uygulaması',
        recommendedModelName: builder.name,
        recommendedToolId: builder.toolId,
        recommendedUrl: builder.url,
        isFromUserStack: builder.fromUser,
        rationale: 'Onaylanan mimariye göre temiz, tip güvenli ve eksiksiz kodu üretir.',
        stepPrompt: `Onaylanan şu mimari plana birebir sadık kalarak tip güvenli, hata yönetimli ve üretime hazır kodu yaz. Gereksiz açıklama ekleme, sadece kritik kararları kısa notla belirt. [1. Adım planını yapıştır]`,
      },
      {
        stepNumber: 3,
        title: 'Hızlı Güvenlik & Performans Denetimi (Kredi Dostu)',
        recommendedModelName: reviewer.name,
        recommendedToolId: reviewer.toolId,
        recommendedUrl: reviewer.url,
        isFromUserStack: reviewer.fromUser,
        rationale: 'Ücretsiz/hızlı bir ikinci modelle çapraz kod incelemesi yaparak kör noktaları yakalar.',
        stepPrompt: `Aşağıdaki kodu güvenlik açıkları, yarış durumları (race condition) ve performans darboğazları açısından denetle; yalnızca gerçek hataları ve düzeltme önerilerini listele. [2. Adım kodunu yapıştır]`,
      }
    );
  } else {
    const strategist = pickModelForRole(['gemini', 'chatgpt', 'claude']);
    const finisher = pickModelForRole(['claude', 'chatgpt', 'gemini']);
    steps.push(
      {
        stepNumber: 1,
        title: 'Çerçeve, İskelet & Alternatif Açı Üretimi',
        recommendedModelName: strategist.name,
        recommendedToolId: strategist.toolId,
        recommendedUrl: strategist.url,
        isFromUserStack: strategist.fromUser,
        rationale: 'Görevin ana yapısını ve alternatif yaklaşımları hızlıca masaya koyar.',
        stepPrompt: `Şu görev için hedef kitleyi, ana mesajı ve 3 farklı yapısal taslağı kısa maddeler halinde çıkar:\n"${shortTopic}"`,
      },
      {
        stepNumber: 2,
        title: 'Üslup Cilalama & Nihai Teslimat',
        recommendedModelName: finisher.name,
        recommendedToolId: finisher.toolId,
        recommendedUrl: finisher.url,
        isFromUserStack: finisher.fromUser,
        rationale: 'Seçilen taslağı yüksek ikna gücü ve akıcı dille son haline getirir.',
        stepPrompt: `Seçtiğim taslağı kullanarak gereksiz dolgu ifadelerden arınmış, akıcı, profesyonel ve doğrudan kullanıma hazır nihai metni yaz. [1. Adım taslağını yapıştır]`,
      }
    );
  }

  return {
    mode: 'combo_workflow',
    headline: `Akıllı Combo (Zincirleme) İş Akışı — ${steps.length} Adımda Maksimum Verim`,
    description:
      'Görevi tek bir devasa promptla tek modele yüklemek yerine uzmanlaşmış adımlara bölmek hem çıktı kalitesini belirgin biçimde artırır hem de pahalı Pro kredi tekrarlarını azaltır.',
    comboSteps: steps,
  };
}

function generateModelAwarePrompt(
  rawPrompt: string,
  modelName: string,
  promptStyle: AIToolDefinition['promptStyle'],
  domains: DomainSignal[],
  complexity: ComplexityLevel,
  mode: PriorityMode
): { formatStyleLabel: string; whyThisFormat: string; enhancedPrompt: string } {
  const primaryDomain = domains[0]?.labelTr ?? 'Genel Görev';
  const cleaned = rawPrompt.trim();

  const speedDirective =
    mode === 'speed'
      ? 'Gereksiz giriş/çıkış cümlelerini atla, doğrudan uygulanabilir ve özlü sonuç ver.'
      : mode === 'credit_saver'
      ? 'Tek yanıtta eksiksiz ve takip sorusu gerektirmeyecek kadar net bir çıktı üret (mesaj kotasını koru).'
      : 'Derinlemesine düşün, uç durumları (edge-case) gözden kaçırma ve en yüksek kalite standardında üret.';

  switch (promptStyle) {
    case 'claude_xml':
      return {
        formatStyleLabel: 'Claude XML Yapılandırılmış Format',
        whyThisFormat:
          'Claude modelleri `<role>`, `<task>`, `<constraints>` gibi XML etiketleriyle ayrılmış yönergeleri çok yüksek sadakatle takip eder ve halüsinasyonu minimize eder.',
        enhancedPrompt: `<role>
Sen ${primaryDomain} alanında kıdemli bir uzmansın. Temiz, yapılandırılmış ve doğrudan uygulanabilir çözümler üretirsin.
</role>

<task>
${cleaned}
</task>

<constraints>
- ${speedDirective}
- Varsayım yapman gerekiyorsa yanıtın en başında kısaca listele.
- Somut örnekler, net başlıklar ve uygulanabilir adımlar kullan.${
          complexity === 'high' || complexity === 'expert'
            ? '\n- Nihai cevaba geçmeden önce kritik riskleri ve tasarım kararlarını 3 maddede özetle.'
            : ''
        }
</constraints>

<output_format>
1. Kısa Özet / Yaklaşım
2. Ana Çözüm (yapılandırılmış ve doğrudan kullanılabilir)
3. Kontrol Listesi & İyileştirme Önerileri
</output_format>`,
      };

    case 'gemini_structured':
      return {
        formatStyleLabel: 'Gemini Markdown Persona + Çıktı Şeması',
        whyThisFormat:
          'Gemini, net bir uzman rolü, kalın Markdown başlıkları ve açıkça tanımlanmış bir çıktı tablosu/şeması verildiğinde bağlamı çok keskin işler.',
        enhancedPrompt: `**Rol:** ${primaryDomain} konusunda uzman bir danışman ve uygulayıcı gibi davran.

**Görev:**
${cleaned}

**Öncelik ve Kısıtlar:**
- ${speedDirective}
- Bilgi kirliliği yaratma; her madde doğrudan aksiyon alınabilir olsun.
- Karşılaştırma veya çoklu seçenek varsa Markdown tablosu kullan.
- Belirsiz bir nokta varsa en mantıklı standart yaklaşımı seçip dipnot olarak belirt.

**İstenen Çıktı Yapısı:**
### 1. Hızlı Özet
### 2. Detaylı Çözüm
### 3. Dikkat Edilmesi Gerekenler & Sonraki Adım`,
      };

    case 'chatgpt_spec':
      return {
        formatStyleLabel: 'ChatGPT Görev Şartnamesi + Öz-Denetim',
        whyThisFormat:
          'ChatGPT ve muhakeme (o-serisi) modelleri net hedef, kısıtlar ve yanıt öncesi öz-kontrol kriteri verildiğinde en tutarlı sonucu verir.',
        enhancedPrompt: `Rol: Kıdemli ${primaryDomain} Uzmanı

Amaç:
"${cleaned}"

Çalışma Kuralları:
1. ${speedDirective}
2. Yüzeysel genellemeler yerine somut, doğrudan kullanıma hazır içerik/kod/plan üret.
3. Önemli kararların gerekçesini tek cümleyle açıkla.

Çıktı Formatı:
- Önce 2 cümlelik özet
- Ardından net başlıklarla yapılandırılmış ana çıktı
- En sonda "Eksik / Risk Kontrolü" başlığı altında 3 kritik kontrol maddesi`,
      };

    case 'perplexity_research':
      return {
        formatStyleLabel: 'Perplexity Kaynak Odaklı Araştırma Sorgusu',
        whyThisFormat:
          'Perplexity canlı arama motoru gibi çalışır; zaman aralığı, kaynak kalitesi ve karşılaştırma tablosu belirtmek en doğru referansları getirir.',
        enhancedPrompt: `Aşağıdaki konuda güncel ve doğrulanabilir kaynaklara dayalı derin bir araştırma yap:

Araştırma Konusu: ${cleaned}

Kaynak ve Kapsam Kuralları:
- Öncelikle resmi dokümanlar, güncel 2025–2026 raporları ve güvenilir sektör kaynaklarını kullan.
- Her temel veriyi ve iddiayı kaynak linkiyle destekle.
- ${speedDirective}

Çıktı Formatı:
1. Yönetici Özeti (3-4 madde)
2. Karşılaştırmalı Veri Tablosu (Kriter | Detay | Kaynak)
3. Öne Çıkan Riskler ve Pratik Çıkarımlar`,
      };

    case 'midjourney_visual':
      return {
        formatStyleLabel: 'Midjourney Görsel Kompozisyon & Parametre Promptu',
        whyThisFormat:
          'Midjourney, sohbet cümleleri yerine İngilizce görsel tanımlayıcılar (konu, ışık, kamera, doku) ve son ek parametrelerle (--ar, --stylize) en iyi sonucu verir.',
        enhancedPrompt: `/imagine prompt: Editorial ultra-detailed visual concept for: ${cleaned} — luxury studio photography, luminous translucent glass reflections, delicate lavender and icy-blue rim lighting, cinematic depth of field, crisp micro-textures, octane aesthetic polish, clean composition, shot on 85mm f/1.8 lens, soft atmospheric bokeh --ar 4:5 --stylize 250 --v 6.1

[İpucu: Yukarıdaki Türkçe görevi İngilizce anahtar kelimelere çevirip Midjourney'e doğrudan yapıştırabilir, yatay afiş için --ar 16:9 kullanabilirsin.]`,
      };

    case 'deepseek_reasoning':
      return {
        formatStyleLabel: 'DeepSeek Analitik & Adım Adım Muhakeme Promptu',
        whyThisFormat:
          'DeepSeek muhakeme modelleri net kısıtlar ve doğrulama adımı verildiğinde algoritma, mantık ve teknik görevlerde son derece yüksek doğruluk sağlar.',
        enhancedPrompt: `Görev (${primaryDomain}):
${cleaned}

Çözüm Yönergeleri:
- Problemi önce temel bileşenlerine ayır ve olası hata/sınır durumlarını tespit et.
- ${speedDirective}
- Eğer kod, formül veya hesaplama varsa doğrulama örneğiyle sağlamasını yap.
- Çıktıyı sade, net ve doğrudan kopyalanabilir formatta sun.`,
      };

    default:
      return {
        formatStyleLabel: `${modelName} Yapılandırılmış Uzman Promptu`,
        whyThisFormat:
          'Rol, bağlam, kısıtlar ve çıktı formatını netleştirerek ilk seferde isabetli sonuç almanı sağlar.',
        enhancedPrompt: `Rol: ${primaryDomain} Uzmanı
Görev: ${cleaned}

Kısıtlar:
- ${speedDirective}
- Somut, net ve doğrudan kullanılabilir bir çıktı üret.

Çıktı Formatı:
1. Kısa Özet
2. Ana Çözüm
3. Sonraki Önerilen Adım`,
      };
  }
}

/**
 * Local intelligent rule-based AI Router & Prompt Enhancer
 */
export function runLocalAnalysis(
  prompt: string,
  priorityMode: PriorityMode,
  userPlans: UserPlanSelection[]
): AnalysisResult {
  const catalog = getAllCatalogTools(userPlans);
  const domains = detectDomains(prompt);
  const complexity = assessComplexity(prompt, domains);

  // 1. Market Top 5 (evaluated using each tool's ideal/flagship tier for quality, or free/balanced for credit_saver)
  const marketScored: RankedModelItem[] = catalog
    .map((tool) => {
      const idealTier =
        priorityMode === 'credit_saver'
          ? tool.tiers.find((t) => !t.isPaid) ?? tool.tiers[0]
          : tool.tiers[tool.tiers.length - 1];
      const score = scoreToolForTask(tool, domains, complexity.level, priorityMode, idealTier);
      return {
        toolId: tool.id,
        name: tool.name,
        provider: tool.provider,
        recommendedTierLabel: idealTier.label,
        url: tool.url,
        score,
        accentColor: tool.accentColor,
        reasons: buildReasonsForTool(tool, domains, priorityMode, complexity.level, idealTier.label),
        isPaidTier: idealTier.isPaid,
        promptStyle: tool.promptStyle,
      };
    })
    .filter((item) => item.score > 25)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  // 2. User's Active Stack (strictly enabled AND !quotaReached)
  const quotaSkippedModels: QuotaSkippedNotice[] = [];
  const activeUserOptions: UserStackOption[] = [];

  for (const selection of userPlans) {
    if (!selection.enabled) continue;
    const tool = catalog.find((t) => t.id === selection.toolId);
    if (!tool) continue;

    const { tier, label: tierLabel } = resolveTier(tool, selection);

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

    const creditCostLabel = !tier.isPaid
      ? 'Ücretsiz / 0 Pro Kredi'
      : tier.creditWeight >= 3
      ? 'Yüksek Pro/Ultra Kredi'
      : tier.creditWeight === 2
      ? 'Orta Pro Kredi'
      : 'Düşük Kredi Maliyeti';

    activeUserOptions.push({
      toolId: tool.id,
      name: tool.name,
      tierLabel,
      url: tool.url,
      score,
      accentColor: tool.accentColor,
      reasons: buildReasonsForTool(tool, domains, priorityMode, complexity.level, tierLabel),
      planConstraintNote: buildPlanConstraintNote(tool, tier, domains, complexity.level),
      creditCostLabel,
      promptStyle: tool.promptStyle,
    });
  }

  activeUserOptions.sort((a, b) => b.score - a.score);

  // 3. Complexity Badge
  const complexityBadge = buildComplexityBadge(complexity, domains, priorityMode);

  // 4. Smart Strategy & Combo
  const strategy = buildStrategySection(prompt, complexity, domains, activeUserOptions, marketScored);

  // 5. Model-Aware Prompt Enhancer (targets user's #1 active model if available, otherwise Market #1)
  const primaryTarget = activeUserOptions[0]
    ? {
        toolId: activeUserOptions[0].toolId,
        name: activeUserOptions[0].name,
        url: activeUserOptions[0].url,
        tierLabel: activeUserOptions[0].tierLabel,
        promptStyle: activeUserOptions[0].promptStyle,
      }
    : {
        toolId: marketScored[0].toolId,
        name: marketScored[0].name,
        url: marketScored[0].url,
        tierLabel: marketScored[0].recommendedTierLabel,
        promptStyle: marketScored[0].promptStyle,
      };

  const primaryEnhanced = generateModelAwarePrompt(
    prompt,
    primaryTarget.name,
    primaryTarget.promptStyle,
    domains,
    complexity.level,
    priorityMode
  );

  let marketTopAlternative: EnhancedPromptData['marketTopAlternative'] | undefined;
  if (activeUserOptions[0] && marketScored[0] && activeUserOptions[0].toolId !== marketScored[0].toolId) {
    const marketAlt = generateModelAwarePrompt(
      prompt,
      marketScored[0].name,
      marketScored[0].promptStyle,
      domains,
      complexity.level,
      priorityMode
    );
    marketTopAlternative = {
      targetToolId: marketScored[0].toolId,
      targetModelName: marketScored[0].name,
      targetUrl: marketScored[0].url,
      formatStyleLabel: marketAlt.formatStyleLabel,
      enhancedPrompt: marketAlt.enhancedPrompt,
    };
  }

  return {
    id: `analysis_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
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
      targetUrl: primaryTarget.url,
      targetTierLabel: primaryTarget.tierLabel,
      formatStyleLabel: primaryEnhanced.formatStyleLabel,
      whyThisFormat: primaryEnhanced.whyThisFormat,
      enhancedPrompt: primaryEnhanced.enhancedPrompt,
      marketTopAlternative,
    },
  };
}

/**
 * Clean async service layer:
 * Uses optional live LLM API if user configured an API key,
 * and falls back gracefully to our deterministic smart local router engine.
 */
export async function analyzeUserTask(
  prompt: string,
  priorityMode: PriorityMode,
  userPlans: UserPlanSelection[],
  liveApiConfig?: LiveApiConfig
): Promise<AnalysisResult> {
  // Always compute baseline local analysis for instant structural reliability & fallback
  const localResult = runLocalAnalysis(prompt, priorityMode, userPlans);

  if (!liveApiConfig?.enabled || !liveApiConfig.apiKey.trim()) {
    // Brief subtle delay so Framer Motion loading shimmer feels smooth and responsive
    await new Promise((resolve) => setTimeout(resolve, 420));
    return localResult;
  }

  try {
    const systemPrompt = `Sen WhichAI adında uzman bir AI Router ve Prompt Mühendisisin.
Kullanıcının görevini analiz et ve sadece geçerli JSON döndür.
JSON şeması:
{
  "complexityHeadline": "string (Türkçe kısa başlık)",
  "complexitySummary": "string (Türkçe 1-2 cümle)",
  "enhancedPrompt": "string (önerilen model için doğrudan kopyalanabilir geliştirilmiş prompt)"
}`;

    const userContext = `Görev: ${prompt}
Öncelik Modu: ${priorityMode}
Önerilen Hedef Model: ${localResult.promptEnhancer.targetModelName} (${localResult.promptEnhancer.formatStyleLabel})`;

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
        enhancedPrompt: parsed.enhancedPrompt || localResult.promptEnhancer.enhancedPrompt,
      },
    };
  } catch {
    // Graceful fallback to local smart router
    return localResult;
  }
}
