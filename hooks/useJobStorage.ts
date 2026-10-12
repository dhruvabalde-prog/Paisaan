import { useState, useEffect, useRef } from "react";
import { TrackedJobData } from "@/types/job";
import { supabase } from "@/lib/supabase";

const STORAGE_KEY = "paisaan_tracked_jobs_v1";

export function useJobStorage(userId?: string) {
  const [trackedJobs, setTrackedJobs] = useState<Record<string, TrackedJobData>>({});
  const [isHydrated, setIsHydrated] = useState(false);
  const syncChannelRef = useRef<any>(null);

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

  // Multi-device real-time sync via Supabase Realtime Broadcast Channel
  useEffect(() => {
    // Unique room channel based on authenticated user or common room
    const channelName = userId ? `sync-user-${userId.replace(/[^a-zA-Z0-9]/g, "")}` : "sync-paisaan-global";
    
    const channel = supabase.channel(channelName, {
      config: { broadcast: { self: false } },
    });

    channel
      .on("broadcast", { event: "job_state_update" }, (payload) => {
        if (payload?.payload?.trackedJobs) {
          setTrackedJobs((prev) => {
            const merged = { ...prev, ...payload.payload.trackedJobs };
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
      })
      .on("broadcast", { event: "trigger_reload" }, () => {
        // Trigger soft refresh across devices
        window.dispatchEvent(new CustomEvent("paisaan_remote_reload"));
      })
      .subscribe();

    syncChannelRef.current = channel;

    // Cross-tab sync via local storage events
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setTrackedJobs(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      channel.unsubscribe();
      window.removeEventListener("storage", handleStorage);
    };
  }, [userId]);

  // Sync to localStorage and broadcast to other devices
  const saveState = (updated: Record<string, TrackedJobData>) => {
    setTrackedJobs(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
    }

    // Broadcast change to other open devices (Phone <-> Laptop)
    if (syncChannelRef.current) {
      syncChannelRef.current.send({
        type: "broadcast",
        event: "job_state_update",
        payload: { trackedJobs: updated, timestamp: Date.now() },
      });
    }
  };

  const broadcastReload = () => {
    if (syncChannelRef.current) {
      syncChannelRef.current.send({
        type: "broadcast",
        event: "trigger_reload",
        payload: { timestamp: Date.now() },
      });
    }
  };

  const updateJob = (id: string, partial: Partial<TrackedJobData>) => {
    setTrackedJobs((prev) => {
      const existing = prev[id] || {
        status: "New",
        isOpen: true,
        updatedAt: new Date().toISOString(),
      };
      const updated = {
        ...prev,
        [id]: {
          ...existing,
          ...partial,
          updatedAt: new Date().toISOString(),
        },
      };
      saveState(updated);
      return updated;
    });
  };

  const setStatus = (id: string, status: TrackedJobData["status"]) => {
    updateJob(id, {
      status,
      // If status explicitly changed to Closed, mark isOpen as false
      ...(status === "Closed" ? { isOpen: false } : {}),
    });
  };

  const setIsOpen = (id: string, isOpen: boolean) => {
    updateJob(id, {
      isOpen,
      ...(isOpen === false ? { status: "Closed" } : {}),
    });
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
    setIsOpen,
    setAnalysis,
    setDemoUrl,
    setNotes,
    setRevenue,
    broadcastReload,
    totalWonRevenueUSD,
  };
}
