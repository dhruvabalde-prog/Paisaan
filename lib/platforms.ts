import { PlatformMeta, GigSource } from "@/types/job";

export const GIG_PLATFORMS: { name: GigSource; allowsSelling: boolean; allowsHiring: boolean; badgeBg: string; website: string; description: string }[] = [
  {
    name: "Upwork",
    allowsSelling: false,
    allowsHiring: true,
    badgeBg: "bg-emerald-600",
    website: "https://upwork.com",
    description: "World's largest marketplace for fixed-price MVPs and hourly client development contracts.",
  },
  {
    name: "Contra",
    allowsSelling: false,
    allowsHiring: true,
    badgeBg: "bg-indigo-600",
    website: "https://contra.com",
    description: "Commission-free client network for hiring independent software builders and prototype developers.",
  },
  {
    name: "Freelancer.com",
    allowsSelling: false,
    allowsHiring: true,
    badgeBg: "bg-sky-600",
    website: "https://freelancer.com",
    description: "Global job board for competitive software development projects, calculators, and client tasks.",
  },
  {
    name: "RemoteOK",
    allowsSelling: false,
    allowsHiring: true,
    badgeBg: "bg-blue-600",
    website: "https://remoteok.com",
    description: "Remote client and startup work opportunities with transparent salary and contract terms.",
  },
  {
    name: "WeWorkRemotely",
    allowsSelling: false,
    allowsHiring: true,
    badgeBg: "bg-rose-600",
    website: "https://weworkremotely.com",
    description: "Curated tech and engineering contracts from top global startups.",
  },
  {
    name: "Hacker News Jobs",
    allowsSelling: false,
    allowsHiring: true,
    badgeBg: "bg-orange-600",
    website: "https://news.ycombinator.com/jobs",
    description: "Direct founder-to-developer contracting, MVP sprints, and technical contract roles.",
  },
];
