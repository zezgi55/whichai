import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  MessageSquare,
  Trash2,
  Sliders,
  Moon,
  Sun,
  ShieldAlert,
  Sparkles,
  PanelLeftClose,
} from 'lucide-react';
import { ChatThread, ThemeMode, UserPlanSelection } from '../types';
import { DreamySparkleSvg, LavenderBotanicalSvg, PixelCursorSvg } from './AtmosphereDecor';

interface SidebarProps {
  threads: ChatThread[];
  activeThreadId: string | null;
  onSelectThread: (id: string) => void;
  onNewChat: () => void;
  onDeleteThread: (id: string) => void;
  onOpenPlans: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  userPlans: UserPlanSelection[];
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  threads,
  activeThreadId,
  onSelectThread,
  onNewChat,
  onDeleteThread,
  onOpenPlans,
  theme,
  onToggleTheme,
  userPlans,
  mobileOpen,
  onCloseMobile,
}) => {
  const activePlansCount = userPlans.filter((p) => p.enabled && !p.quotaReached).length;
  const quotaReachedCount = userPlans.filter((p) => p.enabled && p.quotaReached).length;

  const sidebarContent = (
    <div className="glass-panel relative h-full flex flex-col w-[280px] sm:w-[292px] border-r border-white/65 dark:border-purple-300/20 overflow-hidden select-none">
      {/* Subtle atmospheric art strictly inside the Sidebar (keeps chat reading area calm) */}
      {theme === 'dark' ? (
        <LavenderBotanicalSvg className="pointer-events-none absolute -bottom-4 -right-3 w-28 h-40 opacity-30" />
      ) : (
        <div className="pointer-events-none absolute top-3.5 right-3.5 flex items-center gap-1 opacity-75">
          <DreamySparkleSvg className="w-3.5 h-3.5 text-indigo-500 animate-twinkle" />
          <PixelCursorSvg className="w-4 h-4" />
        </div>
      )}

      {/* Brand Header */}
      <div className="px-4 pt-4 pb-3 border-b border-indigo-200/50 dark:border-purple-300/15">
        {theme === 'light' && (
          <div className="flex items-center gap-1.5 mb-2.5">
            <span className="y2k-dot bg-gradient-to-br from-pink-300 to-purple-300" />
            <span className="y2k-dot bg-gradient-to-br from-sky-200 to-blue-300" />
            <span className="y2k-dot bg-gradient-to-br from-indigo-200 to-violet-300" />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl liquid-glow-primary flex items-center justify-center shadow-md shrink-0">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                WhichAI
              </h1>
              <p className="text-[11px] font-medium text-indigo-700/75 dark:text-purple-200/70">
                AI Router &amp; Kredi Asistanı
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-xl glass-pill text-slate-600 dark:text-purple-200 cursor-pointer"
            aria-label="Menüyü kapat"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <button
          type="button"
          onClick={() => {
            onNewChat();
            onCloseMobile();
          }}
          className="mt-4 w-full liquid-glow-primary py-2.5 px-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.6]" />
          Yeni Sohbet
        </button>
      </div>

      {/* Chat History List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        <div className="px-2 pb-1.5 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-purple-200/55">
            Önceki Sohbetler
          </span>
          <span className="text-[10px] font-semibold text-slate-400 dark:text-purple-300/45">
            {threads.length}
          </span>
        </div>

        {threads.length === 0 ? (
          <div className="px-3 py-6 text-center rounded-2xl bg-white/35 dark:bg-white/[0.03] border border-dashed border-indigo-200/70 dark:border-purple-300/15">
            <p className="text-xs text-slate-500 dark:text-purple-200/60">
              Henüz sohbet yok. İlk görevini yazarak en doğru yapay zekayı keşfet!
            </p>
          </div>
        ) : (
          threads.map((thread) => {
            const isActive = thread.id === activeThreadId;
            return (
              <div
                key={thread.id}
                onClick={() => {
                  onSelectThread(thread.id);
                  onCloseMobile();
                }}
                className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-2xl cursor-pointer transition-all ${
                  isActive
                    ? 'liquid-card ring-1 ring-purple-400/60 dark:ring-fuchsia-400/50 text-slate-900 dark:text-white'
                    : 'hover:bg-white/50 dark:hover:bg-white/[0.06] text-slate-700 dark:text-purple-100/80'
                }`}
              >
                <MessageSquare
                  className={`w-4 h-4 shrink-0 ${
                    isActive
                      ? 'text-purple-600 dark:text-fuchsia-300'
                      : 'text-slate-400 dark:text-purple-300/50'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{thread.title}</p>
                  <p className="text-[10px] text-slate-500 dark:text-purple-200/50 mt-0.5">
                    {thread.messages.filter((m) => m.role === 'user').length} analiz
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteThread(thread.id);
                  }}
                  aria-label="Sohbeti sil"
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Controls: AI Planlarım Widget + Theme Switcher */}
      <div className="relative z-10 p-3 border-t border-indigo-200/55 dark:border-purple-300/15 space-y-2.5 bg-white/30 dark:bg-black/20">
        {/* Quick Plans Access Card */}
        <button
          type="button"
          onClick={() => {
            onOpenPlans();
            onCloseMobile();
          }}
          className="w-full liquid-card rounded-2xl p-3 text-left hover:-translate-y-0.5 transition cursor-pointer"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-purple-500/20 to-sky-400/25 dark:from-purple-500/35 dark:to-pink-500/30 border border-white/50 dark:border-purple-300/30 flex items-center justify-center">
                <Sliders className="w-3.5 h-3.5 text-purple-700 dark:text-fuchsia-200" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">AI Planlarım</p>
                <p className="text-[10px] text-slate-600 dark:text-purple-200/70">
                  {activePlansCount} aktif plan
                </p>
              </div>
            </div>
            {quotaReachedCount > 0 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-400/40">
                <ShieldAlert className="w-3 h-3" />
                {quotaReachedCount} Dolu
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-400/30">
                Hazır
              </span>
            )}
          </div>
        </button>

        {/* Dual-Theme Toggle (Liquid Glass Dark <-> Dreamy Y2K Light) */}
        <button
          type="button"
          onClick={onToggleTheme}
          className="w-full glass-pill rounded-2xl p-2 px-3 flex items-center justify-between cursor-pointer"
        >
          <span className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-purple-100">
            {theme === 'dark' ? (
              <>
                <Moon className="w-3.5 h-3.5 text-fuchsia-300" />
                Liquid Glass
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-indigo-600" />
                Dreamy Y2K
              </>
            )}
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 dark:bg-purple-400/20 text-indigo-700 dark:text-purple-200">
            {theme === 'dark' ? 'Aydınlık' : 'Karanlık'}
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Static Sidebar */}
      <aside className="hidden lg:block h-full shrink-0 z-20">{sidebarContent}</aside>

      {/* Mobile Slide-in Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="lg:hidden fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="lg:hidden fixed inset-y-0 left-0 z-50"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
