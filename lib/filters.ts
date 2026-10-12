import {
  JobItem,
  FilterState,
  WorkType,
  WorkMode,
  CountryCode,
  DifficultyLevel,
  GigSource,
  EligibilityStrictness,
  JobStatus,
} from "@/types/job";

export const DEFAULT_FILTERS: FilterState = {
  workTypes: [],
  workModes: [],
  countries: [],
  difficulties: [],
  platforms: [],
  eligibilities: [],
  statuses: [],
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

export const ALL_STATUS_OPTIONS: JobStatus[] = [
  "New",
  "Applied",
  "Interviewing",
  "Won",
  "Skipped",
  "Closed",
];

export const INDIAN_PLATFORMS: GigSource[] = [
  "Truelancer",
  "TapChief",
  "Hasjob",
  "WorknHire",
];

export const GLOBAL_PLATFORMS: GigSource[] = [
  "Upwork",
  "Contra",
  "Freelancer.com",
  "RemoteOK",
  "WeWorkRemotely",
  "Hacker News Jobs",
];

export const ALL_PLATFORM_SOURCES: GigSource[] = [
  ...INDIAN_PLATFORMS,
  ...GLOBAL_PLATFORMS,
];

/**
 * Returns available platforms dynamically dependent on selected country filter.
 * If user selected only India -> returns only Indian platforms.
 * If user selected only USA/Global -> returns only Global platforms.
 * If both or none selected -> returns all platforms.
 */
export function getDependentPlatforms(selectedCountries: CountryCode[]): GigSource[] {
  if (selectedCountries.length === 1) {
    if (selectedCountries[0] === "IN") {
      return INDIAN_PLATFORMS;
    }
    if (selectedCountries[0] === "US") {
      return GLOBAL_PLATFORMS;
    }
  }
  return ALL_PLATFORM_SOURCES;
}

export function countActiveFilters(filters: FilterState): number {
  return (
    filters.workTypes.length +
    filters.workModes.length +
    filters.countries.length +
    filters.difficulties.length +
    filters.platforms.length +
    filters.eligibilities.length +
    filters.statuses.length +
    (filters.openOnly ? 1 : 0) +
    filters.roles.length
  );
}

/**
 * Core filtering function that filters jobs by filter state.
 */
export function filterJobs(jobs: JobItem[], filters: FilterState, trackedJobs: Record<string, any>): JobItem[] {
  return jobs.filter((job) => {
    const isJobIndian =
      job.country === "IN" ||
      job.source === "Truelancer" ||
      job.source === "TapChief" ||
      job.source === "Hasjob" ||
      job.source === "WorknHire";

    // 1. Open only filter
    const isClosed = trackedJobs[job.id]?.isOpen === false || trackedJobs[job.id]?.status === "Closed" || job.isOpen === false;
    const isOpen = !isClosed;
    if (filters.openOnly && !isOpen) {
      return false;
    }

    // 2. Status filter
    if (filters.statuses.length > 0) {
      const currentSt = isClosed ? "Closed" : (trackedJobs[job.id]?.status || "New");
      if (!filters.statuses.includes(currentSt)) {
        return false;
      }
    }

    // 3. Country / Currency filter
    if (filters.countries.length > 0) {
      const jobCountry: CountryCode = isJobIndian ? "IN" : "US";
      if (!filters.countries.includes(jobCountry)) return false;
    }

    // 4. Platform filter
    if (filters.platforms.length > 0) {
      if (!filters.platforms.includes(job.source as GigSource)) return false;
    }

    // 5. Difficulty filter
    if (filters.difficulties.length > 0) {
      const d = job.difficulty || "Easy";
      if (!filters.difficulties.includes(d)) return false;
    }

    // 6. Work Types filter
    if (filters.workTypes.length > 0) {
      const wt = job.workType || "Project-Based MVP";
      if (!filters.workTypes.includes(wt)) return false;
    }

    // 7. Work Modes filter
    if (filters.workModes.length > 0) {
      const wm = job.workMode || "100% Remote";
      if (!filters.workModes.includes(wm)) return false;
    }

    // 8. Eligibility filter
    if (filters.eligibilities.length > 0) {
      const el = job.eligibility || "Open to All (Portfolio First)";
      if (!filters.eligibilities.includes(el)) return false;
    }

    return true;
  });
}

/**
 * Calculates dynamic counts for any specific option based on the remaining filters,
 * exactly as Myntra does (faceted search counts).
 */
export function getFacetCount(
  jobs: JobItem[],
  currentFilters: FilterState,
  trackedJobs: Record<string, any>,
  category: keyof FilterState,
  optionValue: any
): number {
  const simulatedFilters: FilterState = {
    ...currentFilters,
    [category]: [optionValue],
  };
  return filterJobs(jobs, simulatedFilters, trackedJobs).length;
}
