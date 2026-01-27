import { createClient } from "@supabase/supabase-js";
import { EventsList } from "@/components/EventsList";

// Revalidate every 60 seconds to pick up changes from admin panel
export const revalidate = 60;

// Create a Supabase client for server-side fetching
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export interface Event {
  id: string;
  name: string;
  slug: string;
  description_plain: string | null;
  photo_url: string | null;
  price: number | null;
  currency: string;
  duration: number;
  calendly_url: string;
  max_guests: number | null;
  color: string | null;
  is_active: boolean;
}

export default async function Home() {
  const supabase = getSupabase();

  const { data: events } = await supabase
    .from("events")
    .select(
      "id, name, slug, description_plain, photo_url, price, currency, duration, calendly_url, max_guests, color, is_active"
    )
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  return <EventsList events={events || []} />;
}
