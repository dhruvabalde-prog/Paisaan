export type PlatformCategory = "gigs" | "assets";

export type GigSource =
  | "Upwork"
  | "Contra"
  | "Freelancer.com"
  | "RemoteOK"
  | "WeWorkRemotely"
  | "Hacker News Jobs";

export type AssetSource =
  | "Acquire.com"
  | "Microns.io"
  | "Flippa"
  | "SideProjectors"
  | "CodeCanyon"
  | "Gumroad / Lemon Squeezy";

export type JobSource = GigSource | AssetSource;

export type JobStatus = "New" | "Applied" | "Interviewing" | "Won" | "Skipped";

export type DifficultyLevel = "Easy" | "Moderate" | "Hard";

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
  demoUrl?: string;
  notes?: string;
  revenue?: number; // USD
  analysis?: JobAnalysis;
  updatedAt: string;
}

export type ViewMode = "categories" | "platforms" | "statuses" | "difficulty";

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
