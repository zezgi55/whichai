export type ThemeMode = 'dark' | 'light';

export type Language = 'tr' | 'en';

export type PriorityMode = 'quality' | 'speed' | 'credit_saver';

export type TaskDomain =
  | 'coding'
  | 'reasoning'
  | 'research'
  | 'writing'
  | 'visual'
  | 'long_context'
  | 'data_math'
  | 'simple_edit'
  | 'strategy';

export type ComplexityLevel = 'low' | 'medium' | 'high' | 'expert';

export type SubModelEffort = 'light' | 'balanced' | 'heavy';

export interface CapabilityScores {
  coding: number;
  reasoning: number;
  research: number;
  writing: number;
  visual: number;
  long_context: number;
  data_math: number;
  speed: number;
  valueFree: number;
}

export interface SubModelOption {
  id: string;
  name: string;
  effort: SubModelEffort;
  minPaid?: boolean; // requires paid tier by default
  creditTagTr: string;
  creditTagEn: string;
  bestForTr: string;
  bestForEn: string;
}

export interface PlanTierOption {
  id: string;
  labelTr: string;
  labelEn: string;
  isPaid: boolean;
  qualityBoost: number;
  creditWeight: number; // 0 = free, 1 = light paid, 2 = medium, 3 = heavy pro credit
  constraintsTr: string[];
  constraintsEn: string[];
}

export interface AIToolDefinition {
  id: string;
  name: string;
  provider: string;
  url: string;
  accentColor: string;
  badgeTextTr: string;
  badgeTextEn: string;
  taglineTr: string;
  taglineEn: string;
  promptStyle:
    | 'claude_xml'
    | 'gemini_structured'
    | 'chatgpt_spec'
    | 'perplexity_research'
    | 'midjourney_visual'
    | 'deepseek_reasoning'
    | 'generic';
  tiers: PlanTierOption[];
  subModels: SubModelOption[];
  scores: CapabilityScores;
  isCustom?: boolean;
}

export interface UserPlanSelection {
  toolId: string;
  enabled: boolean;
  tierId: string;
  customTierName?: string;
  quotaReached: boolean;
  enabledSubModelIds?: string[];
  customSubModels?: string[]; // e.g., ["Hidrojen", "Karbon", "Neon"]
  customTool?: AIToolDefinition;
}

export interface ComplexityBadgeData {
  level: ComplexityLevel;
  label: string;
  headline: string;
  summary: string;
  creditAdvice: 'save_credits' | 'balanced' | 'worth_pro';
  detectedDomains: string[];
  estimatedEffortScore: number;
}

export interface RankedModelItem {
  toolId: string;
  name: string;
  subModelName: string;
  provider: string;
  recommendedTierLabel: string;
  url: string;
  score: number;
  accentColor: string;
  reasons: string[];
  isPaidTier: boolean;
  promptStyle: AIToolDefinition['promptStyle'];
}

export interface UserStackOption {
  toolId: string;
  name: string;
  subModelName: string;
  subModelGuidance: string;
  tierLabel: string;
  url: string;
  score: number;
  accentColor: string;
  reasons: string[];
  planConstraintNote?: string;
  creditCostLabel: string;
  promptStyle: AIToolDefinition['promptStyle'];
}

export interface QuotaSkippedNotice {
  toolId: string;
  name: string;
  tierLabel: string;
}

export interface ComboStep {
  stepNumber: number;
  title: string;
  recommendedModelName: string;
  recommendedSubModel: string;
  recommendedToolId: string;
  recommendedUrl: string;
  isFromUserStack: boolean;
  rationale: string;
  stepPrompt: string;
}

export interface StrategySectionData {
  mode: 'simple_equivalent' | 'combo_workflow';
  headline: string;
  description: string;
  equivalentModels?: string[];
  comboSteps?: ComboStep[];
  finalVerdictLine: string;
}

export interface EnhancedPromptData {
  targetToolId: string;
  targetModelName: string;
  targetSubModelName: string;
  targetUrl: string;
  targetTierLabel: string;
  formatStyleLabel: string;
  whyThisFormat: string;
  originalInput: string;
  cleanedInput: string;
  typoFixesCount: number;
  typoFixesList: Array<{ from: string; to: string }>;
  enhancedPrompt: string;
  marketTopAlternative?: {
    targetToolId: string;
    targetModelName: string;
    targetSubModelName: string;
    targetUrl: string;
    formatStyleLabel: string;
    enhancedPrompt: string;
  };
}

export interface AnalysisResult {
  id: string;
  createdAt: string;
  language: Language;
  priorityMode: PriorityMode;
  engineSource: 'smart_local' | 'live_llm';
  complexityBadge: ComplexityBadgeData;
  marketTop5: RankedModelItem[];
  userBestOptions: UserStackOption[];
  quotaSkippedModels: QuotaSkippedNotice[];
  strategy: StrategySectionData;
  promptEnhancer: EnhancedPromptData;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  priorityMode: PriorityMode;
  createdAt: string;
  analysis?: AnalysisResult;
}

export interface ChatThread {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface LiveApiConfig {
  enabled: boolean;
  provider: 'gemini' | 'openai_compatible';
  apiKey: string;
  baseUrl?: string;
  modelName?: string;
}
