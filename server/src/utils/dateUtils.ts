/** Format a Date (or date string) as YYYY-MM-DD, the shape Frankfurter's API expects. */
export function toIsoDateOnly(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
}

export function todayIsoDate(): string {
  return toIsoDateOnly(new Date());
}

export function isPastDate(dateStr: string): boolean {
  return dateStr < todayIsoDate();
}
