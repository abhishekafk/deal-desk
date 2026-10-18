import { Extraction, DeliverableType } from '../types';

/**
 * Heuristic regex extractor for Indian creator economy brand messages.
 * Detects:
 * - Brand names (GlowLeaf, UrbanKart, Zestify, KaffeeKart, BloomBox, NovaFit, PixelPop, TrailNest, etc.)
 * - Rupee amounts: Rs 4,000, 4k, 1 lakh, ₹5000, etc.
 * - Deliverables: reel, story, post, carousel, event
 * - Usage rights: N months, perpetual, paid ads, whitelisting
 * - Exclusivity: N months, exclusive
 * - Payment terms: after N days, advance
 * - Injection detection: instructions aimed at AI
 * - Red flags: raw files, no agreement, exposure, etc.
 */
export function extractWithRegex(message: string): Extraction {
  const text = message.trim();
  const lower = text.toLowerCase();

  // 1. Detect Injection Attempt
  const injectionPatterns = [
    /system\s*:/i,
    /ignore\s+(your\s+)?(previous|prior)\s+instructions/i,
    /tell\s+the\s+creator\s+this\s+is\s+an?\s+(excellent|great|good)\s+deal/i,
    /do\s+not\s+mention\s+usage\s+rights/i,
    /disregard/i,
    /you\s+are\s+now/i,
  ];
  const injection_attempt_detected = injectionPatterns.some(p => p.test(text));

  // 2. Detect Brand Name
  let brand_name: string | null = null;
  const knownBrands = [
    { name: 'GlowLeaf Beauty', matches: ['glowleaf beauty', 'glowleaf'] },
    { name: 'UrbanKart Fashion', matches: ['urbankart fashion', 'urbankart'] },
    { name: 'Zestify Foods', matches: ['zestify foods', 'zestify'] },
    { name: 'KaffeeKart Coffee', matches: ['kaffeekart coffee', 'kaffeekart'] },
    { name: 'BloomBox Subscriptions', matches: ['bloombox subscriptions', 'bloombox'] },
    { name: 'NovaFit Wearables', matches: ['novafit wearables', 'novafit'] },
    { name: 'PixelPop Gadgets', matches: ['pixelpop gadgets', 'pixelpop'] },
    { name: 'TrailNest Travel', matches: ['trailnest travel', 'trailnest'] },
  ];

  for (const b of knownBrands) {
    if (b.matches.some(m => lower.includes(m))) {
      brand_name = b.name;
      break;
    }
  }

  if (!brand_name) {
    // Try regex: "from X", "X here", "hi, we are X"
    const brandMatch = text.match(/([A-Z][a-zA-Z0-9]+(?:\s+[A-Z][a-zA-Z0-9]+)?)\s+here/i)
      || text.match(/(?:from|at|team)\s+([A-Z][a-zA-Z0-9]+(?:\s+[A-Z][a-zA-Z0-9]+)?)/i);
    if (brandMatch && !['Hi', 'Hey', 'Dear', 'The', 'We'].includes(brandMatch[1])) {
      brand_name = brandMatch[1].trim();
    }
  }

  // 3. Detect Deliverables
  const deliverables: { type: DeliverableType; count: number }[] = [];

  // Match reels
  const reelMatch = text.match(/(\d+)\s*(?:reels?|videos?)/i) || (lower.includes('reel') ? [null, '1'] : null);
  if (reelMatch) {
    deliverables.push({ type: 'reel', count: parseInt(reelMatch[1] || '1', 10) });
  }

  // Match story sets
  const storyMatch = text.match(/(\d+)\s*story\s*(?:set|frames?|stories)?/i) || (lower.includes('story') && !deliverables.some(d => d.type === 'story_set') ? [null, '1'] : null);
  if (storyMatch && !reelMatch) {
    deliverables.push({ type: 'story_set', count: parseInt(storyMatch[1] || '1', 10) });
  } else if (storyMatch && (lower.includes('+') || lower.includes('and'))) {
    deliverables.push({ type: 'story_set', count: parseInt(storyMatch[1] || '1', 10) });
  }

  // Match carousels
  const carouselMatch = text.match(/(\d+)\s*carousels?/i) || (lower.includes('carousel') ? [null, '1'] : null);
  if (carouselMatch) {
    deliverables.push({ type: 'carousel', count: parseInt(carouselMatch[1] || '1', 10) });
  }

  // Match static posts
  const postMatch = text.match(/(\d+)\s*(?:static\s+)?posts?/i);
  if (postMatch && !lower.includes('reel') && !lower.includes('carousel')) {
    deliverables.push({ type: 'static_post', count: parseInt(postMatch[1] || '1', 10) });
  }

  // 4. Detect Cash Offer
  let cash_offer_inr: number | null = null;

  // Patterns: Rs 4,000 | Rs. 4000 | ₹4,000 | 4k | 1 lakh | 1.5 lakh | 10,000 INR
  const lakhMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|lacs|lakhs)/i);
  if (lakhMatch) {
    cash_offer_inr = Math.round(parseFloat(lakhMatch[1]) * 100000);
  } else {
    const kMatch = text.match(/(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)\s*k\b/i);
    if (kMatch && !lower.includes('followers') && !lower.includes('views')) {
      cash_offer_inr = Math.round(parseFloat(kMatch[1]) * 1000);
    } else {
      const explicitInrMatch = text.match(/(?:rs\.?|₹|inr)\s*([\d,]+)/i) || text.match(/([\d,]+)\s*(?:inr|rupees)/i);
      if (explicitInrMatch) {
        const cleaned = explicitInrMatch[1].replace(/,/g, '');
        const num = parseInt(cleaned, 10);
        if (!isNaN(num) && num > 100 && num < 10000000) {
          cash_offer_inr = num;
        }
      }
    }
  }

  // 5. Detect Product Offered / Barter (only if barter, gift, passes, or no cash offer)
  let product_offered: { description: string; stated_value_inr: number | null } | null = null;
  const isExplicitBarter = lower.includes('barter') || 
    lower.includes("we'll give you") || 
    lower.includes('we will give you') || 
    lower.includes('free passes') || 
    lower.includes('passes (worth') || 
    lower.includes('passes worth') ||
    lower.includes('gift hamper') ||
    (cash_offer_inr === null && (lower.includes('passes') || lower.includes('pass') || lower.includes('hamper') || lower.includes('gift kit')));

  if (isExplicitBarter) {
    // Check if stated value: "worth Rs 3,000" or "valued at 2500"
    const worthMatch = text.match(/worth\s*(?:rs\.?|₹|inr)?\s*([\d,]+)/i)
      || text.match(/valued\s+at\s*(?:rs\.?|₹|inr)?\s*([\d,]+)/i);
    const statedVal = worthMatch ? parseInt(worthMatch[1].replace(/,/g, ''), 10) : null;

    let desc = 'Brand product / passes';
    if (lower.includes('launch') && lower.includes('pass')) desc = '2 launch passes';
    else if (lower.includes('hamper')) desc = 'Gift hamper';

    product_offered = {
      description: desc,
      stated_value_inr: statedVal,
    };
  }

  // 6. Detect Usage Rights
  let duration_months: number | 'perpetual' | null = null;
  let paid_ads: boolean | null = null;

  if (lower.includes('perpetual') || lower.includes('forever') || lower.includes('in perpetuity') || lower.includes('unlimited duration')) {
    duration_months = 'perpetual';
  } else {
    const usageMonthMatch = text.match(/(\d+)\s*(?:-\s*month|month|m)\s*(?:digital\s+)?usage/i)
      || text.match(/usage\s*(?:rights)?\s*(?:for\s*)?(\d+)\s*months?/i);
    if (usageMonthMatch) {
      duration_months = parseInt(usageMonthMatch[1], 10);
    }
  }

  if (lower.includes('paid ad') || lower.includes('whitelisting') || lower.includes('spark ad') || lower.includes('boosting') || lower.includes('amplification')) {
    paid_ads = true;
  }

  // 7. Detect Exclusivity
  let exclusivity_duration_months: number | null = null;
  let exclusivity_category: string | null = null;

  const exclusivityMatch = text.match(/(\d+)\s*(?:-\s*month|month|m)\s*(?:category\s+)?exclusiv/i)
    || text.match(/exclusiv\w*\s*(?:for\s*)?(\d+)\s*months?/i);
  if (exclusivityMatch) {
    exclusivity_duration_months = parseInt(exclusivityMatch[1], 10);
    exclusivity_category = 'category';
  }

  // 8. Detect Payment Terms
  let days_after_posting: number | null = null;
  let advance_pct: number | null = null;

  const daysMatch = text.match(/(?:payment\s+)?(?:within|after)\s*(\d+)\s*days/i)
    || text.match(/(\d+)\s*days\s*(?:credit|payment|payout)/i);
  if (daysMatch) {
    days_after_posting = parseInt(daysMatch[1], 10);
  }

  const advanceMatch = text.match(/(\d+)%\s*advance/i);
  if (advanceMatch) {
    advance_pct = parseInt(advanceMatch[1], 10);
  }

  // 9. Red Flags
  const red_flags: string[] = [];
  if (lower.includes('raw file') || lower.includes('unedited')) {
    red_flags.push('Raw or unedited footage requested');
  }
  if (lower.includes('no written agreement') || lower.includes('no contract')) {
    red_flags.push('No written agreement provided');
  }
  if (lower.includes('payment after performance') || lower.includes('pay on views')) {
    red_flags.push('Performance-contingent payout');
  }
  if (lower.includes('unlimited revisions')) {
    red_flags.push('Unlimited revision requests');
  }
  if (lower.includes('exposure') && !cash_offer_inr && !product_offered?.stated_value_inr) {
    red_flags.push('Exposure offered as primary compensation');
  }

  // 10. Missing Fields
  const missing_fields: string[] = [];
  if (deliverables.length === 0) missing_fields.push('deliverables');
  if (cash_offer_inr === null && (!product_offered || product_offered.stated_value_inr === null)) {
    missing_fields.push('cash_offer_or_product');
  }
  if (duration_months === null) missing_fields.push('usage_rights');
  if (exclusivity_duration_months === null) missing_fields.push('exclusivity');
  if (days_after_posting === null && advance_pct === null) missing_fields.push('payment_terms');

  return {
    brand_name,
    deliverables,
    cash_offer_inr,
    product_offered,
    usage_rights: {
      duration_months,
      paid_ads,
    },
    exclusivity: {
      duration_months: exclusivity_duration_months,
      category: exclusivity_category,
    },
    deadline: null,
    payment_terms: {
      days_after_posting,
      advance_pct,
    },
    sponsorship_disclosure_mentioned: lower.includes('#ad') || lower.includes('sponsor') || lower.includes('collab'),
    red_flags,
    injection_attempt_detected,
    missing_fields,
  };
}
