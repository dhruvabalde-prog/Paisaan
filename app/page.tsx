"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Banknote,
  RefreshCw,
  Search,
  Layers,
  FolderTree,
  ListFilter,
  Gauge,
} from "lucide-react";
import { JobItem, JobStatus, ViewMode, DifficultyLevel } from "@/types/job";
import { useJobStorage } from "@/hooks/useJobStorage";
import { FolderSection } from "@/components/FolderSection";
import { JobDetailPage } from "@/components/JobDetailPage";
import { SettingsPage } from "@/components/SettingsPage";
import { cn } from "@/lib/utils";

const ALL_PLATFORM_NAMES = [
  "Upwork",
  "Contra",
  "Freelancer.com",
  "RemoteOK",
  "WeWorkRemotely",
  "Hacker News Jobs",
  "Acquire.com",
  "Microns.io",
  "Flippa",
  "SideProjectors",
  "CodeCanyon",
  "Gumroad / Lemon Squeezy",
];

const ALL_STATUS_NAMES: JobStatus[] = [
  "New",
  "Applied",
  "Interviewing",
  "Won",
  "Skipped",
];

const ALL_DIFFICULTIES: DifficultyLevel[] = ["Easy", "Moderate", "Hard"];

export default function Dashboard() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeJob, setActiveJob] = useState<JobItem | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // View Mode: 'categories' | 'platforms' | 'statuses' | 'difficulty'
  const [activeView, setActiveView] = useState<ViewMode>("categories");

  // Search query
  const [searchQuery, setSearchQuery] = useState("");

  // User profile
  const [userGoogle, setUserGoogle] = useState<{
    name: string;
    email: string;
    avatar?: string;
  } | null>(null);

  const {
    trackedJobs,
    isHydrated,
    setStatus,
    setAnalysis,
    setDemoUrl,
    setNotes,
    setRevenue,
  } = useJobStorage();

  // Load user session
  useEffect(() => {
    try {
      const stored = localStorage.getItem("paisaan_user_google");
      if (stored) {
        setUserGoogle(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const handleUserUpdate = (u: { name: string; email: string; avatar?: string } | null) => {
    setUserGoogle(u);
    try {
      if (u) {
        localStorage.setItem("paisaan_user_google", JSON.stringify(u));
      } else {
        localStorage.removeItem("paisaan_user_google");
      }
    } catch {}
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      if (data.jobs) {
        setJobs(data.jobs);
      }
    } catch (e) {
      console.error("Failed to fetch jobs:", e);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch automatically whenever the window regains focus or opens
  useEffect(() => {
    fetchJobs();

    const handleFocus = () => {
      fetchJobs();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  // Filter listings based on search query
  const searchableJobs = useMemo(() => {
    if (!searchQuery.trim()) return jobs;
    const q = searchQuery.toLowerCase();
    return jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q) ||
        j.source.toLowerCase().includes(q) ||
        j.budget.toLowerCase().includes(q)
    );
  }, [jobs, searchQuery]);

  // Groupings for View 1: Gigs & Asset Stores Folders
  const categoryGroups = useMemo(() => {
    const gigs = searchableJobs.filter((j) => j.category === "gigs");
    const assets = searchableJobs.filter((j) => j.category === "assets");
    return { gigs, assets };
  }, [searchableJobs]);

  // Groupings for View 2: Platform Folders
  const platformGroups = useMemo(() => {
    const map: Record<string, JobItem[]> = {};
    for (const name of ALL_PLATFORM_NAMES) {
      map[name] = searchableJobs.filter((j) => j.source === name);
    }
    return map;
  }, [searchableJobs]);

  // Groupings for View 3: Status Folders
  const statusGroups = useMemo(() => {
    const map: Record<JobStatus, JobItem[]> = {
      New: [],
      Applied: [],
      Interviewing: [],
      Won: [],
      Skipped: [],
    };
    for (const j of searchableJobs) {
      const st = trackedJobs[j.id]?.status || "New";
      map[st].push(j);
    }
    return map;
  }, [searchableJobs, trackedJobs]);

  // Groupings for View 4: Difficulty Folders (Easy, Moderate, Hard)
  const difficultyGroups = useMemo(() => {
    const map: Record<DifficultyLevel, JobItem[]> = {
      Easy: [],
      Moderate: [],
      Hard: [],
    };
    for (const j of searchableJobs) {
      const diff = j.difficulty || "Easy";
      map[diff].push(j);
    }
    return map;
  }, [searchableJobs]);

  // If a listing is open, render Full-Page Job Detail View
  if (activeJob) {
    return (
      <JobDetailPage
        job={activeJob}
        tracked={trackedJobs[activeJob.id]}
        onBack={() => setActiveJob(null)}
        onStatusChange={setStatus}
        onUpdateDemoUrl={setDemoUrl}
        onUpdateNotes={setNotes}
        onUpdateRevenue={setRevenue}
        onSaveAnalysis={setAnalysis}
      />
    );
  }

  // If Settings is open, render Full-Page Settings View
  if (isSettingsOpen) {
    return (
      <SettingsPage
        onBack={() => setIsSettingsOpen(false)}
        jobs={jobs}
        userGoogle={userGoogle}
        onUserUpdate={handleUserUpdate}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      {/* Clean Minimalist Header */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md px-3 sm:px-6 py-2.5">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          {/* Brand Logo & Name with Banknote Icon inside green symbol */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2.5 group text-left p-1 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            title="Open Settings & Profile"
          >
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Banknote className="h-4 w-4 text-zinc-950 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black tracking-tight text-zinc-900 dark:text-zinc-100 leading-none">
                PAISAAN
              </span>
              {userGoogle ? (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold truncate max-w-[140px]">
                  {userGoogle.name}
                </span>
              ) : null}
            </div>
          </button>

          {/* Refresh Button (Only symbol) */}
          <button
            onClick={fetchJobs}
            disabled={loading}
            className="p-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:text-emerald-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer"
            title="Refresh Listings"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto w-full flex-1 flex flex-col bg-white dark:bg-zinc-950 border-x border-zinc-200/80 dark:border-zinc-800/80 min-h-[calc(100vh-53px)]">
        {/* Top View Mode Pills Bar & Search Toolbar */}
        <div className="p-3 sm:p-4 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/40 space-y-3">
          {/* Asana-style 4 View Switcher Pills */}
          <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-zinc-200/70 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setActiveView("categories")}
              className={cn(
                "flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer",
                activeView === "categories"
                  ? "bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              <Layers className="h-3 w-3 shrink-0" />
              <span className="truncate">Categories</span>
            </button>

            <button
              onClick={() => setActiveView("platforms")}
              className={cn(
                "flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer",
                activeView === "platforms"
                  ? "bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              <FolderTree className="h-3 w-3 shrink-0" />
              <span className="truncate">Platforms</span>
            </button>

            <button
              onClick={() => setActiveView("statuses")}
              className={cn(
                "flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer",
                activeView === "statuses"
                  ? "bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              <ListFilter className="h-3 w-3 shrink-0" />
              <span className="truncate">Statuses</span>
            </button>

            <button
              onClick={() => setActiveView("difficulty")}
              className={cn(
                "flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer",
                activeView === "difficulty"
                  ? "bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              <Gauge className="h-3 w-3 shrink-0" />
              <span className="truncate">Difficulty</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search across all opportunities & assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none shadow-xs"
            />
          </div>
        </div>

        {/* View Content Streams */}
        <div className="flex-1">
          {loading && jobs.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center gap-2 text-zinc-400">
              <RefreshCw className="h-6 w-6 animate-spin text-emerald-500" />
              <span className="text-xs font-semibold">Streaming opportunities...</span>
            </div>
          ) : (
            <>
              {/* VIEW 1: CATEGORIES VIEW */}
              {activeView === "categories" && (
                <div>
                  <FolderSection
                    title="Gigs & Client Projects"
                    badge="Clients Hiring"
                    count={categoryGroups.gigs.length}
                    defaultOpen={true}
                    jobs={categoryGroups.gigs}
                    trackedJobs={trackedJobs}
                    onSelectJob={setActiveJob}
                  />

                  <FolderSection
                    title="Asset Stores & Micro-SaaS"
                    badge="Product Sales"
                    count={categoryGroups.assets.length}
                    defaultOpen={true}
                    jobs={categoryGroups.assets}
                    trackedJobs={trackedJobs}
                    onSelectJob={setActiveJob}
                  />
                </div>
              )}

              {/* VIEW 2: PLATFORMS VIEW */}
              {activeView === "platforms" && (
                <div>
                  {ALL_PLATFORM_NAMES.map((platName) => {
                    const platJobs = platformGroups[platName] || [];
                    return (
                      <FolderSection
                        key={platName}
                        title={platName}
                        badge={platName === "Contra" ? "Gigs + Assets" : undefined}
                        count={platJobs.length}
                        defaultOpen={platName === "Upwork" || platName === "Acquire.com"}
                        jobs={platJobs}
                        trackedJobs={trackedJobs}
                        onSelectJob={setActiveJob}
                      />
                    );
                  })}
                </div>
              )}

              {/* VIEW 3: STATUSES VIEW */}
              {activeView === "statuses" && (
                <div>
                  {ALL_STATUS_NAMES.map((st) => {
                    const stJobs = statusGroups[st] || [];
                    return (
                      <FolderSection
                        key={st}
                        title={st}
                        badge={st === "Won" ? "Revenue Log" : undefined}
                        count={stJobs.length}
                        defaultOpen={st === "New" || st === "Applied"}
                        jobs={stJobs}
                        trackedJobs={trackedJobs}
                        onSelectJob={setActiveJob}
                      />
                    );
                  })}
                </div>
              )}

              {/* VIEW 4: DIFFICULTY VIEW (Easy, Moderate, Hard) */}
              {activeView === "difficulty" && (
                <div>
                  <FolderSection
                    title="Easy Tasks & Rapid MVPs"
                    badge="Green • Fast turnaround"
                    colorClass="bg-emerald-500"
                    count={difficultyGroups.Easy.length}
                    defaultOpen={true}
                    jobs={difficultyGroups.Easy}
                    trackedJobs={trackedJobs}
                    onSelectJob={setActiveJob}
                  />

                  <FolderSection
                    title="Moderate Applications"
                    badge="Yellow • Fullstack & DB"
                    colorClass="bg-amber-500"
                    count={difficultyGroups.Moderate.length}
                    defaultOpen={true}
                    jobs={difficultyGroups.Moderate}
                    trackedJobs={trackedJobs}
                    onSelectJob={setActiveJob}
                  />

                  <FolderSection
                    title="Hard & Complex Projects"
                    badge="Red • High complexity"
                    colorClass="bg-rose-500"
                    count={difficultyGroups.Hard.length}
                    defaultOpen={true}
                    jobs={difficultyGroups.Hard}
                    trackedJobs={trackedJobs}
                    onSelectJob={setActiveJob}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
