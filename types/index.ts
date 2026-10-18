export type Niche = 
  | 'lifestyle'
  | 'beauty'
  | 'fashion'
  | 'food'
  | 'tech'
  | 'fitness'
  | 'travel'
  | 'finance';

export type DeliverableType = 
  | 'reel'
  | 'story_set'
  | 'static_post'
  | 'carousel'
  | 'event_attendance'
  | 'other';

export type CreatorProfile = {
  id: string;
  name: string;
  niche: Niche;
  followers: number;
  medianReelViews: number;
  engagementRatePct?: number; // optional
  updatedAt: string;          // ISO date; stale if older than 30 days
  source: 'sample' | 'self_reported';
  verified?: boolean;
};

export type DeliverableItem = {
  type: DeliverableType;
  count: number;
};

export type Extraction = {
  brand_name: string | null;
  deliverables: DeliverableItem[];
  cash_offer_inr: number | null;
  product_offered: {
    description: string;
    stated_value_inr: number | null;
  } | null;
  usage_rights: {
    duration_months: number | 'perpetual' | null;
    paid_ads: boolean | null;
  };
  exclusivity: {
    duration_months: number | null;
    category: string | null;
  };
  deadline: string | null;
  payment_terms: {
    days_after_posting: number | null;
    advance_pct: number | null;
  };
  sponsorship_disclosure_mentioned: boolean | null;
  red_flags: string[];
  injection_attempt_detected: boolean;
  missing_fields: string[];
};

export type BrandRecord = {
  id: string;
  name: string;
  category: Niche | 'other';
  reports_count: number;
  verified_count: number;
  last_report_date: string;
  payout_days: { p25: number; median: number; p75: number } | null;
  typical_reel_cash_inr: { low: number; high: number } | null; // for ~10K views
  advance_paid_reports: number;
  common_asks: string[];
};

export type Verdict = 'TAKE' | 'COUNTER' | 'PASS_OR_RESET' | 'NEED_INFO';
export type Confidence = 'HIGH' | 'MEDIUM' | 'LOW';
export type Tier = 1 | 2 | 3;

export type EngineFlag = 
  | 'SLOW_PAYOUT'
  | 'NO_ADVANCE'
  | 'LOW_REACH_RATIO'
  | 'STALE_PROFILE'
  | 'LOW_BRAND_DATA'
  | 'HEAVY_RIGHTS'
  | 'INJECTION';

export type EngineResult = {
  verdict: Verdict;
  confidence: Confidence;
  brandTier: Tier;
  fairRange: { low: number; high: number } | null;
  baseRange: { low: number; high: number } | null; // before rights multipliers
  offerValue: number | null;
  ratioToLow: number | null;
  cpvOffer: number | null;
  cpvFair: { low: number; high: number } | null;
  giveaways: { term: string; addOnPct: number }[];
  counterTarget: number | null;
  resetRange: { low: number; high: number } | null; // fair range with perpetual usage and 12m+ exclusivity removed (PASS_OR_RESET only)
  flags: EngineFlag[];
  missingQuestions: string[];
  allowedNumbers: number[]; // every number the AI text may mention
  benchmarkData?: {
    category: string;
    typical_cash: { low: number; high: number };
    payout_median: number;
    reports_count: number;
  };
};

export type ReplyDraft = {
  label: 'friendly' | 'firm';
  text: string;
};

export type ExplanationResponse = {
  headline: string;
  why: string[];
  giveaways: string[];
  payment_note: string | null;
  questions_to_ask: string[];
  replies: ReplyDraft[];
  cautions: string[];
};

export type DealStatus = 'Checked' | 'Replied' | 'Accepted' | 'Delivered' | 'Paid' | 'Declined';

export type DealOutcome = {
  finalCash: number;
  productValue: number;
  usageAgreed?: string;
  exclusivityAgreed?: string;
  paidYet: boolean;
  daysToPayment?: number;
  paidOnTime?: boolean;
  proofAttached: boolean;
  upliftInr: number;
  loggedAt: string;
};

export type DealRecord = {
  id: string;
  createdAt: string;
  brandName: string;
  originalMessage: string;
  extraction: Extraction;
  engine: EngineResult;
  explanation: ExplanationResponse;
  status: DealStatus;
  profile: CreatorProfile;
  brandRecord?: BrandRecord | null;
  outcome?: DealOutcome;
};

export type RateForm = {
  type: DeliverableType;
  count: number;
  usageMonths: number;
  exclusivityMonths: number;
  paidAds?: boolean;
};

export type DealCheckRequest = {
  mode: 'offer' | 'rate';
  profile: CreatorProfile;
  message?: string;
  rateForm?: RateForm;
  confirmedProductValueInr?: number;
};

export type DealCheckResponse = {
  extraction: Extraction;
  engine: EngineResult;
  explanation: ExplanationResponse;
  replies: ReplyDraft[];
  warnings: string[];
  runMode: 'live' | 'demo';
};

export type CaptionRequest = {
  brief: string;
  brandName: string;
  relationship: 'paid' | 'gifted' | 'barter' | 'unknown';
  requestedRemoval?: boolean;
};

export type CaptionResponse = {
  captions: string[];
  note: string;
  disclosureRefused?: boolean;
  missingRelationship?: boolean;
};
