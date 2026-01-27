/**
 * Database types for Bania Booking System
 * Based on the Calendly integration schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      bookings: {
        Row: {
          id: string;
          calendly_event_uri: string;
          calendly_invitee_uri: string;
          event_type_name: string;
          event_type_uuid: string | null;
          start_time: string;
          end_time: string;
          invitee_name: string;
          invitee_email: string | null;
          invitee_phone: string | null;
          guests_count: number;
          status: "scheduled" | "cancelled" | "completed";
          payment_status: "pending" | "paid" | "refunded";
          payment_amount: number | null;
          payment_notes: string | null;
          notes: string | null;
          calendly_payload: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          calendly_event_uri: string;
          calendly_invitee_uri: string;
          event_type_name: string;
          event_type_uuid?: string | null;
          start_time: string;
          end_time: string;
          invitee_name: string;
          invitee_email?: string | null;
          invitee_phone?: string | null;
          guests_count?: number;
          status?: "scheduled" | "cancelled" | "completed";
          payment_status?: "pending" | "paid" | "refunded";
          payment_amount?: number | null;
          payment_notes?: string | null;
          notes?: string | null;
          calendly_payload?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          calendly_event_uri?: string;
          calendly_invitee_uri?: string;
          event_type_name?: string;
          event_type_uuid?: string | null;
          start_time?: string;
          end_time?: string;
          invitee_name?: string;
          invitee_email?: string | null;
          invitee_phone?: string | null;
          guests_count?: number;
          status?: "scheduled" | "cancelled" | "completed";
          payment_status?: "pending" | "paid" | "refunded";
          payment_amount?: number | null;
          payment_notes?: string | null;
          notes?: string | null;
          calendly_payload?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      upcoming_bookings: {
        Row: {
          id: string;
          event_type_name: string;
          start_time: string;
          end_time: string;
          invitee_name: string;
          invitee_phone: string | null;
          guests_count: number;
          status: "scheduled" | "cancelled" | "completed";
          payment_status: "pending" | "paid" | "refunded";
          payment_amount: number | null;
        };
      };
      todays_bookings: {
        Row: {
          id: string;
          event_type_name: string;
          start_time: string;
          end_time: string;
          invitee_name: string;
          invitee_phone: string | null;
          guests_count: number;
          status: "scheduled" | "cancelled" | "completed";
          payment_status: "pending" | "paid" | "refunded";
        };
      };
    };
    Functions: {};
    Enums: {
      booking_status: "scheduled" | "cancelled" | "completed";
      payment_status: "pending" | "paid" | "refunded";
    };
    CompositeTypes: {};
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Insertable<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type Updatable<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
