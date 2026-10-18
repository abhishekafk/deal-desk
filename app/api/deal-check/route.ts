import { NextRequest, NextResponse } from 'next/server';
import { DealCheckRequest, DealCheckResponse, Extraction } from '@/types';
import { runEngine } from '@/lib/engine';
import { parseOfferWithLLM, explainAndDraftWithLLM, checkRateLimit } from '@/lib/llm';
import { enforceGuardrails } from '@/lib/guardrails';

export async function POST(req: NextRequest) {
  try {
    // 1. IP rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || '127.0.0.1';
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Maximum 20 deal checks per hour.' },
        { status: 429 }
      );
    }

    const body = (await req.json()) as DealCheckRequest;
    const { mode, profile, message = '', rateForm, confirmedProductValueInr } = body;

    if (!profile) {
      return NextResponse.json({ error: 'Profile is required' }, { status: 400 });
    }

    let extraction: Extraction;
    let runMode: 'live' | 'demo' = 'live';

    // 2. Step 1: Extraction
    if (mode === 'rate' && rateForm) {
      // In rate mode: build extraction directly from rateForm
      extraction = {
        brand_name: null,
        deliverables: [{ type: rateForm.type, count: rateForm.count || 1 }],
        cash_offer_inr: null,
        product_offered: null,
        usage_rights: {
          duration_months: rateForm.usageMonths > 0 ? rateForm.usageMonths : null,
          paid_ads: rateForm.paidAds ?? false,
        },
        exclusivity: {
          duration_months: rateForm.exclusivityMonths > 0 ? rateForm.exclusivityMonths : null,
          category: rateForm.exclusivityMonths > 0 ? 'category' : null,
        },
        deadline: null,
        payment_terms: {
          days_after_posting: 30,
          advance_pct: null,
        },
        sponsorship_disclosure_mentioned: true,
        red_flags: [],
        injection_attempt_detected: false,
        missing_fields: [],
      };
      runMode = 'demo';
    } else {
      // Offer mode: extract terms from message
      const parseResult = await parseOfferWithLLM(message);
      extraction = parseResult.extraction;
      if (parseResult.runMode === 'demo') {
        runMode = 'demo';
      }

      // If user confirmed product value inline
      if (confirmedProductValueInr !== undefined && confirmedProductValueInr !== null) {
        if (!extraction.product_offered) {
          extraction.product_offered = {
            description: 'Creator specified product/pass',
            stated_value_inr: confirmedProductValueInr,
          };
        } else {
          extraction.product_offered.stated_value_inr = confirmedProductValueInr;
        }
      }
    }

    // 3. Step 2: Pure deterministic Engine execution in code
    const engine = runEngine(extraction, profile, null, mode === 'rate');

    // 4. Step 3: Explanation & Draft generation
    const explainResult = await explainAndDraftWithLLM(engine, profile, extraction);
    if (explainResult.runMode === 'demo') {
      runMode = 'demo';
    }

    // 5. Step 4: Guardrail post-checks
    const { sanitized, warnings } = enforceGuardrails(
      explainResult.explanation,
      engine,
      profile,
      extraction
    );

    // 6. Step 5: Respond
    const responseData: DealCheckResponse = {
      extraction,
      engine,
      explanation: sanitized,
      replies: sanitized.replies,
      warnings,
      runMode,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Deal check API error:', error);
    // Never fail with 500 error screen; return graceful demo response
    return NextResponse.json(
      { error: 'Internal processing error, please retry' },
      { status: 500 }
    );
  }
}
