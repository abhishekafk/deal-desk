/**
 * Formats a number as Indian Rupees (INR) with the rupee symbol (₹).
 * Uses en-IN locale grouping (lakhs, crores).
 */
export function formatInr(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(amount);
  return `₹${formatted}`;
}

/**
 * Formats Cost Per View (CPV) with 2 decimal places.
 */
export function formatCpv(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0.00';
  }
  return `₹${amount.toFixed(2)}`;
}

/**
 * Formats large counts compactly (e.g., 30,600 -> 30.6K).
 */
export function formatCompactNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return '0';
  if (num >= 100000) {
    const lakhs = (num / 100000).toFixed(1).replace(/\.0$/, '');
    return `${lakhs}L`;
  }
  if (num >= 1000) {
    const k = (num / 1000).toFixed(1).replace(/\.0$/, '');
    return `${k}K`;
  }
  return num.toLocaleString('en-IN');
}

/**
 * Formats percentage.
 */
export function formatPct(val: number | null | undefined, decimals = 1): string {
  if (val === null || val === undefined) return '0%';
  return `${val.toFixed(decimals)}%`;
}
