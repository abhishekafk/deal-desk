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
  ChevronUp, 
  AlertTriangle,
  Sparkles
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
  const all10Passed = ranCount === 10 && passCount === 10;
  const anyHardFailed = Object.values(results).some(r => r.isHard && !r.allPassed);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 hover:text-teal-950 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to DealDesk
          </Link>

          <button
            onClick={handleRunAll}
            disabled={isRunningAll}
            className="px-4 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-50 rounded-xl shadow-sm flex items-center gap-2 transition-colors"
          >
            {isRunningAll ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" /> Running All 10 Cases...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Run All 10 Evals
              </>
            )}
          </button>
        </div>

        {/* Page Header */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                Automated Verification Suite
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                DealDesk Model & Engine Evaluation Suite
              </h1>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Run the 10 core eval cases before every release. Each test exercises the live or demo pipeline and executes machine-checkable assertions on verdicts, flags, allowlists, and guardrails.
              </p>
            </div>

            {/* Release Status Banner */}
            {ranCount > 0 && (
              <div>
                {all10Passed ? (
                  <div className="bg-emerald-50 border-2 border-emerald-400 text-emerald-900 px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold shadow-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>RELEASE READY: 10/10 PASSED</span>
                  </div>
                ) : anyHardFailed ? (
                  <div className="bg-rose-50 border-2 border-rose-400 text-rose-900 px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold shadow-sm">
                    <XCircle className="w-5 h-5 text-rose-600" />
                    <span>RELEASE BLOCKED: HARD CASE FAILED</span>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-300 text-amber-900 px-4 py-2 rounded-xl text-xs font-bold">
                    {passCount}/{ranCount} Cases Passed
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Eval Cases Table */}
        <div className="space-y-3">
          {EVAL_CASES.map((c, idx) => {
            const res = results[c.id];
            const isRunning = runningCaseId === c.id;
            const isExpanded = expandedCaseId === c.id;

            return (
              <div
                key={c.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all"
              >
                <div className="p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200">
                      {c.id}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-900">{c.title}</h3>
                        {c.isHard && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                            Hard Case
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {c.input}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {res ? (
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                          res.allPassed
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-50 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {res.allPassed ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            PASS ({res.assertions.length}/{res.assertions.length})
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            FAIL
                          </>
                        )}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Not run yet</span>
                    )}

                    <button
                      onClick={() => handleRunCase(c.id)}
                      disabled={isRunning || isRunningAll}
                      className="px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors flex items-center gap-1"
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
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                      title="View assertions & details"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-3 text-xs">
                    <div>
                      <span className="font-bold text-slate-700 block mb-0.5">Input Text:</span>
                      <p className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-800 font-mono text-[11px]">
                        {c.input}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 block mb-0.5">Expected Behavior:</span>
                      <p className="text-slate-600 leading-relaxed">{c.expected}</p>
                    </div>

                    {res && (
                      <div className="space-y-1.5">
                        <span className="font-bold text-slate-700 block">
                          Machine-Checkable Assertions:
                        </span>
                        <div className="space-y-1">
                          {res.assertions.map((a, aIdx) => (
                            <div
                              key={aIdx}
                              className={`p-2 rounded-lg border flex items-center justify-between ${
                                a.passed
                                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                                  : 'bg-rose-50 border-rose-200 text-rose-900'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {a.passed ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                ) : (
                                  <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                )}
                                <span className="font-mono text-[11px] font-medium">{a.name}</span>
                              </div>
                              <span className="text-[10px] text-slate-500 font-medium">
                                {a.message || (a.passed ? 'Assertion verified' : 'Failed assertion')}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Raw Output Accordion */}
                        <div className="pt-2">
                          <span className="font-bold text-slate-700 block mb-1">
                            Raw Engine / Model Output:
                          </span>
                          <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto text-[10px] font-mono leading-relaxed max-h-48">
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
