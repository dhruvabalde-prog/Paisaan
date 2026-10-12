import { PlatformMeta, GigSource, AssetSource } from "@/types/job";

export const GIG_PLATFORMS: { name: GigSource; allowsSelling: boolean; allowsHiring: boolean; badgeBg: string; website: string; description: string }[] = [
  {
    name: "Upwork",
    allowsSelling: false,
    allowsHiring: true,
    badgeBg: "bg-emerald-600",
    website: "https://upwork.com",
    description: "World's largest marketplace for fixed-price MVPs and hourly development.",
  },
  {
    name: "Contra",
    allowsSelling: true, // Commission-free freelance + package services store
    allowsHiring: true,
    badgeBg: "bg-indigo-600",
    website: "https://contra.com",
    description: "Commission-free freelance network supporting gig proposals and pre-packaged service offerings.",
  },
  {
    name: "Freelancer.com",
    allowsSelling: false,
    allowsHiring: true,
    badgeBg: "bg-sky-600",
    website: "https://freelancer.com",
    description: "Global marketplace for competitive project bidding and contests.",
  },
  {
    name: "RemoteOK",
    allowsSelling: false,
    allowsHiring: true,
    badgeBg: "bg-blue-600",
    website: "https://remoteok.com",
    description: "Real-time tech and AI remote opportunities across venture-backed startups.",
  },
  {
    name: "WeWorkRemotely",
    allowsSelling: false,
    allowsHiring: true,
    badgeBg: "bg-red-600",
    website: "https://weworkremotely.com",
    description: "Top remote community with verified developer and engineering contracts.",
  },
  {
    name: "Hacker News Jobs",
    allowsSelling: false,
    allowsHiring: true,
    badgeBg: "bg-orange-600",
    website: "https://news.ycombinator.com/jobs",
    description: "Direct-to-founder tech, early-stage contractor, and MVP opportunities from YC startups.",
  },
];

export const ASSET_PLATFORMS: { name: AssetSource; allowsSelling: boolean; allowsHiring: boolean; badgeBg: string; website: string; description: string }[] = [
  {
    name: "Acquire.com",
    allowsSelling: true,
    allowsHiring: false,
    badgeBg: "bg-blue-500",
    website: "https://acquire.com",
    description: "Premier marketplace to buy and sell profitable SaaS products and digital micro-businesses.",
  },
  {
    name: "Microns.io",
    allowsSelling: true,
    allowsHiring: false,
    badgeBg: "bg-purple-600",
    website: "https://microns.io",
    description: "Curated newsletter and marketplace for acquiring and selling micro-startups under $100k.",
  },
  {
    name: "Flippa",
    allowsSelling: true,
    allowsHiring: false,
    badgeBg: "bg-amber-600",
    website: "https://flippa.com",
    description: "Global marketplace for selling web assets, domain portfolios, apps, and established websites.",
  },
  {
    name: "SideProjectors",
    allowsSelling: true,
    allowsHiring: false,
    badgeBg: "bg-emerald-700",
    website: "https://sideprojectors.com",
    description: "Marketplace for discovering, buying, or selling side projects and unfinished MVPs.",
  },
  {
    name: "CodeCanyon",
    allowsSelling: true,
    allowsHiring: false,
    badgeBg: "bg-teal-600",
    website: "https://codecanyon.net",
    description: "Mass-distribution marketplace for selling reusable scripts, Next.js code templates, and plugins.",
  },
  {
    name: "Gumroad / Lemon Squeezy",
    allowsSelling: true,
    allowsHiring: false,
    badgeBg: "bg-pink-600",
    website: "https://gumroad.com",
    description: "Direct-to-consumer digital commerce platforms for selling UI boilerplates, dev kits, and SaaS licenses.",
  },
];
