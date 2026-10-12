"use client";

import { useState, useEffect, useMemo } from "react";
import {
  RefreshCw,
  Search,
  FolderTree,
  ListFilter,
  Gauge,
  Zap,
  Sparkles,
} from "lucide-react";
import { PaisaanLogo } from "@/components/PaisaanLogo";
import { JobItem, JobStatus, ViewMode, DifficultyLevel, GigSource } from "@/types/job";
import { useJobStorage } from "@/hooks/useJobStorage";
import { FolderSection } from "@/components/FolderSection";
import { JobDetailPage } from "@/components/JobDetailPage";
import { SettingsPage } from "@/components/SettingsPage";
import { BigJobCard } from "@/components/BigJobCard";
import { cn, parseBudgetUSD } from "@/lib/utils";

const WORK_PLATFORMS: GigSource[] = [
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

const ALL_STATUS_NAMES: JobStatus[] = [
  "New",
  "Applied",
  "Interviewing",
  "Won",
  "Skipped",
  "Closed",
];

export default function Dashboard() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeJob, setActiveJob] = useState<JobItem | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // View Mode: 'easy' (Home / Landing) | 'platforms' | 'difficulty' | 'statuses'
  const [activeView, setActiveView] = useState<ViewMode>("easy");

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
    setIsOpen,
    setAnalysis,
    setDemoUrl,
    setNotes,
    setRevenue,
    broadcastReload,
  } = useJobStorage(userGoogle?.email);

  // Load user session and listen for Supabase Google OAuth callback
  useEffect(() => {
    try {
      const stored = localStorage.getItem("paisaan_user_google");
      if (stored) {
        setUserGoogle(JSON.parse(stored));
      }
    } catch {}

    // Check Supabase session returned from Google OAuth
    import("@/lib/supabase").then(({ supabase }) => {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session?.user) {
          const u = {
            name: data.session.user.user_metadata?.full_name || data.session.user.email?.split("@")[0] || "User",
            email: data.session.user.email || "",
            avatar: data.session.user.user_metadata?.avatar_url,
          };
          setUserGoogle(u);
          localStorage.setItem("paisaan_user_google", JSON.stringify(u));
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const u = {
            name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "User",
            email: session.user.email || "",
            avatar: session.user.user_metadata?.avatar_url,
          };
          setUserGoogle(u);
          localStorage.setItem("paisaan_user_google", JSON.stringify(u));
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    });
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

  // Re-fetch automatically on window focus and on remote multi-device reload broadcast
  useEffect(() => {
    fetchJobs();

    const handleFocus = () => {
      fetchJobs();
    };
    const handleRemoteReload = () => {
      fetchJobs();
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("paisaan_remote_reload", handleRemoteReload);
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("paisaan_remote_reload", handleRemoteReload);
    };
  }, []);

  const handleManualRefresh = () => {
    fetchJobs();
    broadcastReload();
  };

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

  // LANDING PAGE: All Easy Work arranged in descending order of payout (USD & INR normalized via live forex)
  const rankedEasyJobs = useMemo(() => {
    const easyOnly = searchableJobs.filter((j) => (j.difficulty || "Easy") === "Easy");
    return [...easyOnly].sort((a, b) => {
      const isIndianA = a.country === "IN" || a.source === "Truelancer" || a.source === "TapChief" || a.source === "Hasjob" || a.source === "WorknHire";
      const isIndianB = b.country === "IN" || b.source === "Truelancer" || b.source === "TapChief" || b.source === "Hasjob" || b.source === "WorknHire";
      const valA = parseBudgetUSD(a.budget, isIndianA);
      const valB = parseBudgetUSD(b.budget, isIndianB);
      return valB - valA; // Descending order: highest paying easy job on top
    });
  }, [searchableJobs]);

  // Groupings for View 1: Platforms View (Upwork, Contra, Freelancer, RemoteOK, WWR, HN)
  const platformGroups = useMemo(() => {
    const map: Record<string, JobItem[]> = {};
    for (const name of WORK_PLATFORMS) {
      map[name] = searchableJobs.filter((j) => j.source === name);
    }
    return map;
  }, [searchableJobs]);

  // Groupings for View 2: Difficulty View (Easy, Moderate, Hard)
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

  // Groupings for View 3: Statuses View (New, Applied, Won, Skipped, Closed)
  const statusGroups = useMemo(() => {
    const map: Record<JobStatus, JobItem[]> = {
      New: [],
      Applied: [],
      Interviewing: [],
      Won: [],
      Skipped: [],
      Closed: [],
    };
    for (const j of searchableJobs) {
      const isActuallyClosed = trackedJobs[j.id]?.isOpen === false || trackedJobs[j.id]?.status === "Closed" || j.isOpen === false;
      const st = isActuallyClosed ? "Closed" : (trackedJobs[j.id]?.status || "New");
      map[st].push(j);
    }
    return map;
  }, [searchableJobs, trackedJobs]);

  // Count open and closed opportunities
  const liveStats = useMemo(() => {
    let openCount = 0;
    let closedCount = 0;
    for (const j of searchableJobs) {
      const isOpen = trackedJobs[j.id]?.isOpen ?? j.isOpen ?? true;
      if (isOpen && trackedJobs[j.id]?.status !== "Closed") {
        openCount++;
      } else {
        closedCount++;
      }
    }
    return { openCount, closedCount };
  }, [searchableJobs, trackedJobs]);

  // Full-page Detail View
  if (activeJob) {
    return (
      <JobDetailPage
        job={activeJob}
        tracked={trackedJobs[activeJob.id]}
        onBack={() => setActiveJob(null)}
        onStatusChange={setStatus}
        onToggleOpen={setIsOpen}
        onUpdateDemoUrl={setDemoUrl}
        onUpdateNotes={setNotes}
        onUpdateRevenue={setRevenue}
        onSaveAnalysis={setAnalysis}
      />
    );
  }

  // Full-page Settings View
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
      {/* Clean Header */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md px-3 sm:px-6 py-2.5">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          {/* Brand Logo & Name with crisp white & green money icon */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2.5 group text-left p-1 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            title="Open Settings & Profile"
          >
            <PaisaanLogo className="h-8 w-8" />
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

          {/* Right Header: Live Openings Stat & Refresh Button */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{liveStats.openCount} Open</span>
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <span className="text-zinc-500 dark:text-zinc-400">
                {liveStats.closedCount} Closed
              </span>
            </div>

            {/* Refresh Button (Broadcasts to all devices) */}
            <button
              onClick={handleManualRefresh}
              disabled={loading}
              className="p-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:text-emerald-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer"
              title="Refresh Listings & Sync Devices"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto w-full flex-1 flex flex-col bg-white dark:bg-zinc-950 border-x border-zinc-200/80 dark:border-zinc-800/80 min-h-[calc(100vh-53px)]">
        {/* Top View Mode Pills Bar & Search Toolbar */}
        <div className="p-3 sm:p-4 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/40 space-y-3">
          {/* 4 View Switcher Pills: Easy Work (Landing) | Platforms | Difficulty | Statuses */}
          <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-zinc-200/70 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setActiveView("easy")}
              className={cn(
                "flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                activeView === "easy"
                  ? "bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
              title="Home: All Easy Work ranked descending by payout"
            >
              <Zap className="h-3.5 w-3.5 shrink-0 text-emerald-500 fill-emerald-500" />
              <span className="truncate">Easy Work</span>
            </button>

            <button
              onClick={() => setActiveView("platforms")}
              className={cn(
                "flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                activeView === "platforms"
                  ? "bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              <FolderTree className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Platforms</span>
            </button>

            <button
              onClick={() => setActiveView("difficulty")}
              className={cn(
                "flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                activeView === "difficulty"
                  ? "bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              <Gauge className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Difficulty</span>
            </button>

            <button
              onClick={() => setActiveView("statuses")}
              className={cn(
                "flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                activeView === "statuses"
                  ? "bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              <ListFilter className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Statuses</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search across all client gigs & opportunities..."
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
              <span className="text-xs font-semibold">Streaming client opportunities...</span>
            </div>
          ) : (
            <>
              {/* PRIMARY LANDING PAGE: ALL EASY WORK RANKED DESCENDING BY PAYOUT */}
              {activeView === "easy" && (
                <div className="p-3.5 sm:p-5 flex flex-col gap-4">
                  {/* Landing Header Banner */}
                  <div className="flex items-center justify-between pb-1">
                    <div>
                      <h2 className="text-sm sm:text-base font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <span>Top Paying Easy Gigs</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {rankedEasyJobs.length} live
                        </span>
                      </h2>
                      <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Arranged in descending order of payout across global ($) and Indian (₹) markets.
                      </p>
                    </div>

                    <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
                      <span>Forex: 1 USD ≈ 86.5 INR</span>
                    </div>
                  </div>

                  {/* Bigger Tiles Grid with More Details */}
                  {rankedEasyJobs.length === 0 ? (
                    <div className="py-16 text-center text-xs text-zinc-400">
                      No easy jobs match your search query.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3.5">
                      {rankedEasyJobs.map((job, idx) => (
                        <BigJobCard
                          key={job.id}
                          job={job}
                          rank={idx + 1}
                          tracked={trackedJobs[job.id]}
                          onSelect={setActiveJob}
                          onStatusChange={setStatus}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* VIEW 1: PLATFORMS VIEW (Work Platforms Only) */}
              {activeView === "platforms" && (
                <div>
                  {WORK_PLATFORMS.map((platName) => {
                    const platJobs = platformGroups[platName] || [];
                    return (
                      <FolderSection
                        key={platName}
                        title={platName}
                        count={platJobs.length}
                        defaultOpen={platName === "Upwork" || platName === "Contra" || platName === "WeWorkRemotely"}
                        jobs={platJobs}
                        trackedJobs={trackedJobs}
                        onSelectJob={setActiveJob}
                      />
                    );
                  })}
                </div>
              )}

              {/* VIEW 2: DIFFICULTY VIEW (Easy, Moderate, Hard) */}
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

              {/* VIEW 3: STATUSES VIEW (Pipeline Folders) */}
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
            </>
          )}
        </div>
      </main>
    </div>
  );
}
