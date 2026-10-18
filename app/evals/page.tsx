'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  EVAL_CASES, 
  runEvalCase, 
  runAllEvalCases, 
  EvalCaseResult 
} from '@/evals/cases';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Play, 
  RotateCw, 
  CheckCircle2, 
  XCircle, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';

export default function EvalsPage() {
  const [results, setResults] = useState<Record<string, EvalCaseResult>>({});
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [runningCaseId, setRunningCaseId] = useState<string | null>(null);
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);

  const handleRunCase = async (id: string) => {
    setRunningCaseId(id);
    try {
      const res = await runEvalCase(id);
      setResults(prev => ({ ...prev, [id]: res }));
    } catch (err) {
      console.error(`Failed to run eval case ${id}:`, err);
    } finally {
      setRunningCaseId(null);
    }
  };

  const handleRunAll = async () => {
    setIsRunningAll(true);
    try {
      const allResults = await runAllEvalCases();
      const mapped: Record<string, EvalCaseResult> = {};
      for (const r of allResults) {
        mapped[r.id] = r;
      }
      setResults(mapped);
    } catch (err) {
      console.error('Failed to run all evals:', err);
    } finally {
      setIsRunningAll(false);
    }
  };

  const ranCount = Object.keys(results).length;
  const passCount = Object.values(results).filter(r => r.allPassed).length;
  const totalCases = EVAL_CASES.length;
  const allPassed = ranCount === totalCases && passCount === totalCases;
  const anyHardFailed = Object.values(results).some(r => r.isHard && !r.allPassed);

  return (
    <div className="min-h-screen bg-[#F3F5F9] text-[#121A2B] py-6 px-4">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#6B7488] hover:text-[#121A2B] transition-colors py-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back to chat
          </Link>

          <button
            onClick={handleRunAll}
            disabled={isRunningAll}
            className="px-4 py-2 text-[13px] font-semibold text-white bg-[#121A2B] hover:bg-[#1f2b45] disabled:opacity-50 rounded-full shadow-sm flex items-center gap-2 transition-colors min-h-[44px]"
          >
            {isRunningAll ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" /> Running all {totalCases} cases...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Run all {totalCases} evals
              </>
            )}
          </button>
        </div>

        {/* Page Header */}
        <div className="bg-white rounded-[20px] p-5 border border-[#E3E7EF] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-semibold text-[#6B7488] block mb-1">
                Evaluation suite
              </span>
              <h1 className="text-[24px] font-semibold text-[#121A2B] tracking-tight">
                Model & engine checks
              </h1>
              <p className="text-[13px] text-[#6B7488] mt-1 leading-snug">
                {totalCases} automated test cases exercising the pricing pipeline, guardrails, and number allowlists.
              </p>
            </div>

            {/* Release Status Banner */}
            {ranCount > 0 && (
              <div>
                {allPassed ? (
                  <div className="bg-[#1F9D6B]/10 border border-[#1F9D6B] text-[#1F9D6B] px-3.5 py-2 rounded-full flex items-center gap-2 text-[13px] font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-[#1F9D6B]" />
                    <span>RELEASE READY: {totalCases}/{totalCases} PASSED</span>
                  </div>
                ) : anyHardFailed ? (
                  <div className="bg-[#D64545]/10 border border-[#D64545] text-[#D64545] px-3.5 py-2 rounded-full flex items-center gap-2 text-[13px] font-semibold">
                    <XCircle className="w-4 h-4 text-[#D64545]" />
                    <span>RELEASE BLOCKED: HARD CASE FAILED</span>
                  </div>
                ) : (
                  <div className="bg-[#D98A00]/10 border border-[#D98A00] text-[#D98A00] px-3.5 py-2 rounded-full text-[13px] font-semibold">
                    {passCount}/{ranCount} cases passed
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Eval Cases Table */}
        <div className="space-y-2.5">
          {EVAL_CASES.map((c) => {
            const res = results[c.id];
            const isRunning = runningCaseId === c.id;
            const isExpanded = expandedCaseId === c.id;

            return (
              <div
                key={c.id}
                className="bg-white rounded-[20px] border border-[#E3E7EF] overflow-hidden"
              >
                <div className="p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-[#F3F5F9] text-[#121A2B] font-semibold text-[11px] flex items-center justify-center shrink-0 border border-[#E3E7EF]">
                      {c.id}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-[15px] text-[#121A2B]">{c.title}</h3>
                        {c.isHard && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#D64545]/10 text-[#D64545] border border-[#D64545]/30">
                            Hard case
                          </span>
                        )}
                      </div>
                      <p className="text-[13px] text-[#6B7488] line-clamp-1 mt-0.5">
                        {c.input}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {res ? (
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                          res.allPassed
                            ? 'bg-[#1F9D6B]/10 text-[#1F9D6B] border border-[#1F9D6B]/30'
                            : 'bg-[#D64545]/10 text-[#D64545] border border-[#D64545]/30'
                        }`}
                      >
                        {res.allPassed ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#1F9D6B]" />
                            PASS ({res.assertions.length}/{res.assertions.length})
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-[#D64545]" />
                            FAIL
                          </>
                        )}
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#6B7488]">Not run</span>
                    )}

                    <button
                      onClick={() => handleRunCase(c.id)}
                      disabled={isRunning || isRunningAll}
                      className="px-3 py-1.5 text-[11px] font-semibold text-[#121A2B] bg-[#F3F5F9] hover:bg-slate-200 border border-[#E3E7EF] rounded-full transition-colors flex items-center gap-1 min-h-[36px]"
                    >
                      {isRunning ? (
                        <RotateCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <Play className="w-3 h-3 fill-current" />
                      )}
                      <span>Run</span>
                    </button>

                    <button
                      onClick={() => setExpandedCaseId(isExpanded ? null : c.id)}
                      className="p-1.5 text-[#6B7488] hover:text-[#121A2B] rounded-full hover:bg-[#F3F5F9] transition-colors"
                      title="View assertions"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-[#E3E7EF] bg-[#F3F5F9]/50 space-y-3 text-[13px]">
                    <div>
                      <span className="font-semibold text-[#121A2B] block mb-0.5">Input text:</span>
                      <p className="p-2.5 bg-white rounded-xl border border-[#E3E7EF] text-[#121A2B] font-mono text-[11px]">
                        {c.input}
                      </p>
                    </div>

                    <div>
                      <span className="font-semibold text-[#121A2B] block mb-0.5">Expected behavior:</span>
                      <p className="text-[#6B7488] leading-snug">{c.expected}</p>
                    </div>

                    {res && (
                      <div className="space-y-1.5">
                        <span className="font-semibold text-[#121A2B] block">
                          Machine-checkable assertions:
                        </span>
                        <div className="space-y-1">
                          {res.assertions.map((a, aIdx) => (
                            <div
                              key={aIdx}
                              className={`p-2 rounded-xl border flex items-center justify-between ${
                                a.passed
                                  ? 'bg-[#1F9D6B]/5 border-[#1F9D6B]/20 text-[#121A2B]'
                                  : 'bg-[#D64545]/5 border-[#D64545]/20 text-[#D64545]'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {a.passed ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1F9D6B] shrink-0" />
                                ) : (
                                  <XCircle className="w-3.5 h-3.5 text-[#D64545] shrink-0" />
                                )}
                                <span className="font-mono text-[11px] font-medium">{a.name}</span>
                              </div>
                              <span className="text-[11px] text-[#6B7488] font-medium">
                                {a.message || (a.passed ? 'Verified' : 'Failed')}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Raw Output Accordion */}
                        <div className="pt-2">
                          <span className="font-semibold text-[#121A2B] block mb-1">
                            Raw engine output:
                          </span>
                          <pre className="p-3 bg-[#121A2B] text-slate-100 rounded-xl overflow-x-auto text-[10px] font-mono leading-relaxed max-h-48">
                            {JSON.stringify(res.rawOutput, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
