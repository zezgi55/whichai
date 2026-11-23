import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Menu,
  Sliders,
  Sparkles,
  Zap,
  Leaf,
  Crown,
  SendHorizontal,
  ShieldAlert,
  Moon,
  Sun,
  User,
  Bot,
  Wand2,
} from 'lucide-react';
import { ChatMessage, PriorityMode, ThemeMode, UserPlanSelection } from '../types';
import { DEFAULT_AI_CATALOG, SAMPLE_STARTER_PROMPTS } from '../data/aiCatalog';
import { AnalysisCards } from './AnalysisCards';
import { DreamySparkleSvg, PixelCursorSvg } from './AtmosphereDecor';

interface ChatWorkspaceProps {
  threadTitle: string;
  messages: ChatMessage[];
  isAnalyzing: boolean;
  priorityMode: PriorityMode;
  onChangePriorityMode: (mode: PriorityMode) => void;
  onSendPrompt: (prompt: string) => void;
  onOpenSidebar: () => void;
  onOpenPlans: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  userPlans: UserPlanSelection[];
  onToast: (msg: string) => void;
}

const PRIORITY_MODES: Array<{
  id: PriorityMode;
  label: string;
  shortDesc: string;
  icon: React.ReactNode;
}> = [
  {
    id: 'quality',
    label: 'Maksimum Kalite',
    shortDesc: 'En yüksek performans odaklı',
    icon: <Crown className="w-3.5 h-3.5" />,
  },
  {
    id: 'speed',
    label: 'Hız Odaklı',
    shortDesc: 'En hızlı ve pratik çözüm',
    icon: <Zap className="w-3.5 h-3.5" />,
  },
  {
    id: 'credit_saver',
    label: 'Kredi Tasarrufu',
    shortDesc: 'Pro kredilerini korur',
    icon: <Leaf className="w-3.5 h-3.5" />,
  },
];

export const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({
  threadTitle,
  messages,
  isAnalyzing,
  priorityMode,
  onChangePriorityMode,
  onSendPrompt,
  onOpenSidebar,
  onOpenPlans,
  theme,
  onToggleTheme,
  userPlans,
  onToast,
}) => {
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
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  const activePlans = userPlans.filter((p) => p.enabled && !p.quotaReached);
  const quotaReachedPlans = userPlans.filter((p) => p.enabled && p.quotaReached);

  const getPlanLabel = (plan: UserPlanSelection) => {
    const def = plan.customTool ?? DEFAULT_AI_CATALOG.find((t) => t.id === plan.toolId);
    if (!def) return plan.toolId;
    const tier = def.tiers.find((t) => t.id === plan.tierId);
    const tierName = plan.customTierName?.trim() || tier?.label || '';
    return `${def.name}${tierName ? ` ${tierName}` : ''}`;
  };

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
    <div className="flex-1 flex flex-col h-full min-w-0 relative z-10">
      {/* Top Bar */}
      <header className="shrink-0 h-15 px-4 sm:px-6 flex items-center justify-between gap-3 border-b border-white/55 dark:border-purple-300/12 bg-white/40 dark:bg-[#0e0a1a]/60 backdrop-blur-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="lg:hidden p-2 rounded-xl glass-pill text-slate-700 dark:text-purple-100 cursor-pointer"
            aria-label="Menüyü aç"
          >
            <Menu className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
              {messages.length === 0 ? 'Yeni AI Yönlendirme Analizi' : threadTitle}
            </h2>
          </div>
        </div>

        {/* Quick Top Tabs / Drawer Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenPlans}
            className="glass-pill px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-800 dark:text-purple-100 flex items-center gap-2 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-purple-600 dark:text-fuchsia-300" />
            <span className="hidden sm:inline">AI Planlarım &amp; Kotalar</span>
            <span className="sm:hidden">Planlarım</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/18 text-emerald-700 dark:text-emerald-300">
              {activePlans.length}
            </span>
            {quotaReachedPlans.length > 0 && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-700 dark:text-amber-300">
                <ShieldAlert className="w-3 h-3" />
                {quotaReachedPlans.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            className="glass-pill p-2 rounded-full text-slate-700 dark:text-purple-100 cursor-pointer"
            title={theme === 'dark' ? 'Dreamy Y2K Aydınlık Moda Geç' : 'Liquid Glass Karanlık Moda Geç'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>
        </div>
      </header>

      {/* Main Scrollable Chat Stream */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            /* Welcome Hero (Gemini Style + Dual Theme Accents) */
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="py-6 sm:py-10 space-y-8"
            >
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill text-xs font-bold text-indigo-800 dark:text-purple-100">
                  {theme === 'light' ? (
                    <PixelCursorSvg className="w-4 h-4" />
                  ) : (
                    <DreamySparkleSvg className="w-3.5 h-3.5 text-fuchsia-300 animate-twinkle" />
                  )}
                  <span>Pro Kredilerini İsraf Etmeden En Doğru AI&apos;ı Seç</span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                  Bugün hangi görevi{' '}
                  <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-purple-300 dark:via-pink-300 dark:to-sky-300 bg-clip-text text-transparent">
                    en verimli AI
                  </span>{' '}
                  ile çözelim?
                </h1>

                <p className="text-sm sm:text-base text-slate-600 dark:text-purple-200/75 max-w-2xl mx-auto">
                  Görevini aşağıya yaz; WhichAI zorluk derecesini ölçsün, piyasadaki en iyi 5 modeli kıyaslasın, kotası dolmamış aktif planlarından en doğrusunu seçsin ve modele özel optimize promptu tek tıkla hazırlasın.
                </p>

                {/* Active Plans Mini Pill Bar */}
                <div className="pt-2 flex flex-wrap items-center justify-center gap-1.5">
                  {activePlans.slice(0, 6).map((plan) => (
                    <span
                      key={plan.toolId}
                      className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/70 dark:bg-white/[0.06] border border-indigo-200/70 dark:border-purple-300/20 text-slate-700 dark:text-purple-100"
                    >
                      {getPlanLabel(plan)}
                    </span>
                  ))}
                  {quotaReachedPlans.length > 0 && (
                    <button
                      type="button"
                      onClick={onOpenPlans}
                      className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-800 dark:text-amber-200 border border-amber-400/40 flex items-center gap-1 cursor-pointer"
                    >
                      <ShieldAlert className="w-3 h-3" />
                      {quotaReachedPlans.length} modelin limiti dolu
                    </button>
                  )}
                </div>
              </div>

              {/* Starter Example Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {SAMPLE_STARTER_PROMPTS.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => onSendPrompt(item.prompt)}
                    className="liquid-card rounded-2xl p-4 text-left hover:-translate-y-0.5 transition group cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/12 dark:bg-purple-400/20 text-indigo-700 dark:text-purple-200">
                        {item.badge}
                      </span>
                      <Wand2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-500 dark:group-hover:text-fuchsia-300 transition" />
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-purple-200/75 mt-1 line-clamp-2 leading-relaxed">
                      &ldquo;{item.prompt}&rdquo;
                    </p>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            /* Active Conversation Messages */
            <div className="space-y-6 pb-4">
              {messages.map((msg) => (
                <div key={msg.id}>
                  {msg.role === 'user' ? (
                    <div className="flex justify-end items-start gap-2.5">
                      <div className="max-w-2xl rounded-3xl rounded-tr-md px-4 py-3 chat-reading-card border-indigo-300/80 dark:border-purple-400/30">
                        <p className="text-sm text-slate-900 dark:text-white whitespace-pre-wrap leading-relaxed">
                          {msg.content}
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-2xl glass-pill flex items-center justify-center shrink-0 text-indigo-700 dark:text-purple-200">
                        <User className="w-4 h-4" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <div className="hidden sm:flex w-8 h-8 rounded-2xl liquid-glow-primary items-center justify-center shrink-0 mt-1 shadow-md">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        {msg.analysis ? (
                          <AnalysisCards
                            analysis={msg.analysis}
                            onOpenPlans={onOpenPlans}
                            onToast={onToast}
                          />
                        ) : (
                          <div className="chat-reading-card rounded-3xl p-4 text-sm text-slate-800 dark:text-purple-100">
                            {msg.content}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Analyzing Shimmer Card */}
              {isAnalyzing && (
                <div className="flex items-start gap-3">
                  <div className="hidden sm:flex w-8 h-8 rounded-2xl liquid-glow-primary items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-white animate-spin" />
                  </div>
                  <div className="flex-1 chat-reading-card rounded-3xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-fuchsia-300">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      Görev analiz ediliyor, aktif planların taranıyor ve modele özel prompt hazırlanıyor...
                    </div>
                    <div className="space-y-2 animate-pulse">
                      <div className="h-3 w-3/4 rounded-full bg-indigo-200/70 dark:bg-purple-400/20" />
                      <div className="h-3 w-1/2 rounded-full bg-indigo-200/50 dark:bg-purple-400/15" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={endRef} />
            </div>
          )}
        </div>
      </main>

      {/* Bottom Sticky Composer + 3 Priority Modes */}
      <footer className="shrink-0 px-4 sm:px-6 pb-4 pt-2 bg-gradient-to-t from-white/55 via-white/30 to-transparent dark:from-[#0b0714]/90 dark:via-[#0b0714]/55 dark:to-transparent">
        <div className="max-w-4xl mx-auto space-y-2.5">
          {/* 3 One-Click Priority Modes right above input */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            {PRIORITY_MODES.map((m) => {
              const active = priorityMode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onChangePriorityMode(m.id)}
                  title={m.shortDesc}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    active
                      ? 'liquid-glow-primary text-white scale-[1.02]'
                      : 'glass-pill text-slate-700 dark:text-purple-100/90 hover:-translate-y-0.5'
                  }`}
                >
                  {m.icon}
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* Input Box */}
          <form
            onSubmit={handleSubmit}
            className="glass-panel rounded-3xl p-2 pl-4 flex items-end gap-2 shadow-lg"
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Yapay zekaya yaptırmak istediğin görevi yaz... (Örn: 120 sayfalık PDF'i özetle veya React auth servisi kodla)"
              className="flex-1 bg-transparent resize-none py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-purple-200/50 focus:outline-none max-h-40 leading-relaxed"
            />
            <button
              type="submit"
              disabled={!input.trim() || isAnalyzing}
              className="liquid-glow-primary p-3 rounded-2xl disabled:opacity-45 disabled:cursor-not-allowed shrink-0 cursor-pointer"
              aria-label="Analiz et"
            >
              <SendHorizontal className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[11px] text-center text-slate-500 dark:text-purple-200/55">
            Aktif {activePlans.length} plan taranır
            {quotaReachedPlans.length > 0
              ? ` · ${quotaReachedPlans.length} kota dolu model hariç tutulur`
              : ''}
            {' · '}Enter ile gönder, Shift+Enter ile alt satır
          </p>
        </div>
      </footer>
    </div>
  );
};
