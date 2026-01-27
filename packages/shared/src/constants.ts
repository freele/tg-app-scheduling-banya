/**
 * Default timezone for the application
 */
export const DEFAULT_TIMEZONE = "Europe/Moscow";

/**
 * Default session duration in minutes
 */
export const DEFAULT_DURATION_MINUTES = 120;

/**
 * Minimum booking notice in hours
 */
export const MIN_BOOKING_NOTICE_HOURS = 2;

/**
 * Maximum booking advance in days
 */
export const MAX_BOOKING_ADVANCE_DAYS = 30;

/**
 * Default page size for pagination
 */
export const DEFAULT_PAGE_SIZE = 20;

/**
 * Maximum page size for pagination
 */
export const MAX_PAGE_SIZE = 100;

/**
 * API error codes
 */
export const ErrorCodes = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  CONFLICT: "CONFLICT",
  EVENT_FULLY_BOOKED: "EVENT_FULLY_BOOKED",
  EVENT_CANCELLED: "EVENT_CANCELLED",
  BOOKING_PAST_EVENT: "BOOKING_PAST_EVENT",
  INSUFFICIENT_SPOTS: "INSUFFICIENT_SPOTS",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
