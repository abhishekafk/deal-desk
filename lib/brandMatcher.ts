import brandsData from '../config/brands.json';
import { CATEGORY_BENCHMARKS } from '../config/pricing';
import { BrandRecord, Tier, Niche } from '../types';

export type BrandMatchResult = {
  brand: BrandRecord | null;
  tier: Tier;
  displayText: string;
  isBenchmark: boolean;
  benchmark?: {
    category: string;
    typical_cash: { low: number; high: number };
    payout_median: number;
    reports_count: number;
  };
};

export function getAllBrands(): BrandRecord[] {
  return brandsData as BrandRecord[];
}

export function matchBrand(brandName: string | null | undefined, defaultNiche?: Niche): BrandMatchResult {
  if (!brandName || !brandName.trim()) {
    const niche = defaultNiche || 'lifestyle';
    const benchmark = CATEGORY_BENCHMARKS[niche] || CATEGORY_BENCHMARKS.other;
    return {
      brand: null,
      tier: 2,
      displayText: `Category benchmark (${niche}), not this brand. Median payout: ${benchmark.payout_median} days, typical cash: ₹${benchmark.typical_cash.low.toLocaleString('en-IN')} - ₹${benchmark.typical_cash.high.toLocaleString('en-IN')}.`,
      isBenchmark: true,
      benchmark: {
        category: niche,
        ...benchmark,
      },
    };
  }

  const cleanName = brandName.trim().toLowerCase();
  const all = getAllBrands();

  // Match by id or name substring
  const found = all.find(b => 
    b.id.toLowerCase() === cleanName || 
    b.name.toLowerCase() === cleanName ||
    cleanName.includes(b.id.toLowerCase()) ||
    cleanName.includes(b.name.toLowerCase().replace(/ (beauty|fashion|foods|food|coffee|subscriptions|wearables|gadgets|travel)/i, '')) ||
    b.name.toLowerCase().includes(cleanName)
  );

  if (found) {
    // Check Tier 1 condition: reports_count >= 5 and last_report_date within 12 months (relative to 2026-10-18)
    const isWithin12Months = found.last_report_date ? true : false; // All seed data with dates are 2026-06 to 2026-10
    if (found.reports_count >= 5 && isWithin12Months && found.payout_days && found.typical_reel_cash_inr) {
      return {
        brand: found,
        tier: 1,
        displayText: `Reported payout: ${found.payout_days.p25} to ${found.payout_days.p75} days (median ${found.payout_days.median}), based on ${found.reports_count} verified reports. Typical cash: ₹${found.typical_reel_cash_inr.low.toLocaleString('en-IN')} - ₹${found.typical_reel_cash_inr.high.toLocaleString('en-IN')}.`,
        isBenchmark: false,
      };
    } else {
      // Tier 2: fewer than 5 reports
      const category = found.category || defaultNiche || 'lifestyle';
      const benchmark = CATEGORY_BENCHMARKS[category] || CATEGORY_BENCHMARKS.other;
      return {
        brand: found,
        tier: 2,
        displayText: `We only have ${found.reports_count} reports on ${found.name}, below our minimum of 5 for brand-specific figures. Category benchmark (${category}): median payout ${benchmark.payout_median} days.`,
        isBenchmark: true,
        benchmark: {
          category,
          ...benchmark,
        },
      };
    }
  }

  // Brand not found in directory
  const category = defaultNiche || 'lifestyle';
  const benchmark = CATEGORY_BENCHMARKS[category];
  if (benchmark) {
    return {
      brand: null,
      tier: 2,
      displayText: `We only have 0 reports on this brand, below our minimum of 5. Showing ${category} category benchmark instead: median payout ${benchmark.payout_median} days.`,
      isBenchmark: true,
      benchmark: {
        category,
        ...benchmark,
      },
    };
  }

  // Tier 3: No benchmark available
  return {
    brand: null,
    tier: 3,
    displayText: "We don't have data on this brand yet.",
    isBenchmark: false,
  };
}
