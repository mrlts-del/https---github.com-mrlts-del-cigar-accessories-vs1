import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as currency (USD by default).
 * @param amount - The amount to format.
 * @param currency - The currency code (default: 'USD').
 * @returns The formatted currency string.
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD'
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2, // Ensure two decimal places
  }).format(amount);
}
