"use client";

import { useState, useEffect, useMemo } from "react";
import {
  RefreshCw,
  Search,
  SlidersHorizontal,
  Flame,
  RotateCcw,
} from "lucide-react";
import { PaisaanLogo } from "@/components/PaisaanLogo";
import { JobItem, JobStatus, FilterState } from "@/types/job";
import { useJobStorage } from "@/hooks/useJobStorage";
import { JobDetailPage } from "@/components/JobDetailPage";
import { SettingsPage } from "@/components/SettingsPage";
import { BigJobCard } from "@/components/BigJobCard";
import { MyntraFilterModal } from "@/components/MyntraFilterModal";
import { filterJobs, countActiveFilters, DEFAULT_FILTERS } from "@/lib/filters";
import { cn, parseBudgetUSD } from "@/lib/utils";

export default function Dashboard() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeJob, setActiveJob] = useState<JobItem | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Search query
  const [searchQuery, setSearchQuery] = useState("");

  // Myntra-style Filter Engine State
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

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

  // Active filter count for badge
  const activeFilterCount = useMemo(() => countActiveFilters(filters), [filters]);

  // 1. Filter listings based on Myntra Filter Engine
  const filterMatchedJobs = useMemo(() => {
    return filterJobs(jobs, filters, trackedJobs);
  }, [jobs, filters, trackedJobs]);

  // 2. Filter listings based on text search query
  const searchableJobs = useMemo(() => {
    if (!searchQuery.trim()) return filterMatchedJobs;
    const q = searchQuery.toLowerCase();
    return filterMatchedJobs.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q) ||
        j.source.toLowerCase().includes(q) ||
        j.budget.toLowerCase().includes(q) ||
        (j.workType && j.workType.toLowerCase().includes(q)) ||
        (j.workMode && j.workMode.toLowerCase().includes(q))
    );
  }, [filterMatchedJobs, searchQuery]);

  // 3. Normalized Forex Ranking: Sorted in descending order of payout
  const rankedJobs = useMemo(() => {
    return [...searchableJobs].sort((a, b) => {
      const isIndianA =
        a.country === "IN" ||
        a.source === "Truelancer" ||
        a.source === "TapChief" ||
        a.source === "Hasjob" ||
        a.source === "WorknHire";
      const isIndianB =
        b.country === "IN" ||
        b.source === "Truelancer" ||
        b.source === "TapChief" ||
        b.source === "Hasjob" ||
        b.source === "WorknHire";
      const valA = parseBudgetUSD(a.budget, isIndianA);
      const valB = parseBudgetUSD(b.budget, isIndianB);
      return valB - valA; // Highest paying job on top
    });
  }, [searchableJobs]);

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
          {/* Brand Logo & Name */}
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

      {/* Main Discovery Feed Container (Zero Clutter on Main Page) */}
      <main className="max-w-3xl mx-auto w-full flex-1 flex flex-col bg-white dark:bg-zinc-950 border-x border-zinc-200/80 dark:border-zinc-800/80 min-h-[calc(100vh-53px)]">
        {/* Search Toolbar & Myntra Filters Trigger */}
        <div className="p-3 sm:p-4 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/40 space-y-3">
          {/* Search bar & Myntra Filters Trigger Button */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search across gigs, tech stack, roles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none shadow-xs"
              />
            </div>

            {/* Myntra Filters Trigger Button with Active Badge */}
            <button
              onClick={() => setIsFiltersOpen(true)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 shadow-xs",
                activeFilterCount > 0
                  ? "bg-emerald-500 text-zinc-950 border-emerald-500 font-black shadow-emerald-500/20"
                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-emerald-500/60 hover:text-emerald-500"
              )}
              title="Open Myntra-style Filters Page"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="h-5 w-5 rounded-full bg-zinc-950 text-emerald-400 text-[11px] font-black flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Active Filter Chips Ribbon (Quick removal) */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
              <span className="text-zinc-400 font-semibold shrink-0">Applied:</span>
              {filters.countries.map((c) => (
                <span
                  key={c}
                  onClick={() => setFilters({ ...filters, countries: filters.countries.filter((x) => x !== c) })}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 cursor-pointer hover:bg-rose-50 hover:text-rose-600 shrink-0"
                >
                  {c === "IN" ? "🇮🇳 India (₹)" : "🇺🇸 Global / USA ($)"} ✕
                </span>
              ))}
              {filters.platforms.map((plat) => (
                <span
                  key={plat}
                  onClick={() => setFilters({ ...filters, platforms: filters.platforms.filter((x) => x !== plat) })}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 cursor-pointer hover:bg-rose-50 hover:text-rose-600 shrink-0"
                >
                  {plat} ✕
                </span>
              ))}
              {filters.difficulties.map((d) => (
                <span
                  key={d}
                  onClick={() => setFilters({ ...filters, difficulties: filters.difficulties.filter((x) => x !== d) })}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 cursor-pointer hover:bg-rose-50 hover:text-rose-600 shrink-0"
                >
                  {d} ✕
                </span>
              ))}
              {filters.workTypes.map((wt) => (
                <span
                  key={wt}
                  onClick={() => setFilters({ ...filters, workTypes: filters.workTypes.filter((x) => x !== wt) })}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 cursor-pointer hover:bg-rose-50 hover:text-rose-600 shrink-0"
                >
                  {wt} ✕
                </span>
              ))}
              {filters.workModes.map((wm) => (
                <span
                  key={wm}
                  onClick={() => setFilters({ ...filters, workModes: filters.workModes.filter((x) => x !== wm) })}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 cursor-pointer hover:bg-rose-50 hover:text-rose-600 shrink-0"
                >
                  {wm} ✕
                </span>
              ))}
              {filters.statuses.map((st) => (
                <span
                  key={st}
                  onClick={() => setFilters({ ...filters, statuses: filters.statuses.filter((x) => x !== st) })}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 cursor-pointer hover:bg-rose-50 hover:text-rose-600 shrink-0"
                >
                  Status: {st} ✕
                </span>
              ))}
              {filters.openOnly && (
                <span
                  onClick={() => setFilters({ ...filters, openOnly: false })}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 cursor-pointer hover:bg-rose-50 hover:text-rose-600 shrink-0"
                >
                  ● Open Only ✕
                </span>
              )}
              {filters.roles.map((r) => (
                <span
                  key={r}
                  onClick={() => setFilters({ ...filters, roles: filters.roles.filter((x) => x !== r) })}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 cursor-pointer hover:bg-rose-50 hover:text-rose-600 shrink-0"
                >
                  Role: Vibe Coder ✕
                </span>
              ))}
              <button
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="text-[11px] font-bold text-rose-500 hover:underline shrink-0 pl-1 cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Clean Feed Content */}
        <div className="flex-1 p-3.5 sm:p-5 flex flex-col gap-4">
          {loading && jobs.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center gap-2 text-zinc-400">
              <RefreshCw className="h-6 w-6 animate-spin text-emerald-500" />
              <span className="text-xs font-semibold">Streaming client opportunities...</span>
            </div>
          ) : (
            <>
              {/* Feed Header Banner */}
              <div className="flex items-center justify-between pb-1 flex-wrap gap-2">
                <div>
                  <h2 className="text-sm sm:text-base font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <span>{activeFilterCount > 0 ? "Filtered Opportunities" : "Top Paying Opportunities"}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {rankedJobs.length} live
                    </span>
                  </h2>
                  <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Ranked by highest payout across global ($) and Indian (₹) markets.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <span>Forex: 1 USD ≈ 86.5 INR</span>
                </div>
              </div>

              {/* Big Job Cards Grid */}
              {rankedJobs.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                    No opportunities match your current filters or search query.
                  </p>
                  <button
                    onClick={() => {
                      setFilters(DEFAULT_FILTERS);
                      setSearchQuery("");
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline px-3 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/30 cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset All Filters</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3.5">
                  {rankedJobs.map((job, idx) => (
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
            </>
          )}
        </div>
      </main>

      {/* Myntra-style Split-Pane Full Filter Page */}
      <MyntraFilterModal
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        filters={filters}
        onApply={(updated) => setFilters(updated)}
        onReset={() => setFilters(DEFAULT_FILTERS)}
        allJobs={jobs}
        trackedJobs={trackedJobs}
      />
    </div>
  );
}
