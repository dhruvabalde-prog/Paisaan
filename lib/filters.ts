import {
  JobItem,
  FilterState,
  WorkType,
  WorkMode,
  CountryCode,
  DifficultyLevel,
  GigSource,
  EligibilityStrictness,
} from "@/types/job";

export const DEFAULT_FILTERS: FilterState = {
  workTypes: [],
  workModes: [],
  countries: [],
  difficulties: [],
  platforms: [],
  eligibilities: [],
  openOnly: false,
  roles: [],
};

export const ALL_WORK_TYPES: WorkType[] = [
  "Project-Based MVP",
  "Freelance Sprint",
  "Hourly Contract",
  "Full-Time Role",
];

export const ALL_WORK_MODES: WorkMode[] = [
  "100% Remote",
  "Hybrid",
  "In-Office",
];

export const ALL_COUNTRIES: { code: CountryCode; label: string; flag: string }[] = [
  { code: "IN", label: "India (₹ INR Payouts)", flag: "🇮🇳" },
  { code: "US", label: "Global / USA ($ USD Payouts)", flag: "🇺🇸" },
];

export const ALL_DIFFICULTIES: { level: DifficultyLevel; label: string; badge: string }[] = [
  { level: "Easy", label: "Easy (Rapid turnaround)", badge: "🟢" },
  { level: "Moderate", label: "Moderate (Fullstack / DB)", badge: "🟡" },
  { level: "Hard", label: "Hard (High complexity)", badge: "🔴" },
];

export const ALL_ELIGIBILITIES: EligibilityStrictness[] = [
  "Open to All (Portfolio First)",
  "Mid-Level (1+ Shipped Apps)",
  "Strict (Senior Screening)",
];

export const ALL_PLATFORM_SOURCES: GigSource[] = [
  "Upwork",
  "Contra",
  "Freelancer.com",
  "Truelancer",
  "TapChief",
  "Hasjob",
  "WorknHire",
  "RemoteOK",
  "WeWorkRemotely",
  "Hacker News Jobs",
];

export function countActiveFilters(filters: FilterState): number {
  return (
    filters.workTypes.length +
    filters.workModes.length +
    filters.countries.length +
    filters.difficulties.length +
    filters.platforms.length +
    filters.eligibilities.length +
    (filters.openOnly ? 1 : 0) +
    filters.roles.length
  );
}

export function filterJobs(jobs: JobItem[], filters: FilterState, trackedJobs: Record<string, any>): JobItem[] {
  return jobs.filter((job) => {
    // 1. Open only filter
    const isOpen = trackedJobs[job.id]?.isOpen ?? job.isOpen ?? true;
    if (filters.openOnly && !isOpen) {
      return false;
    }

    // 2. Work Types
    if (filters.workTypes.length > 0) {
      const wt = job.workType || "Project-Based MVP";
      if (!filters.workTypes.includes(wt)) return false;
    }

    // 3. Work Modes
    if (filters.workModes.length > 0) {
      const wm = job.workMode || "100% Remote";
      if (!filters.workModes.includes(wm)) return false;
    }

    // 4. Country / Currency
    if (filters.countries.length > 0) {
      const c = job.country || (job.source.includes("Truelancer") || job.source.includes("TapChief") || job.source.includes("Hasjob") || job.source.includes("WorknHire") ? "IN" : "US");
      if (!filters.countries.includes(c)) return false;
    }

    // 5. Difficulty
    if (filters.difficulties.length > 0) {
      const d = job.difficulty || "Easy";
      if (!filters.difficulties.includes(d)) return false;
    }

    // 6. Platforms
    if (filters.platforms.length > 0) {
      if (!filters.platforms.includes(job.source as GigSource)) return false;
    }

    // 7. Eligibility
    if (filters.eligibilities.length > 0) {
      const el = job.eligibility || "Open to All (Portfolio First)";
      if (!filters.eligibilities.includes(el)) return false;
    }

    return true;
  });
}
