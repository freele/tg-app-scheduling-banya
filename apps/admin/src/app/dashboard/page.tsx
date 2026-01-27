import { cookies } from "next/headers";
import { createServerClient } from "@bania/supabase/server";
import Link from "next/link";
import { formatDate, formatTime } from "@/lib/utils";

interface Booking {
  id: string;
  event_type_name: string;
  start_time: string;
  invitee_name: string;
  guests_count: number;
  payment_status: "pending" | "paid" | "refunded";
}

interface RevenueRow {
  payment_amount: number | null;
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = await createServerClient(cookieStore);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  // Fetch stats
  const [todayResult, upcomingResult, pendingPaymentsResult, revenueResult] =
    await Promise.all([
      // Today's bookings
      supabase
        .from("bookings")
        .select("id", { count: "exact" })
        .gte("start_time", todayISO)
        .lt(
          "start_time",
          new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString()
        )
        .eq("status", "scheduled"),

      // Upcoming bookings
      supabase
        .from("bookings")
        .select("id", { count: "exact" })
        .gte("start_time", new Date().toISOString())
        .eq("status", "scheduled"),

      // Pending payments
      supabase
        .from("bookings")
        .select("id", { count: "exact" })
        .eq("payment_status", "pending")
        .eq("status", "scheduled"),

      // Total revenue (paid bookings)
      supabase
        .from("bookings")
        .select("payment_amount")
        .eq("payment_status", "paid"),
    ]);

  const revenueData = (revenueResult.data || []) as unknown as RevenueRow[];
  const totalRevenue = revenueData.reduce(
    (sum, b) => sum + (b.payment_amount || 0),
    0
  );

  const stats = [
    { name: "Today's Bookings", value: todayResult.count ?? 0, color: "blue" },
    {
      name: "Upcoming Bookings",
      value: upcomingResult.count ?? 0,
      color: "green",
    },
    {
      name: "Pending Payments",
      value: pendingPaymentsResult.count ?? 0,
      color: "yellow",
    },
    {
      name: "Total Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      color: "purple",
    },
  ];

  // Fetch upcoming bookings
  const { data: upcomingData } = await supabase
    .from("bookings")
    .select("*")
    .gte("start_time", new Date().toISOString())
    .eq("status", "scheduled")
    .order("start_time", { ascending: true })
    .limit(10);

  const upcomingBookings = (upcomingData || []) as unknown as Booking[];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link
          href="/dashboard/bookings"
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          View all bookings →
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-500">{stat.name}</p>
            <p className="text-3xl font-bold mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Upcoming Bookings */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Upcoming Bookings</h2>
        </div>
        <div className="divide-y">
          {upcomingBookings?.length === 0 && (
            <p className="px-6 py-8 text-gray-500 text-center">
              No upcoming bookings
            </p>
          )}
          {upcomingBookings?.map((booking) => (
            <Link
              key={booking.id}
              href={`/dashboard/bookings/${booking.id}`}
              className="px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <p className="font-medium">{booking.invitee_name}</p>
                  <span className="text-sm text-gray-500">
                    {booking.guests_count}{" "}
                    {booking.guests_count === 1 ? "guest" : "guests"}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {booking.event_type_name}
                </p>
              </div>

              <div className="text-right">
                <p className="font-medium">
                  {formatDate(booking.start_time)}
                </p>
                <p className="text-sm text-gray-500">
                  {formatTime(booking.start_time)}
                </p>
              </div>

              <div className="ml-4">
                <PaymentBadge status={booking.payment_status} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
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
