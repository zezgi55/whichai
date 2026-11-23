import React, { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import {
  ChatMessage,
  ChatThread,
  Language,
  LiveApiConfig,
  PriorityMode,
  ThemeMode,
  UserPlanSelection,
} from './types';
import { DEFAULT_USER_PLANS } from './data/aiCatalog';
import { TRANSLATIONS } from './i18n/translations';
import { useLocalStorage } from './hooks/useLocalStorage';
import { analyzeUserTask, runLocalAnalysis } from './services/routerEngine';
import { AtmosphereBackdrop } from './components/AtmosphereDecor';
import { Sidebar } from './components/Sidebar';
import { ChatWorkspace } from './components/ChatWorkspace';
import { OnboardingModal } from './components/OnboardingModal';
import { PlansDrawer } from './components/PlansDrawer';
import { SettingsModal } from './components/SettingsModal';

const DEFAULT_API_CONFIG: LiveApiConfig = {
  enabled: false,
  provider: 'gemini',
  apiKey: '',
  modelName: 'gemini-2.5-flash',
  baseUrl: 'https://api.openai.com/v1',
};

export function App() {
  // Default to Daylight Sky ('light') to immediately showcase the cozy retro sky palette
  const [theme, setTheme] = useLocalStorage<ThemeMode>('whichai_theme_v2', 'light');
  const [lang, setLang] = useLocalStorage<Language>('whichai_lang', 'tr');
  const [hasOnboarded, setHasOnboarded] = useLocalStorage<boolean>('whichai_onboarded', false);
  const [userPlans, setUserPlans] = useLocalStorage<UserPlanSelection[]>(
    'whichai_user_plans',
    DEFAULT_USER_PLANS
  );
  const [threads, setThreads] = useLocalStorage<ChatThread[]>('whichai_threads', []);
  const [activeThreadId, setActiveThreadId] = useLocalStorage<string | null>(
    'whichai_active_thread',
    null
  );
  const [priorityMode, setPriorityMode] = useLocalStorage<PriorityMode>(
    'whichai_priority_mode',
    'quality'
  );
  const [liveApiConfig, setLiveApiConfig] = useLocalStorage<LiveApiConfig>(
    'whichai_live_api',
    DEFAULT_API_CONFIG
  );

  const [onboardingOpen, setOnboardingOpen] = useState(!hasOnboarded);
  const [plansDrawerOpen, setPlansDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const t = TRANSLATIONS[lang];

  // Sync Tailwind dark class and document lang attribute
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.lang = lang;
  }, [theme, lang]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  }, []);

  const activeThread = threads.find((th) => th.id === activeThreadId) ?? null;

  const handleChangeTheme = (next: ThemeMode) => {
    setTheme(next);
    showToast(next === 'light' ? t.toastDayTheme : t.toastNightTheme);
  };

  const handleToggleTheme = () => {
    handleChangeTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleChangeLang = (nextLang: Language) => {
    if (nextLang === lang) return;
    setLang(nextLang);

    // Automatically re-localize any existing analysis cards so 100% of screen text matches the new language
    setThreads((prevThreads) =>
      prevThreads.map((thread) => {
        const updatedMessages: ChatMessage[] = [];
        let lastUserText = '';
        for (const msg of thread.messages) {
          if (msg.role === 'user') {
            lastUserText = msg.content;
            updatedMessages.push(msg);
          } else if (msg.analysis && lastUserText) {
            const refreshed = runLocalAnalysis(
              lastUserText,
              msg.priorityMode,
              userPlans,
              nextLang
            );
            updatedMessages.push({
              ...msg,
              content: refreshed.complexityBadge.headline,
              analysis: refreshed,
            });
          } else {
            updatedMessages.push(msg);
          }
        }
        return { ...thread, messages: updatedMessages };
      })
    );

    showToast(TRANSLATIONS[nextLang].toastLangChanged);
  };

  const handleCompleteOnboarding = () => {
    setHasOnboarded(true);
    setOnboardingOpen(false);
    showToast(t.toastPlansSaved);
  };

  const handleNewChat = () => {
    setActiveThreadId(null);
  };

  const handleDeleteThread = (id: string) => {
    setThreads((prev) => prev.filter((th) => th.id !== id));
    if (activeThreadId === id) {
      setActiveThreadId(null);
    }
  };

  const handleClearAllChats = () => {
    setThreads([]);
    setActiveThreadId(null);
    showToast(t.clearChatsConfirm);
  };

  const handleSendPrompt = async (promptText: string) => {
    const now = new Date().toISOString();
    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      content: promptText,
      priorityMode,
      createdAt: now,
    };

    let targetThreadId = activeThreadId;

    if (!targetThreadId || !threads.some((th) => th.id === targetThreadId)) {
      const newThreadId = `thread_${Date.now()}`;
      const shortTitle =
        promptText.length > 42 ? `${promptText.slice(0, 40)}...` : promptText;
      const newThread: ChatThread = {
        id: newThreadId,
        title: shortTitle,
        createdAt: now,
        updatedAt: now,
        messages: [userMsg],
      };
      setThreads((prev) => [newThread, ...prev]);
      setActiveThreadId(newThreadId);
      targetThreadId = newThreadId;
    } else {
      setThreads((prev) =>
        prev.map((th) =>
          th.id === targetThreadId
            ? { ...th, updatedAt: now, messages: [...th.messages, userMsg] }
            : th
        )
      );
    }

    setIsAnalyzing(true);
    try {
      const analysis = await analyzeUserTask(
        promptText,
        priorityMode,
        userPlans,
        lang,
        liveApiConfig
      );
      const assistantMsg: ChatMessage = {
        id: `msg_a_${Date.now()}`,
        role: 'assistant',
        content: analysis.complexityBadge.headline,
        priorityMode,
        createdAt: new Date().toISOString(),
        analysis,
      };

      setThreads((prev) =>
        prev.map((th) =>
          th.id === targetThreadId
            ? {
                ...th,
                updatedAt: new Date().toISOString(),
                messages: [...th.messages, assistantMsg],
              }
            : th
        )
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReanalyzeLast = async () => {
    if (!activeThread) return;
    const lastUserMessage = [...activeThread.messages]
      .reverse()
      .find((m) => m.role === 'user');
    if (!lastUserMessage) return;

    setIsAnalyzing(true);
    try {
      const analysis = await analyzeUserTask(
        lastUserMessage.content,
        priorityMode,
        userPlans,
        lang,
        liveApiConfig
      );
      const assistantMsg: ChatMessage = {
        id: `msg_a_${Date.now()}`,
        role: 'assistant',
        content: analysis.complexityBadge.headline,
        priorityMode,
        createdAt: new Date().toISOString(),
        analysis,
      };
      setThreads((prev) =>
        prev.map((th) =>
          th.id === activeThread.id
            ? {
                ...th,
                updatedAt: new Date().toISOString(),
                messages: [...th.messages, assistantMsg],
              }
            : th
        )
      );
      showToast(t.toastReanalyzed);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="retro-desktop-bg relative h-screen w-screen overflow-hidden flex transition-colors duration-200">
      {/* Cozy Retro Sky & Grid Motifs */}
      <AtmosphereBackdrop theme={theme} />

      {/* Left Retro OS Sidebar Window */}
      <Sidebar
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={(id) => setActiveThreadId(id)}
        onNewChat={handleNewChat}
        onDeleteThread={handleDeleteThread}
        onOpenPlans={() => setPlansDrawerOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        lang={lang}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        userPlans={userPlans}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Retro OS Chat Window */}
      <ChatWorkspace
        threadTitle={activeThread?.title ?? t.newChat}
        messages={activeThread?.messages ?? []}
        isAnalyzing={isAnalyzing}
        priorityMode={priorityMode}
        onChangePriorityMode={setPriorityMode}
        onSendPrompt={handleSendPrompt}
        onOpenSidebar={() => setMobileSidebarOpen(true)}
        onOpenPlans={() => setPlansDrawerOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        lang={lang}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        userPlans={userPlans}
        onToast={showToast}
      />

      {/* First-Launch Onboarding Window */}
      <OnboardingModal
        isOpen={onboardingOpen}
        lang={lang}
        userPlans={userPlans}
        onUpdatePlans={setUserPlans}
        onComplete={handleCompleteOnboarding}
        canDismiss={hasOnboarded}
      />

      {/* Slide-Over AI Plans & Quotas Window */}
      <PlansDrawer
        isOpen={plansDrawerOpen}
        onClose={() => setPlansDrawerOpen(false)}
        lang={lang}
        userPlans={userPlans}
        onUpdatePlans={setUserPlans}
        onOpenOnboarding={() => setOnboardingOpen(true)}
        onReanalyzeLast={handleReanalyzeLast}
        hasMessages={(activeThread?.messages.length ?? 0) > 0}
      />

      {/* Dedicated Settings Window (TR / EN, Theme, Live API, Data) */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        lang={lang}
        onChangeLang={handleChangeLang}
        theme={theme}
        onChangeTheme={handleChangeTheme}
        liveApiConfig={liveApiConfig}
        onUpdateLiveApiConfig={setLiveApiConfig}
        onClearAllChats={handleClearAllChats}
        hasChats={threads.length > 0}
      />

      {/* Crisp Retro Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-5 right-5 z-50 retro-window-sm px-3.5 py-2.5 flex items-center gap-2 font-retro text-xs font-bold text-[var(--ink-primary)]"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
