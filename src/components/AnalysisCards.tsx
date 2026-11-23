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
  Copy,
  Check,
  ExternalLink,
  Sliders,
  Zap,
  Gauge,
  Leaf,
  Info,
  ArrowRight,
  Cpu,
  SpellCheck2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AnalysisResult, Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import {
  RetroFolderIcon,
  RetroNoteIcon,
  RetroStarSvg,
  RetroWindowControls,
} from './AtmosphereDecor';

interface AnalysisCardsProps {
  analysis: AnalysisResult;
  lang: Language;
  onOpenPlans: () => void;
  onToast: (msg: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.24, ease: 'easeOut' as const } },
};

export const AnalysisCards: React.FC<AnalysisCardsProps> = ({
  analysis,
  lang,
  onOpenPlans,
  onToast,
}) => {
  const t = TRANSLATIONS[lang];
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
  const [showTypoDiff, setShowTypoDiff] = useState(false);

  const activePromptBlock =
    promptTarget === 'market_top' && promptEnhancer.marketTopAlternative
      ? {
          modelName: promptEnhancer.marketTopAlternative.targetModelName,
          subModelName: promptEnhancer.marketTopAlternative.targetSubModelName,
          url: promptEnhancer.marketTopAlternative.targetUrl,
          formatLabel: promptEnhancer.marketTopAlternative.formatStyleLabel,
          promptText: promptEnhancer.marketTopAlternative.enhancedPrompt,
          whyNote:
            lang === 'tr'
              ? 'Piyasa #1 alt modeli için en yüksek uyumu sağlayacak formatta optimize edildi.'
              : 'Optimized specifically for the #1 market sub-model format.',
        }
      : {
          modelName: promptEnhancer.targetModelName,
          subModelName: promptEnhancer.targetSubModelName,
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

  const handleCopyAndOpen = async (text: string, url: string, modelLabel: string) => {
    await copyText(
      text,
      'main_prompt',
      `${t.copied}! ${modelLabel} ${t.toastCopyOpenSuffix}`
    );
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const badgeTone =
    complexityBadge.creditAdvice === 'save_credits'
      ? {
          pill: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200 border-emerald-600/60',
          bar: '#10b981',
          icon: <Leaf className="w-3.5 h-3.5" />,
        }
      : complexityBadge.creditAdvice === 'balanced'
      ? {
          pill: 'bg-[#dbeafe] dark:bg-[#2a3b75] text-[#1e3a8a] dark:text-[#dbeafe] border-[#3b82f6]',
          bar: '#3b82f6',
          icon: <Gauge className="w-3.5 h-3.5" />,
        }
      : {
          pill: 'bg-[#fce7f3] dark:bg-[#f472b6]/20 text-[#9d174d] dark:text-[#fbcfe8] border-[#ec4899]',
          bar: '#ec4899',
          icon: <Zap className="w-3.5 h-3.5" />,
        };

  const modeLabel =
    priorityMode === 'quality'
      ? t.modeQuality
      : priorityMode === 'speed'
      ? t.modeSpeed
      : t.modeSaver;

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
      <motion.section variants={cardVariants} className="retro-window-sm overflow-hidden">
        <div className="retro-titlebar">
          <div className="flex items-center gap-2 min-w-0">
            <RetroNoteIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="font-retro text-[11px] font-bold text-[#1b2544] dark:text-[#eef2ff] truncate">
              {t.card1TitleBar}
            </span>
          </div>
          <RetroWindowControls />
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-retro text-xs font-bold border-[1.5px] ${badgeTone.pill}`}
              >
                {badgeTone.icon}
                {complexityBadge.label}
              </span>
              <span className="px-2.5 py-1 rounded-md font-retro text-[11px] font-bold bg-[var(--win-bg-soft)] border border-[var(--win-border-soft)] text-[var(--ink-secondary)]">
                {t.modeLabel}: {modeLabel}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-retro font-bold text-[var(--ink-secondary)]">
              <span>
                {t.effortScore}: {complexityBadge.estimatedEffortScore}/100
              </span>
              <div className="w-20 h-2.5 rounded-xs bg-[var(--win-bg-soft)] border border-[var(--win-border)] overflow-hidden">
                <div
                  className="h-full"
                  style={{
                    width: `${complexityBadge.estimatedEffortScore}%`,
                    backgroundColor: badgeTone.bar,
                  }}
                />
              </div>
            </div>
          </div>

          <h3 className="font-retro text-sm sm:text-base font-bold text-[var(--ink-primary)] leading-snug">
            {complexityBadge.headline}
          </h3>
          <p className="text-sm text-[var(--ink-secondary)] mt-1.5 leading-relaxed">
            {complexityBadge.summary}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {complexityBadge.detectedDomains.map((domain) => (
              <span
                key={domain}
                className="px-2 py-0.5 rounded text-[11px] font-medium bg-[var(--win-bg-soft)] text-[var(--ink-secondary)] border border-[var(--win-border-soft)]"
              >
                #{domain}
              </span>
            ))}
          </div>
        </div>
      </motion.section>

      {/* =====================================================================
          2. PİYASADAKİ EN İYİ 5 YAPAY ZEKA & ALT MODEL (İLK 3 PODYUM)
         ===================================================================== */}
      <motion.section variants={cardVariants} className="retro-window-sm overflow-hidden">
        <div className="retro-titlebar">
          <div className="flex items-center gap-2 min-w-0">
            <RetroFolderIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="font-retro text-[11px] font-bold text-[#1b2544] dark:text-[#eef2ff] truncate">
              {t.card2TitleBar}
            </span>
          </div>
          <RetroWindowControls />
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 mb-3.5">
            <div>
              <span className="font-retro text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                {t.section2Label}
              </span>
              <h4 className="font-retro text-sm sm:text-base font-bold text-[var(--ink-primary)]">
                {t.section2Heading}
              </h4>
            </div>
            <span className="font-retro text-[10px] font-bold px-2 py-0.5 rounded bg-[#fce7f3] dark:bg-[#f472b6]/20 text-[#be185d] dark:text-[#fbcfe8] border border-[#f472b6]">
              {t.top3Podium}
            </span>
          </div>

          {/* TOP 3 PODIUM */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {top3.map((model, idx) => {
              const rank = idx + 1;
              const rankMeta =
                rank === 1
                  ? {
                      icon: <Crown className="w-3.5 h-3.5" />,
                      label: t.rank1Badge,
                      badgeCls:
                        'bg-[#fce7f3] dark:bg-[#f472b6]/25 text-[#be185d] dark:text-[#fbcfe8] border-[#ec4899]',
                      cardCls: 'retro-window-sm bg-[var(--win-bg)]',
                    }
                  : rank === 2
                  ? {
                      icon: <Medal className="w-3.5 h-3.5" />,
                      label: t.rank2Badge,
                      badgeCls:
                        'bg-[#dbeafe] dark:bg-[#2a3b75] text-[#1e3a8a] dark:text-[#dbeafe] border-[#60a5fa]',
                      cardCls: 'retro-panel-flat',
                    }
                  : {
                      icon: <Award className="w-3.5 h-3.5" />,
                      label: t.rank3Badge,
                      badgeCls:
                        'bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 border-amber-500/70',
                      cardCls: 'retro-panel-flat',
                    };

              return (
                <div key={model.toolId} className={`${rankMeta.cardCls} p-3.5 flex flex-col`}>
                  <div className="flex items-center justify-between gap-1.5 mb-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-retro text-[10px] font-bold border ${rankMeta.badgeCls}`}
                    >
                      {rankMeta.icon}
                      {rankMeta.label}
                    </span>
                    <span className="font-retro text-xs font-bold text-[var(--ink-primary)]">
                      {model.score}%
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-xs border border-[#2c3b68] shrink-0"
                      style={{ backgroundColor: model.accentColor }}
                    />
                    <h5 className="font-retro font-bold text-sm text-[var(--ink-primary)]">
                      {model.name}
                    </h5>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[var(--win-bg-soft)] border border-[var(--win-border-soft)] text-[var(--ink-secondary)]">
                      {model.recommendedTierLabel}
                    </span>
                  </div>

                  {/* Exact Sub-Model Chip */}
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#dde7ff] dark:bg-[#2a3668] border border-[var(--win-border)] text-[11px] font-retro font-bold text-[#1b2544] dark:text-[#eef2ff] w-fit">
                    <Cpu className="w-3 h-3 text-[#ec4899] shrink-0" />
                    <span className="truncate">{model.subModelName}</span>
                  </div>

                  <ul className="mt-2.5 space-y-1.5">
                    {model.reasons.map((r, i) => (
                      <li
                        key={i}
                        className="text-xs text-[var(--ink-secondary)] leading-snug flex items-start gap-1.5"
                      >
                        <span className="text-[#ec4899] font-bold">›</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* #4 & #5 */}
          {rest2.length > 0 && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {rest2.map((model, idx) => (
                <div
                  key={model.toolId}
                  className="retro-panel-flat p-3 flex items-start gap-2.5"
                >
                  <span className="w-6 h-6 rounded bg-[var(--win-bg)] border border-[var(--win-border)] font-retro text-[11px] font-bold text-[var(--ink-primary)] flex items-center justify-center shrink-0">
                    #{idx + 4}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-retro font-bold text-xs text-[var(--ink-primary)]">
                          {model.name}
                        </span>
                        <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-[#dde7ff] dark:bg-[#2a3668] text-[#1b2544] dark:text-[#eef2ff]">
                          {model.subModelName}
                        </span>
                      </div>
                      <span className="font-retro text-[11px] font-bold text-[var(--ink-secondary)]">
                        {model.score}%
                      </span>
                    </div>
                    <p className="text-xs text-[var(--ink-secondary)] mt-1 leading-snug">
                      {model.reasons[0]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      {/* =====================================================================
          3. SENİN ELİNDEKİ EN İYİ SEÇENEKLER & ALT MODEL YÖNLENDİRMESİ
         ===================================================================== */}
      <motion.section variants={cardVariants} className="retro-window-sm overflow-hidden">
        <div className="retro-titlebar">
          <div className="flex items-center gap-2 min-w-0">
            <RetroFolderIcon accent className="w-3.5 h-3.5 shrink-0" />
            <span className="font-retro text-[11px] font-bold text-[#1b2544] dark:text-[#eef2ff] truncate">
              {t.card3TitleBar}
            </span>
          </div>
          <RetroWindowControls />
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
            <div>
              <span className="font-retro text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                {t.section3Label}
              </span>
              <h4 className="font-retro text-sm sm:text-base font-bold text-[var(--ink-primary)]">
                {t.section3Heading}
              </h4>
            </div>

            <button
              type="button"
              onClick={onOpenPlans}
              className="retro-btn px-3 py-1.5 font-retro text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-[#ec4899]" />
              {t.editPlansBtn}
            </button>
          </div>

          {quotaSkippedModels.length > 0 && (
            <div className="mb-3.5 p-3 rounded-lg bg-amber-100 dark:bg-amber-900/35 border-[1.5px] border-amber-500 flex items-start gap-2 text-xs text-amber-950 dark:text-amber-100">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-300 shrink-0 mt-0.5" />
              <span>
                <strong>{t.quotaSkippedLabel}</strong>{' '}
                {quotaSkippedModels.map((m) => `${m.name} (${m.tierLabel})`).join(', ')}.{' '}
                {t.quotaSkippedNote}
              </span>
            </div>
          )}

          {userBestOptions.length === 0 ? (
            <div className="p-4 rounded-lg bg-rose-100 dark:bg-rose-950/40 border-[1.5px] border-rose-500 text-xs text-rose-900 dark:text-rose-200 space-y-1.5">
              <p className="font-retro font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {t.noActivePlansTitle}
              </p>
              <p className="leading-relaxed">{t.noActivePlansBody}</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {userBestOptions.slice(0, 4).map((opt, idx) => (
                <div
                  key={opt.toolId}
                  className={
                    idx === 0 ? 'retro-window-sm p-3.5 bg-[var(--win-bg)]' : 'retro-panel-flat p-3.5'
                  }
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`w-6 h-6 rounded font-retro text-xs font-bold flex items-center justify-center border ${
                          idx === 0
                            ? 'bg-[#3a56a8] dark:bg-[#5b72d6] text-white border-[#2c3b68]'
                            : 'bg-[var(--win-bg)] text-[var(--ink-primary)] border-[var(--win-border)]'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="font-retro font-bold text-sm text-[var(--ink-primary)]">
                        {opt.name}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[var(--win-bg-soft)] border border-[var(--win-border-soft)] text-[var(--ink-secondary)]">
                        {opt.tierLabel}
                      </span>
                      {idx === 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-retro text-[10px] font-bold bg-[#fce7f3] dark:bg-[#f472b6]/20 text-[#be185d] dark:text-[#fbcfe8] border border-[#f472b6]">
                          <CheckCircle2 className="w-3 h-3" />
                          {t.bestActiveChoice}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[var(--win-bg-soft)] border border-[var(--win-border-soft)] text-[var(--ink-secondary)]">
                        {opt.creditCostLabel}
                      </span>
                      <span className="font-retro text-xs font-bold text-[var(--ink-primary)]">
                        {opt.score}%
                      </span>
                    </div>
                  </div>

                  {/* Exact Sub-Model Callout Box */}
                  <div className="mt-2.5 px-3 py-2 rounded-md bg-[#e6eeff] dark:bg-[#25315f] border-[1.5px] border-[var(--win-border)] flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 font-retro text-[11px] font-bold text-[#1b2544] dark:text-[#eef2ff]">
                      <Cpu className="w-3.5 h-3.5 text-[#ec4899]" />
                      {t.recommendedSubModelLabel}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[var(--win-bg)] border border-[var(--win-border)] font-retro text-xs font-bold text-[#1b2544] dark:text-[#eef2ff]">
                      {opt.subModelName}
                    </span>
                    <span className="text-xs text-[var(--ink-secondary)] leading-snug">
                      — {opt.subModelGuidance}
                    </span>
                  </div>

                  {opt.planConstraintNote && (
                    <div className="mt-2 flex items-start gap-2 px-3 py-1.5 rounded-md bg-amber-50 dark:bg-amber-900/25 border border-amber-400/70 text-[11px] text-amber-950 dark:text-amber-200 leading-snug">
                      <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-300 shrink-0 mt-0.5" />
                      <span>
                        <strong>{t.planConstraintLabel}</strong> {opt.planConstraintNote}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      {/* =====================================================================
          4. AKILLI STRATEJİ, COMBO & KESİN ALT MODEL KARARI
         ===================================================================== */}
      <motion.section variants={cardVariants} className="retro-window-sm overflow-hidden">
        <div className="retro-titlebar">
          <div className="flex items-center gap-2 min-w-0">
            <GitBranch className="w-3.5 h-3.5 text-[#1b2544] dark:text-[#eef2ff] shrink-0" />
            <span className="font-retro text-[11px] font-bold text-[#1b2544] dark:text-[#eef2ff] truncate">
              {t.card4TitleBar}
            </span>
          </div>
          <RetroWindowControls />
        </div>

        <div className="p-4 sm:p-5">
          <span className="font-retro text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
            {t.section4Label}
          </span>
          <h4 className="font-retro text-sm sm:text-base font-bold text-[var(--ink-primary)] mt-0.5">
            {strategy.headline}
          </h4>
          <p className="text-sm text-[var(--ink-secondary)] mt-1.5 leading-relaxed">
            {strategy.description}
          </p>

          {strategy.mode === 'simple_equivalent' && strategy.equivalentModels && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="font-retro text-[11px] font-bold text-[var(--ink-muted)]">
                {t.equivalentLabel}
              </span>
              {strategy.equivalentModels.map((name) => (
                <span
                  key={name}
                  className="px-2.5 py-1 rounded-md bg-[var(--win-bg-soft)] border border-[var(--win-border)] font-retro text-xs font-bold text-[var(--ink-primary)]"
                >
                  {name}
                </span>
              ))}
            </div>
          )}

          {strategy.mode === 'combo_workflow' && strategy.comboSteps && (
            <div className="mt-4 space-y-2.5">
              {strategy.comboSteps.map((step, i) => (
                <div key={step.stepNumber}>
                  <div className="retro-panel-flat p-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded font-retro text-[11px] font-bold bg-[#3a56a8] dark:bg-[#5b72d6] text-white">
                          {t.stepLabel} {step.stepNumber}
                        </span>
                        <h5 className="font-retro text-xs sm:text-sm font-bold text-[var(--ink-primary)]">
                          {step.title}
                        </h5>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded font-retro text-[11px] font-bold bg-[#dde7ff] dark:bg-[#2a3668] border border-[var(--win-border)] text-[#1b2544] dark:text-[#eef2ff]">
                          {step.recommendedModelName} → {step.recommendedSubModel}
                        </span>
                        {step.isFromUserStack && (
                          <span className="text-[10px] font-retro font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border border-emerald-500/50">
                            {t.inYourPlan}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-[var(--ink-secondary)] mt-1.5">{step.rationale}</p>

                    <div className="mt-2.5 p-2.5 rounded-md bg-[var(--win-bg)] border border-[var(--win-border-soft)] flex items-start justify-between gap-3">
                      <p className="text-xs font-code text-[var(--ink-primary)] whitespace-pre-wrap leading-relaxed">
                        {step.stepPrompt}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          copyText(
                            step.stepPrompt,
                            `step_${step.stepNumber}`,
                            `${step.stepNumber}. ${t.toastStepCopied}`
                          )
                        }
                        className="retro-btn p-1.5 shrink-0 cursor-pointer"
                        title={t.copyStepPrompt}
                      >
                        {copiedId === `step_${step.stepNumber}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {i < strategy.comboSteps!.length - 1 && (
                    <div className="flex justify-center py-1 text-[var(--ink-muted)]">
                      <ArrowRight className="w-4 h-4 rotate-90" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Final Exact Sub-Model Verdict Strip */}
          <div className="mt-4 p-3 rounded-lg bg-[#fce7f3] dark:bg-[#f472b6]/15 border-[1.5px] border-[#ec4899] flex items-start gap-2">
            <RetroStarSvg pinkAccent className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="text-xs text-[#831843] dark:text-[#fce7f3] leading-relaxed">
              <strong className="font-retro">{t.finalSubModelCallout}</strong>{' '}
              {strategy.finalVerdictLine}
            </p>
          </div>
        </div>
      </motion.section>

      {/* =====================================================================
          5. YAZIM DÜZELTMELİ & MODELE ÖZEL PROMPT İYİLEŞTİRİCİ
         ===================================================================== */}
      <motion.section variants={cardVariants} className="retro-window-sm overflow-hidden">
        <div className="retro-titlebar">
          <div className="flex items-center gap-2 min-w-0">
            <RetroStarSvg pinkAccent className="w-3.5 h-3.5 shrink-0" />
            <span className="font-retro text-[11px] font-bold text-[#1b2544] dark:text-[#eef2ff] truncate">
              {t.card5TitleBar}
            </span>
          </div>
          <RetroWindowControls />
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div>
              <span className="font-retro text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                {t.section5Label}
              </span>
              <h4 className="font-retro text-sm sm:text-base font-bold text-[var(--ink-primary)] mt-0.5">
                {activePromptBlock.modelName} · {activePromptBlock.subModelName}{' '}
                {t.optimizedForSuffix}
              </h4>
              <p className="text-xs text-[var(--ink-secondary)] mt-0.5">
                {activePromptBlock.formatLabel} — {activePromptBlock.whyNote}
              </p>
            </div>

            {promptEnhancer.marketTopAlternative && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPromptTarget('user_top')}
                  className={`px-2.5 py-1 font-retro text-[11px] font-bold cursor-pointer ${
                    promptTarget === 'user_top' ? 'retro-btn-accent' : 'retro-btn'
                  }`}
                >
                  {t.yourTop1} ({promptEnhancer.targetSubModelName})
                </button>
                <button
                  type="button"
                  onClick={() => setPromptTarget('market_top')}
                  className={`px-2.5 py-1 font-retro text-[11px] font-bold cursor-pointer ${
                    promptTarget === 'market_top' ? 'retro-btn-accent' : 'retro-btn'
                  }`}
                >
                  {t.marketTop1} ({promptEnhancer.marketTopAlternative.targetSubModelName})
                </button>
              </div>
            )}
          </div>

          {/* Typo & Phrasing Auto-Fix Transparency Strip */}
          {promptEnhancer.typoFixesCount > 0 && (
            <div className="mb-3 rounded-lg bg-[#f3f7ff] dark:bg-[#212b54] border border-[var(--win-border-soft)] p-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-retro text-[11px] font-bold bg-[#fce7f3] dark:bg-[#f472b6]/20 text-[#be185d] dark:text-[#fbcfe8] border border-[#f472b6]">
                    <SpellCheck2 className="w-3.5 h-3.5" />
                    {promptEnhancer.typoFixesCount} {t.typosFixedBadge}
                  </span>
                  <div className="hidden sm:flex flex-wrap gap-1">
                    {promptEnhancer.typoFixesList.slice(0, 4).map((fix, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-code px-1.5 py-0.5 rounded bg-[var(--win-bg)] border border-[var(--win-border-soft)] text-[var(--ink-secondary)]"
                      >
                        <span className="line-through opacity-65">{fix.from}</span> →{' '}
                        <strong className="text-[var(--ink-primary)]">{fix.to}</strong>
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowTypoDiff((v) => !v)}
                  className="text-[11px] font-retro font-bold text-[#3a56a8] dark:text-[#93c5fd] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {showTypoDiff ? t.hideCleanedText : t.showCleanedText}
                  {showTypoDiff ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {showTypoDiff && (
                <div className="mt-2.5 pt-2.5 retro-divider space-y-1.5 text-xs">
                  <p className="text-[var(--ink-muted)]">
                    <strong className="font-retro">{t.originalTextLabel}</strong>{' '}
                    <span className="line-through">{promptEnhancer.originalInput}</span>
                  </p>
                  <p className="text-[var(--ink-primary)]">
                    <strong className="font-retro text-emerald-700 dark:text-emerald-300">
                      {t.cleanedTextLabel}
                    </strong>{' '}
                    {promptEnhancer.cleanedInput}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Crisp Monospace Prompt Box */}
          <div className="rounded-lg p-4 bg-[var(--win-bg-soft)] border-[1.5px] border-[var(--win-border)] overflow-x-auto">
            <pre className="text-xs sm:text-[13px] font-code text-[var(--ink-primary)] whitespace-pre-wrap leading-relaxed m-0">
              {activePromptBlock.promptText}
            </pre>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() =>
                handleCopyAndOpen(
                  activePromptBlock.promptText,
                  activePromptBlock.url,
                  `${activePromptBlock.modelName} (${activePromptBlock.subModelName})`
                )
              }
              className="retro-btn-primary px-4 py-2 font-retro text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              {copiedId === 'main_prompt' ? (
                <Check className="w-4 h-4" />
              ) : (
                <ExternalLink className="w-4 h-4" />
              )}
              {t.copyAndOpenPrefix} {activePromptBlock.modelName} ({activePromptBlock.subModelName})
              {t.copyAndOpenSuffix}
            </button>

            <button
              type="button"
              onClick={() => copyText(activePromptBlock.promptText, 'copy_only', t.toastCopied)}
              className="retro-btn px-3.5 py-2 font-retro text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              {copiedId === 'copy_only' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  {t.copied}
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  {t.copyOnly}
                </>
              )}
            </button>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
};
