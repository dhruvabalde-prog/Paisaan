"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Sparkles,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  DollarSign,
  Layers,
  FileCode,
  Loader2,
  Calendar,
} from "lucide-react";
import { JobItem, JobStatus, TrackedJobData } from "@/types/job";
import { cn } from "@/lib/utils";

interface JobDetailPageProps {
  job: JobItem;
  tracked?: TrackedJobData;
  onBack: () => void;
  onStatusChange: (id: string, status: JobStatus) => void;
  onUpdateDemoUrl: (id: string, url: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onUpdateRevenue: (id: string, revenue: number) => void;
  onSaveAnalysis: (id: string, analysis: TrackedJobData["analysis"]) => void;
}

const STATUSES: JobStatus[] = ["New", "Applied", "Interviewing", "Won", "Skipped"];

export function JobDetailPage({
  job,
  tracked,
  onBack,
  onStatusChange,
  onUpdateDemoUrl,
  onUpdateNotes,
  onUpdateRevenue,
  onSaveAnalysis,
}: JobDetailPageProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [revenueInput, setRevenueInput] = useState<string>(
    tracked?.revenue !== undefined ? String(tracked.revenue) : ""
  );

  const analysis = tracked?.analysis;
  const currentStatus = tracked?.status || "New";

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job }),
      });
      const data = await res.json();
      if (data.analysis) {
        onSaveAnalysis(job.id, data.analysis);
      }
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCopy = (text: string, type: "pitch" | "prompt") => {
    navigator.clipboard.writeText(text);
    if (type === "pitch") {
      setCopiedPitch(true);
      setTimeout(() => setCopiedPitch(false), 2000);
    } else {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    }
  };

  const handleRevenueSubmit = () => {
    const parsed = parseFloat(revenueInput);
    if (!isNaN(parsed)) {
      onUpdateRevenue(job.id, parsed);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      {/* Mobile-first Navigation Bar with Back Button */}
      <div className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md px-3 sm:px-6 py-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:text-emerald-500 py-1.5 px-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            {job.source}
          </span>
          <a
            href={job.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-xs font-bold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 px-3 py-1.5 rounded-xl shadow-sm transition-colors"
          >
            <span>Open Link</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Main Body */}
      <div className="max-w-4xl mx-auto w-full px-3 sm:px-6 py-5 flex-1 flex flex-col gap-5">
        {/* Title, Platform & Budget Header Card */}
        <div className="p-4 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800/40">
              {job.category === "gigs" ? "Category A: Gig / Client" : "Category B: Asset Store"}
            </span>
            <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
              <Calendar className="h-3.5 w-3.5" />
              <span>Posted: {job.dateGroup}</span>
            </div>
          </div>

          <h1 className="text-lg sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 leading-snug">
            {job.title}
          </h1>

          <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-1 text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400">
              <DollarSign className="h-4 w-4" />
              <span>{job.budget}</span>
            </div>

            {/* Status Switcher (Mobile Touch-Optimized) */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
              {STATUSES.map((st) => (
                <button
                  key={st}
                  onClick={() => onStatusChange(job.id, st)}
                  className={cn(
                    "text-xs px-2.5 py-1.5 rounded-lg font-bold border transition-colors shrink-0",
                    currentStatus === st
                      ? "bg-emerald-500 text-zinc-950 border-emerald-500"
                      : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                  )}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Gemini AI Vetting Panel */}
        <div className="p-4 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
              <h2 className="text-base font-bold">Gemini 3.8 Flash Analysis</h2>
            </div>
            <button
              onClick={handleRunAnalysis}
              disabled={analyzing}
              className="flex items-center gap-1.5 text-xs font-bold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 px-3.5 py-2 rounded-xl transition-all shadow-sm"
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  {analysis ? "Re-Analyze" : "Run AI Analysis"}
                </>
              )}
            </button>
          </div>

          {analysis ? (
            <div className="space-y-4 pt-1">
              {/* Match Score & Red Flag Audit */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3">
                  <span className="text-[11px] text-zinc-500 uppercase font-bold">Match Score</span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-emerald-500 dark:text-emerald-400">{analysis.match_score}</span>
                    <span className="text-xs text-zinc-400">/ 10</span>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3">
                  <span className="text-[11px] text-zinc-500 uppercase font-bold">Red Flag Status</span>
                  <div className="mt-1 flex items-center gap-1.5">
                    {analysis.red_flag_check === "PASS" ? (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                        <ShieldCheck className="h-4 w-4" /> PASS
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold text-sm">
                        <ShieldAlert className="h-4 w-4" /> FAIL
                      </span>
                    )}
                  </div>
                  {analysis.red_flag_reason && (
                    <p className="mt-1 text-xs text-rose-500 leading-tight">{analysis.red_flag_reason}</p>
                  )}
                </div>
              </div>

              {/* Plain English Translation */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-4">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Plain-English Summary (Zero Jargon)
                </h3>
                <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                  {analysis.plain_english_summary}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <span>Suggested Bid:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{analysis.suggested_bid}</span>
                </div>
              </div>

              {/* 3-Screen Blueprint */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    3-Screen MVP Blueprint
                  </h3>
                </div>
                <div className="grid gap-2">
                  {analysis.three_screen_blueprint.map((screen, idx) => (
                    <div key={idx} className="rounded-lg border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 p-2.5">
                      <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{screen.title}</div>
                      <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">{screen.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 1-Click Client Pitch */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    3-Line Client Proposal
                  </span>
                  <button
                    onClick={() => handleCopy(analysis.client_pitch, "pitch")}
                    className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-zinc-900 border border-emerald-200 dark:border-zinc-800 px-2.5 py-1 rounded-md font-semibold"
                  >
                    {copiedPitch ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-500" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" /> Copy Pitch
                      </>
                    )}
                  </button>
                </div>
                <pre className="whitespace-pre-wrap font-sans text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed bg-white dark:bg-zinc-900/70 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  {analysis.client_pitch}
                </pre>
              </div>

              {/* 1-Click v0.dev Prompt */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <FileCode className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                      v0.dev Demo Prompt
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(analysis.v0_prompt, "prompt")}
                    className="flex items-center gap-1 text-xs text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-zinc-900 border border-cyan-200 dark:border-zinc-800 px-2.5 py-1 rounded-md font-semibold"
                  >
                    {copiedPrompt ? (
                      <>
                        <Check className="h-3 w-3 text-cyan-500" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" /> Copy Prompt
                      </>
                    )}
                  </button>
                </div>
                <pre className="whitespace-pre-wrap font-sans text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed bg-white dark:bg-zinc-900/70 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  {analysis.v0_prompt}
                </pre>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs sm:text-sm text-zinc-500">
              Tap <strong className="text-emerald-500">Run AI Analysis</strong> to get a match score, red flag audit, and ready-to-pitch proposal.
            </div>
          )}
        </div>

        {/* Full Original Description */}
        <div className="p-4 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Original Post Description
          </h3>
          <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
            {job.description}
          </p>
        </div>

        {/* Tracking, Demo URL & Notes */}
        <div className="p-4 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Personal Notes & Live Prototype Link
          </h3>

          <div>
            <label className="text-xs text-zinc-500 block mb-1">
              Live Prototype / Vercel Demo Link:
            </label>
            <input
              type="text"
              placeholder="https://my-mvp-demo.vercel.app"
              defaultValue={tracked?.demoUrl || ""}
              onBlur={(e) => onUpdateDemoUrl(job.id, e.target.value)}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-zinc-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-500 block mb-1">Private Notes / Next Follow-up:</label>
            <textarea
              rows={3}
              placeholder="Client liked prototype, follow-up on Friday..."
              defaultValue={tracked?.notes || ""}
              onBlur={(e) => onUpdateNotes(job.id, e.target.value)}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-zinc-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {currentStatus === "Won" && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20 p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                  Revenue Earned from Project ($ USD)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="500"
                  value={revenueInput}
                  onChange={(e) => setRevenueInput(e.target.value)}
                  className="w-36 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:border-emerald-500 focus:outline-none"
                />
                <button
                  onClick={handleRevenueSubmit}
                  className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                >
                  Save Revenue
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
