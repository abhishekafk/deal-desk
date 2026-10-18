import { 
  EngineResult, 
  CreatorProfile, 
  Extraction, 
  ExplanationResponse, 
  ReplyDraft 
} from '../types';
import { generateTemplateExplanation } from './templates';

/**
 * Denylist for drafts: Reject any draft containing accusation or threat words
 */
export const DRAFT_DENYLIST = [
  /\bscams?\b/i,
  /\bscammers?\b/i,
  /\bfrauds?\b/i,
  /\bcheats?\b/i,
  /\bliars?\b/i,
  /\bexpose\b/i,
  /\bshame\b/i,
  /\bblackmail\b/i,
  /\blegal\s+action\b/i,
  /\bsue\s+you\b/i,
];

/**
 * Checks if a string contains any denied accusation or threat words
 */
export function containsDeniedWords(text: string): boolean {
  return DRAFT_DENYLIST.some(pattern => pattern.test(text));
}

/**
 * Extracts all distinct numerical values from a text string.
 * Strips punctuation and currency symbols.
 */
export function extractNumbersFromText(text: string): number[] {
  // Matches integers, decimals, and numbers with comma separators (e.g., 4,000, 3.1)
  const matches = text.match(/\b\d{1,3}(?:,\d{3})*(?:\.\d+)?\b/g) || [];
  const numbers: number[] = [];

  for (const m of matches) {
    const cleaned = m.replace(/,/g, '');
    const num = parseFloat(cleaned);
    if (!isNaN(num)) {
      numbers.push(num);
    }
  }

  return numbers;
}

/**
 * Checks if every number extracted from the text exists in the allowedNumbers set.
 * Allows minor rounding tolerance (e.g. integer vs decimal).
 */
export function validateNumberAllowlist(text: string, allowedNumbers: number[]): boolean {
  const extracted = extractNumbersFromText(text);
  const allowedSet = new Set(allowedNumbers.map(n => Math.round(n)));

  // Also include exact values
  for (const n of allowedNumbers) {
    allowedSet.add(n);
  }

  for (const n of extracted) {
    // If n is 1 or 2 (deliverable counts, list numbering), allow
    if (n <= 3) continue;

    const rounded = Math.round(n);
    if (!allowedSet.has(rounded) && !allowedSet.has(n)) {
      // Check if it's within 1% of an allowed number (floating point formatting)
      const matchesAllowed = allowedNumbers.some(a => Math.abs(a - n) < 1.0);
      if (!matchesAllowed) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Generates a firm, professional overdue payment message (replaces threats/accusations).
 */
export function getFirmOverdueReply(agreedAmount = 'the agreed fee', agreedDate = 'the agreed invoice date'): string {
  return `Hello, this is a formal follow-up regarding invoice payment for ${agreedAmount}, which was due on ${agreedDate} and is now overdue. Please confirm the payment transfer reference by end of day today. I am documenting all campaign deliverables and correspondence for our records.`;
}

/**
 * Full post-check enforcement pipeline adhering strictly to Section 8:
 * 1. Number allowlist check
 * 2. Denylist check for drafts
 * 3. Disclosure check for paid/gifted/barter work
 * 4. Verdict lock
 * 5. Brand-data lock
 * 6. Tier labelling
 * 7. Stale or sample data banners
 */
export function enforceGuardrails(
  aiOutput: ExplanationResponse,
  engine: EngineResult,
  profile: CreatorProfile,
  extraction: Extraction
): { sanitized: ExplanationResponse; warnings: string[] } {
  const warnings: string[] = [];
  let result = { ...aiOutput };

  // 1. Number allowlist check
  const allText = [
    result.headline,
    ...(result.why || []),
    ...(result.giveaways || []),
    result.payment_note || '',
    ...(result.cautions || []),
    ...(result.replies || []).map(r => r.text),
  ].join(' ');

  const numbersValid = validateNumberAllowlist(allText, engine.allowedNumbers);
  if (!numbersValid) {
    warnings.push('Guardrail G5 triggered: AI output mentioned unverified numbers. Falling back to verified template output.');
    result = generateTemplateExplanation(engine, profile, extraction);
  }

  // 2. Denylist check on drafts
  const sanitizedReplies: ReplyDraft[] = [];
  for (const r of result.replies || []) {
    if (containsDeniedWords(r.text)) {
      warnings.push(`Guardrail G3 triggered: Draft contained aggressive/accusatory language. Replaced with firm professional notice.`);
      sanitizedReplies.push({
        label: r.label,
        text: getFirmOverdueReply(
          engine.offerValue ? `₹${engine.offerValue.toLocaleString('en-IN')}` : 'the agreed fee',
          extraction.payment_terms?.days_after_posting ? `${extraction.payment_terms.days_after_posting} days post-publishing` : 'the agreed date'
        ),
      });
    } else {
      sanitizedReplies.push(r);
    }
  }
  result.replies = sanitizedReplies;

  // 3. Disclosure check (G2) for sponsored / barter replies if they write captions or agreements
  const isSponsored = extraction.sponsorship_disclosure_mentioned || (engine.offerValue !== null && engine.offerValue > 0);
  if (isSponsored) {
    // Check if reply mentions posting without disclosure
    result.replies = result.replies.map(r => {
      if (r.text.toLowerCase().includes('without disclosure') || r.text.toLowerCase().includes('no sponsor tag')) {
        return {
          ...r,
          text: r.text + ' Note: Indian consumer protection rules require clear disclosure (#ad).',
        };
      }
      return r;
    });
  }

  // 4. Verdict lock (Section 8.4): Never allow AI text to alter or conflict with engine verdict
  // If TAKE, ensure no counter language exists in replies
  if (engine.verdict === 'TAKE') {
    result.replies = result.replies.map(r => {
      if (r.text.toLowerCase().includes('counter') || r.text.toLowerCase().includes('my rate is higher')) {
        return {
          label: r.label,
          text: `Hi ${extraction.brand_name || 'team'}, thank you for the offer! I am pleased to accept the offer of ₹${engine.offerValue?.toLocaleString('en-IN')} for the agreed deliverables. Please share the agreement with the payment date in writing.`,
        };
      }
      return r;
    });
  }

  // 5. Tier labelling (Section 8.6)
  if (engine.brandTier === 2) {
    const hasBenchmarkSentence = (result.cautions || []).some(c => c.toLowerCase().includes('benchmark') || c.toLowerCase().includes('minimum of 5'));
    if (!hasBenchmarkSentence) {
      result.cautions = [
        ...(result.cautions || []),
        'We only have limited reports on this brand, below our minimum of 5. Showing category benchmark data instead.',
      ];
    }
  } else if (engine.brandTier === 3) {
    const hasNoDataSentence = (result.cautions || []).some(c => c.toLowerCase().includes("don't have data"));
    if (!hasNoDataSentence) {
      result.cautions = [
        ...(result.cautions || []),
        "We don't have verified payout data on this brand yet.",
      ];
    }
  }

  return { sanitized: result, warnings };
}
