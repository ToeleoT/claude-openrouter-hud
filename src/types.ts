export type StatuslineInput = {
  cwd?: string;
  model?: {
    display_name?: string;
    id?: string;
  };
  session_id?: string;
  transcript_path?: string;
};

export type GenerationData = {
  cache_discount: number | null;
  model: string;
  provider_name: string;
  total_cost: number;
};

export type CreditsData = {
  total_credits: number;
  total_usage: number;
};

export type SessionState = {
  last_model: string;
  last_provider: string;
  seen_ids: string[];
  total_cache_discount: number;
  total_cost: number;
};

export type CreditsSnapshot = {
  depletionPercent: number;
  level: 'healthy' | 'warning' | 'critical';
  remainingCredits: number;
  totalCredits: number;
  totalUsage: number;
};

export type HudLineInput = {
  cacheDiscount: number;
  credits: CreditsSnapshot | null;
  model: string;
  provider: string;
  sessionCost: number;
  title: string;
  useColor?: boolean;
};
