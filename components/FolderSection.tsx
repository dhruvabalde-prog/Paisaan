"use client";

import { useState } from "react";
import { Folder, ChevronRight, ChevronDown } from "lucide-react";
import { JobItem, TrackedJobData } from "@/types/job";
import { ChatTile } from "@/components/ChatTile";

interface FolderSectionProps {
  title: string;
  count: number;
  badge?: string;
  colorClass?: string;
  defaultOpen?: boolean;
  jobs: JobItem[];
  trackedJobs: Record<string, TrackedJobData>;
  onSelectJob: (job: JobItem) => void;
}

export function FolderSection({
  title,
  count,
  badge,
  colorClass = "bg-emerald-500",
  defaultOpen = false,
  jobs,
  trackedJobs,
  onSelectJob,
}: FolderSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-zinc-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-950">
      {/* Folder Header Row */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors text-left select-none"
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center shrink-0">
            <Folder className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {title}
              </span>
              {badge && (
                <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                  {badge}
                </span>
              )}
            </div>
            <span className="text-[11px] text-zinc-400">
              {count} {count === 1 ? "listing" : "listings"} available
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500">
            {count}
          </span>
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-zinc-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-zinc-400" />
          )}
        </div>
      </button>

      {/* Expanded Inner Stream (WhatsApp Chat Tiles) */}
      {isOpen && (
        <div className="pl-3 sm:pl-4 border-l-2 border-emerald-500/40 divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-zinc-50/30 dark:bg-zinc-900/20">
          {jobs.length === 0 ? (
            <div className="py-4 text-xs text-zinc-400 px-4">
              No listings currently in this folder.
            </div>
          ) : (
            jobs.map((job) => (
              <ChatTile
                key={job.id}
                job={job}
                tracked={trackedJobs[job.id]}
                onSelect={onSelectJob}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
