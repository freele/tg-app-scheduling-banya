import { z } from "zod";
import { BookingStatus, PaymentStatus } from "./types";

// ============================================
// Common Schemas
// ============================================

export const uuidSchema = z.string().uuid();

export const phoneSchema = z
  .string()
  .min(10, "Phone number must be at least 10 digits")
  .max(20, "Phone number must be at most 20 characters")
  .regex(/^[+]?[\d\s()-]+$/, "Invalid phone number format")
  .optional();

export const dateTimeSchema = z.string().datetime({ offset: true });

// ============================================
// Booking Schemas
// ============================================

export const bookingStatusSchema = z.enum([
  BookingStatus.SCHEDULED,
  BookingStatus.CANCELLED,
  BookingStatus.COMPLETED,
]);

export const paymentStatusSchema = z.enum([
  PaymentStatus.PENDING,
  PaymentStatus.PAID,
  PaymentStatus.REFUNDED,
]);

export const updateBookingSchema = z.object({
  status: bookingStatusSchema.optional(),
  payment_status: paymentStatusSchema.optional(),
  payment_amount: z.number().min(0).optional(),
  payment_notes: z.string().max(500).optional(),
  notes: z.string().max(500).optional(),
});

export const bookingsQuerySchema = z.object({
  status: bookingStatusSchema.optional(),
  payment_status: paymentStatusSchema.optional(),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

// ============================================
// Calendly Webhook Schemas
// ============================================

export const calendlyWebhookEventSchema = z.enum([
  "invitee.created",
  "invitee.canceled",
  "routing_form_submission.created",
]);

export const calendlyQuestionSchema = z.object({
  question: z.string(),
  answer: z.string(),
  position: z.number(),
});

export const calendlyScheduledEventSchema = z.object({
  uri: z.string(),
  name: z.string(),
  status: z.enum(["active", "canceled"]),
  start_time: z.string(),
  end_time: z.string(),
  event_type: z.string(),
  location: z
    .object({
      type: z.string(),
      location: z.string().optional(),
    })
    .nullable()
    .optional(),
  invitees_counter: z.object({
    total: z.number(),
    active: z.number(),
    limit: z.number(),
  }),
});

export const calendlyTrackingSchema = z.object({
  utm_source: z.string().nullable().optional(),
  utm_medium: z.string().nullable().optional(),
  utm_campaign: z.string().nullable().optional(),
  utm_content: z.string().nullable().optional(),
  utm_term: z.string().nullable().optional(),
  salesforce_uuid: z.string().nullable().optional(),
});

export const calendlyInviteePayloadSchema = z.object({
  uri: z.string(),
  name: z.string(),
  email: z.string().email(),
  event: z.string(),
  status: z.enum(["active", "canceled"]),
  timezone: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  cancel_url: z.string(),
  reschedule_url: z.string(),
  questions_and_answers: z.array(calendlyQuestionSchema).default([]),
  scheduled_event: calendlyScheduledEventSchema,
  tracking: calendlyTrackingSchema.optional(),
});

export const calendlyWebhookPayloadSchema = z.object({
  event: calendlyWebhookEventSchema,
  payload: calendlyInviteePayloadSchema,
});

// ============================================
// Type Exports from Schemas
// ============================================

export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
export type BookingsQueryInput = z.infer<typeof bookingsQuerySchema>;
export type CalendlyWebhookInput = z.infer<typeof calendlyWebhookPayloadSchema>;
