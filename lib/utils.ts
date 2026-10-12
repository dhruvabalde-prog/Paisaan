import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Current Forex Rate: 1 USD ≈ 84 INR (₹84 = $1)
export const FOREX_USD_TO_INR = 84;

/**
 * Normalizes any budget string (USD or INR or Hourly) into approximate total USD value for fair ranking.
 * e.g.:
 * - "$600" -> 600
 * - "₹45,000" -> 45000 / 84 ≈ 535.71
 * - "₹1,20,000" -> 120000 / 84 ≈ 1428.57
 * - "$60 - $85/hr" -> 85 * 20 (contract sprint) = 1700
 */
export function extractNormalizedBudgetUSD(budgetString: string): number {
  if (!budgetString) return 0;
  const clean = budgetString.replace(/,/g, "").trim();

  // 1. Check for Indian Rupees (₹ or INR)
  const rupeeMatch = clean.match(/₹\s*([0-9.]+)/i) || clean.match(/INR\s*([0-9.]+)/i);
  if (rupeeMatch) {
    const inrValue = parseFloat(rupeeMatch[1]);
    if (!isNaN(inrValue)) {
      return inrValue / FOREX_USD_TO_INR;
    }
  }

  // 2. Check for Hourly Range in USD (e.g. "$60 - $85/hr")
  const hourlyRangeMatch = clean.match(/\$([0-9.]+)\s*-\s*\$([0-9.]+)\s*\/\s*hr/i);
  if (hourlyRangeMatch) {
    const maxRate = parseFloat(hourlyRangeMatch[2]);
    return !isNaN(maxRate) ? maxRate * 15 : 500; // estimated 15-hr sprint
  }

  // 3. Check for standard USD ($450, $1000)
  const dollarMatch = clean.match(/\$([0-9.]+)/);
  if (dollarMatch) {
    const val = parseFloat(dollarMatch[1]);
    if (!isNaN(val)) return val;
  }

  // 4. Raw number check fallback
  const rawNum = clean.match(/([0-9]+(?:\.[0-9]+)?)/);
  if (rawNum) {
    const val = parseFloat(rawNum[1]);
    return !isNaN(val) ? val : 0;
  }

  return 0;
}
