"use client";

import { ChevronRight } from "lucide-react";
import { JobItem, JobStatus, TrackedJobData, DifficultyLevel } from "@/types/job";
import { cn } from "@/lib/utils";

interface ChatTileProps {
  job: JobItem;
  tracked?: TrackedJobData;
  onSelect: (job: JobItem) => void;
}

export function ChatTile({ job, tracked, onSelect }: ChatTileProps) {
  const currentStatus: JobStatus = tracked?.status || "New";

  const getSourceInitial = (source: string) => {
    switch (source) {
      case "Upwork": return "U";
      case "Contra": return "C";
      case "Freelancer.com": return "F";
      case "RemoteOK": return "R";
      case "WeWorkRemotely": return "W";
      case "Hacker News Jobs": return "HN";
      case "Acquire.com": return "AQ";
      case "Microns.io": return "M";
      case "Flippa": return "FL";
      case "SideProjectors": return "SP";
      case "CodeCanyon": return "CC";
      case "Gumroad / Lemon Squeezy": return "G";
      default: return source.slice(0, 2).toUpperCase();
    }
  };

  const getAvatarBg = (source: string) => {
    switch (source) {
      case "Upwork": return "bg-emerald-600 text-white";
      case "Contra": return "bg-indigo-600 text-white";
      case "Freelancer.com": return "bg-sky-600 text-white";
      case "RemoteOK": return "bg-blue-600 text-white";
      case "WeWorkRemotely": return "bg-rose-600 text-white";
      case "Hacker News Jobs": return "bg-orange-600 text-white";
      case "Acquire.com": return "bg-blue-500 text-white";
      case "Microns.io": return "bg-purple-600 text-white";
      case "Flippa": return "bg-amber-600 text-white";
      case "SideProjectors": return "bg-emerald-700 text-white";
      case "CodeCanyon": return "bg-teal-600 text-white";
      case "Gumroad / Lemon Squeezy": return "bg-pink-600 text-white";
      default: return "bg-zinc-700 text-white";
    }
  };

  const difficultyConfig: Record<DifficultyLevel, { color: string; label: string }> = {
    Easy: { color: "bg-emerald-500 ring-emerald-500/30", label: "Easy" },
    Moderate: { color: "bg-amber-500 ring-amber-500/30", label: "Moderate" },
    Hard: { color: "bg-rose-500 ring-rose-500/30", label: "Hard" },
  };

  const diff = difficultyConfig[job.difficulty || "Easy"];

  return (
    <div
      onClick={() => onSelect(job)}
      className="group flex items-center justify-between gap-3 px-3.5 py-3 border-b border-zinc-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 active:bg-zinc-100 dark:active:bg-zinc-800 transition-colors cursor-pointer select-none"
    >
      {/* Left: Platform Avatar */}
      <div
        className={cn(
          "h-10 w-10 sm:h-11 sm:w-11 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-sm transition-transform group-hover:scale-105",
          getAvatarBg(job.source)
        )}
      >
        {getSourceInitial(job.source)}
      </div>

      {/* Center: Main details (Heading, Platform Name, Budget, Difficulty Button) */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center justify-between gap-2 mb-1">
          {/* Platform name, category & difficulty indicator */}
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-200 truncate">
              {job.source}
            </span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500">•</span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
              {job.budget}
            </span>

            {/* Difficulty Circular Badge */}
            <span
              className="flex items-center gap-1 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 pl-1"
              title={`Difficulty: ${diff.label}`}
            >
              <span className={cn("h-2.5 w-2.5 rounded-full ring-2 shrink-0", diff.color)} />
              <span className="hidden sm:inline-block">{diff.label}</span>
            </span>
          </div>

          {/* Date of posting */}
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 whitespace-nowrap shrink-0">
            {job.dateGroup}
          </span>
        </div>

        {/* Main Job / Asset Heading */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs sm:text-sm font-medium text-zinc-800 dark:text-zinc-300 truncate leading-snug">
            {job.title}
          </p>

          {/* Status badge */}
          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded border shrink-0 hidden sm:inline-block border-zinc-200 dark:border-zinc-800 text-zinc-500">
            {currentStatus}
          </span>
        </div>
      </div>

      {/* Right chevron indicator */}
      <ChevronRight className="h-4 w-4 text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 shrink-0 transition-transform group-hover:translate-x-0.5" />
    </div>
  );
}
