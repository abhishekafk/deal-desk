import { Niche, DeliverableType } from '../types';

export const NICHE_CPM: Record<Niche, { low: number; high: number }> = {
  lifestyle: { low: 500, high: 900 },
  beauty: { low: 600, high: 1000 },
  fashion: { low: 500, high: 900 },
  food: { low: 400, high: 800 },
  tech: { low: 700, high: 1300 },
  fitness: { low: 500, high: 900 },
  travel: { low: 500, high: 1000 },
  finance: { low: 900, high: 1800 },
};

export const FORMAT_MULTIPLIERS: Record<DeliverableType, number> = {
  reel: 1.0,
  carousel: 0.6,
  static_post: 0.5,
  story_set: 0.4,
  event_attendance: 0, // not priced as a deliverable; treated as a perk valued by creator
  other: 0.5,
};

export function getUsageAddOn(durationMonths: number | 'perpetual' | null): number {
  if (durationMonths === null || durationMonths === 0) return 0;
  if (durationMonths === 'perpetual') return 2.0;
  if (durationMonths <= 3) return 0.20;
  if (durationMonths <= 6) return 0.40;
  if (durationMonths <= 12) return 0.80;
  return 2.0;
}

export function getExclusivityAddOn(durationMonths: number | null): number {
  if (durationMonths === null || durationMonths === 0) return 0;
  if (durationMonths <= 3) return 0.30;
  if (durationMonths <= 6) return 0.60;
  return 1.20; // 12 months or more
}

export const PAID_ADS_ADDON = 0.40;

/**
 * Rounding rule from Section 5.2:
 * Round to the nearest Rs 50 below Rs 2,000 and the nearest Rs 250 otherwise.
 */
export function roundInr(value: number): number {
  if (value < 2000) {
    return Math.round(value / 50) * 50;
  }
  return Math.round(value / 250) * 250;
}

export const CATEGORY_BENCHMARKS: Record<string, { typical_cash: { low: number; high: number }; payout_median: number; reports_count: number }> = {
  beauty: { typical_cash: { low: 4500, high: 7000 }, payout_median: 45, reports_count: 42 },
  fashion: { typical_cash: { low: 4500, high: 7500 }, payout_median: 35, reports_count: 58 },
  food: { typical_cash: { low: 3500, high: 6000 }, payout_median: 40, reports_count: 31 },
  lifestyle: { typical_cash: { low: 4000, high: 6500 }, payout_median: 42, reports_count: 65 },
  fitness: { typical_cash: { low: 4000, high: 6500 }, payout_median: 48, reports_count: 24 },
  tech: { typical_cash: { low: 6000, high: 11000 }, payout_median: 38, reports_count: 19 },
  travel: { typical_cash: { low: 4500, high: 8000 }, payout_median: 50, reports_count: 14 },
  finance: { typical_cash: { low: 8000, high: 15000 }, payout_median: 40, reports_count: 12 },
  other: { typical_cash: { low: 4000, high: 7000 }, payout_median: 45, reports_count: 20 },
};
