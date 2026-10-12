"use client";

import { useState } from "react";
import { X, RotateCcw, Check, Briefcase, Globe, DollarSign, Gauge, ShieldCheck, CheckCircle2, UserCheck } from "lucide-react";
import {
  FilterState,
  WorkType,
  WorkMode,
  CountryCode,
  DifficultyLevel,
  GigSource,
  EligibilityStrictness,
  JobItem,
} from "@/types/job";
import {
  ALL_WORK_TYPES,
  ALL_WORK_MODES,
  ALL_COUNTRIES,
  ALL_DIFFICULTIES,
  ALL_ELIGIBILITIES,
  ALL_PLATFORM_SOURCES,
  filterJobs,
  countActiveFilters,
} from "@/lib/filters";
import { cn } from "@/lib/utils";

interface MyntraFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApply: (newFilters: FilterState) => void;
  onReset: () => void;
  allJobs: JobItem[];
  trackedJobs: Record<string, any>;
}

type FilterCategoryKey =
  | "workType"
  | "workMode"
  | "currency"
  | "difficulty"
  | "platforms"
  | "eligibility"
  | "status"
  | "roles";

interface CategoryMeta {
  key: FilterCategoryKey;
  label: string;
  icon: any;
  badgeCount: (f: FilterState) => number;
}

export function MyntraFilterModal({
  isOpen,
  onClose,
  filters,
  onApply,
  onReset,
  allJobs,
  trackedJobs,
}: MyntraFilterModalProps) {
  const [draft, setDraft] = useState<FilterState>(filters);
  const [activeCategory, setActiveCategory] = useState<FilterCategoryKey>("workType");

  if (!isOpen) return null;

  const categories: CategoryMeta[] = [
    {
      key: "workType",
      label: "Types of Work",
      icon: Briefcase,
      badgeCount: (f) => f.workTypes.length,
    },
    {
      key: "workMode",
      label: "Work Mode (Location)",
      icon: Globe,
      badgeCount: (f) => f.workModes.length,
    },
    {
      key: "currency",
      label: "Country & Currency",
      icon: DollarSign,
      badgeCount: (f) => f.countries.length,
    },
    {
      key: "difficulty",
      label: "Difficulty Level",
      icon: Gauge,
      badgeCount: (f) => f.difficulties.length,
    },
    {
      key: "platforms",
      label: "Platforms",
      icon: Briefcase,
      badgeCount: (f) => f.platforms.length,
    },
    {
      key: "eligibility",
      label: "Eligibility Criteria",
      icon: ShieldCheck,
      badgeCount: (f) => f.eligibilities.length,
    },
    {
      key: "status",
      label: "Live Openings Status",
      icon: CheckCircle2,
      badgeCount: (f) => (f.openOnly ? 1 : 0),
    },
    {
      key: "roles",
      label: "Roles",
      icon: UserCheck,
      badgeCount: (f) => f.roles.length,
    },
  ];

  // Live match preview count based on current draft
  const previewMatchCount = filterJobs(allJobs, draft, trackedJobs).length;
  const activeCount = countActiveFilters(draft);

  // Toggle helpers
  const toggleItem = <T,>(arr: T[], item: T): T[] => {
    return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
  };

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  const handleReset = () => {
    onReset();
    setDraft({
      workTypes: [],
      workModes: [],
      countries: [],
      difficulties: [],
      platforms: [],
      eligibilities: [],
      openOnly: false,
      roles: [],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-950 w-full h-full sm:h-[85vh] sm:max-w-2xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="px-4 sm:px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/80 dark:bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-100 uppercase">
              Filter Opportunities
            </h2>
            {activeCount > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-zinc-950">
                {activeCount} active
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="text-xs font-bold text-zinc-500 hover:text-rose-500 dark:text-zinc-400 dark:hover:text-rose-400 flex items-center gap-1 px-2 py-1 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Myntra-style Split Pane (Left Category Sidebar, Right Selection Pane) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Category Sidebar */}
          <div className="w-2/5 sm:w-1/3 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 overflow-y-auto">
            {categories.map((cat) => {
              const count = cat.badgeCount(draft);
              const isSelected = activeCategory === cat.key;
              const Icon = cat.icon;

              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={cn(
                    "w-full text-left px-3 sm:px-4 py-3.5 flex items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-850/50 transition-colors cursor-pointer select-none",
                    isSelected
                      ? "bg-white dark:bg-zinc-950 border-l-4 border-l-emerald-500 font-extrabold text-zinc-900 dark:text-zinc-100 shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-medium"
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Icon className={cn("h-4 w-4 shrink-0", isSelected ? "text-emerald-500" : "text-zinc-400")} />
                    <span className="text-xs sm:text-sm truncate">{cat.label}</span>
                  </div>
                  {count > 0 && (
                    <span className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black flex items-center justify-center shrink-0">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Selection Content Pane */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-white dark:bg-zinc-950">
            {/* 1. Types of Work */}
            {activeCategory === "workType" && (
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">
                  Select Work Engagement
                </h3>
                {ALL_WORK_TYPES.map((wt) => {
                  const checked = draft.workTypes.includes(wt);
                  return (
                    <label
                      key={wt}
                      onClick={() => setDraft({ ...draft, workTypes: toggleItem(draft.workTypes, wt) })}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none",
                        checked
                          ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
                          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-800 dark:text-zinc-200"
                      )}
                    >
                      <span className="text-xs sm:text-sm font-bold">{wt}</span>
                      <div className={cn("h-5 w-5 rounded-md border flex items-center justify-center transition-colors", checked ? "bg-emerald-500 border-emerald-500 text-zinc-950" : "border-zinc-300 dark:border-zinc-700")}>
                        {checked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            {/* 2. Work Mode (Location) */}
            {activeCategory === "workMode" && (
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">
                  Location & Work Arrangement
                </h3>
                {ALL_WORK_MODES.map((wm) => {
                  const checked = draft.workModes.includes(wm);
                  return (
                    <label
                      key={wm}
                      onClick={() => setDraft({ ...draft, workModes: toggleItem(draft.workModes, wm) })}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none",
                        checked
                          ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
                          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-800 dark:text-zinc-200"
                      )}
                    >
                      <span className="text-xs sm:text-sm font-bold">{wm}</span>
                      <div className={cn("h-5 w-5 rounded-md border flex items-center justify-center transition-colors", checked ? "bg-emerald-500 border-emerald-500 text-zinc-950" : "border-zinc-300 dark:border-zinc-700")}>
                        {checked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            {/* 3. Currency & Region */}
            {activeCategory === "currency" && (
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">
                  Payout Currency & Region
                </h3>
                {ALL_COUNTRIES.map((c) => {
                  const checked = draft.countries.includes(c.code);
                  return (
                    <label
                      key={c.code}
                      onClick={() => setDraft({ ...draft, countries: toggleItem(draft.countries, c.code) })}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none",
                        checked
                          ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
                          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-800 dark:text-zinc-200"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{c.flag}</span>
                        <span className="text-xs sm:text-sm font-bold">{c.label}</span>
                      </div>
                      <div className={cn("h-5 w-5 rounded-md border flex items-center justify-center transition-colors", checked ? "bg-emerald-500 border-emerald-500 text-zinc-950" : "border-zinc-300 dark:border-zinc-700")}>
                        {checked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            {/* 4. Difficulty Level */}
            {activeCategory === "difficulty" && (
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">
                  Difficulty Level
                </h3>
                {ALL_DIFFICULTIES.map((d) => {
                  const checked = draft.difficulties.includes(d.level);
                  return (
                    <label
                      key={d.level}
                      onClick={() => setDraft({ ...draft, difficulties: toggleItem(draft.difficulties, d.level) })}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none",
                        checked
                          ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
                          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-800 dark:text-zinc-200"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span>{d.badge}</span>
                        <span className="text-xs sm:text-sm font-bold">{d.label}</span>
                      </div>
                      <div className={cn("h-5 w-5 rounded-md border flex items-center justify-center transition-colors", checked ? "bg-emerald-500 border-emerald-500 text-zinc-950" : "border-zinc-300 dark:border-zinc-700")}>
                        {checked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            {/* 5. Platforms */}
            {activeCategory === "platforms" && (
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">
                  Source Platforms
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ALL_PLATFORM_SOURCES.map((plat) => {
                    const checked = draft.platforms.includes(plat);
                    const isIndian = plat === "Truelancer" || plat === "TapChief" || plat === "Hasjob" || plat === "WorknHire";
                    return (
                      <label
                        key={plat}
                        onClick={() => setDraft({ ...draft, platforms: toggleItem(draft.platforms, plat) })}
                        className={cn(
                          "flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer select-none",
                          checked
                            ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
                            : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-800 dark:text-zinc-200"
                        )}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-xs">{isIndian ? "🇮🇳" : "🇺🇸"}</span>
                          <span className="text-xs font-bold truncate">{plat}</span>
                        </div>
                        <div className={cn("h-4.5 w-4.5 rounded border flex items-center justify-center shrink-0 transition-colors", checked ? "bg-emerald-500 border-emerald-500 text-zinc-950" : "border-zinc-300 dark:border-zinc-700")}>
                          {checked && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 6. Eligibility Criteria */}
            {activeCategory === "eligibility" && (
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">
                  Screening & Background Strictness
                </h3>
                {ALL_ELIGIBILITIES.map((el) => {
                  const checked = draft.eligibilities.includes(el);
                  return (
                    <label
                      key={el}
                      onClick={() => setDraft({ ...draft, eligibilities: toggleItem(draft.eligibilities, el) })}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none",
                        checked
                          ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
                          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-800 dark:text-zinc-200"
                      )}
                    >
                      <span className="text-xs sm:text-sm font-bold">{el}</span>
                      <div className={cn("h-5 w-5 rounded-md border flex items-center justify-center transition-colors", checked ? "bg-emerald-500 border-emerald-500 text-zinc-950" : "border-zinc-300 dark:border-zinc-700")}>
                        {checked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            {/* 7. Live Status */}
            {activeCategory === "status" && (
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">
                  Opening Availability
                </h3>
                <label
                  onClick={() => setDraft({ ...draft, openOnly: !draft.openOnly })}
                  className={cn(
                    "flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none",
                    draft.openOnly
                      ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-800 dark:text-zinc-200"
                  )}
                >
                  <div>
                    <div className="text-xs sm:text-sm font-bold">Only Live & Open Openings</div>
                    <div className="text-[11px] text-zinc-400">Hide closed gigs and expired contracts</div>
                  </div>
                  <div className={cn("h-5 w-5 rounded-md border flex items-center justify-center transition-colors", draft.openOnly ? "bg-emerald-500 border-emerald-500 text-zinc-950" : "border-zinc-300 dark:border-zinc-700")}>
                    {draft.openOnly && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </div>
                </label>
              </div>
            )}

            {/* 8. Roles */}
            {activeCategory === "roles" && (
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">
                  Target Builder Role
                </h3>
                <label
                  onClick={() =>
                    setDraft({
                      ...draft,
                      roles: draft.roles.includes("Vibe Coder (0-to-1 Fast Builder)")
                        ? []
                        : ["Vibe Coder (0-to-1 Fast Builder)"],
                    })
                  }
                  className={cn(
                    "flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none",
                    draft.roles.includes("Vibe Coder (0-to-1 Fast Builder)")
                      ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-800 dark:text-zinc-200"
                  )}
                >
                  <div>
                    <div className="text-xs sm:text-sm font-bold">Vibe Coder (0-to-1 Fast Builder)</div>
                    <div className="text-[11px] text-zinc-400">Fullstack Next.js, AI wrappers, MVPs, and rapid tools</div>
                  </div>
                  <div className={cn("h-5 w-5 rounded-md border flex items-center justify-center transition-colors", draft.roles.includes("Vibe Coder (0-to-1 Fast Builder)") ? "bg-emerald-500 border-emerald-500 text-zinc-950" : "border-zinc-300 dark:border-zinc-700")}>
                    {draft.roles.includes("Vibe Coder (0-to-1 Fast Builder)") && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </div>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Bottom Action Bar (Apply Button) */}
        <div className="p-3.5 sm:p-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex items-center justify-between gap-3">
          <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <span>{previewMatchCount} opportunities matching</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Apply Filters</span>
              <span className="px-1.5 py-0.5 rounded-full bg-zinc-950 text-emerald-400 text-[10px]">
                {previewMatchCount}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
