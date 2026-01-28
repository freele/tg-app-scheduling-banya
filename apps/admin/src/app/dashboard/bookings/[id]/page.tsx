import { cookies } from "next/headers";
import { createServerClient } from "@bania/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDate, formatTime, formatDuration } from "@/lib/utils";
import { PaymentForm } from "./PaymentForm";

interface Booking {
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
  telegram_user_id: number | null;
  guests_count: number;
  status: "scheduled" | "cancelled" | "completed";
  payment_status: "pending" | "paid" | "refunded";
  payment_amount: number | null;
  payment_notes: string | null;
  notes: string | null;
  calendly_payload: unknown;
  created_at: string;
  updated_at: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = await createServerClient(cookieStore);

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  const booking = data as unknown as Booking;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/bookings"
          className="text-gray-500 hover:text-gray-700"
        >
          ← Back
        </Link>
        <h1 className="text-2xl font-bold">Booking Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Guest Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Guest Information</h2>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-500">Name</dt>
                <dd className="font-medium">{booking.invitee_name}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Email</dt>
                <dd className="font-medium">
                  {booking.invitee_email || "Not provided"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Phone</dt>
                <dd className="font-medium">
                  {booking.invitee_phone || "Not provided"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Guests</dt>
                <dd className="font-medium">{booking.guests_count}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Telegram</dt>
                <dd className="font-medium">
                  {booking.telegram_user_id ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="inline-block w-2 h-2 bg-blue-500 rounded-full" />
                      ID: {booking.telegram_user_id}
                    </span>
                  ) : (
                    <span className="text-gray-400">Not from Telegram</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>

          {/* Event Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Event Information</h2>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-500">Event Type</dt>
                <dd className="font-medium">{booking.event_type_name}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Duration</dt>
                <dd className="font-medium">
                  {formatDuration(booking.start_time, booking.end_time)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Date</dt>
                <dd className="font-medium">{formatDate(booking.start_time)}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Time</dt>
                <dd className="font-medium">
                  {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Status</dt>
                <dd>
                  <StatusBadge status={booking.status} />
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Booked At</dt>
                <dd className="font-medium text-sm">
                  {new Date(booking.created_at).toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Notes</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{booking.notes}</p>
            </div>
          )}
        </div>

        {/* Payment Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Payment</h2>
            <PaymentForm booking={booking} />
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {booking.telegram_user_id && (
                <a
                  href={`tg://user?id=${booking.telegram_user_id}`}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                  </svg>
                  Написать в Telegram
                </a>
              )}
              {booking.invitee_phone && (
                <a
                  href={`tel:${booking.invitee_phone}`}
                  className="block w-full px-4 py-2 text-center border rounded-md hover:bg-gray-50"
                >
                  Call Guest
                </a>
              )}
              {booking.invitee_email && (
                <a
                  href={`mailto:${booking.invitee_email}`}
                  className="block w-full px-4 py-2 text-center border rounded-md hover:bg-gray-50"
                >
                  Email Guest
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    scheduled: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`px-2 py-1 text-xs rounded-full capitalize ${styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800"}`}
    >
      {status}
    </span>
  );
}
