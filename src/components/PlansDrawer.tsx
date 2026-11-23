import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ShieldAlert,
  Check,
  Plus,
  Trash2,
  Sliders,
  KeyRound,
  RefreshCw,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { AIToolDefinition, LiveApiConfig, ThemeMode, UserPlanSelection } from '../types';
import { DEFAULT_AI_CATALOG } from '../data/aiCatalog';

interface PlansDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  userPlans: UserPlanSelection[];
  onUpdatePlans: (plans: UserPlanSelection[]) => void;
  onOpenOnboarding: () => void;
  liveApiConfig: LiveApiConfig;
  onUpdateLiveApiConfig: (cfg: LiveApiConfig) => void;
  onReanalyzeLast?: () => void;
  hasMessages?: boolean;
}

export const PlansDrawer: React.FC<PlansDrawerProps> = ({
  isOpen,
  onClose,
  theme,
  userPlans,
  onUpdatePlans,
  onOpenOnboarding,
  liveApiConfig,
  onUpdateLiveApiConfig,
  onReanalyzeLast,
  hasMessages = false,
}) => {
  const [activeTab, setActiveTab] = useState<'plans' | 'custom' | 'api'>('plans');
  const [customName, setCustomName] = useState('');
  const [customTierLabel, setCustomTierLabel] = useState('Pro');
  const [customUrl, setCustomUrl] = useState('https://');
  const [customIsPaid, setCustomIsPaid] = useState(true);
  const [customStrength, setCustomStrength] = useState<'coding' | 'writing' | 'research' | 'reasoning' | 'visual' | 'long_context'>('coding');

  const allTools: AIToolDefinition[] = [
    ...DEFAULT_AI_CATALOG,
    ...userPlans.filter((p) => p.customTool).map((p) => p.customTool as AIToolDefinition),
  ];

  const activeCount = userPlans.filter((p) => p.enabled && !p.quotaReached).length;
  const quotaCount = userPlans.filter((p) => p.enabled && p.quotaReached).length;

  const toggleTool = (toolId: string) => {
    const exists = userPlans.find((p) => p.toolId === toolId);
    if (exists) {
      onUpdatePlans(userPlans.map((p) => (p.toolId === toolId ? { ...p, enabled: !p.enabled } : p)));
    } else {
      const def = allTools.find((t) => t.id === toolId);
      onUpdatePlans([
        ...userPlans,
        { toolId, enabled: true, tierId: def?.tiers[0]?.id ?? 'free', quotaReached: false },
      ]);
    }
  };

  const changeTier = (toolId: string, tierId: string) => {
    onUpdatePlans(
      userPlans.map((p) =>
        p.toolId === toolId
          ? {
              ...p,
              enabled: true,
              tierId,
              customTierName: tierId === 'custom' ? p.customTierName || 'Özel Plan' : undefined,
            }
          : p
      )
    );
  };

  const changeCustomTierName = (toolId: string, name: string) => {
    onUpdatePlans(userPlans.map((p) => (p.toolId === toolId ? { ...p, customTierName: name } : p)));
  };

  const toggleQuota = (toolId: string) => {
    onUpdatePlans(userPlans.map((p) => (p.toolId === toolId ? { ...p, quotaReached: !p.quotaReached } : p)));
  };

  const resetAllQuotas = () => {
    onUpdatePlans(userPlans.map((p) => ({ ...p, quotaReached: false })));
  };

  const removeCustomTool = (toolId: string) => {
    onUpdatePlans(userPlans.filter((p) => p.toolId !== toolId));
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    const id = `custom_${Date.now()}`;
    const safeUrl =
      customUrl.trim().startsWith('http://') || customUrl.trim().startsWith('https://')
        ? customUrl.trim()
        : 'https://chat.openai.com';

    const newTool: AIToolDefinition = {
      id,
      name: customName.trim(),
      provider: 'Özel Araç',
      url: safeUrl,
      accentColor: '#d946ef',
      badgeText: 'Özel Tanımlı Model',
      tagline: 'Kullanıcı tarafından eklenen özel AI aracı',
      promptStyle: 'generic',
      isCustom: true,
      scores: {
        coding: customStrength === 'coding' ? 9.3 : 7.5,
        reasoning: customStrength === 'reasoning' ? 9.3 : 7.8,
        research: customStrength === 'research' ? 9.3 : 7.4,
        writing: customStrength === 'writing' ? 9.3 : 7.8,
        visual: customStrength === 'visual' ? 9.5 : 4.5,
        long_context: customStrength === 'long_context' ? 9.4 : 7.6,
        data_math: 8.2,
        speed: 8.6,
        valueFree: customIsPaid ? 7.2 : 9.4,
      },
      tiers: [
        {
          id: 'custom_tier',
          label: customTierLabel.trim() || (customIsPaid ? 'Pro' : 'Ücretsiz'),
          isPaid: customIsPaid,
          qualityBoost: customIsPaid ? 0.65 : 0,
          creditWeight: customIsPaid ? 2 : 0,
          constraints: ['Özel eklenen model — limitlerini buradan anlık yönetebilirsin.'],
        },
      ],
    };

    onUpdatePlans([
      ...userPlans,
      {
        toolId: id,
        enabled: true,
        tierId: 'custom_tier',
        customTierName: customTierLabel.trim() || undefined,
        quotaReached: false,
        customTool: newTool,
      },
    ]);

    setCustomName('');
    setCustomTierLabel('Pro');
    setCustomUrl('https://');
    setActiveTab('plans');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-xs"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="glass-panel fixed top-0 right-0 bottom-0 z-50 w-full max-w-md flex flex-col border-l border-white/60 dark:border-purple-300/20 shadow-2xl"
          >
            {/* Header */}
            <div className="px-5 pt-5 pb-4 border-b border-indigo-200/60 dark:border-purple-300/15">
              {theme === 'light' && (
                <div className="flex items-center gap-1.5 mb-2.5">
                  <span className="y2k-dot bg-gradient-to-br from-pink-300 to-purple-300" />
                  <span className="y2k-dot bg-gradient-to-br from-sky-200 to-blue-300" />
                  <span className="y2k-dot bg-gradient-to-br from-indigo-200 to-violet-300" />
                  <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600/75">
                    AI_Planlarım.sys
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-purple-600 dark:text-fuchsia-300" />
                    AI Planlarım &amp; Kotalar
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-purple-200/70 mt-0.5">
                    {activeCount} aktif model · {quotaCount} kota dolu
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-full glass-pill text-slate-600 dark:text-purple-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tabs */}
              <div className="mt-4 grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-white/50 dark:bg-black/30 border border-indigo-200/60 dark:border-purple-300/15">
                {[
                  { id: 'plans', label: 'Plan & Kota' },
                  { id: 'custom', label: '+ Özel Araç' },
                  { id: 'api', label: 'Canlı API' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      activeTab === tab.id
                        ? 'liquid-glow-primary text-white'
                        : 'text-slate-600 dark:text-purple-200/80 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {activeTab === 'plans' && (
                <>
                  {quotaCount > 0 && (
                    <div className="rounded-2xl p-3 bg-amber-500/12 border border-amber-400/40 flex items-center justify-between gap-2">
                      <div className="text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 shrink-0 text-amber-500" />
                        <span>
                          <strong>{quotaCount} model</strong> geçici olarak devre dışı. Öneriler aktif alternatiflerine yönlendirilir.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={resetAllQuotas}
                        className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-200 hover:bg-amber-500/30 cursor-pointer"
                      >
                        Sıfırla
                      </button>
                    </div>
                  )}

                  {allTools.map((tool) => {
                    const sel = userPlans.find((p) => p.toolId === tool.id);
                    const isEnabled = sel?.enabled ?? false;
                    const isQuota = sel?.quotaReached ?? false;
                    const currentTierId = sel?.tierId ?? tool.tiers[0].id;
                    const isCustomTierMode = Boolean(sel?.customTierName !== undefined);

                    return (
                      <div
                        key={tool.id}
                        className={`liquid-card rounded-2xl p-3.5 transition ${
                          !isEnabled ? 'opacity-60' : isQuota ? 'ring-1 ring-amber-400/65' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => toggleTool(tool.id)}
                            className="flex items-center gap-2.5 text-left flex-1 cursor-pointer"
                          >
                            <div
                              className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 ${
                                isEnabled
                                  ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 border-white/60 text-white'
                                  : 'border-slate-300 dark:border-purple-300/30 bg-white/40 dark:bg-white/5'
                              }`}
                            >
                              {isEnabled && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="w-2 h-2 rounded-full shrink-0"
                                  style={{ backgroundColor: tool.accentColor }}
                                />
                                <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                                  {tool.name}
                                </span>
                                {isEnabled && isQuota && (
                                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300">
                                    Kota Dolu
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-purple-200/65 truncate">
                                {tool.badgeText}
                              </p>
                            </div>
                          </button>

                          <div className="flex items-center gap-1">
                            <a
                              href={tool.url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-purple-200 transition"
                              title={`${tool.name} sitesini aç`}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            {tool.isCustom && (
                              <button
                                type="button"
                                onClick={() => removeCustomTool(tool.id)}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {isEnabled && (
                          <div className="mt-3 pt-2.5 border-t border-indigo-200/50 dark:border-purple-300/15 space-y-2.5">
                            <div className="flex flex-wrap gap-1.5">
                              {tool.tiers.map((tier) => {
                                const selected = !isCustomTierMode && currentTierId === tier.id;
                                return (
                                  <button
                                    key={tier.id}
                                    type="button"
                                    onClick={() => changeTier(tool.id, tier.id)}
                                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer ${
                                      selected
                                        ? 'liquid-glow-primary text-white'
                                        : 'bg-white/70 dark:bg-white/8 text-slate-700 dark:text-purple-100 border border-indigo-200/70 dark:border-purple-300/20'
                                    }`}
                                  >
                                    {tier.label}
                                  </button>
                                );
                              })}
                              {!tool.isCustom && (
                                <button
                                  type="button"
                                  onClick={() => changeTier(tool.id, 'custom')}
                                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer ${
                                    isCustomTierMode
                                      ? 'liquid-glow-primary text-white'
                                      : 'bg-white/40 dark:bg-white/5 text-slate-600 dark:text-purple-200 border border-dashed border-indigo-300 dark:border-purple-300/30'
                                  }`}
                                >
                                  Özel
                                </button>
                              )}
                            </div>

                            {isCustomTierMode && (
                              <input
                                type="text"
                                value={sel?.customTierName ?? ''}
                                onChange={(e) => changeCustomTierName(tool.id, e.target.value)}
                                placeholder="Özel plan adı (Örn: Ultra, Team...)"
                                className="w-full px-3 py-1.5 text-xs rounded-xl bg-white/85 dark:bg-black/35 border border-indigo-200 dark:border-purple-300/25 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                              />
                            )}

                            {/* One-click Quota Reached Switch */}
                            <div
                              onClick={() => toggleQuota(tool.id)}
                              className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition ${
                                isQuota
                                  ? 'bg-amber-500/18 border border-amber-400/45'
                                  : 'bg-white/45 dark:bg-white/5 border border-indigo-100 dark:border-purple-300/12 hover:border-purple-300/40'
                              }`}
                            >
                              <span className="text-xs font-semibold flex items-center gap-1.5 text-slate-700 dark:text-purple-100">
                                <ShieldAlert
                                  className={`w-3.5 h-3.5 ${
                                    isQuota ? 'text-amber-500' : 'text-slate-400 dark:text-purple-300/50'
                                  }`}
                                />
                                Şu an limitim doldu
                              </span>
                              <div
                                className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                                  isQuota ? 'bg-amber-500' : 'bg-slate-300 dark:bg-purple-950'
                                }`}
                              >
                                <div
                                  className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                                    isQuota ? 'translate-x-4' : 'translate-x-0'
                                  }`}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              )}

              {activeTab === 'custom' && (
                <form onSubmit={handleAddCustom} className="liquid-card rounded-2xl p-4 space-y-3.5">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Plus className="w-4 h-4 text-fuchsia-500" />
                      Özel Yapay Zeka Aracı Ekle
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-purple-200/70 mt-1">
                      Kullandığın yerel bir model, kurumsal AI veya listede olmayan herhangi bir aboneliği ekle.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-purple-100 mb-1">
                        Araç / Model Adı
                      </label>
                      <input
                        type="text"
                        required
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="Örn: Mistral Le Chat, Poe, v0, Lovable..."
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white/85 dark:bg-black/35 border border-indigo-200 dark:border-purple-300/25 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-purple-100 mb-1">
                        Plan / Sürüm Adı
                      </label>
                      <input
                        type="text"
                        value={customTierLabel}
                        onChange={(e) => setCustomTierLabel(e.target.value)}
                        placeholder="Örn: Pro, Ultra, Kurumsal, Ücretsiz"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white/85 dark:bg-black/35 border border-indigo-200 dark:border-purple-300/25 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-purple-100 mb-1">
                        Web Adresi (Tek tıkla açmak için)
                      </label>
                      <input
                        type="text"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white/85 dark:bg-black/35 border border-indigo-200 dark:border-purple-300/25 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-purple-100 mb-1.5">
                        En Güçlü Olduğu Alan
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { id: 'coding', label: 'Kodlama' },
                          { id: 'writing', label: 'Yazım' },
                          { id: 'research', label: 'Araştırma' },
                          { id: 'reasoning', label: 'Muhakeme' },
                          { id: 'visual', label: 'Görsel' },
                          { id: 'long_context', label: 'Uzun Doküman' },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setCustomStrength(opt.id as typeof customStrength)}
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer ${
                              customStrength === opt.id
                                ? 'liquid-glow-primary text-white'
                                : 'bg-white/70 dark:bg-white/8 text-slate-700 dark:text-purple-200'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-purple-100 pt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={customIsPaid}
                        onChange={(e) => setCustomIsPaid(e.target.checked)}
                        className="rounded accent-purple-600"
                      />
                      Ücretli abonelik (Kredi Tasarrufu modunda önceliği dengeler)
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full liquid-glow-primary py-2.5 rounded-full text-xs font-bold cursor-pointer"
                  >
                    Aracı Planlarıma Ekle
                  </button>
                </form>
              )}

              {activeTab === 'api' && (
                <div className="liquid-card rounded-2xl p-4 space-y-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-purple-500 dark:text-sky-300" />
                        Opsiyonel Canlı LLM Motoru
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-purple-200/75 mt-1">
                        Uygulama yerleşik akıllı motoruyla API anahtarı olmadan anında çalışır. İstersen kendi Gemini veya OpenAI API anahtarını bağlayarak canlı prompt iyileştirme alabilirsin.
                      </p>
                    </div>
                  </div>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-white/55 dark:bg-white/5 border border-indigo-200/70 dark:border-purple-300/15 cursor-pointer">
                    <span className="text-xs font-bold text-slate-800 dark:text-purple-100">
                      Canlı LLM API Kullan
                    </span>
                    <input
                      type="checkbox"
                      checked={liveApiConfig.enabled}
                      onChange={(e) =>
                        onUpdateLiveApiConfig({ ...liveApiConfig, enabled: e.target.checked })
                      }
                      className="w-4 h-4 accent-purple-600"
                    />
                  </label>

                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-purple-100 mb-1">
                        Sağlayıcı
                      </label>
                      <select
                        value={liveApiConfig.provider}
                        onChange={(e) =>
                          onUpdateLiveApiConfig({
                            ...liveApiConfig,
                            provider: e.target.value as LiveApiConfig['provider'],
                          })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white/85 dark:bg-black/40 border border-indigo-200 dark:border-purple-300/25 text-slate-900 dark:text-white"
                      >
                        <option value="gemini">Google Gemini API</option>
                        <option value="openai_compatible">OpenAI / Uyumlu API</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-purple-100 mb-1">
                        API Anahtarı (Yalnızca tarayıcında saklanır)
                      </label>
                      <input
                        type="password"
                        value={liveApiConfig.apiKey}
                        onChange={(e) =>
                          onUpdateLiveApiConfig({ ...liveApiConfig, apiKey: e.target.value })
                        }
                        placeholder={liveApiConfig.provider === 'gemini' ? 'AIza...' : 'sk-...'}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white/85 dark:bg-black/40 border border-indigo-200 dark:border-purple-300/25 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-purple-100 mb-1">
                        Model Adı (Opsiyonel)
                      </label>
                      <input
                        type="text"
                        value={liveApiConfig.modelName ?? ''}
                        onChange={(e) =>
                          onUpdateLiveApiConfig({ ...liveApiConfig, modelName: e.target.value })
                        }
                        placeholder={
                          liveApiConfig.provider === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4o-mini'
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white/85 dark:bg-black/40 border border-indigo-200 dark:border-purple-300/25 text-slate-900 dark:text-white"
                      />
                    </div>

                    {liveApiConfig.provider === 'openai_compatible' && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-purple-100 mb-1">
                          Base URL (Opsiyonel)
                        </label>
                        <input
                          type="text"
                          value={liveApiConfig.baseUrl ?? ''}
                          onChange={(e) =>
                            onUpdateLiveApiConfig({ ...liveApiConfig, baseUrl: e.target.value })
                          }
                          placeholder="https://api.openai.com/v1"
                          className="w-full px-3 py-2 text-xs rounded-xl bg-white/85 dark:bg-black/40 border border-indigo-200 dark:border-purple-300/25 text-slate-900 dark:text-white"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="px-5 py-4 border-t border-indigo-200/60 dark:border-purple-300/15 space-y-2 bg-white/35 dark:bg-black/25">
              {hasMessages && onReanalyzeLast && (
                <button
                  type="button"
                  onClick={() => {
                    onReanalyzeLast();
                    onClose();
                  }}
                  className="w-full liquid-glow-primary py-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Son Görevi Güncel Plan &amp; Kotalarla Yeniden Analiz Et
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenOnboarding();
                }}
                className="w-full glass-pill py-2 rounded-full text-xs font-semibold text-slate-700 dark:text-purple-100 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-500 dark:text-pink-300" />
                Tam Kurulum Sihirbazını Aç
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
