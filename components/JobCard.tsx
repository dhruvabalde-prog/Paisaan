"use client";

import { Sparkles, DollarSign, ExternalLink, ShieldAlert, ShieldCheck } from "lucide-react";
import { JobItem, JobStatus, TrackedJobData } from "@/types/job";
import { cn } from "@/lib/utils";

interface JobCardProps {
  job: JobItem;
  tracked?: TrackedJobData;
  onSelect: (job: JobItem) => void;
  onStatusChange: (id: string, status: JobStatus) => void;
}

const STATUS_OPTIONS: JobStatus[] = ["New", "Applied", "Interviewing", "Won", "Skipped"];

export function JobCard({ job, tracked, onSelect, onStatusChange }: JobCardProps) {
  const currentStatus: JobStatus = tracked?.status || "New";
  const analysis = tracked?.analysis;

  const handleOpenPlatform = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(job.url, "_blank", "noopener,noreferrer");
    if (currentStatus === "New") {
      onStatusChange(job.id, "Applied");
    }
  };

  const getSourceBadgeStyle = (source: string) => {
    switch (source) {
      case "Upwork":
        return "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/60";
      case "WeWorkRemotely":
        return "bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800/60";
      case "RemoteOK":
      default:
        return "bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800/60";
    }
  };

  const statusColors: Record<JobStatus, string> = {
    New: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    Applied: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    Interviewing: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    Won: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    Skipped: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",
  };

  return (
    <div
      onClick={() => onSelect(job)}
      className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-4 sm:p-5 transition-all duration-200 hover:border-emerald-500/50 hover:shadow-lg dark:hover:shadow-emerald-950/20 cursor-pointer shadow-sm"
    >
      <div>
        {/* Top meta tags */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider border",
                getSourceBadgeStyle(job.source)
              )}
            >
              {job.source}
            </span>
            <span className="text-[11px] text-zinc-400 font-medium">
              {job.dateGroup}
            </span>
          </div>

          {/* Quick analysis badge if available */}
          {analysis && (
            <div className="flex items-center gap-1.5 text-xs">
              {analysis.red_flag_check === "PASS" ? (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 rounded px-2 py-0.5 font-medium text-[11px]">
                  <ShieldCheck className="h-3 w-3" /> PASS ({analysis.match_score}/10)
                </span>
              ) : (
                <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 rounded px-2 py-0.5 font-medium text-[11px]">
                  <ShieldAlert className="h-3 w-3" /> FAIL
                </span>
              )}
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
          {job.title}
        </h3>

        {/* Plain English summary or raw excerpt */}
        <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
          {analysis?.plain_english_summary || job.description}
        </p>
      </div>

      {/* Card Footer */}
      <div className="mt-4 pt-3.5 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-0.5 text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-200">
            <DollarSign className="h-4 w-4 text-emerald-500 dark:text-emerald-400 -mr-0.5" />
            <span>{job.budget}</span>
          </div>

          {/* Direct Action Link */}
          <button
            onClick={handleOpenPlatform}
            className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950 px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/40 transition-colors"
            title="Opens gig in new tab & marks status as Applied"
          >
            <span>Open on {job.source}</span>
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>

        {/* Mobile touch-friendly Status Pill Selector */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex flex-wrap items-center gap-1 overflow-x-auto pb-0.5"
        >
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              onClick={() => onStatusChange(job.id, status)}
              className={cn(
                "rounded-md px-2 py-1 text-[11px] font-semibold border transition-all shrink-0",
                currentStatus === status
                  ? statusColors[status]
                  : "border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
