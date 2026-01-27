import { cookies } from "next/headers";
import { createServerClient } from "@bania/supabase/server";
import Link from "next/link";
import { formatDate, formatTime } from "@/lib/utils";
import { MarkPaidButton } from "./MarkPaidButton";

interface Booking {
  id: string;
  event_type_name: string;
  start_time: string;
  end_time: string;
  invitee_name: string;
  invitee_email: string | null;
  invitee_phone: string | null;
  guests_count: number;
  status: "scheduled" | "cancelled" | "completed";
  payment_status: "pending" | "paid" | "refunded";
  payment_amount: number | null;
}

interface SearchParams {
  status?: string;
  payment?: string;
  search?: string;
}

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const cookieStore = await cookies();
  const supabase = await createServerClient(cookieStore);
  const params = await searchParams;

  let query = supabase
    .from("bookings")
    .select("*")
    .order("start_time", { ascending: false });

  // Apply filters
  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }

  if (params.payment && params.payment !== "all") {
    query = query.eq("payment_status", params.payment);
  }

  if (params.search) {
    query = query.or(
      `invitee_name.ilike.%${params.search}%,invitee_email.ilike.%${params.search}%,invitee_phone.ilike.%${params.search}%`
    );
  }

  const { data } = await query.limit(50);
  const bookings = (data || []) as unknown as Booking[];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Bookings</h1>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <form className="flex flex-wrap gap-4" method="GET">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              defaultValue={params.status || "all"}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment
            </label>
            <select
              name="payment"
              defaultValue={params.payment || "all"}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Payments</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              name="search"
              placeholder="Name, email, or phone"
              defaultValue={params.search || ""}
              className="border rounded-md px-3 py-2 text-sm w-64"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Guest
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Event
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">

              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings?.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-8 text-center text-gray-500"
                >
                  No bookings found
                </td>
              </tr>
            )}
            {bookings?.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <p className="font-medium text-gray-900">
                      {booking.invitee_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {booking.invitee_phone || booking.invitee_email}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="text-gray-900">{booking.event_type_name}</p>
                  <p className="text-sm text-gray-500">
                    {booking.guests_count}{" "}
                    {booking.guests_count === 1 ? "guest" : "guests"}
                  </p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="text-gray-900">
                    {formatDate(booking.start_time)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatTime(booking.start_time)}
                  </p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={booking.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <PaymentBadge status={booking.payment_status} />
                    <MarkPaidButton
                      bookingId={booking.id}
                      currentStatus={booking.payment_status}
                    />
                  </div>
                  {booking.payment_amount && (
                    <p className="text-sm text-gray-500 mt-1">
                      ${booking.payment_amount}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <Link
                    href={`/dashboard/bookings/${booking.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

function PaymentBadge({ status }: { status: string }) {
  const styles = {
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    refunded: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={`px-2 py-1 text-xs rounded-full capitalize ${styles[status as keyof typeof styles] || styles.pending}`}
    >
      {status}
    </span>
  );
}
