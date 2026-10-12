import { JobItem, TrackedJobData } from "@/types/job";

export function exportJobsToCSV(jobs: JobItem[], tracked: Record<string, TrackedJobData>) {
  const headers = [
    "ID",
    "Title",
    "Source",
    "Budget",
    "Status",
    "Match Score",
    "Red Flag",
    "Suggested Bid",
    "Demo URL",
    "Revenue (USD)",
    "Notes",
    "Published At",
    "Original URL",
  ];

  const escapeCSV = (value: string | number | undefined | null) => {
    if (value === undefined || value === null) return '""';
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = jobs.map((job) => {
    const itemTracked = tracked[job.id];
    const analysis = itemTracked?.analysis;

    return [
      escapeCSV(job.id),
      escapeCSV(job.title),
      escapeCSV(job.source),
      escapeCSV(job.budget),
      escapeCSV(itemTracked?.status || "New"),
      escapeCSV(analysis?.match_score || ""),
      escapeCSV(analysis?.red_flag_check || ""),
      escapeCSV(analysis?.suggested_bid || ""),
      escapeCSV(itemTracked?.demoUrl || ""),
      escapeCSV(itemTracked?.revenue || 0),
      escapeCSV(itemTracked?.notes || ""),
      escapeCSV(job.publishedAt),
      escapeCSV(job.url),
    ].join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `paisaan_dealflow_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
