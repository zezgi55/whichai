import React, { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import {
  ChatMessage,
  ChatThread,
  LiveApiConfig,
  PriorityMode,
  ThemeMode,
  UserPlanSelection,
} from './types';
import { DEFAULT_USER_PLANS } from './data/aiCatalog';
import { useLocalStorage } from './hooks/useLocalStorage';
import { analyzeUserTask } from './services/routerEngine';
import { AtmosphereBackdrop } from './components/AtmosphereDecor';
import { Sidebar } from './components/Sidebar';
import { ChatWorkspace } from './components/ChatWorkspace';
import { OnboardingModal } from './components/OnboardingModal';
import { PlansDrawer } from './components/PlansDrawer';

const DEFAULT_API_CONFIG: LiveApiConfig = {
  enabled: false,
  provider: 'gemini',
  apiKey: '',
  modelName: 'gemini-2.5-flash',
  baseUrl: 'https://api.openai.com/v1',
};

export function App() {
  const [theme, setTheme] = useLocalStorage<ThemeMode>('whichai_theme', 'dark');
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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync Tailwind dark class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  }, []);

  const activeThread = threads.find((t) => t.id === activeThreadId) ?? null;

  const handleToggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    showToast(next === 'dark' ? 'Liquid Glass Karanlık Tema aktif' : 'Dreamy Y2K Aydınlık Tema aktif');
  };

  const handleCompleteOnboarding = () => {
    setHasOnboarded(true);
    setOnboardingOpen(false);
    showToast('AI planların kaydedildi! Görevini yazmaya hazırsın.');
  };

  const handleNewChat = () => {
    setActiveThreadId(null);
  };

  const handleDeleteThread = (id: string) => {
    setThreads((prev) => prev.filter((t) => t.id !== id));
    if (activeThreadId === id) {
      setActiveThreadId(null);
    }
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

    if (!targetThreadId || !threads.some((t) => t.id === targetThreadId)) {
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
        prev.map((t) =>
          t.id === targetThreadId
            ? { ...t, updatedAt: now, messages: [...t.messages, userMsg] }
            : t
        )
      );
    }

    setIsAnalyzing(true);
    try {
      const analysis = await analyzeUserTask(promptText, priorityMode, userPlans, liveApiConfig);
      const assistantMsg: ChatMessage = {
        id: `msg_a_${Date.now()}`,
        role: 'assistant',
        content: analysis.complexityBadge.headline,
        priorityMode,
        createdAt: new Date().toISOString(),
        analysis,
      };

      setThreads((prev) =>
        prev.map((t) =>
          t.id === targetThreadId
            ? { ...t, updatedAt: new Date().toISOString(), messages: [...t.messages, assistantMsg] }
            : t
        )
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReanalyzeLast = async () => {
    if (!activeThread) return;
    const lastUserMessage = [...activeThread.messages].reverse().find((m) => m.role === 'user');
    if (!lastUserMessage) return;

    setIsAnalyzing(true);
    try {
      const analysis = await analyzeUserTask(
        lastUserMessage.content,
        priorityMode,
        userPlans,
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
        prev.map((t) =>
          t.id === activeThread.id
            ? { ...t, updatedAt: new Date().toISOString(), messages: [...t.messages, assistantMsg] }
            : t
        )
      );
      showToast('Son görev güncel plan ve kota durumuna göre yeniden analiz edildi!');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div
      className={`relative h-screen w-screen overflow-hidden flex transition-colors duration-300 ${
        theme === 'dark' ? 'theme-canvas-dark' : 'theme-canvas-light'
      }`}
    >
      {/* Subtle Dual-Theme Atmospheric Backdrop */}
      <AtmosphereBackdrop theme={theme} />

      {/* Left Gemini-Style Sidebar */}
      <Sidebar
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={(id) => setActiveThreadId(id)}
        onNewChat={handleNewChat}
        onDeleteThread={handleDeleteThread}
        onOpenPlans={() => setPlansDrawerOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        userPlans={userPlans}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Chat Flow */}
      <ChatWorkspace
        threadTitle={activeThread?.title ?? 'Yeni Sohbet'}
        messages={activeThread?.messages ?? []}
        isAnalyzing={isAnalyzing}
        priorityMode={priorityMode}
        onChangePriorityMode={setPriorityMode}
        onSendPrompt={handleSendPrompt}
        onOpenSidebar={() => setMobileSidebarOpen(true)}
        onOpenPlans={() => setPlansDrawerOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        userPlans={userPlans}
        onToast={showToast}
      />

      {/* First-Launch Onboarding & Plan Setup Modal */}
      <OnboardingModal
        isOpen={onboardingOpen}
        theme={theme}
        userPlans={userPlans}
        onUpdatePlans={setUserPlans}
        onComplete={handleCompleteOnboarding}
        canDismiss={hasOnboarded}
      />

      {/* Instant Slide-Over Drawer: AI Planlarım & Kotalar */}
      <PlansDrawer
        isOpen={plansDrawerOpen}
        onClose={() => setPlansDrawerOpen(false)}
        theme={theme}
        userPlans={userPlans}
        onUpdatePlans={setUserPlans}
        onOpenOnboarding={() => setOnboardingOpen(true)}
        liveApiConfig={liveApiConfig}
        onUpdateLiveApiConfig={setLiveApiConfig}
        onReanalyzeLast={handleReanalyzeLast}
        hasMessages={(activeThread?.messages.length ?? 0) > 0}
      />

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            className="fixed bottom-6 right-6 z-50 glass-panel px-4 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white shadow-xl"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
