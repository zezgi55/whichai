import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Sparkles,
  Plus,
  Flame,
  ShieldAlert,
  Trash2,
  Wand2,
  X,
} from 'lucide-react';
import { AIToolDefinition, ThemeMode, UserPlanSelection } from '../types';
import { DEFAULT_AI_CATALOG, ONBOARDING_PRESETS } from '../data/aiCatalog';
import { DreamySparkleSvg, LavenderBotanicalSvg, PixelCursorSvg } from './AtmosphereDecor';

interface OnboardingModalProps {
  isOpen: boolean;
  theme: ThemeMode;
  userPlans: UserPlanSelection[];
  onUpdatePlans: (plans: UserPlanSelection[]) => void;
  onComplete: () => void;
  canDismiss?: boolean;
}

const STRENGTH_OPTIONS = [
  { id: 'coding', label: 'Kodlama' },
  { id: 'writing', label: 'Yazım' },
  { id: 'research', label: 'Araştırma' },
  { id: 'reasoning', label: 'Muhakeme' },
  { id: 'visual', label: 'Görsel' },
  { id: 'long_context', label: 'Uzun Doküman' },
] as const;

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  theme,
  userPlans,
  onUpdatePlans,
  onComplete,
  canDismiss = false,
}) => {
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customTierLabel, setCustomTierLabel] = useState('Pro');
  const [customUrl, setCustomUrl] = useState('https://');
  const [customIsPaid, setCustomIsPaid] = useState(true);
  const [customStrength, setCustomStrength] = useState<(typeof STRENGTH_OPTIONS)[number]['id']>('coding');

  const allTools: AIToolDefinition[] = [
    ...DEFAULT_AI_CATALOG,
    ...userPlans
      .filter((p) => p.customTool)
      .map((p) => p.customTool as AIToolDefinition),
  ];

  const activeCount = userPlans.filter((p) => p.enabled && !p.quotaReached).length;
  const quotaCount = userPlans.filter((p) => p.enabled && p.quotaReached).length;

  const toggleTool = (toolId: string) => {
    const exists = userPlans.find((p) => p.toolId === toolId);
    if (exists) {
      onUpdatePlans(
        userPlans.map((p) =>
          p.toolId === toolId ? { ...p, enabled: !p.enabled } : p
        )
      );
    } else {
      const def = allTools.find((t) => t.id === toolId);
      onUpdatePlans([
        ...userPlans,
        {
          toolId,
          enabled: true,
          tierId: def?.tiers[0]?.id ?? 'free',
          quotaReached: false,
        },
      ]);
    }
  };

  const changeTier = (toolId: string, tierId: string) => {
    onUpdatePlans(
      userPlans.map((p) =>
        p.toolId === toolId
          ? { ...p, enabled: true, tierId, customTierName: tierId === 'custom' ? p.customTierName || 'Özel Plan' : undefined }
          : p
      )
    );
  };

  const changeCustomTierName = (toolId: string, name: string) => {
    onUpdatePlans(
      userPlans.map((p) =>
        p.toolId === toolId ? { ...p, customTierName: name } : p
      )
    );
  };

  const toggleQuota = (toolId: string) => {
    onUpdatePlans(
      userPlans.map((p) =>
        p.toolId === toolId ? { ...p, quotaReached: !p.quotaReached } : p
      )
    );
  };

  const applyPreset = (presetId: string) => {
    const preset = ONBOARDING_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    const customOnly = userPlans.filter((p) => p.customTool);
    const presetPlans: UserPlanSelection[] = preset.plans.map((item) => ({
      toolId: item.toolId,
      enabled: item.enabled,
      tierId: item.tierId,
      quotaReached: false,
    }));
    onUpdatePlans([...presetPlans, ...customOnly]);
  };

  const handleAddCustomTool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    const id = `custom_${Date.now()}`;
    const safeUrl =
      customUrl.trim().startsWith('http://') || customUrl.trim().startsWith('https://')
        ? customUrl.trim()
        : 'https://chat.openai.com';

    const scores = {
      coding: customStrength === 'coding' ? 9.2 : 7.5,
      reasoning: customStrength === 'reasoning' ? 9.2 : 7.8,
      research: customStrength === 'research' ? 9.3 : 7.2,
      writing: customStrength === 'writing' ? 9.2 : 7.8,
      visual: customStrength === 'visual' ? 9.5 : 4.5,
      long_context: customStrength === 'long_context' ? 9.4 : 7.5,
      data_math: customStrength === 'reasoning' || customStrength === 'coding' ? 8.6 : 7.4,
      speed: 8.5,
      valueFree: customIsPaid ? 7.2 : 9.4,
    };

    const newTool: AIToolDefinition = {
      id,
      name: customName.trim(),
      provider: 'Özel Araç',
      url: safeUrl,
      accentColor: '#d946ef',
      badgeText: STRENGTH_OPTIONS.find((s) => s.id === customStrength)?.label ?? 'Özel',
      tagline: 'Kullanıcı tarafından eklenen özel AI aracı',
      promptStyle: 'generic',
      isCustom: true,
      scores,
      tiers: [
        {
          id: 'custom_tier',
          label: customTierLabel.trim() || (customIsPaid ? 'Pro' : 'Ücretsiz'),
          isPaid: customIsPaid,
          qualityBoost: customIsPaid ? 0.65 : 0,
          creditWeight: customIsPaid ? 2 : 0,
          constraints: ['Özel tanımlı plan — kullanım limitlerini ihtiyacına göre buradan takip edebilirsin.'],
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
    setShowCustomForm(false);
  };

  const removeCustomTool = (toolId: string) => {
    onUpdatePlans(userPlans.filter((p) => p.toolId !== toolId));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 14 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            className="glass-panel relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl overflow-hidden"
          >
            {/* Atmospheric Corner Art */}
            {theme === 'dark' ? (
              <LavenderBotanicalSvg className="pointer-events-none absolute -top-2 right-6 w-24 h-36 opacity-35" />
            ) : (
              <div className="pointer-events-none absolute top-4 right-14 flex items-center gap-1.5 opacity-80">
                <DreamySparkleSvg className="w-4 h-4 text-indigo-500 animate-twinkle" />
                <PixelCursorSvg className="w-5 h-5" />
              </div>
            )}

            {/* Modal Header (Y2K Window bar in light mode, Liquid Glass header in dark) */}
            <div className="relative px-6 pt-5 pb-4 border-b border-indigo-200/60 dark:border-purple-300/15">
              {theme === 'light' && (
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="y2k-dot bg-gradient-to-br from-pink-300 to-purple-300" />
                  <span className="y2k-dot bg-gradient-to-br from-sky-200 to-blue-300" />
                  <span className="y2k-dot bg-gradient-to-br from-indigo-200 to-violet-300" />
                  <span className="ml-2 text-[11px] font-semibold tracking-wider uppercase text-indigo-700/70">
                    WhichAI · Kurulum Penceresi
                  </span>
                </div>
              )}

              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-xs font-semibold text-indigo-700 dark:text-purple-200 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-fuchsia-500 dark:text-pink-300" />
                    <span>Kredi Optimizasyon Kurulumu</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Elindeki Yapay Zeka Planlarını Seç
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-purple-200/75 mt-1 max-w-2xl">
                    Hangi AI araçlarına ve plan seviyelerine sahip olduğunu işaretle. WhichAI, her görevde Pro kredilerini israf etmeden elindeki en doğru modeli ve ona özel promptu hazırlasın.
                  </p>
                </div>

                {canDismiss && (
                  <button
                    onClick={onComplete}
                    aria-label="Kapat"
                    className="p-2 rounded-full glass-pill text-slate-600 dark:text-purple-200 hover:scale-105 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Quick Starter Presets */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-purple-300/70 mr-1">
                  Hızlı Şablon:
                </span>
                {ONBOARDING_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset.id)}
                    className="glass-pill px-3 py-1.5 rounded-full text-xs font-semibold text-indigo-900 dark:text-purple-100 hover:-translate-y-0.5 transition flex items-center gap-1.5 cursor-pointer"
                    title={preset.description}
                  >
                    <Wand2 className="w-3 h-3 text-purple-500 dark:text-pink-300" />
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Tool Selection Grid */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {allTools.map((tool) => {
                  const sel = userPlans.find((p) => p.toolId === tool.id);
                  const isEnabled = sel?.enabled ?? false;
                  const isQuota = sel?.quotaReached ?? false;
                  const currentTierId = sel?.tierId ?? tool.tiers[0].id;
                  const isCustomTierMode = Boolean(sel?.customTierName !== undefined);

                  return (
                    <div
                      key={tool.id}
                      className={`liquid-card rounded-2xl p-4 transition-all ${
                        isEnabled
                          ? isQuota
                            ? 'ring-1 ring-amber-400/70 dark:ring-amber-400/50 opacity-90'
                            : 'ring-2 ring-purple-500/60 dark:ring-fuchsia-400/55'
                          : 'opacity-70 hover:opacity-95'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => toggleTool(tool.id)}
                          className="flex items-center gap-3 text-left flex-1 cursor-pointer"
                        >
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center border transition shrink-0 ${
                              isEnabled
                                ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 border-white/60 text-white shadow-sm'
                                : 'border-slate-300 dark:border-purple-300/30 bg-white/50 dark:bg-white/5'
                            }`}
                          >
                            {isEnabled && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: tool.accentColor }}
                              />
                              <span className="font-bold text-sm text-slate-900 dark:text-white">
                                {tool.name}
                              </span>
                              <span className="text-[11px] font-medium text-slate-500 dark:text-purple-200/60">
                                {tool.provider}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-purple-200/70 mt-0.5 line-clamp-1">
                              {tool.badgeText}
                            </p>
                          </div>
                        </button>

                        {tool.isCustom && (
                          <button
                            type="button"
                            onClick={() => removeCustomTool(tool.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                            title="Özel aracı kaldır"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Tier Selector & Quota Switch when enabled */}
                      {isEnabled && (
                        <div className="mt-3 pt-3 border-t border-indigo-200/60 dark:border-purple-300/15 space-y-2.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {tool.tiers.map((tier) => {
                              const selected = !isCustomTierMode && currentTierId === tier.id;
                              return (
                                <button
                                  key={tier.id}
                                  type="button"
                                  onClick={() => changeTier(tool.id, tier.id)}
                                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer ${
                                    selected
                                      ? 'liquid-glow-primary text-white'
                                      : 'bg-white/65 dark:bg-white/8 text-slate-700 dark:text-purple-100 border border-indigo-200/70 dark:border-purple-300/20 hover:border-purple-400'
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
                                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer ${
                                  isCustomTierMode
                                    ? 'liquid-glow-primary text-white'
                                    : 'bg-white/50 dark:bg-white/5 text-slate-600 dark:text-purple-200/80 border border-dashed border-indigo-300 dark:border-purple-300/30'
                                }`}
                              >
                                + Özel Seviye
                              </button>
                            )}
                          </div>

                          {isCustomTierMode && (
                            <input
                              type="text"
                              value={sel?.customTierName ?? ''}
                              onChange={(e) => changeCustomTierName(tool.id, e.target.value)}
                              placeholder="Örn: Team, Enterprise, Öğrenci Pro..."
                              className="w-full px-3 py-1.5 text-xs rounded-xl bg-white/80 dark:bg-black/35 border border-indigo-200 dark:border-purple-300/25 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                            />
                          )}

                          {/* Quota Reached Toggle */}
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[11px] font-medium flex items-center gap-1.5 text-slate-600 dark:text-purple-200/75">
                              <ShieldAlert
                                className={`w-3.5 h-3.5 ${
                                  isQuota ? 'text-amber-500' : 'text-slate-400 dark:text-purple-300/45'
                                }`}
                              />
                              Şu an limitim doldu
                            </span>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={isQuota}
                              onClick={() => toggleQuota(tool.id)}
                              className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${
                                isQuota
                                  ? 'bg-amber-500'
                                  : 'bg-slate-300/80 dark:bg-purple-950/80 border border-slate-300 dark:border-purple-400/30'
                              }`}
                            >
                              <span
                                className={`block w-3.5 h-3.5 rounded-full bg-white shadow transition-transform ${
                                  isQuota ? 'translate-x-4.5' : 'translate-x-0.5'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add Custom Tool Section */}
              <div className="pt-1">
                {!showCustomForm ? (
                  <button
                    type="button"
                    onClick={() => setShowCustomForm(true)}
                    className="w-full py-3 rounded-2xl border border-dashed border-indigo-400/70 dark:border-purple-300/35 bg-white/40 dark:bg-purple-950/25 hover:bg-white/65 dark:hover:bg-purple-900/30 text-sm font-semibold text-indigo-800 dark:text-purple-100 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Listede Olmayan Özel Bir Yapay Zeka Aracı Ekle
                  </button>
                ) : (
                  <form
                    onSubmit={handleAddCustomTool}
                    className="liquid-card rounded-2xl p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Plus className="w-4 h-4 text-fuchsia-500" />
                        Özel Yapay Zeka Aracı Tanımla
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowCustomForm(false)}
                        className="text-xs text-slate-500 dark:text-purple-200/70 hover:underline cursor-pointer"
                      >
                        Vazgeç
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <input
                        type="text"
                        required
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="Araç adı (Örn: Poe, Mistral, Bolt)"
                        className="px-3 py-2 text-xs rounded-xl bg-white/85 dark:bg-black/35 border border-indigo-200 dark:border-purple-300/25 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                      <input
                        type="text"
                        value={customTierLabel}
                        onChange={(e) => setCustomTierLabel(e.target.value)}
                        placeholder="Plan adı (Örn: Pro, Ultra, Free)"
                        className="px-3 py-2 text-xs rounded-xl bg-white/85 dark:bg-black/35 border border-indigo-200 dark:border-purple-300/25 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                      <input
                        type="text"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        placeholder="URL (https://...)"
                        className="px-3 py-2 text-xs rounded-xl bg-white/85 dark:bg-black/35 border border-indigo-200 dark:border-purple-300/25 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-purple-200/70">
                          Güçlü Alan:
                        </span>
                        {STRENGTH_OPTIONS.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setCustomStrength(opt.id)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer ${
                              customStrength === opt.id
                                ? 'liquid-glow-primary text-white'
                                : 'bg-white/70 dark:bg-white/8 text-slate-700 dark:text-purple-200'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-purple-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={customIsPaid}
                            onChange={(e) => setCustomIsPaid(e.target.checked)}
                            className="rounded accent-purple-600"
                          />
                          Ücretli Plan
                        </label>
                        <button
                          type="submit"
                          className="liquid-glow-primary px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer"
                        >
                          Listeye Ekle
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-indigo-200/60 dark:border-purple-300/15 flex flex-wrap items-center justify-between gap-3 bg-white/35 dark:bg-black/25">
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-400/30">
                  <Flame className="w-3.5 h-3.5" />
                  {activeCount} Aktif Plan
                </span>
                {quotaCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-400/30">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {quotaCount} Kota Dolu
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={onComplete}
                className="liquid-glow-primary px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Planlarımı Kaydet ve Başla
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
