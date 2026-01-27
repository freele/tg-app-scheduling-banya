import { cookies } from "next/headers";
import { createServerClient } from "@bania/supabase/server";
import { EventsTable } from "./EventsTable";

export default async function EventsPage() {
  const cookieStore = await cookies();
  const supabase = await createServerClient(cookieStore);

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("display_order", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage event types synced from Calendly
          </p>
        </div>
        <a
          href="https://calendly.com/event_types/user/me"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700"
        >
          Open Calendly Dashboard
        </a>
      </div>

      <EventsTable initialEvents={events || []} />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2">How it works</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>
            • Events are synced from Calendly - create new events in Calendly
            first
          </li>
          <li>• Edit prices, descriptions, and photos here for display</li>
          <li>
            • Click &quot;Book&quot; to test the booking flow for each event
          </li>
          <li>
            • Click &quot;Manage&quot; to edit availability and settings in
            Calendly
          </li>
        </ul>
      </div>
    </div>
  );
}
