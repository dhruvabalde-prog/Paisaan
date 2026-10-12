"use client";

import { JobItem, JobStatus, TrackedJobData } from "@/types/job";
import { formatCrossCurrency, cn } from "@/lib/utils";
import {
  ExternalLink,
  Calendar,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Flame,
} from "lucide-react";

interface BigJobCardProps {
  job: JobItem;
  rank: number;
  tracked?: TrackedJobData;
  onSelect: (job: JobItem) => void;
  onStatusChange: (id: string, status: JobStatus) => void;
}

const STATUS_PILLS: JobStatus[] = ["New", "Applied", "Interviewing", "Won", "Skipped", "Closed"];

export function BigJobCard({
  job,
  rank,
  tracked,
  onSelect,
  onStatusChange,
}: BigJobCardProps) {
  const currentStatus: JobStatus = tracked?.status || "New";
  const isOpen = tracked?.isOpen ?? job.isOpen ?? true;
  const isIndian = job.country === "IN" || job.source === "Truelancer" || job.source === "TapChief" || job.source === "Hasjob" || job.source === "WorknHire";
  const currencyInfo = formatCrossCurrency(job.budget, isIndian);

  const getSourceInitial = (source: string) => {
    switch (source) {
      case "Upwork": return "U";
      case "Contra": return "C";
      case "Freelancer.com": return "F";
      case "Truelancer": return "TL";
      case "TapChief": return "TC";
      case "Hasjob": return "HJ";
      case "WorknHire": return "WH";
      case "RemoteOK": return "R";
      case "WeWorkRemotely": return "W";
      case "Hacker News Jobs": return "HN";
      default: return source.slice(0, 2).toUpperCase();
    }
  };

  const getAvatarBg = (source: string) => {
    switch (source) {
      case "Upwork": return "bg-emerald-600 text-white";
      case "Contra": return "bg-indigo-600 text-white";
      case "Freelancer.com": return "bg-sky-600 text-white";
      case "Truelancer": return "bg-teal-600 text-white";
      case "TapChief": return "bg-amber-600 text-white";
      case "Hasjob": return "bg-red-600 text-white";
      case "WorknHire": return "bg-cyan-600 text-white";
      case "RemoteOK": return "bg-blue-600 text-white";
      case "WeWorkRemotely": return "bg-rose-600 text-white";
      case "Hacker News Jobs": return "bg-orange-600 text-white";
      default: return "bg-zinc-700 text-white";
    }
  };

  return (
    <div
      onClick={() => onSelect(job)}
      className={cn(
        "group relative rounded-2xl border p-4 sm:p-5 transition-all duration-200 cursor-pointer shadow-sm flex flex-col justify-between gap-3.5",
        "bg-white dark:bg-zinc-900/70 border-zinc-200 dark:border-zinc-800/80 hover:border-emerald-500/60 hover:shadow-md dark:hover:shadow-emerald-950/20",
        !isOpen && "opacity-75 bg-zinc-50/50 dark:bg-zinc-950/50"
      )}
    >
      {/* Top Bar: Rank Tag, Platform info & Forex Payout Pill */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {/* Top Rank Badge */}
          <span className="flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            {rank <= 3 ? <Flame className="h-3 w-3 text-amber-500 fill-amber-500" /> : <TrendingUp className="h-3 w-3" />}
            #{rank}
          </span>

          {/* Platform Avatar & Flag */}
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                "h-6 w-6 rounded-lg flex items-center justify-center font-black text-[10px] shrink-0 shadow-xs",
                getAvatarBg(job.source)
              )}
            >
              {getSourceInitial(job.source)}
            </div>
            <span className="text-xs select-none">{isIndian ? "🇮🇳" : "🇺🇸"}</span>
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
              {job.source}
            </span>
          </div>

          {/* Difficulty pill */}
          {job.difficulty === "Hard" ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
              🔴 Hard
            </span>
          ) : job.difficulty === "Moderate" ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              🟡 Moderate
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              🟢 Easy
            </span>
          )}

          {/* Work Type chip */}
          {job.workType && (
            <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
              {job.workType}
            </span>
          )}

          {/* Work Mode chip */}
          {job.workMode && (
            <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40">
              {job.workMode}
            </span>
          )}
        </div>

        {/* Big Payout with Live Cross-Forex Conversion */}
        <div className="text-right">
          <div className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 leading-none">
            {currencyInfo.primary}
          </div>
          <div className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 mt-0.5">
            {currencyInfo.secondary}
          </div>
        </div>
      </div>

      {/* Main Listing Title & Expanded Description */}
      <div>
        <h3 className={cn(
          "text-sm sm:text-base font-extrabold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug line-clamp-2",
          !isOpen && "line-through text-zinc-400 dark:text-zinc-500"
        )}>
          {job.title}
        </h3>

        <p className="mt-1.5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 sm:line-clamp-3 leading-relaxed">
          {job.description}
        </p>
      </div>

      {/* Bottom Row: Metadata, Direct Platform Link, and Status Pills */}
      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-[11px] text-zinc-400">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {job.dateGroup}
            </span>
            <span className={cn(
              "font-bold px-1.5 py-0.5 rounded text-[10px]",
              isOpen ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60" : "text-zinc-500 bg-zinc-100 dark:bg-zinc-800"
            )}>
              {isOpen ? "● OPEN" : "✕ CLOSED"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={job.url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-[11px] font-bold text-zinc-700 dark:text-zinc-300 hover:text-emerald-500 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-750 px-2.5 py-1 rounded-lg transition-colors"
            >
              <span>Apply</span>
              <ExternalLink className="h-3 w-3" />
            </a>

            <button
              onClick={() => onSelect(job)}
              className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              <span>View & Pitch</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Status switcher pills directly on card */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 overflow-x-auto pb-0.5"
        >
          {STATUS_PILLS.map((st) => (
            <button
              key={st}
              onClick={() => onStatusChange(job.id, st)}
              className={cn(
                "text-[10px] px-2 py-1 rounded-lg font-bold border transition-colors shrink-0 cursor-pointer",
                currentStatus === st
                  ? st === "Closed"
                    ? "bg-rose-500 text-white border-rose-500"
                    : "bg-emerald-500 text-zinc-950 border-emerald-500 shadow-xs"
                  : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              {st}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
