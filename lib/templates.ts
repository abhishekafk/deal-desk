import { 
  EngineResult, 
  CreatorProfile, 
  Extraction, 
  ExplanationResponse, 
  ReplyDraft 
} from '../types';
import { formatInr } from './formatters';

export function generateTemplateExplanation(
  engine: EngineResult,
  profile: CreatorProfile,
  extraction: Extraction
): ExplanationResponse {
  const { verdict, fairRange, baseRange, counterTarget, resetRange, flags, giveaways } = engine;
  const brandName = extraction.brand_name || 'the brand';
  const offerAmount = engine.offerValue !== null ? formatInr(engine.offerValue) : 'Not stated';

  const why: string[] = [];
  const cautions: string[] = [];
  const replies: ReplyDraft[] = [];

  // 1. Working bullets (Why section)
  why.push(`Your median reel performance is ${profile.medianReelViews.toLocaleString('en-IN')} views.`);

  if (fairRange) {
    why.push(`Based on your niche and format benchmarks, the fair commercial range is ${formatInr(fairRange.low)} to ${formatInr(fairRange.high)}.`);
  }

  if (engine.offerValue !== null && fairRange) {
    const pctOfLow = engine.ratioToLow ? Math.round(engine.ratioToLow * 100) : 0;
    why.push(`Their current offer is ${offerAmount}, which is ${pctOfLow}% of the fair baseline.`);
    if (engine.cpvOffer !== null && engine.cpvFair) {
      why.push(`This offer equals Rs ${engine.cpvOffer.toFixed(2)} cost per view, compared to your fair range of Rs ${engine.cpvFair.low.toFixed(2)} to Rs ${engine.cpvFair.high.toFixed(2)}.`);
    }
  }

  // 2. Giveaways
  const giveawayStrings: string[] = [];
  for (const g of giveaways) {
    giveawayStrings.push(`${g.term} (adds approximately +${g.addOnPct}% to commercial value)`);
  }

  // 3. Payment note
  let payment_note: string | null = null;
  if (flags.includes('SLOW_PAYOUT')) {
    payment_note = `Reported payment timeline exceeds 60 days. We recommend securing a 50% advance before production and confirming the exact payment date in writing.`;
  } else if (flags.includes('NO_ADVANCE')) {
    payment_note = `No advance payment is offered and payout exceeds 45 days. Requesting a 50% booking advance is standard practice.`;
  }

  // 4. Flags & Cautions
  if (flags.includes('INJECTION')) {
    cautions.push('This message contained instructions aimed at an AI. We ignored them and evaluated the terms safely.');
  }
  if (flags.includes('LOW_REACH_RATIO')) {
    const reachPct = profile.followers > 0 ? ((profile.medianReelViews / profile.followers) * 100).toFixed(1) : '1.4';
    cautions.push(`Brands price on views, and your reel reaches about ${reachPct}% of your followers. Our evaluation uses your verified median view count.`);
  }
  if (flags.includes('STALE_PROFILE')) {
    cautions.push('Your creator profile is over 30 days old. Refresh your recent reel metrics for a more precise valuation.');
  }
  if (engine.brandTier === 2) {
    if (engine.benchmarkData) {
      cautions.push(`We only have limited verified reports on this brand, below our minimum of 5. Showing category benchmark data instead.`);
    }
  } else if (engine.brandTier === 3) {
    cautions.push("We don't have verified payout data on this brand yet. Rely strictly on your agreed contract terms.");
  }
  if (flags.includes('HEAVY_RIGHTS')) {
    cautions.push('This offer includes heavy rights (perpetual usage or long exclusivity). Note: This is commercial guidance, not legal advice. We suggest having an attorney or contract specialist review the terms before signing.');
  }

  // 5. Headline
  let headline = '';
  if (verdict === 'TAKE') {
    headline = engine.ratioToLow && engine.ratioToLow > 1.0 
      ? `Fair offer above baseline for ${brandName}`
      : `Solid, fair offer from ${brandName}`;
  } else if (verdict === 'COUNTER') {
    headline = `Counter recommended: target ${counterTarget ? formatInr(counterTarget) : 'fair midpoint'}`;
  } else if (verdict === 'PASS_OR_RESET') {
    headline = `Pass on these terms or reset scope with ${brandName}`;
  } else {
    headline = `Need more information from ${brandName} before pricing`;
  }

  // 6. Reply drafts (Friendly & Firm)
  if (verdict === 'TAKE') {
    const advanceSentence = flags.includes('SLOW_PAYOUT') || flags.includes('NO_ADVANCE')
      ? ' Given our production schedule, we request a 50% advance to confirm the date and the remaining balance on delivery.'
      : ' Please share the agreement confirming the deliverables and written payment schedule.';

    replies.push({
      label: 'friendly',
      text: `Hi ${brandName} team, thank you for reaching out! The offer of ${offerAmount} works for 1 reel.${advanceSentence} Looking forward to creating great content together!`,
    });

    replies.push({
      label: 'firm',
      text: `Hello, thanks for the brief. I confirm acceptance of ${offerAmount} for the agreed reel.${advanceSentence} Please send the formal contract with the payment date specified in writing.`,
    });
  } else if (verdict === 'COUNTER') {
    const targetStr = counterTarget ? formatInr(counterTarget) : 'the fair commercial fee';
    const termsMention = giveaways.length > 0 
      ? ` Given the inclusion of ${giveaways.map(g => g.term).join(' and ')}, ` 
      : ' ';

    replies.push({
      label: 'friendly',
      text: `Hi ${brandName} team, thank you for the offer! My median reel reaches ${profile.medianReelViews.toLocaleString('en-IN')} views with active engagement.${termsMention}my standard commercial rate for this scope is ${targetStr}. Let me know if this aligns with your budget so we can get started!`,
    });

    replies.push({
      label: 'firm',
      text: `Hello, thank you for reaching out. Based on my verified reach of ${profile.medianReelViews.toLocaleString('en-IN')} median views and the requested rights, my commercial rate is ${targetStr}. If this works for your team, please send over the agreement.`,
    });
  } else if (verdict === 'PASS_OR_RESET') {
    const resetStr = resetRange ? `${formatInr(resetRange.low)} to ${formatInr(resetRange.high)}` : 'standard rates';

    replies.push({
      label: 'friendly',
      text: `Hi ${brandName} team, thank you for considering me! Unfortunately, I cannot provide perpetual usage or extensive exclusivity at ${offerAmount}. I would love to collaborate on a standard reel without extended rights for ${resetStr}. Let me know if that works for you!`,
    });

    replies.push({
      label: 'firm',
      text: `Hello, thank you for the brief. I cannot license perpetual rights or long-term category exclusivity for ${offerAmount}. For this budget, I can deliver 1 reel with standard organic posting, or we can adjust to ${resetStr} for limited 3-month digital usage. Note that this is commercial terms negotiation and not legal advice.`,
    });
  } else {
    // NEED_INFO
    const questionsText = engine.missingQuestions.slice(0, 4).map((q, idx) => `${idx + 1}. ${q}`).join('\n');

    replies.push({
      label: 'friendly',
      text: `Hi ${brandName} team, thank you for reaching out! I would love to explore a collaboration. To provide an accurate commercial quote, could you share a few details:\n${questionsText}\nLooking forward to hearing from you!`,
    });

    replies.push({
      label: 'firm',
      text: `Hello, thank you for reaching out. Before sharing my commercial rate card and availability, please confirm:\n${questionsText}\nOnce received, I will share the exact scope and quotation.`,
    });
  }

  return {
    headline,
    why,
    giveaways: giveawayStrings,
    payment_note,
    questions_to_ask: engine.missingQuestions,
    replies,
    cautions,
  };
}
