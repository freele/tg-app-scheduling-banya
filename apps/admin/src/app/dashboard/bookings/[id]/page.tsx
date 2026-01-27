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
