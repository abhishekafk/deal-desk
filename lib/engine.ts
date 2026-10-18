import { 
  CreatorProfile, 
  Extraction, 
  EngineResult, 
  Verdict, 
  Confidence, 
  Tier, 
  EngineFlag,
  BrandRecord 
} from '../types';
import { 
  NICHE_CPM, 
  FORMAT_MULTIPLIERS, 
  getUsageAddOn, 
  getExclusivityAddOn, 
  PAID_ADS_ADDON, 
  roundInr 
} from '../config/pricing';
import { matchBrand } from './brandMatcher';

export function runEngine(
  extraction: Extraction,
  profile: CreatorProfile,
  brandData?: BrandRecord | null,
  isRateMode = false
): EngineResult {
  const flags: EngineFlag[] = [];
  const missingQuestions: string[] = [];
  const giveaways: { term: string; addOnPct: number }[] = [];

  // Check injection flag
  if (extraction.injection_attempt_detected) {
    flags.push('INJECTION');
  }

  // Check profile reach ratio
  if (profile.followers > 0) {
    const reachRatio = profile.medianReelViews / profile.followers;
    if (reachRatio < 0.03) {
      flags.push('LOW_REACH_RATIO');
    }
  }

  // Check profile freshness (stale if older than 30 days)
  if (profile.updatedAt) {
    const updatedTime = new Date(profile.updatedAt).getTime();
    const now = new Date().toISOString();
    const daysOld = (new Date(now).getTime() - updatedTime) / (1000 * 60 * 60 * 24);
    if (daysOld > 30) {
      flags.push('STALE_PROFILE');
    }
  }

  // Brand data tier matching
  const brandMatch = brandData 
    ? { 
        brand: brandData, 
        tier: (brandData.reports_count >= 5 && brandData.payout_days) ? (1 as Tier) : (2 as Tier),
        benchmark: brandData.category ? undefined : undefined 
      }
    : matchBrand(extraction.brand_name, profile.niche);

  const brandTier = brandMatch.tier;
  if (brandTier === 2 || brandTier === 3) {
    flags.push('LOW_BRAND_DATA');
  }

  // Brand payout and advance flags
  const reportedMedianPayout = brandMatch.brand?.payout_days?.median;
  const statedDays = extraction.payment_terms?.days_after_posting;
  const effectivePayoutDays = statedDays ?? reportedMedianPayout;

  if (effectivePayoutDays && effectivePayoutDays > 60) {
    flags.push('SLOW_PAYOUT');
  }

  const advancePct = extraction.payment_terms?.advance_pct ?? 0;
  if ((advancePct === null || advancePct === 0) && effectivePayoutDays && effectivePayoutDays > 45) {
    flags.push('NO_ADVANCE');
  }

  // Check heavy rights
  const isPerpetual = extraction.usage_rights.duration_months === 'perpetual';
  const is12mExclusivity = (extraction.exclusivity.duration_months ?? 0) >= 12;
  if (isPerpetual || is12mExclusivity) {
    flags.push('HEAVY_RIGHTS');
  }

  // Track giveaways
  const usageAddOn = getUsageAddOn(extraction.usage_rights.duration_months);
  if (usageAddOn > 0) {
    const durationLabel = extraction.usage_rights.duration_months === 'perpetual' 
      ? 'Perpetual usage rights' 
      : `${extraction.usage_rights.duration_months}-month usage rights`;
    giveaways.push({ term: durationLabel, addOnPct: Math.round(usageAddOn * 100) });
  }

  const exclusivityAddOn = getExclusivityAddOn(extraction.exclusivity.duration_months);
  if (exclusivityAddOn > 0) {
    const durationLabel = `${extraction.exclusivity.duration_months}-month category exclusivity`;
    giveaways.push({ term: durationLabel, addOnPct: Math.round(exclusivityAddOn * 100) });
  }

  const paidAdsAddOn = extraction.usage_rights.paid_ads ? PAID_ADS_ADDON : 0;
  if (paidAdsAddOn > 0) {
    giveaways.push({ term: 'Paid ad usage / whitelisting', addOnPct: Math.round(paidAdsAddOn * 100) });
  }

  // Base range calculation
  // base = (medianReelViews / 1000) * CPM_range[niche] * formatMultiplier * count
  const cpm = NICHE_CPM[profile.niche] || NICHE_CPM.lifestyle;
  const deliverables = extraction.deliverables || [];

  let unroundedBaseLow = 0;
  let unroundedBaseHigh = 0;

  for (const item of deliverables) {
    const multiplier = FORMAT_MULTIPLIERS[item.type] ?? 0.5;
    const viewsRatio = profile.medianReelViews / 1000;
    unroundedBaseLow += viewsRatio * cpm.low * multiplier * item.count;
    unroundedBaseHigh += viewsRatio * cpm.high * multiplier * item.count;
  }

  const roundBase = (val: number) => {
    if (val < 2000) return roundInr(val);
    if (val % 100 === 0) return val;
    return roundInr(val);
  };

  const baseRange = deliverables.length > 0 ? {
    low: roundBase(unroundedBaseLow),
    high: roundInr(unroundedBaseHigh),
  } : null;

  // Total rights multiplier (additive)
  const totalMultiplier = 1 + usageAddOn + exclusivityAddOn + paidAdsAddOn;

  const unroundedFairLow = unroundedBaseLow * totalMultiplier;
  const unroundedFairHigh = unroundedBaseHigh * totalMultiplier;

  const fairRange = deliverables.length > 0 ? {
    low: roundInr(unroundedFairLow),
    high: roundInr(unroundedFairHigh),
  } : null;

  // Reset range for PASS_OR_RESET: fair range with perpetual usage and 12m+ exclusivity removed
  let resetRange: { low: number; high: number } | null = null;
  if (fairRange && (isPerpetual || is12mExclusivity)) {
    const resetUsageAddOn = isPerpetual ? 0 : usageAddOn;
    const resetExclusivityAddOn = is12mExclusivity ? 0 : exclusivityAddOn;
    const resetMultiplier = 1 + resetUsageAddOn + resetExclusivityAddOn + paidAdsAddOn;
    resetRange = {
      low: roundInr(unroundedBaseLow * resetMultiplier),
      high: roundInr(unroundedBaseHigh * resetMultiplier),
    };
  }

  // Offer value calculation
  const cashOffer = extraction.cash_offer_inr;
  const productVal = extraction.product_offered?.stated_value_inr ?? 0;
  const hasCash = cashOffer !== null && cashOffer !== undefined;
  const hasProduct = extraction.product_offered !== null && extraction.product_offered?.stated_value_inr !== null;
  
  let offerValue: number | null = null;
  if (hasCash || hasProduct) {
    offerValue = (cashOffer ?? 0) + productVal;
  }

  // Cost per view calculations
  const cpvOffer = (offerValue !== null && profile.medianReelViews > 0)
    ? Number((offerValue / profile.medianReelViews).toFixed(2))
    : null;

  const cpvFair = (unroundedFairLow > 0 && profile.medianReelViews > 0)
    ? {
        low: Number((unroundedFairLow / profile.medianReelViews).toFixed(2)),
        high: Number((unroundedFairHigh / profile.medianReelViews).toFixed(2)),
      }
    : null;

  // Missing questions check
  if (!deliverables || deliverables.length === 0) {
    missingQuestions.push('What specific deliverables are expected (e.g. 1 reel, story set, carousel)?');
  }
  if (!hasCash && !hasProduct) {
    missingQuestions.push('What is the allocated budget or commercial fee for this campaign?');
  }
  if (extraction.usage_rights.duration_months === null) {
    missingQuestions.push('Are you requesting paid amplification, whitelisting, or digital usage rights, and for what duration?');
  }
  if (extraction.exclusivity.duration_months === null) {
    missingQuestions.push('Is category exclusivity required, and if so, for how many months?');
  }
  if (!extraction.payment_terms?.days_after_posting && !extraction.payment_terms?.advance_pct) {
    missingQuestions.push('What are your standard payment terms and billing milestone schedules?');
  }

  // Determine Verdict
  let verdict: Verdict;
  let counterTarget: number | null = null;
  let ratioToLow: number | null = null;

  if (isRateMode) {
    // In rate mode: creator is asking what to charge for deliverable
    verdict = 'COUNTER'; // Rate recommendation
    counterTarget = fairRange ? roundInr((unroundedFairLow + unroundedFairHigh) / 2) : null;
  } else if (!deliverables || deliverables.length === 0 || offerValue === null) {
    // Rule 1: Missing deliverables or both cash and product value unknown -> NEED_INFO
    verdict = 'NEED_INFO';
  } else if (unroundedFairLow > 0) {
    ratioToLow = offerValue / unroundedFairLow;

    // Rule 2: PASS_OR_RESET if ratioToLow < 0.5, or if usage is perpetual or exclusivity >= 12m while ratioToLow < 0.85
    if (ratioToLow < 0.5 || ((isPerpetual || is12mExclusivity) && ratioToLow < 0.85)) {
      verdict = 'PASS_OR_RESET';
    } 
    // Rule 3: COUNTER if 0.5 <= ratioToLow < 0.85
    else if (ratioToLow < 0.85) {
      verdict = 'COUNTER';
      counterTarget = roundInr((unroundedFairLow + unroundedFairHigh) / 2);
    } 
    // Rule 4: TAKE if ratioToLow >= 0.85
    else {
      verdict = 'TAKE';
    }
  } else {
    verdict = 'NEED_INFO';
  }

  // Confidence calculation
  // HIGH only if profile is verified and fresh (prototype caps sample at MEDIUM)
  let confidence: Confidence = 'MEDIUM';
  if (flags.includes('STALE_PROFILE') || flags.includes('LOW_BRAND_DATA') || extraction.missing_fields.length > 2) {
    confidence = 'LOW';
  } else if (profile.verified && !flags.includes('STALE_PROFILE') && profile.source === 'self_reported') {
    confidence = 'HIGH';
  } else {
    confidence = 'MEDIUM';
  }

  // Assemble allowedNumbers for strict guardrail G5 / allowlist checking
  const numSet = new Set<number>();
  const addNum = (n: number | null | undefined) => {
    if (n !== null && n !== undefined && !isNaN(n)) {
      numSet.add(n);
      numSet.add(Math.round(n));
      numSet.add(Number(n.toFixed(2)));
    }
  };

  addNum(profile.followers);
  addNum(profile.medianReelViews);
  addNum(profile.engagementRatePct);
  if (profile.followers > 0) {
    addNum(Number(((profile.medianReelViews / profile.followers) * 100).toFixed(1)));
  }

  addNum(offerValue);
  addNum(cashOffer);
  addNum(productVal);
  if (ratioToLow !== null) {
    addNum(Number((ratioToLow * 100).toFixed(0)));
    addNum(Number((ratioToLow * 100).toFixed(1)));
  }

  if (fairRange) {
    addNum(fairRange.low);
    addNum(fairRange.high);
  }
  if (baseRange) {
    addNum(baseRange.low);
    addNum(baseRange.high);
  }
  addNum(counterTarget);
  if (resetRange) {
    addNum(resetRange.low);
    addNum(resetRange.high);
  }

  addNum(cpvOffer);
  if (cpvFair) {
    addNum(cpvFair.low);
    addNum(cpvFair.high);
  }

  for (const d of deliverables) {
    addNum(d.count);
  }
  if (typeof extraction.usage_rights.duration_months === 'number') {
    addNum(extraction.usage_rights.duration_months);
  }
  if (extraction.exclusivity.duration_months) {
    addNum(extraction.exclusivity.duration_months);
  }
  if (extraction.payment_terms?.days_after_posting) {
    addNum(extraction.payment_terms.days_after_posting);
  }
  if (extraction.payment_terms?.advance_pct) {
    addNum(extraction.payment_terms.advance_pct);
  }
  for (const g of giveaways) {
    addNum(g.addOnPct);
  }

  // Brand data figures (if Tier 1)
  if (brandMatch.brand && brandTier === 1) {
    if (brandMatch.brand.payout_days) {
      addNum(brandMatch.brand.payout_days.p25);
      addNum(brandMatch.brand.payout_days.median);
      addNum(brandMatch.brand.payout_days.p75);
    }
    if (brandMatch.brand.typical_reel_cash_inr) {
      addNum(brandMatch.brand.typical_reel_cash_inr.low);
      addNum(brandMatch.brand.typical_reel_cash_inr.high);
    }
    addNum(brandMatch.brand.reports_count);
    addNum(brandMatch.brand.verified_count);
  }

  // Standard guidance numbers
  addNum(50); // 50% advance recommendation
  addNum(30); // 30 days
  addNum(60); // 60 days
  addNum(45); // 45 days
  addNum(5);  // minimum 5 reports threshold
  addNum(3);  // 3 frames or 3 months
  addNum(1);  // 1 reel

  const allowedNumbers = Array.from(numSet);

  return {
    verdict,
    confidence,
    brandTier,
    fairRange,
    baseRange,
    offerValue,
    ratioToLow: ratioToLow !== null ? Number(ratioToLow.toFixed(2)) : null,
    cpvOffer,
    cpvFair,
    giveaways,
    counterTarget,
    resetRange,
    flags,
    missingQuestions,
    allowedNumbers,
    benchmarkData: brandMatch.benchmark,
  };
}
