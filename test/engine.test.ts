import test from 'node:test';
import assert from 'node:assert/strict';
import { runEngine } from '../lib/engine';
import { Extraction, CreatorProfile } from '../types';

const riyaProfile: CreatorProfile = {
  id: 'riya',
  name: 'Riya',
  niche: 'lifestyle',
  followers: 30600,
  medianReelViews: 9200,
  engagementRatePct: 3.1,
  updatedAt: new Date().toISOString(),
  source: 'sample',
  verified: true,
};

const amanProfile: CreatorProfile = {
  id: 'aman',
  name: 'Aman',
  niche: 'lifestyle',
  followers: 3800,
  medianReelViews: 1400,
  engagementRatePct: 4.2,
  updatedAt: new Date().toISOString(),
  source: 'sample',
  verified: true,
};

test('Section 5.5 worked example: Riya 1 reel, 3-month usage, Rs 4,000 offer', () => {
  const extraction: Extraction = {
    brand_name: 'GlowLeaf Beauty',
    deliverables: [{ type: 'reel', count: 1 }],
    cash_offer_inr: 4000,
    product_offered: null,
    usage_rights: { duration_months: 3, paid_ads: false },
    exclusivity: { duration_months: null, category: null },
    deadline: null,
    payment_terms: { days_after_posting: 30, advance_pct: null },
    sponsorship_disclosure_mentioned: true,
    red_flags: [],
    injection_attempt_detected: false,
    missing_fields: [],
  };

  const result = runEngine(extraction, riyaProfile);

  assert.equal(result.verdict, 'COUNTER');
  assert.equal(result.baseRange?.low, 4600);
  assert.equal(result.baseRange?.high, 8250);
  assert.equal(result.fairRange?.low, 5500);
  assert.equal(result.fairRange?.high, 10000);
  assert.equal(result.counterTarget, 7750);
  assert.equal(result.ratioToLow, 0.72);
  assert.equal(result.cpvOffer, 0.43);
  assert.equal(result.cpvFair?.low, 0.60);
  assert.equal(result.cpvFair?.high, 1.08);
});

test('E1: Fair offer from a slow payer (Zestify Foods, Rs 6,000, 1 reel, 3m usage)', () => {
  const extraction: Extraction = {
    brand_name: 'Zestify Foods',
    deliverables: [{ type: 'reel', count: 1 }],
    cash_offer_inr: 6000,
    product_offered: null,
    usage_rights: { duration_months: 3, paid_ads: false },
    exclusivity: { duration_months: null, category: null },
    deadline: null,
    payment_terms: { days_after_posting: 75, advance_pct: 0 },
    sponsorship_disclosure_mentioned: true,
    red_flags: [],
    injection_attempt_detected: false,
    missing_fields: [],
  };

  const result = runEngine(extraction, riyaProfile);

  assert.equal(result.verdict, 'TAKE');
  assert.ok(result.flags.includes('SLOW_PAYOUT'));
  assert.ok(result.ratioToLow && result.ratioToLow >= 0.85);
});

test('E2: Fair barter for early creator (Aman, passes worth Rs 3,000, 1 reel)', () => {
  const extraction: Extraction = {
    brand_name: 'City Event Co',
    deliverables: [{ type: 'reel', count: 1 }],
    cash_offer_inr: 0,
    product_offered: { description: '2 launch passes', stated_value_inr: 3000 },
    usage_rights: { duration_months: null, paid_ads: false },
    exclusivity: { duration_months: null, category: null },
    deadline: null,
    payment_terms: { days_after_posting: null, advance_pct: null },
    sponsorship_disclosure_mentioned: true,
    red_flags: [],
    injection_attempt_detected: false,
    missing_fields: [],
  };

  const result = runEngine(extraction, amanProfile);

  assert.equal(result.verdict, 'TAKE');
  assert.ok(result.fairRange!.high <= 1400);
});

test('E3: Vague collab request produces NEED_INFO and 4+ missing questions', () => {
  const extraction: Extraction = {
    brand_name: null,
    deliverables: [],
    cash_offer_inr: null,
    product_offered: null,
    usage_rights: { duration_months: null, paid_ads: null },
    exclusivity: { duration_months: null, category: null },
    deadline: null,
    payment_terms: { days_after_posting: null, advance_pct: null },
    sponsorship_disclosure_mentioned: null,
    red_flags: [],
    injection_attempt_detected: false,
    missing_fields: ['deliverables', 'cash_offer_or_product', 'usage_rights', 'exclusivity', 'payment_terms'],
  };

  const result = runEngine(extraction, riyaProfile);

  assert.equal(result.verdict, 'NEED_INFO');
  assert.ok(result.missingQuestions.length >= 4);
});

test('E4: 80K followers, 1,100 median views (rate mode, prices from views)', () => {
  const lowReachProfile: CreatorProfile = {
    id: 'custom_e4',
    name: 'Custom Creator',
    niche: 'lifestyle',
    followers: 80000,
    medianReelViews: 1100,
    engagementRatePct: 0.2,
    updatedAt: new Date().toISOString(),
    source: 'self_reported',
    verified: false,
  };

  const extraction: Extraction = {
    brand_name: null,
    deliverables: [{ type: 'reel', count: 1 }],
    cash_offer_inr: null,
    product_offered: null,
    usage_rights: { duration_months: null, paid_ads: false },
    exclusivity: { duration_months: null, category: null },
    deadline: null,
    payment_terms: { days_after_posting: null, advance_pct: null },
    sponsorship_disclosure_mentioned: null,
    red_flags: [],
    injection_attempt_detected: false,
    missing_fields: [],
  };

  const result = runEngine(extraction, lowReachProfile, null, true);

  assert.ok(result.fairRange!.high <= 1000);
  assert.ok(result.flags.includes('LOW_REACH_RATIO'));
  assert.notEqual(result.confidence, 'HIGH');
});

test('E8: Perpetual rights and 12-month exclusivity for Rs 3,000 -> PASS_OR_RESET', () => {
  const extraction: Extraction = {
    brand_name: 'Big Brand',
    deliverables: [{ type: 'reel', count: 1 }],
    cash_offer_inr: 3000,
    product_offered: null,
    usage_rights: { duration_months: 'perpetual', paid_ads: false },
    exclusivity: { duration_months: 12, category: 'all' },
    deadline: null,
    payment_terms: { days_after_posting: 30, advance_pct: null },
    sponsorship_disclosure_mentioned: true,
    red_flags: [],
    injection_attempt_detected: false,
    missing_fields: [],
  };

  const result = runEngine(extraction, riyaProfile);

  assert.equal(result.verdict, 'PASS_OR_RESET');
  assert.ok(result.flags.includes('HEAVY_RIGHTS'));
  assert.ok(result.giveaways.some(g => g.addOnPct === 200));
  assert.ok(result.giveaways.some(g => g.addOnPct === 120));
  assert.ok(result.resetRange !== null);
  assert.ok(result.fairRange!.low >= 18000);
});
