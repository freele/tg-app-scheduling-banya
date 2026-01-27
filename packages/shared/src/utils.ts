/**
 * Format a date to ISO string in a specific timezone
 */
export function formatDateInTimezone(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * Format time for display
 */
export function formatTime(dateString: string, timezone: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/**
 * Format date for display
 */
export function formatDate(dateString: string, timezone: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

/**
 * Format date and time for display
 */
export function formatDateTime(dateString: string, timezone: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/**
 * Calculate duration in minutes between two dates
 */
export function getDurationMinutes(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return Math.round((endDate.getTime() - startDate.getTime()) / 60000);
}

/**
 * Format duration for display
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  return `${hours} hr ${remainingMinutes} min`;
}

/**
 * Check if a date is in the past
 */
export function isPast(dateString: string): boolean {
  return new Date(dateString) < new Date();
}

/**
 * Check if a date is today
 */
export function isToday(dateString: string, timezone: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  return formatDateInTimezone(date, timezone) === formatDateInTimezone(today, timezone);
}

/**
 * Get start of day in a timezone
 */
export function getStartOfDay(date: Date, timezone: string): Date {
  const dateStr = formatDateInTimezone(date, timezone);
  return new Date(`${dateStr}T00:00:00`);
}

/**
 * Get end of day in a timezone
 */
export function getEndOfDay(date: Date, timezone: string): Date {
  const dateStr = formatDateInTimezone(date, timezone);
  return new Date(`${dateStr}T23:59:59.999`);
}
