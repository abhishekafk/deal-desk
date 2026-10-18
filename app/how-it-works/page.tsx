'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Cpu, 
  Lock, 
  Terminal, 
  CheckCircle, 
  HelpCircle,
  FileCode,
  AlertTriangle
} from 'lucide-react';
import { 
  EXTRACTION_SYSTEM_PROMPT, 
  EXPLAIN_DRAFT_SYSTEM_PROMPT, 
  CAPTION_HELPER_SYSTEM_PROMPT 
} from '@/lib/llm';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 hover:text-teal-950 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to DealDesk
        </Link>

        {/* Title & Core Principle */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
            <Cpu className="w-3.5 h-3.5 text-teal-700" /> System Architecture & Transparency
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            How DealDesk Works
          </h1>
          <p className="text-sm font-semibold text-teal-900 bg-teal-50/60 p-3 rounded-xl border border-teal-200">
            Core Design Principle: <span className="font-normal">"The AI explains and writes; deterministic code does the math."</span>
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            Fair commercial ranges and verdicts are never hallucinated by a language model. They are computed by a strictly deterministic, unit-tested engine based on verified median views. The AI model only parses terms from untrusted message text and drafts human-like replies constrained to an exact number allowlist.
          </p>
        </div>

        {/* The 5-Step Pipeline */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Terminal className="w-5 h-5 text-teal-700" />
            The 5-Step Deal Check Pipeline
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                1
              </span>
              <div>
                <h3 className="font-bold text-slate-900">Untrusted Input Parsing (Extraction)</h3>
                <p className="text-slate-600 mt-0.5 leading-relaxed">
                  The pasted DM or email is treated purely as untrusted data. Prompt 1 extracts deliverables, cash, barter goods, usage duration, exclusivity, and payment terms, while flagging prompt injections and missing terms.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                2
              </span>
              <div>
                <h3 className="font-bold text-slate-900">Deterministic Engine Execution (lib/engine.ts)</h3>
                <p className="text-slate-600 mt-0.5 leading-relaxed">
                  Calculates base CPM range from verified median reel views (never followers), applies additive rights add-ons (+20% 3m usage, +120% 12m exclusivity), computes offer-to-fair ratio, determines verdict (TAKE, COUNTER, PASS_OR_RESET, NEED_INFO), and generates the <code>allowedNumbers</code> list.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                3
              </span>
              <div>
                <h3 className="font-bold text-slate-900">Constrained Explanation & Reply Generation</h3>
                <p className="text-slate-600 mt-0.5 leading-relaxed">
                  Prompt 2 receives the Engine facts, the creator's profile, and the offer. It cannot change prices or add unlisted numbers. It writes 3-5 working bullets and two reply drafts (Friendly and Firm).
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                4
              </span>
              <div>
                <h3 className="font-bold text-slate-900">Guardrail Post-Checks (lib/guardrails.ts)</h3>
                <p className="text-slate-600 mt-0.5 leading-relaxed">
                  Runs 7 automated code checks before anything reaches the screen: number allowlist validation, threat/accusation denylist filtering, disclosure tag enforcement, verdict lock, brand data lock, and tier labelling.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                5
              </span>
              <div>
                <h3 className="font-bold text-slate-900">Creator Decision UI</h3>
                <p className="text-slate-600 mt-0.5 leading-relaxed">
                  Renders the Verdict screen showing the Why table, giveaways, brand payout statistics with sample data badge, and one-click copyable reply drafts.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* The 3 Confidence & Brand Tiers */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-700" />
            The 3 Brand Data & Confidence Tiers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-1.5">
              <span className="font-bold text-emerald-900 block text-sm">Tier 1: Verified Brand Data</span>
              <p className="text-emerald-800 leading-relaxed text-[11px]">
                Requires at least 5 verified contract/payment reports within the last 12 months. Shows exact reported payout days (p25 to p75) and typical reel cash.
              </p>
            </div>

            <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 space-y-1.5">
              <span className="font-bold text-blue-900 block text-sm">Tier 2: Category Benchmark</span>
              <p className="text-blue-800 leading-relaxed text-[11px]">
                Triggered when a brand has fewer than 5 reports. Brand-specific figures are withheld. Displays a category benchmark clearly labelled "benchmark, not this brand".
              </p>
            </div>

            <div className="p-4 bg-slate-100 rounded-xl border border-slate-300 space-y-1.5">
              <span className="font-bold text-slate-900 block text-sm">Tier 3: No Prior Data</span>
              <p className="text-slate-700 leading-relaxed text-[11px]">
                Brand is completely unknown and no benchmark matches. The system plainly states "We don't have data on this brand yet" and prices purely on her verified reach.
              </p>
            </div>
          </div>
        </div>

        {/* Top 5 Guardrails (Deliverable Table from Section 10) */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Lock className="w-5 h-5 text-teal-700" />
            The Top 5 Guardrails
          </h2>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <tr>
                  <th className="py-2.5 px-3">Guardrail</th>
                  <th className="py-2.5 px-3">Failure it Prevents</th>
                  <th className="py-2.5 px-3">How Code Enforces It</th>
                  <th className="py-2.5 px-3">What Creator Sees</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-3 px-3 font-bold text-slate-900">G1: Honesty & Confidence Gate</td>
                  <td className="py-3 px-3">Quoting confident rates on thin data, inventing causes for underperformance or legal advice.</td>
                  <td className="py-3 px-3">Prices from code. Brand numbers render only at 5+ reports. Disclaims legal interpretation.</td>
                  <td className="py-3 px-3">"Medium confidence" badge and "We only have 3 reports, here is a category benchmark instead."</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-bold text-slate-900">G2: Sponsorship Disclosure Guard</td>
                  <td className="py-3 px-3">Undisclosed paid/barter posts breaching Indian ASCI guidelines and Consumer Protection Act.</td>
                  <td className="py-3 px-3">Post-check verifies `#ad` or `#gifted`. Refuses removal requests. Asks if relationship unknown.</td>
                  <td className="py-3 px-3">Mandatory `#ad` in drafts. If removal requested: "I cannot remove disclosure. It protects your account."</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-bold text-slate-900">G3: Neutral Brand Language</td>
                  <td className="py-3 px-3">Defamation risks or threatening messages burning industry relationships.</td>
                  <td className="py-3 px-3">Denylist filters "scam", "fraud", "expose", "shame". Replaces threats with firm professional invoice notice.</td>
                  <td className="py-3 px-3">Firm professional notice citing agreed invoice dates, deliverables, and payment transfer deadlines.</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-bold text-slate-900">G4: Fairness Guard (No Bad Counters)</td>
                  <td className="py-3 px-3">Pushing creators to counter fair first offers or barter perks, risking losing the deal.</td>
                  <td className="py-3 px-3">Verdict locked to ratio rule: at ≥85% of fair low, verdict is TAKE and counter drafts are never created.</td>
                  <td className="py-3 px-3">"Solid, fair offer. Countering could cost you the deal." Short acceptance draft provided.</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-bold text-slate-900">G5: Stats Integrity & Injection Safety</td>
                  <td className="py-3 px-3">Draft quoting inflated follower numbers, or pasted message hacking model into fake endorsement.</td>
                  <td className="py-3 px-3">Number allowlist check. Any number not in engine/profile/offer triggers template fallback. Injection flagged.</td>
                  <td className="py-3 px-3">Real verified numbers in "Numbers used in message" panel. Stale profile and prompt injection warning banners.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 6 System Prompts */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileCode className="w-5 h-5 text-teal-700" />
            In-Product System Prompts (Section 6)
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <span className="font-bold text-slate-800 block mb-1">
                Prompt 1: Extraction System Prompt
              </span>
              <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-xl overflow-x-auto font-mono text-[11px] leading-relaxed">
                {EXTRACTION_SYSTEM_PROMPT}
              </pre>
            </div>

            <div>
              <span className="font-bold text-slate-800 block mb-1">
                Prompt 2: Explain and Draft System Prompt
              </span>
              <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-xl overflow-x-auto font-mono text-[11px] leading-relaxed">
                {EXPLAIN_DRAFT_SYSTEM_PROMPT}
              </pre>
            </div>

            <div>
              <span className="font-bold text-slate-800 block mb-1">
                Prompt 3: Caption Helper System Prompt
              </span>
              <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-xl overflow-x-auto font-mono text-[11px] leading-relaxed">
                {CAPTION_HELPER_SYSTEM_PROMPT}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
