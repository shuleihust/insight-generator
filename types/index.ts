// types/index.ts

export type PlanType = 'monthly' | 'yearly' | 'lifetime';
export type SubscriptionStatus = 'active' | 'canceled' | 'expired' | 'incomplete';

export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string | null;
  plan_type: PlanType;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface InsightFunction {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  source_text: string;
  function_data: FunctionData;
  created_at: string;
  updated_at: string;
}

export interface FunctionData {
  goal: string;
  traits: string[];
  beliefs: string[];
  thinking_models: ThinkingModel[];
  language_arsenal: LanguageArsenal;
  process: ProcessStep[];
  quality_standards: string[];
  taboos: string[];
}

export interface ThinkingModel {
  name: string;
  description: string;
  elements: {
    [key: string]: string;
  };
}

export interface LanguageArsenal {
  sentence_patterns: {
    [key: string]: string;
  };
  style_features: {
    [key: string]: string;
  };
}

export interface ProcessStep {
  name: string;
  action: string;
}

export interface GeneratedContent {
  id: string;
  user_id: string;
  function_id: string;
  topic: string;
  parameters: {
    [key: string]: any;
  };
  content: string;
  created_at: string;
}

export interface PricingPlan {
  id: PlanType;
  name: string;
  price: number;
  priceId: string;
  features: string[];
  popular?: boolean;
}
