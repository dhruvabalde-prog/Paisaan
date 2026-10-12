"use client";

import { useState, useEffect } from "react";
import { TrackedJobData } from "@/types/job";

const STORAGE_KEY = "paisaan_tracked_jobs_v1";

export function useJobStorage() {
  const [trackedJobs, setTrackedJobs] = useState<Record<string, TrackedJobData>>({});
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount (prevents hydration mismatch)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setTrackedJobs(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load tracked jobs from localStorage:", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Sync to localStorage
  const saveState = (updated: Record<string, TrackedJobData>) => {
    setTrackedJobs(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
    }
  };

  const updateJob = (id: string, partial: Partial<TrackedJobData>) => {
    const existing = trackedJobs[id] || {
      status: "New",
      updatedAt: new Date().toISOString(),
    };
    const updated = {
      ...trackedJobs,
      [id]: {
        ...existing,
        ...partial,
        updatedAt: new Date().toISOString(),
      },
    };
    saveState(updated);
  };

  const setStatus = (id: string, status: TrackedJobData["status"]) => {
    updateJob(id, { status });
  };

  const setAnalysis = (id: string, analysis: TrackedJobData["analysis"]) => {
    updateJob(id, { analysis });
  };

  const setDemoUrl = (id: string, demoUrl: string) => {
    updateJob(id, { demoUrl });
  };

  const setNotes = (id: string, notes: string) => {
    updateJob(id, { notes });
  };

  const setRevenue = (id: string, revenue: number) => {
    updateJob(id, { revenue });
  };

  // Calculate total won revenue
  const totalWonRevenueUSD = Object.values(trackedJobs).reduce((acc, job) => {
    if (job.status === "Won" && typeof job.revenue === "number") {
      return acc + job.revenue;
    }
    return acc;
  }, 0);

  return {
    trackedJobs,
    isHydrated,
    updateJob,
    setStatus,
    setAnalysis,
    setDemoUrl,
    setNotes,
    setRevenue,
    totalWonRevenueUSD,
  };
}
