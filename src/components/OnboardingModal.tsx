import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, ShieldAlert, Trash2, Sparkles, X } from 'lucide-react';
import { AIToolDefinition, Language, UserPlanSelection } from '../types';
import { DEFAULT_AI_CATALOG, ONBOARDING_PRESETS } from '../data/aiCatalog';
import { TRANSLATIONS } from '../i18n/translations';
import { RetroFolderIcon, RetroStarSvg, RetroWindowControls } from './AtmosphereDecor';

interface OnboardingModalProps {
  isOpen: boolean;
  lang: Language;
  userPlans: UserPlanSelection[];
  onUpdatePlans: (plans: UserPlanSelection[]) => void;
  onComplete: () => void;
  canDismiss?: boolean;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  lang,
  userPlans,
  onUpdatePlans,
  onComplete,
  canDismiss = false,
}) => {
  const t = TRANSLATIONS[lang];

  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customTierLabel, setCustomTierLabel] = useState('Pro');
  const [customSubModelName, setCustomSubModelName] = useState('');
  const [customUrl, setCustomUrl] = useState('https://');
  const [customIsPaid, setCustomIsPaid] = useState(true);
  const [customStrength, setCustomStrength] = useState<
    'coding' | 'writing' | 'research' | 'reasoning' | 'visual' | 'long_context'
  >('coding');
  const [subDraftByTool, setSubDraftByTool] = useState<Record<string, string>>({});

  const strengthOptions = [
    { id: 'coding', label: t.strengthCoding },
    { id: 'writing', label: t.strengthWriting },
    { id: 'research', label: t.strengthResearch },
    { id: 'reasoning', label: t.strengthReasoning },
    { id: 'visual', label: t.strengthVisual },
    { id: 'long_context', label: t.strengthLongContext },
  ] as const;

  const allTools: AIToolDefinition[] = [
    ...DEFAULT_AI_CATALOG,
    ...userPlans.filter((p) => p.customTool).map((p) => p.customTool as AIToolDefinition),
  ];

  const activeCount = userPlans.filter((p) => p.enabled && !p.quotaReached).length;
  const quotaCount = userPlans.filter((p) => p.enabled && p.quotaReached).length;

  const toggleTool = (toolId: string) => {
    const exists = userPlans.find((p) => p.toolId === toolId);
    const def = allTools.find((item) => item.id === toolId);
    if (exists) {
      onUpdatePlans(
        userPlans.map((p) => (p.toolId === toolId ? { ...p, enabled: !p.enabled } : p))
      );
    } else {
      onUpdatePlans([
        ...userPlans,
        {
          toolId,
          enabled: true,
          tierId: def?.tiers[0]?.id ?? 'free',
          quotaReached: false,
          enabledSubModelIds: def?.subModels.map((s) => s.id) ?? [],
        },
      ]);
    }
  };

  const changeTier = (toolId: string, tierId: string) => {
    const def = allTools.find((item) => item.id === toolId);
    const targetTier = def?.tiers.find((tr) => tr.id === tierId);
    onUpdatePlans(
      userPlans.map((p) =>
        p.toolId === toolId
          ? {
              ...p,
              enabled: true,
              tierId,
              customTierName:
                tierId === 'custom'
                  ? p.customTierName || (lang === 'tr' ? 'Özel Plan' : 'Custom Plan')
                  : undefined,
              enabledSubModelIds:
                def && targetTier
                  ? def.subModels
                      .filter((sm) => targetTier.isPaid || !sm.minPaid)
                      .map((sm) => sm.id)
                  : p.enabledSubModelIds,
            }
          : p
      )
    );
  };

  const changeCustomTierName = (toolId: string, name: string) => {
    onUpdatePlans(
      userPlans.map((p) => (p.toolId === toolId ? { ...p, customTierName: name } : p))
    );
  };

  const toggleSubModel = (toolId: string, subModelId: string) => {
    const def = allTools.find((item) => item.id === toolId);
    onUpdatePlans(
      userPlans.map((p) => {
        if (p.toolId !== toolId) return p;
        const current = p.enabledSubModelIds ?? def?.subModels.map((s) => s.id) ?? [];
        const next = current.includes(subModelId)
          ? current.filter((id) => id !== subModelId)
          : [...current, subModelId];
        return { ...p, enabledSubModelIds: next.length > 0 ? next : current };
      })
    );
  };

  const addCustomSubModel = (toolId: string) => {
    const val = (subDraftByTool[toolId] ?? '').trim();
    if (!val) return;
    onUpdatePlans(
      userPlans.map((p) =>
        p.toolId === toolId
          ? { ...p, customSubModels: [...(p.customSubModels ?? []), val] }
          : p
      )
    );
    setSubDraftByTool((prev) => ({ ...prev, [toolId]: '' }));
  };

  const removeCustomSubModel = (toolId: string, subName: string) => {
    onUpdatePlans(
      userPlans.map((p) =>
        p.toolId === toolId
          ? { ...p, customSubModels: (p.customSubModels ?? []).filter((s) => s !== subName) }
          : p
      )
    );
  };

  const toggleQuota = (toolId: string) => {
    onUpdatePlans(
      userPlans.map((p) => (p.toolId === toolId ? { ...p, quotaReached: !p.quotaReached } : p))
    );
  };

  const applyPreset = (presetId: string) => {
    const preset = ONBOARDING_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    const customOnly = userPlans.filter((p) => p.customTool);
    const presetPlans: UserPlanSelection[] = preset.plans.map((item) => {
      const def = DEFAULT_AI_CATALOG.find((c) => c.id === item.toolId);
      const tier = def?.tiers.find((tr) => tr.id === item.tierId);
      return {
        toolId: item.toolId,
        enabled: item.enabled,
        tierId: item.tierId,
        quotaReached: false,
        enabledSubModelIds: def
          ? def.subModels.filter((sm) => tier?.isPaid || !sm.minPaid).map((sm) => sm.id)
          : [],
      };
    });
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
    const subLabel = customSubModelName.trim() || `${customName.trim()} Default`;

    const newTool: AIToolDefinition = {
      id,
      name: customName.trim(),
      provider: lang === 'tr' ? 'Özel Araç' : 'Custom Tool',
      url: safeUrl,
      accentColor: '#ec4899',
      badgeTextTr: strengthOptions.find((s) => s.id === customStrength)?.label ?? 'Özel',
      badgeTextEn: strengthOptions.find((s) => s.id === customStrength)?.label ?? 'Custom',
      taglineTr: 'Kullanıcı tarafından eklenen özel AI aracı',
      taglineEn: 'Custom AI tool added by user',
      promptStyle: 'generic',
      isCustom: true,
      scores: {
        coding: customStrength === 'coding' ? 9.2 : 7.5,
        reasoning: customStrength === 'reasoning' ? 9.2 : 7.8,
        research: customStrength === 'research' ? 9.3 : 7.2,
        writing: customStrength === 'writing' ? 9.2 : 7.8,
        visual: customStrength === 'visual' ? 9.5 : 4.5,
        long_context: customStrength === 'long_context' ? 9.4 : 7.5,
        data_math: customStrength === 'reasoning' || customStrength === 'coding' ? 8.6 : 7.4,
        speed: 8.5,
        valueFree: customIsPaid ? 7.2 : 9.4,
      },
      subModels: [
        {
          id: `${id}_sub`,
          name: subLabel,
          effort: 'balanced',
          minPaid: false,
          creditTagTr: customIsPaid ? 'Özel Pro Alt Model' : 'Ücretsiz Alt Model',
          creditTagEn: customIsPaid ? 'Custom Paid Sub-Model' : 'Free Sub-Model',
          bestForTr: 'Kullanıcı tarafından tanımlanan görevler',
          bestForEn: 'User-defined custom tasks',
        },
      ],
      tiers: [
        {
          id: 'custom_tier',
          labelTr: customTierLabel.trim() || (customIsPaid ? 'Pro' : 'Ücretsiz'),
          labelEn: customTierLabel.trim() || (customIsPaid ? 'Pro' : 'Free'),
          isPaid: customIsPaid,
          qualityBoost: customIsPaid ? 0.65 : 0,
          creditWeight: customIsPaid ? 2 : 0,
          constraintsTr: ['Özel tanımlı plan — limitlerini buradan anlık yönetebilirsin.'],
          constraintsEn: ['Custom plan — toggle quota limit anytime from My Plans.'],
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
        enabledSubModelIds: [`${id}_sub`],
        customTool: newTool,
      },
    ]);

    setCustomName('');
    setCustomTierLabel('Pro');
    setCustomSubModelName('');
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
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#141a35]/55"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.18 }}
            className="retro-window w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            {/* Classic Retro Window Titlebar */}
            <div className="retro-titlebar">
              <div className="flex items-center gap-2 min-w-0">
                <RetroFolderIcon accent className="w-4 h-4 shrink-0" />
                <span className="font-retro text-xs font-bold text-[#1b2544] dark:text-[#eef2ff] truncate">
                  {t.onboardingWindowTitle}
                </span>
              </div>
              <RetroWindowControls onClose={canDismiss ? onComplete : undefined} />
            </div>

            {/* Sub-header & Presets */}
            <div className="px-5 pt-4 pb-3.5 border-b border-[var(--win-border-soft)] bg-[var(--win-bg-soft)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-retro font-bold bg-[#fce7f3] dark:bg-[#f472b6]/20 text-[#be185d] dark:text-[#fbcfe8] border border-[#f472b6] mb-1.5">
                    <RetroStarSvg pinkAccent className="w-3 h-3" />
                    {t.onboardingPill}
                  </span>
                  <h2 className="font-retro text-lg sm:text-xl font-bold text-[var(--ink-primary)]">
                    {t.onboardingHeading}
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--ink-secondary)] mt-1 max-w-2xl">
                    {t.onboardingSubtitle}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="font-retro text-[11px] font-bold text-[var(--ink-muted)]">
                  {t.quickPresets}
                </span>
                {ONBOARDING_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset.id)}
                    className="retro-btn px-2.5 py-1 text-xs font-semibold cursor-pointer"
                    title={lang === 'tr' ? preset.descTr : preset.descEn}
                  >
                    {lang === 'tr' ? preset.labelTr : preset.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Tool Cards */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {allTools.map((tool) => {
                  const sel = userPlans.find((p) => p.toolId === tool.id);
                  const isEnabled = sel?.enabled ?? false;
                  const isQuota = sel?.quotaReached ?? false;
                  const currentTierId = sel?.tierId ?? tool.tiers[0].id;
                  const isCustomTierMode = Boolean(sel?.customTierName !== undefined);
                  const enabledSubIds = sel?.enabledSubModelIds ?? tool.subModels.map((s) => s.id);

                  return (
                    <div
                      key={tool.id}
                      className={`retro-window-sm p-3.5 transition ${
                        !isEnabled ? 'opacity-65' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => toggleTool(tool.id)}
                          className="flex items-center gap-2.5 text-left flex-1 cursor-pointer"
                        >
                          <div
                            className={`w-5 h-5 rounded-sm flex items-center justify-center border-[1.5px] shrink-0 ${
                              isEnabled
                                ? 'bg-[#3a56a8] dark:bg-[#5b72d6] border-[#2c3b68] dark:border-[#c7d2fe] text-white'
                                : 'bg-[var(--win-bg)] border-[var(--win-border)]'
                            }`}
                          >
                            {isEnabled && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-2.5 h-2.5 rounded-xs border border-[#2c3b68] shrink-0"
                                style={{ backgroundColor: tool.accentColor }}
                              />
                              <span className="font-retro font-bold text-sm text-[var(--ink-primary)]">
                                {tool.name}
                              </span>
                              <span className="text-[11px] text-[var(--ink-muted)]">
                                {tool.provider}
                              </span>
                            </div>
                            <p className="text-xs text-[var(--ink-secondary)] mt-0.5 truncate">
                              {lang === 'tr' ? tool.badgeTextTr : tool.badgeTextEn}
                            </p>
                          </div>
                        </button>

                        {tool.isCustom && (
                          <button
                            type="button"
                            onClick={() => removeCustomTool(tool.id)}
                            className="p-1 text-rose-600 dark:text-rose-300 hover:bg-rose-500/10 rounded cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {isEnabled && (
                        <div className="mt-3 pt-2.5 retro-divider space-y-2.5">
                          {/* Tier Chips */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            {tool.tiers.map((tier) => {
                              const selected = !isCustomTierMode && currentTierId === tier.id;
                              return (
                                <button
                                  key={tier.id}
                                  type="button"
                                  onClick={() => changeTier(tool.id, tier.id)}
                                  className={`px-2 py-0.5 text-[11px] font-bold cursor-pointer ${
                                    selected ? 'retro-btn-accent' : 'retro-btn'
                                  }`}
                                >
                                  {lang === 'tr' ? tier.labelTr : tier.labelEn}
                                </button>
                              );
                            })}
                            {!tool.isCustom && (
                              <button
                                type="button"
                                onClick={() => changeTier(tool.id, 'custom')}
                                className={`px-2 py-0.5 text-[11px] font-bold cursor-pointer ${
                                  isCustomTierMode ? 'retro-btn-accent' : 'retro-btn'
                                }`}
                              >
                                {t.customTierBtn}
                              </button>
                            )}
                          </div>

                          {isCustomTierMode && (
                            <input
                              type="text"
                              value={sel?.customTierName ?? ''}
                              onChange={(e) => changeCustomTierName(tool.id, e.target.value)}
                              placeholder={t.customTierPlaceholder}
                              className="retro-input w-full px-2.5 py-1 text-xs"
                            />
                          )}

                          {/* Sub-Model Selection Chips */}
                          <div className="space-y-1.5">
                            <span className="block font-retro text-[10px] font-bold uppercase tracking-wide text-[var(--ink-muted)]">
                              {t.subModelsLabel}
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {tool.subModels.map((sm) => {
                                const on = enabledSubIds.includes(sm.id);
                                return (
                                  <button
                                    key={sm.id}
                                    type="button"
                                    onClick={() => toggleSubModel(tool.id, sm.id)}
                                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium border cursor-pointer transition ${
                                      on
                                        ? 'bg-[#dde7ff] dark:bg-[#2f3c73] text-[#1b2544] dark:text-[#eef2ff] border-[#2c3b68] dark:border-[#9cb0f0]'
                                        : 'bg-transparent text-[var(--ink-muted)] border-dashed border-[var(--win-border-soft)] opacity-70'
                                    }`}
                                  >
                                    {on ? '✓ ' : '+ '}
                                    {sm.name}
                                  </button>
                                );
                              })}
                              {(sel?.customSubModels ?? []).map((cs) => (
                                <span
                                  key={cs}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#fce7f3] dark:bg-[#f472b6]/20 text-[#be185d] dark:text-[#fbcfe8] border border-[#f472b6]"
                                >
                                  {cs}
                                  <button
                                    type="button"
                                    onClick={() => removeCustomSubModel(tool.id, cs)}
                                    className="cursor-pointer hover:opacity-75"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                            </div>

                            {/* Inline Custom Sub-Model Adder */}
                            <div className="flex gap-1.5 pt-0.5">
                              <input
                                type="text"
                                value={subDraftByTool[tool.id] ?? ''}
                                onChange={(e) =>
                                  setSubDraftByTool((prev) => ({
                                    ...prev,
                                    [tool.id]: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addCustomSubModel(tool.id);
                                  }
                                }}
                                placeholder={t.addCustomSubModelPlaceholder}
                                className="retro-input flex-1 px-2 py-1 text-[11px]"
                              />
                              <button
                                type="button"
                                onClick={() => addCustomSubModel(tool.id)}
                                className="retro-btn px-2 py-1 text-[11px] font-bold cursor-pointer"
                              >
                                {t.addBtn}
                              </button>
                            </div>
                          </div>

                          {/* Instant Quota Reached Toggle */}
                          <div
                            onClick={() => toggleQuota(tool.id)}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-md border cursor-pointer ${
                              isQuota
                                ? 'bg-amber-100 dark:bg-amber-900/35 border-amber-500 text-amber-900 dark:text-amber-200'
                                : 'bg-[var(--win-bg-soft)] border-[var(--win-border-soft)] text-[var(--ink-secondary)]'
                            }`}
                          >
                            <span className="text-[11px] font-semibold flex items-center gap-1.5">
                              <ShieldAlert className="w-3.5 h-3.5" />
                              {t.quotaReachedLabel}
                            </span>
                            <div
                              className={`w-8 h-4 rounded-full p-0.5 transition-colors border border-[#2c3b68] ${
                                isQuota ? 'bg-amber-400' : 'bg-slate-300 dark:bg-slate-700'
                              }`}
                            >
                              <div
                                className={`w-2.5 h-2.5 rounded-full bg-white transition-transform ${
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
              </div>

              {/* Add Custom Tool */}
              {!showCustomForm ? (
                <button
                  type="button"
                  onClick={() => setShowCustomForm(true)}
                  className="w-full py-2.5 rounded-lg border-2 border-dashed border-[var(--win-border-soft)] bg-[var(--win-bg-soft)] hover:border-[var(--win-border)] font-retro text-xs font-bold text-[var(--ink-primary)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  {t.addCustomToolBtn}
                </button>
              ) : (
                <form onSubmit={handleAddCustomTool} className="retro-window-sm p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-retro text-xs font-bold text-[var(--ink-primary)]">
                      {t.customToolHeading}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowCustomForm(false)}
                      className="text-xs text-[var(--ink-muted)] hover:underline cursor-pointer"
                    >
                      {t.cancel}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      required
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder={t.toolNamePlaceholder}
                      className="retro-input px-2.5 py-1.5 text-xs"
                    />
                    <input
                      type="text"
                      value={customTierLabel}
                      onChange={(e) => setCustomTierLabel(e.target.value)}
                      placeholder={t.planNamePlaceholder}
                      className="retro-input px-2.5 py-1.5 text-xs"
                    />
                    <input
                      type="text"
                      value={customSubModelName}
                      onChange={(e) => setCustomSubModelName(e.target.value)}
                      placeholder={t.subModelNamePlaceholder}
                      className="retro-input px-2.5 py-1.5 text-xs"
                    />
                    <input
                      type="text"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      placeholder={t.urlPlaceholder}
                      className="retro-input px-2.5 py-1.5 text-xs"
                    />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-[var(--ink-muted)]">
                        {t.strongAreaLabel}
                      </span>
                      {strengthOptions.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setCustomStrength(opt.id)}
                          className={`px-2 py-0.5 text-[11px] font-bold cursor-pointer ${
                            customStrength === opt.id ? 'retro-btn-accent' : 'retro-btn'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={customIsPaid}
                          onChange={(e) => setCustomIsPaid(e.target.checked)}
                          className="accent-[#ec4899]"
                        />
                        {t.paidPlanCheckbox}
                      </label>
                      <button
                        type="submit"
                        className="retro-btn-primary px-3.5 py-1.5 text-xs font-retro font-bold cursor-pointer"
                      >
                        {t.addToListBtn}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 border-t border-[var(--win-border-soft)] bg-[var(--win-bg-soft)] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-retro font-bold">
                <span className="px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-900/35 text-emerald-800 dark:text-emerald-200 border border-emerald-500/60">
                  {activeCount} {t.activePlans}
                </span>
                {quotaCount > 0 && (
                  <span className="px-2.5 py-1 rounded-md bg-amber-100 dark:bg-amber-900/35 text-amber-800 dark:text-amber-200 border border-amber-500/60">
                    {quotaCount} {t.quotaFullCount}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={onComplete}
                className="retro-btn-primary px-5 py-2 font-retro text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {t.saveAndStartBtn}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
