export type ThemeMode = 'dark' | 'light';

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

export interface CapabilityScores {
  coding: number;      // 1-10
  reasoning: number;   // 1-10
  research: number;    // 1-10
  writing: number;     // 1-10
  visual: number;      // 1-10
  long_context: number;// 1-10
  data_math: number;   // 1-10
  speed: number;       // 1-10
  valueFree: number;   // 1-10 (how generous/cost-effective)
}

export interface PlanTierOption {
  id: string;
  label: string;
  isPaid: boolean;
  qualityBoost: number;   // multiplier or additive boost
  creditWeight: number;   // 0 = free, 1 = light paid, 2 = medium, 3 = heavy pro credit
  constraints: string[];  // e.g. "Günlük mesaj limiti çabuk dolabilir", "Büyük PDF yükleme sınırlı"
}

export interface AIToolDefinition {
  id: string;
  name: string;
  provider: string;
  url: string;
  accentColor: string;
  badgeText: string;
  tagline: string;
  promptStyle: 'claude_xml' | 'gemini_structured' | 'chatgpt_spec' | 'perplexity_research' | 'midjourney_visual' | 'deepseek_reasoning' | 'generic';
  tiers: PlanTierOption[];
  scores: CapabilityScores;
  isCustom?: boolean;
}

export interface UserPlanSelection {
  toolId: string;
  enabled: boolean;
  tierId: string;
  customTierName?: string;
  quotaReached: boolean;
  // If user added a completely custom AI tool
  customTool?: AIToolDefinition;
}

export interface ComplexityBadgeData {
  level: ComplexityLevel;
  label: string;
  headline: string;
  summary: string;
  creditAdvice: 'save_credits' | 'balanced' | 'worth_pro';
  detectedDomains: string[];
  estimatedEffortScore: number; // 1-100
}

export interface RankedModelItem {
  toolId: string;
  name: string;
  provider: string;
  recommendedTierLabel: string;
  url: string;
  score: number; // 0-100
  accentColor: string;
  reasons: string[];
  isPaidTier: boolean;
  promptStyle: AIToolDefinition['promptStyle'];
}

export interface UserStackOption {
  toolId: string;
  name: string;
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
}

export interface EnhancedPromptData {
  targetToolId: string;
  targetModelName: string;
  targetUrl: string;
  targetTierLabel: string;
  formatStyleLabel: string;
  whyThisFormat: string;
  enhancedPrompt: string;
  // Optional alternate prompt for Market #1 when user's #1 differs
  marketTopAlternative?: {
    targetToolId: string;
    targetModelName: string;
    targetUrl: string;
    formatStyleLabel: string;
    enhancedPrompt: string;
  };
}

export interface AnalysisResult {
  id: string;
  createdAt: string;
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
