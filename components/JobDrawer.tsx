"use client";

import { useState } from "react";
import {
  X,
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
} from "lucide-react";
import { JobItem, JobStatus, TrackedJobData } from "@/types/job";
import { cn } from "@/lib/utils";

interface JobDrawerProps {
  job: JobItem | null;
  tracked?: TrackedJobData;
  onClose: () => void;
  onStatusChange: (id: string, status: JobStatus) => void;
  onUpdateDemoUrl: (id: string, url: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onUpdateRevenue: (id: string, revenue: number) => void;
  onSaveAnalysis: (id: string, analysis: TrackedJobData["analysis"]) => void;
}

export function JobDrawer({
  job,
  tracked,
  onClose,
  onStatusChange,
  onUpdateDemoUrl,
  onUpdateNotes,
  onUpdateRevenue,
  onSaveAnalysis,
}: JobDrawerProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [revenueInput, setRevenueInput] = useState<string>(
    tracked?.revenue !== undefined ? String(tracked.revenue) : ""
  );

  if (!job) return null;

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
      console.error("Failed to analyze gig:", err);
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

  const getSourceBadgeStyle = (source: string) => {
    switch (source) {
      case "Upwork":
        return "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800";
      case "WeWorkRemotely":
        return "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800";
      case "RemoteOK":
      default:
        return "bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div
        className="relative flex h-full w-full max-w-2xl flex-col bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 py-4 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span
              className={cn(
                "rounded px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider border",
                getSourceBadgeStyle(job.source)
              )}
            >
              {job.source}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Budget: {job.budget}</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={job.url}
              target="_blank"
              rel="noreferrer"
              onClick={() => {
                if (currentStatus === "New") onStatusChange(job.id, "Applied");
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/40"
            >
              <span>Platform</span> <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Gig Title & Status Bar */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold leading-snug">{job.title}</h2>
            <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Published: {new Date(job.publishedAt).toLocaleString()}</span>
              {/* Status Switcher */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
                {(["New", "Applied", "Interviewing", "Won", "Skipped"] as JobStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => onStatusChange(job.id, st)}
                    className={cn(
                      "text-xs px-2.5 py-1 rounded-md font-semibold border transition-colors shrink-0",
                      currentStatus === st
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                        : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                    )}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI Vetting / Analysis Panel */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                <h3 className="font-bold text-sm sm:text-base">Gemini 3.8 Flash Co-Pilot</h3>
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
                {/* Score & Red Flag Badges */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3">
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 uppercase font-bold">Match Score</span>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-2xl font-black text-emerald-500 dark:text-emerald-400">{analysis.match_score}</span>
                      <span className="text-xs text-zinc-400">/ 10</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3">
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 uppercase font-bold">Red Flag Status</span>
                    <div className="mt-1 flex items-center gap-2">
                      {analysis.red_flag_check === "PASS" ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                          <ShieldCheck className="h-4 w-4" /> PASS
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold text-sm">
                          <ShieldAlert className="h-4 w-4" /> FAIL
                        </div>
                      )}
                    </div>
                    {analysis.red_flag_reason && (
                      <p className="mt-1 text-xs text-rose-500 leading-tight">{analysis.red_flag_reason}</p>
                    )}
                  </div>
                </div>

                {/* Plain English Translation */}
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Plain-English Brief (Zero Jargon)
                  </h4>
                  <p className="mt-2 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                    {analysis.plain_english_summary}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                    <span>Suggested Bid:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{analysis.suggested_bid}</span>
                  </div>
                </div>

                {/* 3-Screen MVP Blueprint */}
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      3-Screen MVP Blueprint
                    </h4>
                  </div>
                  <div className="grid gap-2">
                    {analysis.three_screen_blueprint.map((screen, idx) => (
                      <div key={idx} className="rounded-lg border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/60 p-2.5">
                        <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{screen.title}</div>
                        <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">{screen.description}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 1-Click Client Pitch */}
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
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
                  <pre className="whitespace-pre-wrap font-sans text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-zinc-900/70 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    {analysis.client_pitch}
                  </pre>
                </div>

                {/* 1-Click v0.dev Prompt */}
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <FileCode className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
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
                  <pre className="whitespace-pre-wrap font-sans text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-zinc-900/70 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    {analysis.v0_prompt}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                Tap <span className="font-bold text-emerald-600 dark:text-emerald-400">Run AI Analysis</span> to generate match scores, red flag detection, 3-screen blueprints, and copy-paste proposals with Gemini 3.8 Flash.
              </div>
            )}
          </div>

          {/* Full Original Description */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 p-4 sm:p-5">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
              Original Job Post Description
            </h3>
            <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed font-sans">
              {job.description}
            </p>
          </div>

          {/* Custom Demo Link & Vibe Notes */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 p-4 sm:p-5 space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Personal Tracking & Live Prototype Link
            </h3>

            <div>
              <label className="text-xs text-zinc-500 dark:text-zinc-400 block mb-1">
                Live Prototype / Vercel Link Sent to Client:
              </label>
              <input
                type="text"
                placeholder="https://my-mvp-demo.vercel.app"
                defaultValue={tracked?.demoUrl || ""}
                onBlur={(e) => onUpdateDemoUrl(job.id, e.target.value)}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs sm:text-sm text-zinc-900 dark:text-zinc-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-500 dark:text-zinc-400 block mb-1">Personal Notes & Client Responses:</label>
              <textarea
                rows={3}
                placeholder="Client liked the 2nd screen; follow-up scheduled tomorrow..."
                defaultValue={tracked?.notes || ""}
                onBlur={(e) => onUpdateNotes(job.id, e.target.value)}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs sm:text-sm text-zinc-900 dark:text-zinc-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* If marked Won */}
            {currentStatus === "Won" && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                    Revenue Earned from Project ($ USD)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="e.g. 500"
                    value={revenueInput}
                    onChange={(e) => setRevenueInput(e.target.value)}
                    className="w-40 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:border-emerald-500 focus:outline-none"
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
    </div>
  );
}
