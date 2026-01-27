// ============================================
// Enums
// ============================================

export const BookingStatus = {
  SCHEDULED: "scheduled",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
} as const;

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export const PaymentStatus = {
  PENDING: "pending",
  PAID: "paid",
  REFUNDED: "refunded",
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

// ============================================
// Database Types
// ============================================

export interface Booking {
  id: string;

  // Calendly references
  calendly_event_uri: string;
  calendly_invitee_uri: string;

  // Event details
  event_type_name: string;
  event_type_uuid: string | null;
  start_time: string;
  end_time: string;

  // Invitee details
  invitee_name: string;
  invitee_email: string | null;
  invitee_phone: string | null;
  guests_count: number;

  // Status
  status: BookingStatus;

  // Payment
  payment_status: PaymentStatus;
  payment_amount: number | null;
  payment_notes: string | null;

  // Additional
  notes: string | null;
  calendly_payload: CalendlyWebhookPayload | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// ============================================
// Calendly Webhook Types
// ============================================

export interface CalendlyWebhookPayload {
  event: CalendlyWebhookEvent;
  payload: CalendlyInviteePayload;
}

export type CalendlyWebhookEvent =
  | "invitee.created"
  | "invitee.canceled"
  | "routing_form_submission.created";

export interface CalendlyInviteePayload {
  uri: string;
  name: string;
  email: string;
  event: string; // Event URI
  status: "active" | "canceled";
  timezone: string;
  created_at: string;
  updated_at: string;
  cancel_url: string;
  reschedule_url: string;
  questions_and_answers: CalendlyQuestion[];
  scheduled_event: CalendlyScheduledEvent;
}

export interface CalendlyQuestion {
  question: string;
  answer: string;
  position: number;
}

export interface CalendlyScheduledEvent {
  uri: string;
  name: string;
  status: "active" | "canceled";
  start_time: string;
  end_time: string;
  event_type: string;
  location: CalendlyLocation | null;
  invitees_counter: {
    total: number;
    active: number;
    limit: number;
  };
}

export interface CalendlyLocation {
  type: string;
  location?: string;
}

// ============================================
// API Types
// ============================================

export interface BookingWithFormattedTime extends Booking {
  formatted_date: string;
  formatted_time: string;
  duration_minutes: number;
}

// ============================================
// Request/Response Types
// ============================================

export interface UpdateBookingRequest {
  status?: BookingStatus;
  payment_status?: PaymentStatus;
  payment_amount?: number;
  payment_notes?: string;
  notes?: string;
}

export interface BookingsQueryParams {
  status?: BookingStatus;
  payment_status?: PaymentStatus;
  from_date?: string;
  to_date?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: {
    message: string;
    code: string;
  };
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

// ============================================
// Dashboard Stats
// ============================================

export interface DashboardStats {
  today_bookings: number;
  upcoming_bookings: number;
  pending_payments: number;
  total_revenue: number;
}
