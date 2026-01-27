import { createClient } from "@supabase/supabase-js";
import { BookingPage } from "./BookingPage";
import { notFound } from "next/navigation";

// Revalidate every 60 seconds to pick up changes from admin panel
export const revalidate = 60;

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export interface BookingEvent {
  id: string;
  name: string;
  slug: string;
  description_plain: string | null;
  duration: number;
  calendly_url: string;
  price: number | null;
  currency: string;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BookPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = getSupabase();

  const { data: event } = await supabase
    .from("events")
    .select("id, name, slug, description_plain, duration, calendly_url, price, currency")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!event) {
    notFound();
  }

  return <BookingPage event={event} />;
}
