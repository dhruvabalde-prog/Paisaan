export type PlatformCategory = "gigs" | "assets";

export type GigSource =
  | "Upwork"
  | "Contra"
  | "Freelancer.com"
  | "RemoteOK"
  | "WeWorkRemotely"
  | "Hacker News Jobs"
  | "Truelancer"
  | "TapChief"
  | "Hasjob"
  | "WorknHire";

export type AssetSource =
  | "Acquire.com"
  | "Microns.io"
  | "Flippa"
  | "SideProjectors"
  | "CodeCanyon"
  | "Gumroad / Lemon Squeezy"
  | "Dukaan"
  | "Instamojo";

export type JobSource = GigSource | AssetSource;

export type JobStatus = "New" | "Applied" | "Interviewing" | "Won" | "Skipped" | "Closed";

export type DifficultyLevel = "Easy" | "Moderate" | "Hard";

export type CountryCode = "IN" | "US" | "GLOBAL";

export type WorkType = "Project-Based MVP" | "Freelance Sprint" | "Hourly Contract" | "Full-Time Role";

export type WorkMode = "100% Remote" | "Hybrid" | "In-Office";

export type EligibilityStrictness = "Open to All (Portfolio First)" | "Mid-Level (1+ Shipped Apps)" | "Strict (Senior Screening)";

export type BuilderRole = "Vibe Coder (0-to-1 Fast Builder)";

export interface JobItem {
  id: string;
  title: string;
  description: string;
  budget: string;
  source: JobSource;
  category: PlatformCategory;
  url: string;
  publishedAt: string;
  dateGroup: string; // e.g. "2026-10-12"
  difficulty: DifficultyLevel;
  country?: CountryCode;
  isOpen?: boolean; // Live opening vs Closed
  workType?: WorkType;
  workMode?: WorkMode;
  eligibility?: EligibilityStrictness;
  role?: BuilderRole;
}

export interface FilterState {
  workTypes: WorkType[];
  workModes: WorkMode[];
  countries: CountryCode[];
  difficulties: DifficultyLevel[];
  platforms: GigSource[];
  eligibilities: EligibilityStrictness[];
  statuses: JobStatus[];
  openOnly: boolean;
  roles: BuilderRole[];
}

export interface AnalysisBlueprintScreen {
  title: string;
  description: string;
}

export interface JobAnalysis {
  plain_english_summary: string;
  red_flag_check: "PASS" | "FAIL";
  red_flag_reason?: string;
  match_score: number; // 1-10
  difficulty?: DifficultyLevel;
  three_screen_blueprint: AnalysisBlueprintScreen[];
  client_pitch: string;
  v0_prompt: string;
  suggested_bid: string;
}

export interface TrackedJobData {
  status: JobStatus;
  isOpen?: boolean; // Live open vs closed status
  demoUrl?: string;
  notes?: string;
  revenue?: number; // In currency
  analysis?: JobAnalysis;
  updatedAt: string;
}

export type ViewMode = "easy" | "platforms" | "difficulty" | "statuses";

export interface PlatformMeta {
  name: string;
  category: PlatformCategory;
  allowsSelling?: boolean;
  allowsHiring?: boolean;
  tagline: string;
  badgeBg: string;
  badgeText: string;
  website: string;
}
