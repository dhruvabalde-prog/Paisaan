import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Current forex reference: 1 USD ≈ 86.5 INR
export const USD_TO_INR_RATE = 86.5;

/**
 * Normalizes any budget string (USD or INR or hourly) to a comparable USD numeric value
 * for sorting descending.
 */
export function parseBudgetUSD(budgetStr: string, isIndianPlatform: boolean = false): number {
  if (!budgetStr) return 0;
  const clean = budgetStr.replace(/,/g, "").trim();

  // Check if it's explicitly in Rupees (₹ or INR)
  const isRupees = clean.includes("₹") || /inr/i.test(clean) || isIndianPlatform;

  // Hourly range match (e.g., "$60 - $85/hr" or "60/hr") -> estimate 40hr project sprint
  const hourlyMatch = clean.match(/([0-9.]+)\s*-\s*([0-9.]+)\/hr/i);
  if (hourlyMatch) {
    const high = parseFloat(hourlyMatch[2]);
    const valUSD = high * 20; // 20hr mini contract estimate
    return isRupees ? valUSD / USD_TO_INR_RATE : valUSD;
  }

  // Range match (e.g., "$350 - $750" or "₹25000 - ₹45000") -> take higher bound
  const rangeMatch = clean.match(/([0-9]+(?:\.[0-9]+)?)\s*-\s*([0-9]+(?:\.[0-9]+)?)/);
  if (rangeMatch) {
    const high = parseFloat(rangeMatch[2]);
    return isRupees ? high / USD_TO_INR_RATE : high;
  }

  // Single number match (e.g. "$600" or "₹45,000")
  const numMatch = clean.match(/([0-9]+(?:\.[0-9]+)?)/);
  if (numMatch) {
    const val = parseFloat(numMatch[1]);
    return isRupees ? val / USD_TO_INR_RATE : val;
  }

  return 0;
}

/**
 * Formats cross-currency equivalent (e.g., "$450 ≈ ₹38,925" or "₹45,000 ≈ $520")
 */
export function formatCrossCurrency(budgetStr: string, isIndian: boolean = false): { primary: string; secondary: string } {
  const normUSD = parseBudgetUSD(budgetStr, isIndian);
  const approxINR = Math.round(normUSD * USD_TO_INR_RATE);
  const approxUSD = Math.round(normUSD);

  if (isIndian || budgetStr.includes("₹")) {
    return {
      primary: budgetStr.startsWith("₹") ? budgetStr : `₹${budgetStr}`,
      secondary: `≈ $${approxUSD.toLocaleString("en-US")}`,
    };
  }

  return {
    primary: budgetStr.startsWith("$") ? budgetStr : `$${budgetStr}`,
    secondary: `≈ ₹${approxINR.toLocaleString("en-IN")}`,
  };
}
