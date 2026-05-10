/** Format peso amounts for display (IBM Plex Mono applied at call site). */
export function formatPhp(n: number | string | null | undefined): string {
  const v = typeof n === "string" ? parseFloat(n) : Number(n);
  const x = Number.isFinite(v) ? v : 0;
  return `PHP ${x.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatRate(r: number): string {
  const x = Number.isFinite(r) ? r : 0;
  return `${(x * 100).toFixed(2)}%`;
}
