import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Moon,
  Sun,
  ShieldAlert,
  Settings,
  PanelLeftClose,
} from 'lucide-react';
import { ChatThread, Language, ThemeMode, UserPlanSelection } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import {
  RetroFolderIcon,
  RetroNoteIcon,
  RetroStarSvg,
  RetroWindowControls,
} from './AtmosphereDecor';

interface SidebarProps {
  threads: ChatThread[];
  activeThreadId: string | null;
  onSelectThread: (id: string) => void;
  onNewChat: () => void;
  onDeleteThread: (id: string) => void;
  onOpenPlans: () => void;
  onOpenSettings: () => void;
  lang: Language;
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
  onOpenSettings,
  lang,
  theme,
  onToggleTheme,
  userPlans,
  mobileOpen,
  onCloseMobile,
}) => {
  const t = TRANSLATIONS[lang];
  const activePlansCount = userPlans.filter((p) => p.enabled && !p.quotaReached).length;
  const quotaReachedCount = userPlans.filter((p) => p.enabled && p.quotaReached).length;

  const sidebarContent = (
    <div className="retro-window h-full flex flex-col w-[274px] sm:w-[286px] overflow-hidden select-none">
      {/* Classic Retro Titlebar */}
      <div className="retro-titlebar">
        <div className="flex items-center gap-2 min-w-0">
          <RetroStarSvg pinkAccent className="w-4 h-4 shrink-0" />
          <span className="font-retro text-xs font-bold text-[#1b2544] dark:text-[#eef2ff] truncate">
            whichai.exe
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden retro-win-ctrl cursor-pointer"
            aria-label="Close menu"
          >
            <PanelLeftClose className="w-3 h-3" />
          </button>
          <div className="hidden lg:flex">
            <RetroWindowControls />
          </div>
        </div>
      </div>

      {/* Brand + New Chat */}
      <div className="p-3.5 border-b border-[var(--win-border-soft)] bg-[var(--win-bg-soft)]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg border-[1.5px] border-[var(--win-border)] bg-[#dce7ff] dark:bg-[#2a3668] shadow-[2px_2px_0px_var(--win-shadow)] flex items-center justify-center shrink-0">
            <RetroFolderIcon accent className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="font-retro text-base font-bold text-[var(--ink-primary)] leading-tight">
              {t.appName}
            </h1>
            <p className="text-[11px] text-[var(--ink-secondary)] truncate">{t.appSubtitle}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            onNewChat();
            onCloseMobile();
          }}
          className="mt-3.5 w-full retro-btn-primary py-2 px-3 font-retro text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          {t.newChat}
        </button>
      </div>

      {/* Chat History Directory */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        <div className="px-1 pb-1 flex items-center justify-between">
          <span className="font-retro text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
            {t.previousChats}
          </span>
          <span className="font-retro text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--win-bg-soft)] border border-[var(--win-border-soft)] text-[var(--ink-secondary)]">
            {threads.length}
          </span>
        </div>

        {threads.length === 0 ? (
          <div className="p-3.5 rounded-lg border-[1.5px] border-dashed border-[var(--win-border-soft)] bg-[var(--win-bg-soft)] text-center">
            <p className="text-xs text-[var(--ink-secondary)] leading-relaxed">{t.noChatsYet}</p>
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
                className={`group flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition border-[1.5px] ${
                  isActive
                    ? 'bg-[#fce7f3] dark:bg-[#f472b6]/18 border-[#f472b6] shadow-[2px_2px_0px_var(--win-shadow)] text-[#1b2544] dark:text-[#eef2ff]'
                    : 'bg-transparent border-transparent hover:bg-[var(--win-bg-soft)] hover:border-[var(--win-border-soft)] text-[var(--ink-primary)]'
                }`}
              >
                <RetroNoteIcon className="w-4 h-4 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{thread.title}</p>
                  <p className="text-[10px] text-[var(--ink-muted)]">
                    {thread.messages.filter((m) => m.role === 'user').length} {t.analysesCount}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteThread(thread.id);
                  }}
                  aria-label="Delete chat"
                  className="opacity-0 group-hover:opacity-100 p-1 rounded text-[var(--ink-muted)] hover:text-rose-600 dark:hover:text-rose-300 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Dock: AI Plans + Settings + Day/Night */}
      <div className="p-3 border-t border-[var(--win-border-soft)] bg-[var(--win-bg-soft)] space-y-2">
        {/* AI Plans Quick Card */}
        <button
          type="button"
          onClick={() => {
            onOpenPlans();
            onCloseMobile();
          }}
          className="w-full retro-btn p-2.5 text-left flex items-center justify-between gap-2 cursor-pointer"
        >
          <div className="flex items-center gap-2 min-w-0">
            <RetroFolderIcon className="w-4.5 h-4.5 shrink-0" />
            <div className="min-w-0">
              <p className="font-retro text-xs font-bold text-[var(--ink-primary)] truncate">
                {t.myAiPlans}
              </p>
              <p className="text-[10px] text-[var(--ink-secondary)]">
                {activePlansCount} {t.activePlans}
              </p>
            </div>
          </div>

          {quotaReachedCount > 0 ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-900/45 text-amber-900 dark:text-amber-200 border border-amber-500">
              <ShieldAlert className="w-3 h-3" />
              {quotaReachedCount} {t.quotaFull}
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-retro font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border border-emerald-500/60">
              {t.ready}
            </span>
          )}
        </button>

        {/* Settings + Theme Row */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              onOpenSettings();
              onCloseMobile();
            }}
            className="retro-btn py-2 px-2.5 font-retro text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-[#ec4899]" />
            <span>{t.settings}</span>
            <span className="text-[9px] px-1 rounded bg-[#dde7ff] dark:bg-[#2f3c73] uppercase">
              {lang}
            </span>
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            className="retro-btn py-2 px-2.5 font-retro text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            title={theme === 'dark' ? t.switchToDay : t.switchToNight}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-[#fde68a]" />
                <span>{lang === 'tr' ? 'Gündüz' : 'Day'}</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-[#3a56a8]" />
                <span>{lang === 'tr' ? 'Gece' : 'Night'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block h-full shrink-0 p-2.5 pr-0 z-20">{sidebarContent}</aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="lg:hidden fixed inset-0 z-40 bg-[#141a35]/50"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="lg:hidden fixed inset-y-2 left-2 z-50"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
