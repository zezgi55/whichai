import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Menu,
  Sliders,
  Zap,
  Leaf,
  Crown,
  SendHorizontal,
  ShieldAlert,
  Moon,
  Sun,
  User,
  Bot,
  Settings,
  Wand2,
} from 'lucide-react';
import { ChatMessage, Language, PriorityMode, ThemeMode, UserPlanSelection } from '../types';
import { DEFAULT_AI_CATALOG, getStarterPrompts } from '../data/aiCatalog';
import { TRANSLATIONS } from '../i18n/translations';
import { AnalysisCards } from './AnalysisCards';
import {
  RetroCloudSvg,
  RetroCrescentSvg,
  RetroNoteIcon,
  RetroStarSvg,
  RetroWindowControls,
} from './AtmosphereDecor';

interface ChatWorkspaceProps {
  threadTitle: string;
  messages: ChatMessage[];
  isAnalyzing: boolean;
  priorityMode: PriorityMode;
  onChangePriorityMode: (mode: PriorityMode) => void;
  onSendPrompt: (prompt: string) => void;
  onOpenSidebar: () => void;
  onOpenPlans: () => void;
  onOpenSettings: () => void;
  lang: Language;
  theme: ThemeMode;
  onToggleTheme: () => void;
  userPlans: UserPlanSelection[];
  onToast: (msg: string) => void;
}

export const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({
  threadTitle,
  messages,
  isAnalyzing,
  priorityMode,
  onChangePriorityMode,
  onSendPrompt,
  onOpenSidebar,
  onOpenPlans,
  onOpenSettings,
  lang,
  theme,
  onToggleTheme,
  userPlans,
  onToast,
}) => {
  const t = TRANSLATIONS[lang];
  const starterPrompts = getStarterPrompts(lang);

  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isAnalyzing]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 150)}px`;
  }, [input]);

  const activePlans = userPlans.filter((p) => p.enabled && !p.quotaReached);
  const quotaReachedPlans = userPlans.filter((p) => p.enabled && p.quotaReached);

  const getPlanLabel = (plan: UserPlanSelection) => {
    const def = plan.customTool ?? DEFAULT_AI_CATALOG.find((item) => item.id === plan.toolId);
    if (!def) return plan.toolId;
    const tier = def.tiers.find((tr) => tr.id === plan.tierId);
    const tierName =
      plan.customTierName?.trim() || (tier ? (lang === 'tr' ? tier.labelTr : tier.labelEn) : '');
    return `${def.name}${tierName ? ` (${tierName})` : ''}`;
  };

  const priorityModes: Array<{
    id: PriorityMode;
    label: string;
    desc: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'quality',
      label: t.modeQuality,
      desc: t.modeQualityDesc,
      icon: <Crown className="w-3.5 h-3.5" />,
    },
    {
      id: 'speed',
      label: t.modeSpeed,
      desc: t.modeSpeedDesc,
      icon: <Zap className="w-3.5 h-3.5" />,
    },
    {
      id: 'credit_saver',
      label: t.modeSaver,
      desc: t.modeSaverDesc,
      icon: <Leaf className="w-3.5 h-3.5" />,
    },
  ];

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isAnalyzing) return;
    onSendPrompt(trimmed);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 relative z-10 p-2.5">
      <div className="retro-window flex-1 flex flex-col overflow-hidden">
        {/* Main Workspace Top Retro Bar */}
        <header className="retro-titlebar shrink-0 py-2 px-3 sm:px-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={onOpenSidebar}
              className="lg:hidden retro-btn p-1.5 cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4" />
            </button>
            <RetroNoteIcon className="w-4 h-4 shrink-0 hidden sm:block" />
            <h2 className="font-retro text-xs sm:text-sm font-bold text-[#1b2544] dark:text-[#eef2ff] truncate">
              {messages.length === 0 ? t.newAnalysisTitle : threadTitle}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenPlans}
              className="retro-btn px-2.5 py-1 font-retro text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-[#3a56a8] dark:text-[#93c5fd]" />
              <span className="hidden md:inline">{t.myPlansAndQuotas}</span>
              <span className="md:hidden">{t.myPlansShort}</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 text-[10px]">
                {activePlans.length}
              </span>
              {quotaReachedPlans.length > 0 && (
                <span className="inline-flex items-center gap-0.5 px-1.5 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 text-[10px]">
                  <ShieldAlert className="w-3 h-3" />
                  {quotaReachedPlans.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              className="retro-btn px-2.5 py-1 font-retro text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              title={t.settings}
            >
              <Settings className="w-3.5 h-3.5 text-[#ec4899]" />
              <span className="hidden sm:inline">{t.settings}</span>
              <span className="text-[10px] uppercase opacity-75">({lang})</span>
            </button>

            <button
              type="button"
              onClick={onToggleTheme}
              className="retro-btn p-1.5 cursor-pointer"
              title={theme === 'dark' ? t.switchToDay : t.switchToNight}
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-[#fde68a]" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-[#3a56a8]" />
              )}
            </button>
          </div>
        </header>

        {/* Scrollable Chat / Welcome Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 bg-[var(--win-bg-soft)]">
          <div className="max-w-4xl mx-auto">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="py-3 sm:py-6 space-y-6"
              >
                {/* Cozy Retro Welcome Dialog Window */}
                <div className="retro-window overflow-hidden">
                  <div className="retro-titlebar-alt">
                    <div className="flex items-center gap-2">
                      <RetroStarSvg pinkAccent className="w-3.5 h-3.5" />
                      <span className="font-retro text-[11px] font-bold text-[var(--ink-primary)]">
                        welcome_desk.txt
                      </span>
                    </div>
                    <RetroWindowControls />
                  </div>

                  <div className="relative p-5 sm:p-7 text-center space-y-3.5">
                    <div className="pointer-events-none hidden sm:block absolute top-4 left-5">
                      {theme === 'light' ? (
                        <RetroCloudSvg className="w-16 h-10 opacity-85" />
                      ) : (
                        <RetroCrescentSvg className="w-8 h-8 opacity-90" />
                      )}
                    </div>
                    <div className="pointer-events-none hidden sm:block absolute bottom-4 right-5">
                      <RetroStarSvg className="w-6 h-6 animate-star-blink" />
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md font-retro text-[11px] font-bold bg-[#fce7f3] dark:bg-[#f472b6]/20 text-[#be185d] dark:text-[#fbcfe8] border border-[#f472b6]">
                      <RetroStarSvg pinkAccent className="w-3.5 h-3.5" />
                      <span>{t.heroPill}</span>
                    </div>

                    <h1 className="font-retro text-xl sm:text-2xl font-bold text-[var(--ink-primary)] leading-snug max-w-2xl mx-auto">
                      {t.heroTitlePrefix}{' '}
                      <span className="px-1.5 py-0.5 rounded bg-[#dce7ff] dark:bg-[#2d3b75] border-b-2 border-[#ec4899]">
                        {t.heroTitleHighlight}
                      </span>{' '}
                      {t.heroTitleSuffix}
                    </h1>

                    <p className="text-sm text-[var(--ink-secondary)] max-w-2xl mx-auto leading-relaxed">
                      {t.heroSubtitle}
                    </p>

                    {/* Active Plans Chips */}
                    <div className="pt-1 flex flex-wrap items-center justify-center gap-1.5">
                      {activePlans.slice(0, 6).map((plan) => (
                        <span
                          key={plan.toolId}
                          className="px-2.5 py-0.5 rounded-md font-retro text-[11px] font-bold bg-[var(--win-bg-soft)] border border-[var(--win-border-soft)] text-[var(--ink-primary)]"
                        >
                          {getPlanLabel(plan)}
                        </span>
                      ))}
                      {quotaReachedPlans.length > 0 && (
                        <button
                          type="button"
                          onClick={onOpenPlans}
                          className="px-2.5 py-0.5 rounded-md font-retro text-[11px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 border border-amber-500 flex items-center gap-1 cursor-pointer"
                        >
                          <ShieldAlert className="w-3 h-3" />
                          {quotaReachedPlans.length} {t.modelsQuotaFullSuffix}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4 Starter Retro Mini-Windows */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {starterPrompts.map((item, i) => (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => onSendPrompt(item.prompt)}
                      className="retro-window-sm overflow-hidden text-left hover:-translate-y-0.5 transition group cursor-pointer"
                    >
                      <div className="retro-titlebar-alt py-1.5 px-3">
                        <span className="font-retro text-[10px] font-bold text-[var(--ink-secondary)]">
                          sample_0{i + 1}.txt
                        </span>
                        <span className="text-[10px] font-retro font-bold px-1.5 py-0.2 rounded bg-[#fce7f3] dark:bg-[#f472b6]/20 text-[#be185d] dark:text-[#fbcfe8] border border-[#f472b6]/70">
                          {item.badge}
                        </span>
                      </div>
                      <div className="p-3.5">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-retro text-xs sm:text-sm font-bold text-[var(--ink-primary)]">
                            {item.title}
                          </h3>
                          <Wand2 className="w-3.5 h-3.5 text-[var(--ink-muted)] group-hover:text-[#ec4899] shrink-0" />
                        </div>
                        <p className="text-xs text-[var(--ink-secondary)] mt-1 line-clamp-2 leading-relaxed">
                          &ldquo;{item.prompt}&rdquo;
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              /* Active Conversation Feed */
              <div className="space-y-5 pb-4">
                {messages.map((msg) => (
                  <div key={msg.id}>
                    {msg.role === 'user' ? (
                      <div className="flex justify-end items-start gap-2.5">
                        <div className="max-w-2xl retro-window-sm px-4 py-3 bg-[#e6eeff] dark:bg-[#263262]">
                          <p className="text-sm text-[var(--ink-primary)] whitespace-pre-wrap leading-relaxed">
                            {msg.content}
                          </p>
                        </div>
                        <div className="w-8 h-8 rounded-lg border-[1.5px] border-[var(--win-border)] bg-[var(--win-bg)] shadow-[2px_2px_0px_var(--win-shadow)] flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-[#3a56a8] dark:text-[#93c5fd]" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2.5">
                        <div className="hidden sm:flex w-8 h-8 rounded-lg border-[1.5px] border-[var(--win-border)] bg-[#dce7ff] dark:bg-[#2a3668] shadow-[2px_2px_0px_var(--win-shadow)] items-center justify-center shrink-0 mt-0.5">
                          <Bot className="w-4 h-4 text-[#ec4899]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          {msg.analysis ? (
                            <AnalysisCards
                              analysis={msg.analysis}
                              lang={lang}
                              onOpenPlans={onOpenPlans}
                              onToast={onToast}
                            />
                          ) : (
                            <div className="retro-window-sm p-4 text-sm text-[var(--ink-primary)]">
                              {msg.content}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isAnalyzing && (
                  <div className="flex items-start gap-2.5">
                    <div className="hidden sm:flex w-8 h-8 rounded-lg border-[1.5px] border-[var(--win-border)] bg-[#dce7ff] dark:bg-[#2a3668] items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-[#ec4899] animate-pulse" />
                    </div>
                    <div className="flex-1 retro-window-sm p-4 space-y-2.5">
                      <p className="font-retro text-xs font-bold text-[var(--ink-primary)]">
                        {t.analyzingText}
                      </p>
                      <div className="space-y-2 animate-pulse">
                        <div className="h-2.5 w-3/4 rounded bg-[#cbd9fb] dark:bg-[#334078]" />
                        <div className="h-2.5 w-1/2 rounded bg-[#dce7ff] dark:bg-[#283360]" />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={endRef} />
              </div>
            )}
          </div>
        </main>

        {/* Bottom Sticky Composer with 3 Retro Priority Mode Tabs */}
        <footer className="shrink-0 px-4 sm:px-6 py-3.5 border-t-[1.5px] border-[var(--win-border)] bg-[var(--win-bg)]">
          <div className="max-w-4xl mx-auto space-y-2.5">
            {/* 3 One-Click Priority Mode Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {priorityModes.map((m) => {
                const active = priorityMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onChangePriorityMode(m.id)}
                    title={m.desc}
                    className={`px-3 py-1.5 font-retro text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                      active ? 'retro-btn-accent' : 'retro-btn'
                    }`}
                  >
                    {m.icon}
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Bordered Retro Input Form */}
            <form
              onSubmit={handleSubmit}
              className="retro-input p-2 pl-3.5 flex items-end gap-2 bg-[var(--win-bg-soft)]"
            >
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.inputPlaceholder}
                className="flex-1 bg-transparent resize-none py-1.5 text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus:outline-none max-h-36 leading-relaxed"
              />
              <button
                type="submit"
                disabled={!input.trim() || isAnalyzing}
                className="retro-btn-primary p-2.5 disabled:opacity-45 disabled:cursor-not-allowed shrink-0 cursor-pointer"
                aria-label="Send"
              >
                <SendHorizontal className="w-4 h-4" />
              </button>
            </form>

            <p className="text-[11px] text-center text-[var(--ink-muted)] font-retro">
              {t.footerScanningPrefix} {activePlans.length} {t.footerScanningMid}
              {quotaReachedPlans.length > 0
                ? ` · ${quotaReachedPlans.length} ${t.footerQuotaSkippedMid}`
                : ''}
              {' · '}
              {t.footerKeyHint}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};
