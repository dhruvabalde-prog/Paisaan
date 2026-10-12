"use client";

import {
  ArrowLeft,
  Sun,
  Moon,
  Download,
  Target,
  ExternalLink,
  ShieldCheck,
  LogOut,
  Mail,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { exportJobsToCSV } from "@/lib/exportCsv";
import { GIG_PLATFORMS } from "@/lib/platforms";
import { useJobStorage } from "@/hooks/useJobStorage";
import { JobItem } from "@/types/job";
import { signInWithGoogle, signOutUser } from "@/lib/supabase";

interface SettingsPageProps {
  onBack: () => void;
  jobs: JobItem[];
  userGoogle: { name: string; email: string; avatar?: string } | null;
  onUserUpdate: (user: { name: string; email: string; avatar?: string } | null) => void;
}

export function SettingsPage({
  onBack,
  jobs,
  userGoogle,
  onUserUpdate,
}: SettingsPageProps) {
  const { theme, toggleTheme } = useTheme();
  const { trackedJobs, totalWonRevenueUSD } = useJobStorage();

  const GOAL_USD = 1200;
  const progressPercent = Math.min(100, Math.round((totalWonRevenueUSD / GOAL_USD) * 100));

  const handleGoogleConnect = async () => {
    try {
      const res = await signInWithGoogle();
      if (res && res.user) {
        const u = {
          name: res.user.user_metadata?.full_name || "Vibe Coder",
          email: res.user.email || "vibecoder@gmail.com",
          avatar: res.user.user_metadata?.avatar_url,
        };
        onUserUpdate(u);
      }
    } catch (e) {
      console.error("Google sign in failed:", e);
    }
  };

  const handleGoogleDisconnect = async () => {
    await signOutUser();
    onUserUpdate(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Bar with Back Button */}
      <div className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md px-3 sm:px-6 py-3.5 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:text-emerald-500 py-1.5 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Feed</span>
        </button>

        <h1 className="text-sm font-black tracking-wide uppercase text-zinc-500 dark:text-zinc-400">
          Settings & Profile
        </h1>
      </div>

      <div className="max-w-3xl mx-auto w-full px-3 sm:px-6 py-6 flex-1 flex flex-col gap-6">
        {/* 1. Account & Google OAuth (Gmail Scope) */}
        <section className="p-4 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold">Google Account & Gmail Connect</h2>
              <p className="text-xs text-zinc-500">
                Connect your Google account to sync profile preferences and custom DealFlow
              </p>
            </div>
            {userGoogle ? (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="h-3.5 w-3.5" /> Connected
              </span>
            ) : null}
          </div>

          {userGoogle ? (
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-500 text-zinc-950 font-bold flex items-center justify-center text-sm shadow-sm overflow-hidden">
                  {userGoogle.avatar ? (
                    <img src={userGoogle.avatar} alt="avatar" className="h-full w-full object-cover" />
                  ) : (
                    userGoogle.name.charAt(0)
                  )}
                </div>
                <div>
                  <div className="text-sm font-bold">{userGoogle.name}</div>
                  <div className="text-xs text-zinc-500 flex items-center gap-1">
                    <Mail className="h-3 w-3 text-emerald-500" />
                    <span>{userGoogle.email}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleGoogleDisconnect}
                className="flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline px-3 py-1.5"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleConnect}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-900 text-xs sm:text-sm font-bold shadow-sm transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.94H1.27v3.13C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.26c-.25-.72-.38-1.49-.38-2.26s.13-1.54.38-2.26V6.61H1.27C.46 8.23 0 10.06 0 12s.46 3.77 1.27 5.39l4.01-3.13z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.27 6.61l4.01 3.13c.95-2.84 3.6-4.99 6.72-4.99z"
                />
              </svg>
              <span>Connect Google (OAuth & Gmail Permissions)</span>
            </button>
          )}
        </section>

        {/* 2. October Goal Tracker & Progress */}
        <section className="p-4 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-emerald-500" />
              <h2 className="text-base font-bold">October Revenue Target</h2>
            </div>
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
              ${totalWonRevenueUSD} / ${GOAL_USD} <span className="text-zinc-400 font-normal text-xs">(₹1 Lakh)</span>
            </span>
          </div>

          <div className="h-2.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-zinc-500">
            <span>{progressPercent}% completed</span>
            <span>{progressPercent >= 100 ? "Goal Won!" : `$${Math.max(0, GOAL_USD - totalWonRevenueUSD)} left`}</span>
          </div>
        </section>

        {/* 3. Appearance & Export Actions */}
        <section className="p-4 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm space-y-4">
          <h2 className="text-base font-bold">Preferences & Export</h2>

          <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <div className="text-xs sm:text-sm font-semibold">Appearance Theme</div>
              <div className="text-xs text-zinc-500">Currently: <strong className="capitalize">{theme}</strong> mode</div>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-850 text-xs font-bold transition-colors cursor-pointer"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="h-4 w-4 text-amber-400" /> Switch to Light
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-indigo-600" /> Switch to Dark
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-xs sm:text-sm font-semibold">Export Deal Flow</div>
              <div className="text-xs text-zinc-500">Download deals, bids, and notes as CSV</div>
            </div>
            <button
              onClick={() => exportJobsToCSV(jobs, trackedJobs)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </div>
        </section>

        {/* 4. Complete Platform Universe (12 Verified Sources) */}
        <section className="p-4 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">The Platform Universe</h2>
            <span className="text-[11px] font-semibold text-zinc-500">12 Sources Available</span>
          </div>

          {/* Client Work & Gig Platforms */}
          <div className="space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Verified Client Work Platforms
            </span>
            <div className="grid gap-2">
              {GIG_PLATFORMS.map((p) => (
                <div
                  key={p.name}
                  className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`h-2.5 w-2.5 rounded-full ${p.badgeBg}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold">{p.name}</span>
                      </div>
                      <p className="text-[11px] text-zinc-500">{p.description}</p>
                    </div>
                  </div>
                  <a
                    href={p.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-zinc-400 hover:text-emerald-500 p-1"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
