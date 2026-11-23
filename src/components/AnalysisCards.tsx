import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Crown,
  Medal,
  Award,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  GitBranch,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Sliders,
  Zap,
  Gauge,
  Leaf,
  Info,
  ArrowRight,
} from 'lucide-react';
import { AnalysisResult } from '../types';

interface AnalysisCardsProps {
  analysis: AnalysisResult;
  onOpenPlans: () => void;
  onToast: (msg: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: 'easeOut' as const } },
};

export const AnalysisCards: React.FC<AnalysisCardsProps> = ({
  analysis,
  onOpenPlans,
  onToast,
}) => {
  const {
    complexityBadge,
    marketTop5,
    userBestOptions,
    quotaSkippedModels,
    strategy,
    promptEnhancer,
    priorityMode,
  } = analysis;

  const [promptTarget, setPromptTarget] = useState<'user_top' | 'market_top'>('user_top');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activePromptBlock =
    promptTarget === 'market_top' && promptEnhancer.marketTopAlternative
      ? {
          modelName: promptEnhancer.marketTopAlternative.targetModelName,
          url: promptEnhancer.marketTopAlternative.targetUrl,
          formatLabel: promptEnhancer.marketTopAlternative.formatStyleLabel,
          promptText: promptEnhancer.marketTopAlternative.enhancedPrompt,
          whyNote: 'Piyasa #1 modeli için en yüksek uyumu sağlayacak formatta optimize edildi.',
        }
      : {
          modelName: promptEnhancer.targetModelName,
          url: promptEnhancer.targetUrl,
          formatLabel: promptEnhancer.formatStyleLabel,
          promptText: promptEnhancer.enhancedPrompt,
          whyNote: promptEnhancer.whyThisFormat,
        };

  const copyText = async (text: string, id: string, toastMessage?: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopiedId(id);
    if (toastMessage) onToast(toastMessage);
    setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 2200);
  };

  const handleCopyAndOpen = async (text: string, url: string, modelName: string) => {
    await copyText(text, 'main_prompt', `Prompt kopyalandı! ${modelName} yeni sekmede açılıyor...`);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const badgeTone =
    complexityBadge.creditAdvice === 'save_credits'
      ? {
          pill: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-400/40',
          bar: 'from-emerald-400 to-teal-400',
          icon: <Leaf className="w-4 h-4 text-emerald-500 dark:text-emerald-300" />,
        }
      : complexityBadge.creditAdvice === 'balanced'
      ? {
          pill: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-400/40',
          bar: 'from-sky-400 to-indigo-500',
          icon: <Gauge className="w-4 h-4 text-sky-500 dark:text-sky-300" />,
        }
      : {
          pill: 'bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-200 border-fuchsia-400/45',
          bar: 'from-purple-500 via-fuchsia-500 to-pink-500',
          icon: <Zap className="w-4 h-4 text-fuchsia-500 dark:text-pink-300" />,
        };

  const modeLabel =
    priorityMode === 'quality'
      ? 'Maksimum Kalite'
      : priorityMode === 'speed'
      ? 'Hız Odaklı'
      : 'Kredi Tasarrufu';

  const top3 = marketTop5.slice(0, 3);
  const rest2 = marketTop5.slice(3, 5);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-4 w-full"
    >
      {/* =====================================================================
          1. KREDİ İSRAFI & KARMAŞIKLIK ROZETİ
         ===================================================================== */}
      <motion.section
        variants={cardVariants}
        className="chat-reading-card rounded-3xl p-4 sm:p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${badgeTone.pill}`}
            >
              {badgeTone.icon}
              {complexityBadge.label}
            </span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-500/10 dark:bg-purple-400/15 text-indigo-700 dark:text-purple-200 border border-indigo-300/30 dark:border-purple-300/20">
              Mod: {modeLabel}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-purple-200/70">
            <span>Efor Skoru: {complexityBadge.estimatedEffortScore}/100</span>
            <div className="w-20 h-2 rounded-full bg-slate-200/80 dark:bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${badgeTone.bar}`}
                style={{ width: `${complexityBadge.estimatedEffortScore}%` }}
              />
            </div>
          </div>
        </div>

        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-snug">
          {complexityBadge.headline}
        </h3>
        <p className="text-sm text-slate-700 dark:text-slate-200/90 mt-1.5 leading-relaxed">
          {complexityBadge.summary}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {complexityBadge.detectedDomains.map((domain) => (
            <span
              key={domain}
              className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-white/[0.07] text-slate-700 dark:text-purple-200 border border-slate-200/80 dark:border-purple-300/15"
            >
              #{domain}
            </span>
          ))}
        </div>
      </motion.section>

      {/* =====================================================================
          2. PİYASADAKİ EN İYİ 5 YAPAY ZEKA (İLK 3 PODYUM VURGULU)
         ===================================================================== */}
      <motion.section
        variants={cardVariants}
        className="chat-reading-card rounded-3xl p-4 sm:p-5"
      >
        <div className="flex items-center justify-between gap-2 mb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-fuchsia-300">
              Bölüm 2 · Piyasa Kıyaslaması
            </span>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
              Piyasadaki En İyi 5 Yapay Zeka
            </h4>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-purple-200/65">
            İlk 3 Podyum
          </span>
        </div>

        {/* TOP 3 PODIUM (Signature Liquid Glass / Y2K cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {top3.map((model, idx) => {
            const rank = idx + 1;
            const rankBadge =
              rank === 1
                ? {
                    icon: <Crown className="w-3.5 h-3.5" />,
                    label: '#1 Altın Öneri',
                    cls: 'liquid-glow-primary text-white',
                    ring: 'ring-2 ring-purple-500/65 dark:ring-fuchsia-400/65',
                  }
                : rank === 2
                ? {
                    icon: <Medal className="w-3.5 h-3.5" />,
                    label: '#2 Gümüş',
                    cls: 'bg-sky-500/15 text-sky-800 dark:text-sky-200 border border-sky-400/40',
                    ring: 'ring-1 ring-sky-400/40',
                  }
                : {
                    icon: <Award className="w-3.5 h-3.5" />,
                    label: '#3 Bronz',
                    cls: 'bg-amber-500/15 text-amber-800 dark:text-amber-200 border border-amber-400/40',
                    ring: 'ring-1 ring-amber-400/35',
                  };

            return (
              <div
                key={model.toolId}
                className={`liquid-card rounded-2xl p-3.5 flex flex-col justify-between ${rankBadge.ring}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1.5 mb-2.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${rankBadge.cls}`}
                    >
                      {rankBadge.icon}
                      {rankBadge.label}
                    </span>
                    <span className="text-xs font-extrabold text-indigo-700 dark:text-purple-200">
                      {model.score}%
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: model.accentColor }}
                    />
                    <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {model.name}
                    </h5>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/70 dark:bg-white/10 text-slate-600 dark:text-purple-100">
                      {model.recommendedTierLabel}
                    </span>
                  </div>

                  {/* Score bar */}
                  <div className="mt-2 h-1.5 rounded-full bg-slate-200/75 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${model.score}%`,
                        background:
                          rank === 1
                            ? 'linear-gradient(90deg, #8b5cf6, #ec4899, #38bdf8)'
                            : model.accentColor,
                      }}
                    />
                  </div>

                  <ul className="mt-2.5 space-y-1.5">
                    {model.reasons.map((r, i) => (
                      <li
                        key={i}
                        className="text-xs text-slate-700 dark:text-slate-200/90 leading-snug flex items-start gap-1.5"
                      >
                        <span className="text-purple-500 dark:text-fuchsia-300 mt-0.5">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* #4 and #5 Compact Rows */}
        {rest2.length > 0 && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {rest2.map((model, idx) => (
              <div
                key={model.toolId}
                className="rounded-2xl p-3 bg-slate-50/90 dark:bg-white/[0.04] border border-slate-200/80 dark:border-purple-300/15 flex items-start gap-3"
              >
                <span className="w-6 h-6 rounded-lg bg-slate-200/80 dark:bg-white/10 text-xs font-extrabold text-slate-700 dark:text-purple-200 flex items-center justify-center shrink-0">
                  #{idx + 4}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {model.name}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500 dark:text-purple-200/65">
                        ({model.recommendedTierLabel})
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-600 dark:text-purple-200">
                      {model.score}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300/85 mt-1 leading-snug">
                    {model.reasons[0]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.section>

      {/* =====================================================================
          3. SENİN ELİNDEKİ EN İYİ SEÇENEKLER (SADECE AKTİF & KOTASI DOLMAMIŞ)
         ===================================================================== */}
      <motion.section
        variants={cardVariants}
        className="chat-reading-card rounded-3xl p-4 sm:p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-300">
              Bölüm 3 · Kişisel Abonelik Filtresi
            </span>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
              Senin Elindeki En İyi Seçenekler
            </h4>
          </div>

          <button
            type="button"
            onClick={onOpenPlans}
            className="glass-pill px-3 py-1.5 rounded-full text-xs font-semibold text-indigo-800 dark:text-purple-100 flex items-center gap-1.5 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            Plan / Kota Düzenle
          </button>
        </div>

        {/* Notice for Quota-Reached Skipped Models */}
        {quotaSkippedModels.length > 0 && (
          <div className="mb-3.5 rounded-2xl p-3 bg-amber-500/12 border border-amber-400/40 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                <strong>Kota Dolu Nedeniyle Hariç Tutuldu:</strong>{' '}
                {quotaSkippedModels.map((m) => `${m.name} (${m.tierLabel})`).join(', ')}. Öneriler elindeki aktif alternatiflere göre yeniden sıralandı.
              </span>
            </div>
          </div>
        )}

        {userBestOptions.length === 0 ? (
          <div className="rounded-2xl p-4 bg-rose-500/10 border border-rose-400/35 text-sm text-rose-900 dark:text-rose-200 space-y-2">
            <p className="font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Şu an aktif ve kotası müsait bir planın bulunmuyor.
            </p>
            <p className="text-xs leading-relaxed">
              Tüm planların kapalı veya limitleri dolmuş görünüyor. Sağ üstteki &ldquo;AI Planlarım &amp; Kotalar&rdquo; panelinden kotası yenilenen bir modeli açabilir ya da ücretsiz alternatif olarak <strong>Gemini Ücretsiz</strong> / <strong>DeepSeek</strong> kullanabilirsin.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {userBestOptions.slice(0, 4).map((opt, idx) => (
              <div
                key={opt.toolId}
                className={`rounded-2xl p-3.5 transition ${
                  idx === 0
                    ? 'liquid-card ring-2 ring-emerald-400/60 dark:ring-emerald-400/45'
                    : 'bg-slate-50/90 dark:bg-white/[0.04] border border-slate-200/80 dark:border-purple-300/15'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-6 h-6 rounded-full text-xs font-extrabold flex items-center justify-center shrink-0 ${
                        idx === 0
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'bg-indigo-500/15 dark:bg-purple-400/20 text-indigo-800 dark:text-purple-100'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {opt.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/12 dark:bg-purple-400/20 text-indigo-800 dark:text-purple-100">
                      {opt.tierLabel}
                    </span>
                    {idx === 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="w-3 h-3" />
                        En İyi Aktif Seçimin
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white/80 dark:bg-white/8 text-slate-600 dark:text-purple-200 border border-slate-200/80 dark:border-purple-300/15">
                      {opt.creditCostLabel}
                    </span>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-white">
                      {opt.score}%
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-200/90 mt-2 leading-relaxed">
                  {opt.reasons.join(' ')}
                </p>

                {opt.planConstraintNote && (
                  <div className="mt-2.5 flex items-start gap-2 px-3 py-2 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-400/30 text-[11px] text-amber-900 dark:text-amber-200/95 leading-snug">
                    <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>
                      <strong>Plan Kısıtı Hatırlatması:</strong> {opt.planConstraintNote}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.section>

      {/* =====================================================================
          4. AKILLI STRATEJİ & COMBO (ZİNCİRLEME) MODU
         ===================================================================== */}
      <motion.section
        variants={cardVariants}
        className="chat-reading-card rounded-3xl p-4 sm:p-5"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 border border-indigo-300/40 dark:border-purple-300/25 flex items-center justify-center">
            <GitBranch className="w-4 h-4 text-indigo-600 dark:text-fuchsia-300" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-sky-300">
              Bölüm 4 · Akıllı Strateji
            </span>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
              {strategy.headline}
            </h4>
          </div>
        </div>

        <p className="text-sm text-slate-700 dark:text-slate-200/90 leading-relaxed">
          {strategy.description}
        </p>

        {strategy.mode === 'simple_equivalent' && strategy.equivalentModels && (
          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-600 dark:text-purple-200/75">
              Eşdeğer Hızlı/Ücretsiz Seçenekler:
            </span>
            {strategy.equivalentModels.map((name) => (
              <span
                key={name}
                className="glass-pill px-3 py-1 rounded-full text-xs font-bold text-slate-800 dark:text-purple-100"
              >
                {name}
              </span>
            ))}
          </div>
        )}

        {strategy.mode === 'combo_workflow' && strategy.comboSteps && (
          <div className="mt-4 space-y-3">
            {strategy.comboSteps.map((step, i) => (
              <div key={step.stepNumber} className="relative">
                <div className="rounded-2xl p-3.5 bg-slate-50/95 dark:bg-white/[0.04] border border-indigo-200/70 dark:border-purple-300/18">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold liquid-glow-primary text-white">
                        {step.stepNumber}. Adım
                      </span>
                      <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                        {step.title}
                      </h5>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/12 dark:bg-purple-400/20 text-indigo-800 dark:text-purple-100">
                        {step.recommendedModelName}
                      </span>
                      {step.isFromUserStack && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                          Planında Var
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300/85 mt-1.5">
                    {step.rationale}
                  </p>

                  <div className="mt-2.5 p-2.5 rounded-xl bg-white/90 dark:bg-black/35 border border-slate-200/80 dark:border-purple-300/15 flex items-start justify-between gap-3">
                    <p className="text-xs font-mono text-slate-800 dark:text-purple-100/95 whitespace-pre-wrap leading-relaxed">
                      {step.stepPrompt}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        copyText(
                          step.stepPrompt,
                          `step_${step.stepNumber}`,
                          `${step.stepNumber}. adım promptu kopyalandı!`
                        )
                      }
                      className="shrink-0 glass-pill p-2 rounded-xl text-slate-700 dark:text-purple-100 cursor-pointer"
                      title="Adım promptunu kopyala"
                    >
                      {copiedId === `step_${step.stepNumber}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {i < strategy.comboSteps!.length - 1 && (
                  <div className="flex justify-center py-1 text-indigo-400 dark:text-purple-300/60">
                    <ArrowRight className="w-4 h-4 rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.section>

      {/* =====================================================================
          5. MODELE ÖZEL PROMPT İYİLEŞTİRİCİ (MODEL-AWARE PROMPT ENHANCER)
         ===================================================================== */}
      <motion.section
        variants={cardVariants}
        className="chat-reading-card rounded-3xl p-4 sm:p-5 border-purple-300/65 dark:border-fuchsia-400/30"
      >
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-fuchsia-600 dark:text-pink-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Bölüm 5 · Modele Özel Prompt İyileştirici
            </span>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
              {activePromptBlock.modelName} İçin Optimize Edilmiş Prompt
            </h4>
            <p className="text-xs text-slate-600 dark:text-purple-200/75 mt-0.5">
              {activePromptBlock.formatLabel} — {activePromptBlock.whyNote}
            </p>
          </div>

          {promptEnhancer.marketTopAlternative && (
            <div className="flex items-center p-1 rounded-full bg-slate-100 dark:bg-black/35 border border-slate-200 dark:border-purple-300/20">
              <button
                type="button"
                onClick={() => setPromptTarget('user_top')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                  promptTarget === 'user_top'
                    ? 'liquid-glow-primary text-white'
                    : 'text-slate-600 dark:text-purple-200/80'
                }`}
              >
                Elindeki #1 ({promptEnhancer.targetModelName})
              </button>
              <button
                type="button"
                onClick={() => setPromptTarget('market_top')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                  promptTarget === 'market_top'
                    ? 'liquid-glow-primary text-white'
                    : 'text-slate-600 dark:text-purple-200/80'
                }`}
              >
                Piyasa #1 ({promptEnhancer.marketTopAlternative.targetModelName})
              </button>
            </div>
          )}
        </div>

        {/* Clean High-Contrast Prompt Box */}
        <div className="rounded-2xl p-4 bg-slate-50/95 dark:bg-[#0d0a18]/90 border border-indigo-200/80 dark:border-purple-300/20 overflow-x-auto">
          <pre className="text-xs sm:text-[13px] font-mono text-slate-800 dark:text-purple-50 whitespace-pre-wrap leading-relaxed m-0">
            {activePromptBlock.promptText}
          </pre>
        </div>

        {/* One-Click Copy & Open Action Bar */}
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() =>
              handleCopyAndOpen(
                activePromptBlock.promptText,
                activePromptBlock.url,
                activePromptBlock.modelName
              )
            }
            className="liquid-glow-primary px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer"
          >
            {copiedId === 'main_prompt' ? (
              <Check className="w-4 h-4" />
            ) : (
              <ExternalLink className="w-4 h-4" />
            )}
            Promptu Kopyala ve {activePromptBlock.modelName}&apos;da Aç
          </button>

          <button
            type="button"
            onClick={() =>
              copyText(
                activePromptBlock.promptText,
                'copy_only',
                'Optimize edilmiş prompt panoya kopyalandı!'
              )
            }
            className="glass-pill px-4 py-2.5 rounded-full text-xs font-bold text-slate-800 dark:text-purple-100 flex items-center gap-1.5 cursor-pointer"
          >
            {copiedId === 'copy_only' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                Kopyalandı
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Sadece Kopyala
              </>
            )}
          </button>
        </div>
      </motion.section>
    </motion.div>
  );
};
