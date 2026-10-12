import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { JobItem, JobAnalysis } from "@/types/job";

// Persona configuration for the "vibe_coder"
const PERSONA_CONFIG = {
  role: "vibe_coder",
  sweet_spot: "0-to-1 greenfield MVPs, landing pages, AI wrappers, client intake dashboards, CRUD prototypes ($200 - $800 USD)",
  red_flags: [
    "debugging ancient legacy codebases",
    "complex DevOps or Kubernetes migrations",
    "native mobile apps with complex iOS/Android store publishing",
    "C++, Rust, embedded or low-level systems",
    "unreasonable scope or under $50 micro-tasks with 50 requirements",
  ],
};

function getApiKeys(): string[] {
  const keys: string[] = [];
  if (process.env.GEMINI_API_KEY) keys.push(process.env.GEMINI_API_KEY);
  if (process.env.GEMINI_API_KEY_1 && !keys.includes(process.env.GEMINI_API_KEY_1)) keys.push(process.env.GEMINI_API_KEY_1);
  if (process.env.GEMINI_API_KEY_2 && !keys.includes(process.env.GEMINI_API_KEY_2)) keys.push(process.env.GEMINI_API_KEY_2);
  if (process.env.GEMINI_API_KEY_3 && !keys.includes(process.env.GEMINI_API_KEY_3)) keys.push(process.env.GEMINI_API_KEY_3);
  return keys.filter(k => k.trim().length > 0);
}

function generateHeuristicAnalysis(job: JobItem): JobAnalysis {
  const text = `${job.title} ${job.description}`.toLowerCase();

  const isLegacyOrTrap =
    text.includes("objective-c") ||
    text.includes("c++") ||
    text.includes("memory leak") ||
    text.includes("kubernetes") ||
    text.includes("xcode") ||
    text.includes("legacy") ||
    text.includes("debug old");

  const isIdealVibe =
    text.includes("mvp") ||
    text.includes("prototype") ||
    text.includes("ai wrapper") ||
    text.includes("nextjs") ||
    text.includes("landing page") ||
    text.includes("directory") ||
    text.includes("saas");

  const match_score = isLegacyOrTrap ? 2 : isIdealVibe ? 9 : 6;
  const red_flag_check = isLegacyOrTrap ? "FAIL" : "PASS";
  const red_flag_reason = isLegacyOrTrap
    ? "Requires legacy debugging, native app stores, or complex low-level codebases. High trap potential."
    : undefined;

  const suggested_bid = job.budget && job.budget.includes("$") ? job.budget.replace(/negotiable \/ /i, "") : "$450";

  return {
    plain_english_summary: `Build an interactive, modern web application for "${job.title}" that lets users easily navigate features and get instant value without manual hassle.`,
    red_flag_check,
    red_flag_reason,
    match_score,
    three_screen_blueprint: [
      {
        title: "Screen 1: Clean Onboarding & Input Form",
        description: "A polished dashboard screen where users provide their core inputs and configure options with zero clutter.",
      },
      {
        title: "Screen 2: Interactive Live Preview & Results",
        description: "Dynamic visual preview area with real-time feedback, action pills, and status tags.",
      },
      {
        title: "Screen 3: Export & Sharing Hub",
        description: "1-click export to clipboard/file and clear next action prompts for high customer retention.",
      },
    ],
    client_pitch: `Hi! I checked your project "${job.title}". I specialize in shipping rapid, high-converting Next.js MVPs in days rather than weeks.\nI've already spun up an initial UI direction to match your flow: [Insert Demo Link].\nCan jump on this today and have the working MVP ready for your feedback in 48-72 hours. Let's chat!`,
    v0_prompt: `Build a modern, sleek SaaS web app for "${job.title}". Include a dark/light mode responsive layout, a main input card with clean Tailwind UI elements, a live preview card with instant feedback, and an export toolbar. Use Lucide icons, smooth transitions, and high-contrast badges.`,
    suggested_bid,
  };
}

export async function POST(req: NextRequest) {
  let job: JobItem;
  try {
    const body = await req.json();
    job = body.job;
    if (!job || !job.title) {
      return NextResponse.json({ error: "Job item is required" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const keys = getApiKeys();

  // If no keys are found, use the heuristic engine
  if (keys.length === 0) {
    const fallbackAnalysis = generateHeuristicAnalysis(job);
    return NextResponse.json({
      analysis: fallbackAnalysis,
      mode: "heuristic_fallback",
      note: "No GEMINI_API_KEY configured. Running on intelligent heuristic engine.",
    });
  }

  const prompt = `
You are the elite AI vetting co-pilot inside "Paisaan", an application for a "vibe coder" developer.
Target Profile:
- Sweet Spot: ${PERSONA_CONFIG.sweet_spot}
- Red Flags (FAIL immediately): ${PERSONA_CONFIG.red_flags.join("; ")}

Analyze this gig thoroughly and provide actionable recommendations.

Gig Details:
- Title: ${job.title}
- Description: ${job.description}
- Stated Budget: ${job.budget}
- Platform: ${job.source}
- URL: ${job.url}

Rules:
1. plain_english_summary: 1-2 crisp sentences describing what a user clicks, sees, and gets. Zero technical jargon.
2. red_flag_check: "PASS" or "FAIL". MUST fail if legacy debugging, native app stores, low-level C++/embedded code, or impossible $20 sweatshops are involved.
3. match_score: Number 1 to 10 evaluating suitability for a 0-to-1 vibe coder.
4. three_screen_blueprint: Exactly 3 essential screens for the MVP (title and plain English description).
5. client_pitch: Concise 3-line proposal mentioning a live custom prototype link placeholder.
6. v0_prompt: The exact prompt ready to copy-paste into v0.dev to generate the initial prototype.
7. suggested_bid: Recommended realistic fixed-price bid in USD (e.g. "$450").
`;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      plain_english_summary: {
        type: Type.STRING,
        description: "1-2 sentences explaining what the user clicks, sees, and gets without technical jargon.",
      },
      red_flag_check: {
        type: Type.STRING,
        enum: ["PASS", "FAIL"],
        description: "PASS if suitable greenfield MVP, FAIL if legacy debugging or complex trap.",
      },
      red_flag_reason: {
        type: Type.STRING,
        description: "Brief reason if FAIL, or empty string if PASS.",
      },
      match_score: {
        type: Type.INTEGER,
        description: "Score from 1 to 10 for vibe coder suitability.",
      },
      three_screen_blueprint: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
          },
          required: ["title", "description"],
        },
        description: "Exactly 3 MVP screen specifications.",
      },
      client_pitch: {
        type: Type.STRING,
        description: "Concise 3-line proposal mentioning a live prototype.",
      },
      v0_prompt: {
        type: Type.STRING,
        description: "Copy-paste prompt for v0.dev to generate the demo.",
      },
      suggested_bid: {
        type: Type.STRING,
        description: "Recommended fixed bid in USD.",
      },
    },
    required: [
      "plain_english_summary",
      "red_flag_check",
      "match_score",
      "three_screen_blueprint",
      "client_pitch",
      "v0_prompt",
      "suggested_bid",
    ],
  };

  // Try available keys in sequence to smoothly handle free-tier rate limits (429)
  let lastError: unknown = null;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        },
      });

      const responseText = response.text;
      if (responseText) {
        const analysis: JobAnalysis = JSON.parse(responseText);
        return NextResponse.json({
          analysis,
          mode: "gemini_live",
          keyIndex: i + 1,
        });
      }
    } catch (err: unknown) {
      console.warn(`Gemini Key #${i + 1} attempt failed:`, err);
      lastError = err;
      // continue to next key in pool
    }
  }

  // If all keys fail (e.g. rate limit exhausted across all 3 keys), fallback seamlessly
  console.warn("All Gemini API keys exhausted or failed, falling back to heuristic engine.");
  const fallbackAnalysis = generateHeuristicAnalysis(job);
  return NextResponse.json({
    analysis: fallbackAnalysis,
    mode: "heuristic_fallback",
    exhaustedKeys: true,
    error: lastError instanceof Error ? lastError.message : String(lastError),
  });
}
