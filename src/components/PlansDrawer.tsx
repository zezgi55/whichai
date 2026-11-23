import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  Check,
  Plus,
  Trash2,
  RefreshCw,
  ExternalLink,
  X,
  Wand2,
} from 'lucide-react';
import { AIToolDefinition, Language, UserPlanSelection } from '../types';
import { DEFAULT_AI_CATALOG } from '../data/aiCatalog';
import { TRANSLATIONS } from '../i18n/translations';
import { RetroFolderIcon, RetroWindowControls } from './AtmosphereDecor';

interface PlansDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  userPlans: UserPlanSelection[];
  onUpdatePlans: (plans: UserPlanSelection[]) => void;
  onOpenOnboarding: () => void;
  onReanalyzeLast?: () => void;
  hasMessages?: boolean;
}

export const PlansDrawer: React.FC<PlansDrawerProps> = ({
  isOpen,
  onClose,
  lang,
  userPlans,
  onUpdatePlans,
  onOpenOnboarding,
  onReanalyzeLast,
  hasMessages = false,
}) => {
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState<'plans' | 'custom'>('plans');
  const [customName, setCustomName] = useState('');
  const [customTierLabel, setCustomTierLabel] = useState('Pro');
  const [customSubModel, setCustomSubModel] = useState('');
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
      onUpdatePlans(userPlans.map((p) => (p.toolId === toolId ? { ...p, enabled: !p.enabled } : p)));
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
    onUpdatePlans(userPlans.map((p) => (p.toolId === toolId ? { ...p, customTierName: name } : p)));
  };

  const toggleSubModel = (toolId: string, subId: string) => {
    const def = allTools.find((item) => item.id === toolId);
    onUpdatePlans(
      userPlans.map((p) => {
        if (p.toolId !== toolId) return p;
        const curr = p.enabledSubModelIds ?? def?.subModels.map((s) => s.id) ?? [];
        const next = curr.includes(subId) ? curr.filter((x) => x !== subId) : [...curr, subId];
        return { ...p, enabledSubModelIds: next.length > 0 ? next : curr };
      })
    );
  };

  const addCustomSubModel = (toolId: string) => {
    const val = (subDraftByTool[toolId] ?? '').trim();
    if (!val) return;
    onUpdatePlans(
      userPlans.map((p) =>
        p.toolId === toolId ? { ...p, customSubModels: [...(p.customSubModels ?? []), val] } : p
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
    const subLabel = customSubModel.trim() || `${customName.trim()} Standard`;

    const newTool: AIToolDefinition = {
      id,
      name: customName.trim(),
      provider: lang === 'tr' ? 'Özel Araç' : 'Custom Tool',
      url: safeUrl,
      accentColor: '#ec4899',
      badgeTextTr: 'Özel Tanımlı Model',
      badgeTextEn: 'Custom Defined Model',
      taglineTr: 'Kullanıcı tarafından eklenen özel AI aracı',
      taglineEn: 'User-defined custom AI tool',
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
      subModels: [
        {
          id: `${id}_sub`,
          name: subLabel,
          effort: 'balanced',
          minPaid: false,
          creditTagTr: customIsPaid ? 'Ücretli Alt Model' : 'Ücretsiz Alt Model',
          creditTagEn: customIsPaid ? 'Paid Sub-Model' : 'Free Sub-Model',
          bestForTr: 'Özel tanımlanan görevler',
          bestForEn: 'Custom tasks',
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
          constraintsTr: ['Özel eklenen model — limitlerini buradan anlık yönetebilirsin.'],
          constraintsEn: ['Custom model — manage quota status right here.'],
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
    setCustomSubModel('');
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
            className="fixed inset-0 z-40 bg-[#141a35]/45"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="fixed top-2 right-2 bottom-2 z-50 w-[calc(100%-16px)] max-w-md retro-window flex flex-col overflow-hidden"
          >
            {/* Retro Title Bar */}
            <div className="retro-titlebar">
              <div className="flex items-center gap-2 min-w-0">
                <RetroFolderIcon accent className="w-4 h-4 shrink-0" />
                <span className="font-retro text-xs font-bold text-[#1b2544] dark:text-[#eef2ff] truncate">
                  {t.drawerWindowTitle}
                </span>
              </div>
              <RetroWindowControls onClose={onClose} />
            </div>

            {/* Sub-Header + Folder Tabs */}
            <div className="px-4 pt-3.5 pb-3 border-b border-[var(--win-border-soft)] bg-[var(--win-bg-soft)]">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="font-retro text-sm font-bold text-[var(--ink-primary)]">
                    {t.myPlansAndQuotas}
                  </h3>
                  <p className="text-[11px] text-[var(--ink-secondary)]">
                    {activeCount} {t.activeModels} · {quotaCount} {t.quotaFullCount}
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                {[
                  { id: 'plans', label: t.tabPlans },
                  { id: 'custom', label: t.tabCustom },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as 'plans' | 'custom')}
                    className={`py-1.5 text-xs font-retro font-bold cursor-pointer ${
                      activeTab === tab.id ? 'retro-btn-accent' : 'retro-btn'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeTab === 'plans' ? (
                <>
                  {quotaCount > 0 && (
                    <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/35 border-[1.5px] border-amber-500 flex items-center justify-between gap-2">
                      <div className="text-xs text-amber-900 dark:text-amber-100 flex items-start gap-2">
                        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-300" />
                        <span>
                          <strong>{quotaCount}</strong> {t.quotaBannerPrefix}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={resetAllQuotas}
                        className="retro-btn px-2.5 py-1 text-[11px] font-bold shrink-0 cursor-pointer"
                      >
                        {t.resetQuotas}
                      </button>
                    </div>
                  )}

                  {allTools.map((tool) => {
                    const sel = userPlans.find((p) => p.toolId === tool.id);
                    const isEnabled = sel?.enabled ?? false;
                    const isQuota = sel?.quotaReached ?? false;
                    const currentTierId = sel?.tierId ?? tool.tiers[0].id;
                    const isCustomTierMode = Boolean(sel?.customTierName !== undefined);
                    const enabledSubIds =
                      sel?.enabledSubModelIds ?? tool.subModels.map((s) => s.id);

                    return (
                      <div
                        key={tool.id}
                        className={`retro-window-sm p-3 ${!isEnabled ? 'opacity-60' : ''}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => toggleTool(tool.id)}
                            className="flex items-center gap-2.5 text-left flex-1 cursor-pointer min-w-0"
                          >
                            <div
                              className={`w-5 h-5 rounded-sm flex items-center justify-center border-[1.5px] shrink-0 ${
                                isEnabled
                                  ? 'bg-[#3a56a8] dark:bg-[#5b72d6] border-[#2c3b68] dark:border-[#c7d2fe] text-white'
                                  : 'bg-[var(--win-bg)] border-[var(--win-border)]'
                              }`}
                            >
                              {isEnabled && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="w-2.5 h-2.5 rounded-xs border border-[#2c3b68] shrink-0"
                                  style={{ backgroundColor: tool.accentColor }}
                                />
                                <span className="font-retro font-bold text-xs text-[var(--ink-primary)] truncate">
                                  {tool.name}
                                </span>
                                {isEnabled && isQuota && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-200 dark:bg-amber-800/60 text-amber-900 dark:text-amber-100">
                                    {t.quotaFull}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-[var(--ink-muted)] truncate">
                                {lang === 'tr' ? tool.badgeTextTr : tool.badgeTextEn}
                              </p>
                            </div>
                          </button>

                          <div className="flex items-center gap-1 shrink-0">
                            <a
                              href={tool.url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 text-[var(--ink-muted)] hover:text-[var(--ink-primary)]"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            {tool.isCustom && (
                              <button
                                type="button"
                                onClick={() => removeCustomTool(tool.id)}
                                className="p-1 text-rose-500 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {isEnabled && (
                          <div className="mt-2.5 pt-2.5 retro-divider space-y-2.5">
                            {/* Tiers */}
                            <div className="flex flex-wrap gap-1.5">
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

                            {/* Sub-models */}
                            <div className="space-y-1.5">
                              <span className="block font-retro text-[10px] font-bold uppercase text-[var(--ink-muted)]">
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
                                      className={`px-2 py-0.5 rounded text-[11px] font-medium border cursor-pointer ${
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
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#fce7f3] dark:bg-[#f472b6]/20 text-[#be185d] dark:text-[#fbcfe8] border border-[#f472b6]"
                                  >
                                    {cs}
                                    <button
                                      type="button"
                                      onClick={() => removeCustomSubModel(tool.id, cs)}
                                      className="cursor-pointer"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </span>
                                ))}
                              </div>

                              <div className="flex gap-1.5">
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

                            {/* Quota Reached Toggle */}
                            <div
                              onClick={() => toggleQuota(tool.id)}
                              className={`flex items-center justify-between px-2.5 py-1.5 rounded-md border cursor-pointer ${
                                isQuota
                                  ? 'bg-amber-100 dark:bg-amber-900/35 border-amber-500 text-amber-900 dark:text-amber-100'
                                  : 'bg-[var(--win-bg-soft)] border-[var(--win-border-soft)] text-[var(--ink-secondary)]'
                              }`}
                            >
                              <span className="text-xs font-semibold flex items-center gap-1.5">
                                <ShieldAlert className="w-3.5 h-3.5" />
                                {t.quotaReachedLabel}
                              </span>
                              <div
                                className={`w-8 h-4 rounded-full p-0.5 border border-[#2c3b68] transition-colors ${
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
                </>
              ) : (
                <form onSubmit={handleAddCustom} className="retro-window-sm p-4 space-y-3">
                  <h4 className="font-retro text-xs font-bold text-[var(--ink-primary)] flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-[#ec4899]" />
                    {t.customToolHeading}
                  </h4>

                  <div className="space-y-2.5">
                    <input
                      type="text"
                      required
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder={t.toolNamePlaceholder}
                      className="retro-input w-full px-2.5 py-1.5 text-xs"
                    />
                    <input
                      type="text"
                      value={customTierLabel}
                      onChange={(e) => setCustomTierLabel(e.target.value)}
                      placeholder={t.planNamePlaceholder}
                      className="retro-input w-full px-2.5 py-1.5 text-xs"
                    />
                    <input
                      type="text"
                      value={customSubModel}
                      onChange={(e) => setCustomSubModel(e.target.value)}
                      placeholder={t.subModelNamePlaceholder}
                      className="retro-input w-full px-2.5 py-1.5 text-xs"
                    />
                    <input
                      type="text"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      placeholder={t.urlPlaceholder}
                      className="retro-input w-full px-2.5 py-1.5 text-xs"
                    />

                    <div>
                      <span className="block text-[11px] font-bold text-[var(--ink-muted)] mb-1.5">
                        {t.strongAreaLabel}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
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
                    </div>

                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={customIsPaid}
                        onChange={(e) => setCustomIsPaid(e.target.checked)}
                        className="accent-[#ec4899]"
                      />
                      {t.paidPlanCheckbox}
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full retro-btn-primary py-2 font-retro text-xs font-bold cursor-pointer"
                  >
                    {t.addToListBtn}
                  </button>
                </form>
              )}
            </div>

            {/* Footer */}
            <div className="p-3.5 border-t border-[var(--win-border-soft)] bg-[var(--win-bg-soft)] space-y-2">
              {hasMessages && onReanalyzeLast && (
                <button
                  type="button"
                  onClick={() => {
                    onReanalyzeLast();
                    onClose();
                  }}
                  className="w-full retro-btn-primary py-2 font-retro text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {t.reanalyzeLastBtn}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenOnboarding();
                }}
                className="w-full retro-btn py-1.5 font-retro text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Wand2 className="w-3.5 h-3.5 text-[#ec4899]" />
                {t.openSetupWizardBtn}
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
