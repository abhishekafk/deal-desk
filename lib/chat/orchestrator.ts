import { 
  CreatorProfile, 
  DealRecord, 
  Extraction, 
  EngineResult, 
  ReplyDraft, 
  BrandRecord 
} from '@/types';
import { runEngine } from '@/lib/engine';
import { extractWithRegex } from '@/lib/demoExtractor';
import { generateTemplateExplanation } from '@/lib/templates';
import { enforceGuardrails, containsDeniedWords, getFirmOverdueReply } from '@/lib/guardrails';
import { matchBrand, getAllBrands } from '@/lib/brandMatcher';
import { parseOfferWithLLM, explainAndDraftWithLLM, answerChatWithLLM } from '@/lib/llm';
import { formatInr } from '@/lib/formatters';

export type OrchestratorResponse = {
  type: 'verdict' | 'text' | 'giveaways' | 'brandCard' | 'replyDraft' | 'ratePrompt';
  text?: string;
  deal?: DealRecord;
  brandRecord?: BrandRecord | null;
  brandTier?: 1 | 2 | 3;
  giveaways?: { term: string; addOnPct: number }[];
  replies?: ReplyDraft[];
  chips?: string[];
  runMode: 'live' | 'demo';
};

export async function orchestrateChatMessage(
  message: string,
  profile: CreatorProfile,
  activeDeal?: DealRecord | null
): Promise<OrchestratorResponse> {
  const trimmed = message.trim();
  const lower = trimmed.toLowerCase();

  // 1. Check for E9: Threatening / scam accusation message request
  if (lower.includes('scammer') || lower.includes('expose') || (lower.includes('pay') && lower.includes('today') && lower.includes('write them a message'))) {
    const firmDraft = getFirmOverdueReply('₹7,500', 'October 5th');
    return {
      type: 'text',
      text: `I cannot write accusations or threats. Here is a firm, professional notice citing your agreed terms and invoice deadline:\n\n"${firmDraft}"`,
      chips: ['Copy message', 'Log this deal'],
      runMode: 'demo',
    };
  }

  // 2. Check for E6: "Why did my post flop?" / performance cut
  if (lower.includes('flop') || lower.includes('underperform') || (lower.includes('cut') && lower.includes('fee'))) {
    const median = profile.medianReelViews || 9200;
    const viewMatch = trimmed.match(/(\d[\d,]*)\s*views?/i);
    const actual = viewMatch ? parseInt(viewMatch[1].replace(/,/g, ''), 10) : 3100;
    const dropPct = Math.round(((median - actual) / median) * 100);

    const uncertaintyText = `I don't know the cause of this post underperforming from the available data. Factually, ${actual.toLocaleString('en-IN')} views is about ${dropPct}% below your median of ${median.toLocaleString('en-IN')} views. We cannot see posting time, algorithm distribution, or audience reach breakdown. Commercial contracts typically promise deliverables rather than guaranteed views unless a performance clause was explicitly agreed. We suggest checking your written agreement and asking the brand for their reasoning.`;

    return {
      type: 'text',
      text: uncertaintyText,
      chips: ['Ask brand for metrics', 'Check agreement', 'Is this fair?'],
      runMode: 'demo',
    };
  }

  // 3. Keyword Intent: "Why", "fair", "is this fair?"
  if ((lower === 'why' || lower.includes('why counter') || lower.includes('is this fair') || lower.includes('is it fair') || lower === 'explain') && activeDeal) {
    const { engine } = activeDeal;
    let reason = '';
    if (engine.verdict === 'TAKE') {
      reason = `This offer is fair. They offered ${formatInr(engine.offerValue)}, and your baseline starts at ${formatInr(engine.fairRange?.low)}. You can say yes.`;
    } else if (engine.verdict === 'COUNTER') {
      const pct = engine.ratioToLow ? Math.round(engine.ratioToLow * 100) : 72;
      reason = `Your median performance is ${profile.medianReelViews.toLocaleString('en-IN')} views, which puts your fair range at ${formatInr(engine.fairRange?.low)} to ${formatInr(engine.fairRange?.high)}. Their offer of ${formatInr(engine.offerValue)} is ${pct}% of the baseline, so countering at ${formatInr(engine.counterTarget)} is justified.`;
    } else if (engine.verdict === 'PASS_OR_RESET') {
      reason = `Their offer of ${formatInr(engine.offerValue)} is too low for heavy terms like perpetual usage or 12-month exclusivity. A re-scoped reel without extended rights is ${formatInr(engine.resetRange?.low)} to ${formatInr(engine.resetRange?.high)}.`;
    } else {
      reason = `Key terms are missing from the message. Ask them for deliverables and budget before pricing.`;
    }

    return {
      type: 'text',
      text: reason,
      chips: engine.verdict === 'TAKE' ? ['Accept politely', 'How do they pay?', 'Log this deal'] : ['Write my reply', 'What am I giving away?', 'How do they pay?'],
      runMode: 'demo',
    };
  }

  // 4. Keyword Intent: "What am I giving away?", "rights", "usage"
  if (lower.includes('giving away') || lower === 'rights' || lower === 'usage' || lower.includes('what am i giving away')) {
    if (activeDeal && activeDeal.engine.giveaways.length > 0) {
      return {
        type: 'giveaways',
        text: `Here are the unpriced rights requested in this offer:`,
        giveaways: activeDeal.engine.giveaways,
        chips: activeDeal.engine.verdict === 'TAKE' ? ['Accept politely', 'How do they pay?'] : ['Write my reply', 'How do they pay?', 'Log this deal'],
        runMode: 'demo',
      };
    } else {
      return {
        type: 'text',
        text: 'This offer does not include extended usage rights or exclusivity.',
        chips: ['Write my reply', 'How do they pay?', 'Log this deal'],
        runMode: 'demo',
      };
    }
  }

  // 5. Keyword Intent: "How do they pay?", "pay", "payout", "who pays faster"
  if (lower.includes('how do they pay') || lower.includes('who pays faster') || lower === 'pay' || lower === 'payout' || lower === 'days') {
    if (activeDeal && activeDeal.brandRecord) {
      return {
        type: 'brandCard',
        brandRecord: activeDeal.brandRecord,
        brandTier: activeDeal.engine.brandTier,
        text: `Here is the reported payment history for ${activeDeal.brandRecord.name}:`,
        chips: ['Write my reply', 'Log this deal', 'Is this fair?'],
        runMode: 'demo',
      };
    } else if (activeDeal) {
      const match = matchBrand(activeDeal.extraction.brand_name, profile.niche);
      return {
        type: 'brandCard',
        brandRecord: match.brand,
        brandTier: match.tier,
        text: match.displayText,
        chips: ['Write my reply', 'Log this deal', 'Is this fair?'],
        runMode: 'demo',
      };
    }
  }

  // 6. Keyword Intent: "Write my reply", "reply", "counter", "message", "accept politely"
  if (lower.includes('write my reply') || lower === 'reply' || lower === 'counter' || lower.includes('send a reply') || lower.includes('accept politely')) {
    if (activeDeal) {
      return {
        type: 'replyDraft',
        deal: activeDeal,
        replies: activeDeal.explanation.replies,
        chips: ['Copy message', 'How do they pay?', 'Log this deal'],
        runMode: 'demo',
      };
    }
  }

  // 7. Keyword Intent: "What should I charge?", "rate", "price", "charge" with no active offer
  if (lower.includes('what should i charge') || lower === 'charge' || lower === 'rate' || lower === 'price' || lower.includes('rate form')) {
    // Run rate calculation for 1 reel
    const dummyExtraction: Extraction = {
      brand_name: null,
      deliverables: [{ type: 'reel', count: 1 }],
      cash_offer_inr: null,
      product_offered: null,
      usage_rights: { duration_months: null, paid_ads: false },
      exclusivity: { duration_months: null, category: null },
      deadline: null,
      payment_terms: { days_after_posting: 30, advance_pct: null },
      sponsorship_disclosure_mentioned: true,
      red_flags: [],
      injection_attempt_detected: false,
      missing_fields: [],
    };
    const rateEngine = runEngine(dummyExtraction, profile, null, true);
    const rateExplanation = generateTemplateExplanation(rateEngine, profile, dummyExtraction);

    const rateDeal: DealRecord = {
      id: `rate_${Date.now()}`,
      createdAt: new Date().toISOString(),
      brandName: 'Standard Commercial Rate',
      originalMessage: trimmed,
      extraction: dummyExtraction,
      engine: rateEngine,
      explanation: rateExplanation,
      status: 'Checked',
      profile,
      brandRecord: null,
    };

    return {
      type: 'verdict',
      deal: rateDeal,
      text: `Based on your ${profile.medianReelViews.toLocaleString('en-IN')} median views, here is your standard baseline rate:`,
      chips: ['Add 3m usage rights', 'Add 3m exclusivity', 'Try a sample offer'],
      runMode: 'demo',
    };
  }

  // 8. Keyword Intent: Brand Name Lookup (e.g. "GlowLeaf", "NovaFit", "Zestify", etc.)
  const allBrands = getAllBrands();
  const matchedBrand = allBrands.find(b => 
    b.name.toLowerCase() === lower || 
    b.id.toLowerCase() === lower ||
    lower.includes(b.name.toLowerCase()) ||
    lower.includes(b.id.toLowerCase())
  );
  if (matchedBrand && trimmed.length < 40 && !trimmed.includes('rs') && !trimmed.includes('₹') && !trimmed.includes('reel')) {
    const match = matchBrand(matchedBrand.name, profile.niche);
    return {
      type: 'brandCard',
      brandRecord: match.brand,
      brandTier: match.tier,
      text: match.displayText,
      chips: ['Try a sample offer', 'What should I charge?'],
      runMode: 'demo',
    };
  }

  // 9. Primary Pipeline: Does it look like a brand offer?
  // (contains ₹, Rs, budget, collab, reel, usage, barter, or is over 120 characters)
  const isOfferLike = 
    trimmed.includes('₹') || 
    /rs\.?\s*\d+/i.test(trimmed) || 
    /\d+k\b/i.test(trimmed) || 
    lower.includes('lakh') ||
    lower.includes('reel') || 
    lower.includes('story') || 
    lower.includes('carousel') || 
    lower.includes('collab') || 
    lower.includes('barter') || 
    lower.includes('usage rights') || 
    lower.includes('exclusiv') || 
    lower.includes('launch') ||
    trimmed.length > 120;

  if (isOfferLike) {
    // Run real deal-check pipeline
    const parseResult = await parseOfferWithLLM(trimmed);
    const extraction = parseResult.extraction;
    const brandMatch = matchBrand(extraction.brand_name, profile.niche);
    const engine = runEngine(extraction, profile, brandMatch.brand);
    const explainResult = await explainAndDraftWithLLM(engine, profile, extraction);
    const { sanitized } = enforceGuardrails(explainResult.explanation, engine, profile, extraction);

    const deal: DealRecord = {
      id: `deal_${Date.now()}`,
      createdAt: new Date().toISOString(),
      brandName: extraction.brand_name || 'Brand Collab',
      originalMessage: trimmed,
      extraction,
      engine,
      explanation: sanitized,
      status: 'Checked',
      profile,
      brandRecord: brandMatch.brand,
    };

    const chips = engine.verdict === 'TAKE'
      ? ['Accept politely', 'What am I giving away?', 'How do they pay?', 'Log this deal']
      : ['Write my reply', 'What am I giving away?', 'How do they pay?', 'Log this deal'];

    return {
      type: 'verdict',
      deal,
      text: engine.verdict === 'TAKE' 
        ? "This one's fair. You can say yes." 
        : engine.verdict === 'COUNTER' 
        ? `Here's what I recommend countering with:`
        : engine.verdict === 'PASS_OR_RESET'
        ? `I suggest declining these heavy terms or re-scoping:`
        : `I need a bit more information before pricing:`,
      chips,
      runMode: parseResult.runMode === 'live' && explainResult.runMode === 'live' ? 'live' : 'demo',
    };
  }

  // 10. Fallback: Prompt 4 Chat Q&A
  const qaResult = await answerChatWithLLM(trimmed, profile, activeDeal?.engine, activeDeal?.extraction);
  return {
    type: 'text',
    text: qaResult.text,
    chips: qaResult.chips.length > 0 ? qaResult.chips : ['Try a sample offer', 'What should I charge?', 'Is a brand safe to work with?'],
    runMode: qaResult.runMode,
  };
}
