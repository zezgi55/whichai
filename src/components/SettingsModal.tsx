import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Sun, Moon, KeyRound, Trash2, Check, Settings } from 'lucide-react';
import { Language, LiveApiConfig, ThemeMode } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { RetroWindowControls } from './AtmosphereDecor';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onChangeLang: (lang: Language) => void;
  theme: ThemeMode;
  onChangeTheme: (theme: ThemeMode) => void;
  liveApiConfig: LiveApiConfig;
  onUpdateLiveApiConfig: (cfg: LiveApiConfig) => void;
  onClearAllChats: () => void;
  hasChats: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  lang,
  onChangeLang,
  theme,
  onChangeTheme,
  liveApiConfig,
  onUpdateLiveApiConfig,
  onClearAllChats,
  hasChats,
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141a35]/55"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className="retro-window w-full max-w-xl max-h-[88vh] flex flex-col overflow-hidden"
          >
            {/* Retro OS Title Bar */}
            <div className="retro-titlebar">
              <div className="flex items-center gap-2 min-w-0">
                <Settings className="w-4 h-4 text-[#1b2544] dark:text-[#eef2ff] shrink-0" />
                <span className="font-retro text-xs font-bold text-[#1b2544] dark:text-[#eef2ff] truncate">
                  {t.settingsWindowTitle}
                </span>
              </div>
              <RetroWindowControls onClose={onClose} />
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div>
                <h2 className="font-retro text-lg font-bold text-[var(--ink-primary)]">
                  {t.settingsHeading}
                </h2>
                <p className="text-xs text-[var(--ink-secondary)] mt-0.5">{t.settingsSubtitle}</p>
              </div>

              {/* 1. Language Switcher (TR / EN) */}
              <div className="retro-panel-flat p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#ec4899]" />
                  <h3 className="font-retro text-xs font-bold uppercase tracking-wide text-[var(--ink-primary)]">
                    {t.languageSection}
                  </h3>
                </div>
                <p className="text-xs text-[var(--ink-secondary)]">{t.languageDesc}</p>

                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { code: 'tr' as Language, label: 'Türkçe', sub: 'TR · Varsayılan' },
                    { code: 'en' as Language, label: 'English', sub: 'EN · Full UI & Output' },
                  ].map((item) => {
                    const active = lang === item.code;
                    return (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => onChangeLang(item.code)}
                        className={`p-3 text-left flex items-center justify-between cursor-pointer ${
                          active ? 'retro-btn-accent' : 'retro-btn'
                        }`}
                      >
                        <div>
                          <div className="font-retro text-sm font-bold">{item.label}</div>
                          <div className="text-[11px] opacity-80">{item.sub}</div>
                        </div>
                        {active && <Check className="w-4 h-4 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Theme Selector (Daylight Sky / Twilight Night) */}
              <div className="retro-panel-flat p-4 space-y-3">
                <div className="flex items-center gap-2">
                  {theme === 'light' ? (
                    <Sun className="w-4 h-4 text-[#3a56a8]" />
                  ) : (
                    <Moon className="w-4 h-4 text-[#fde68a]" />
                  )}
                  <h3 className="font-retro text-xs font-bold uppercase tracking-wide text-[var(--ink-primary)]">
                    {t.themeSection}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => onChangeTheme('light')}
                    className={`p-3 text-left cursor-pointer ${
                      theme === 'light' ? 'retro-btn-accent' : 'retro-btn'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-retro text-xs font-bold flex items-center gap-1.5">
                        <Sun className="w-3.5 h-3.5" />
                        {t.themeDayTitle}
                      </span>
                      {theme === 'light' && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <p className="text-[11px] opacity-80 mt-1 leading-snug">{t.themeDayDesc}</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => onChangeTheme('dark')}
                    className={`p-3 text-left cursor-pointer ${
                      theme === 'dark' ? 'retro-btn-accent' : 'retro-btn'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-retro text-xs font-bold flex items-center gap-1.5">
                        <Moon className="w-3.5 h-3.5" />
                        {t.themeNightTitle}
                      </span>
                      {theme === 'dark' && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <p className="text-[11px] opacity-80 mt-1 leading-snug">{t.themeNightDesc}</p>
                  </button>
                </div>
              </div>

              {/* 3. Optional Live LLM API */}
              <div className="retro-panel-flat p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-[#3a56a8] dark:text-[#93c5fd]" />
                    <h3 className="font-retro text-xs font-bold uppercase tracking-wide text-[var(--ink-primary)]">
                      {t.apiSectionTitle}
                    </h3>
                  </div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={liveApiConfig.enabled}
                      onChange={(e) =>
                        onUpdateLiveApiConfig({ ...liveApiConfig, enabled: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#ec4899]"
                    />
                    {t.useLiveApi}
                  </label>
                </div>
                <p className="text-xs text-[var(--ink-secondary)]">{t.apiSectionDesc}</p>

                {liveApiConfig.enabled && (
                  <div className="space-y-2.5 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold mb-1 text-[var(--ink-secondary)]">
                          {t.providerLabel}
                        </label>
                        <select
                          value={liveApiConfig.provider}
                          onChange={(e) =>
                            onUpdateLiveApiConfig({
                              ...liveApiConfig,
                              provider: e.target.value as LiveApiConfig['provider'],
                            })
                          }
                          className="retro-input w-full px-2.5 py-1.5 text-xs"
                        >
                          <option value="gemini">Google Gemini API</option>
                          <option value="openai_compatible">OpenAI / Compatible</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold mb-1 text-[var(--ink-secondary)]">
                          {t.modelNameLabel}
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
                          className="retro-input w-full px-2.5 py-1.5 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold mb-1 text-[var(--ink-secondary)]">
                        {t.apiKeyLabel}
                      </label>
                      <input
                        type="password"
                        value={liveApiConfig.apiKey}
                        onChange={(e) =>
                          onUpdateLiveApiConfig({ ...liveApiConfig, apiKey: e.target.value })
                        }
                        placeholder={liveApiConfig.provider === 'gemini' ? 'AIza...' : 'sk-...'}
                        className="retro-input w-full px-2.5 py-1.5 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Local Data Management */}
              <div className="retro-panel-flat p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-retro text-xs font-bold uppercase tracking-wide text-[var(--ink-primary)]">
                    {t.dataSectionTitle}
                  </h3>
                </div>
                <button
                  type="button"
                  disabled={!hasChats}
                  onClick={onClearAllChats}
                  className="retro-btn px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-300 flex items-center gap-1.5 disabled:opacity-45 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {t.clearChatsBtn}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-[var(--win-border-soft)] flex justify-end bg-[var(--win-bg-soft)]">
              <button
                type="button"
                onClick={onClose}
                className="retro-btn-primary px-5 py-2 text-xs font-retro font-bold cursor-pointer"
              >
                {t.closeBtn}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
