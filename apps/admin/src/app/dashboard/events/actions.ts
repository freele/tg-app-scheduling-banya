"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export interface EventData {
  name: string;
  slug: string;
  description_plain?: string | null;
  description_html?: string | null;
  photo_url?: string | null;
  price?: number | null;
  currency?: string;
  duration: number;
  calendly_url: string;
  calendly_event_uri?: string | null;
  max_guests?: number | null;
  display_order?: number;
  is_active?: boolean;
  color?: string | null;
  metadata?: Record<string, unknown>;
}

export async function getEvents() {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching events:", error);
    return [];
  }

  return data;
}

export async function updateEvent(eventId: string, data: Partial<EventData>) {
  const supabase = getSupabase();

  const { error } = await supabase
    .from("events")
    .update(data)
    .eq("id", eventId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/events");
  return { success: true };
}

export async function uploadEventPhoto(
  eventId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string; url?: string }> {
  const supabase = getSupabase();
  const file = formData.get("file") as File;

  if (!file) {
    return { success: false, error: "No file provided" };
  }

  // Create unique filename
  const ext = file.name.split(".").pop();
  const filename = `${eventId}-${Date.now()}.${ext}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("event-photos")
    .upload(filename, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    return { success: false, error: uploadError.message };
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("event-photos").getPublicUrl(filename);

  // Update event with photo URL
  const { error: updateError } = await supabase
    .from("events")
    .update({ photo_url: publicUrl })
    .eq("id", eventId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  revalidatePath("/dashboard/events");
  return { success: true, url: publicUrl };
}

export async function removeEventPhoto(eventId: string, photoUrl: string) {
  const supabase = getSupabase();

  // Extract filename from URL
  const filename = photoUrl.split("/").pop();

  if (filename) {
    // Delete from storage
    await supabase.storage.from("event-photos").remove([filename]);
  }

  // Update event to remove photo URL
  const { error } = await supabase
    .from("events")
    .update({ photo_url: null })
    .eq("id", eventId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/events");
  return { success: true };
}

export async function createEvent(data: EventData) {
  const supabase = getSupabase();

  const { error } = await supabase.from("events").insert(data);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/events");
  return { success: true };
}

export async function deleteEvent(eventId: string) {
  const supabase = getSupabase();

  const { error } = await supabase.from("events").delete().eq("id", eventId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/events");
  return { success: true };
}

export async function reorderEvents(eventIds: string[]) {
  const supabase = getSupabase();

  const updates = eventIds.map((id, index) =>
    supabase.from("events").update({ display_order: index }).eq("id", id)
  );

  const results = await Promise.all(updates);
  const errors = results.filter((r) => r.error);

  if (errors.length > 0) {
    return { success: false, error: "Failed to reorder some events" };
  }

  revalidatePath("/dashboard/events");
  return { success: true };
}

export async function syncEventsFromCalendly(): Promise<{
  success: boolean;
  error?: string;
  created?: number;
  updated?: number;
  deactivated?: number;
}> {
  const token = process.env.CALENDLY_WEBHOOK_SIGNING_KEY;
  if (!token) {
    return { success: false, error: "CALENDLY_WEBHOOK_SIGNING_KEY is not set" };
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // 1. Get current user URI
  const meRes = await fetch("https://api.calendly.com/users/me", { headers });
  if (!meRes.ok) {
    return { success: false, error: `Calendly API error: ${meRes.status}` };
  }
  const meData = await meRes.json();
  const userUri = meData.resource.uri;

  // 2. Fetch all event types
  const etRes = await fetch(
    `https://api.calendly.com/event_types?user=${encodeURIComponent(userUri)}&count=100&active=true`,
    { headers }
  );
  if (!etRes.ok) {
    return { success: false, error: `Calendly event_types error: ${etRes.status}` };
  }
  const etData = await etRes.json();
  const calendlyEvents = etData.collection as Array<{
    uri: string;
    name: string;
    slug: string;
    scheduling_url: string;
    duration: number;
    description_plain: string | null;
    description_html: string | null;
    color: string;
    active: boolean;
  }>;

  // 3. Fetch existing events from DB
  const supabase = getSupabase();
  const { data: existingEvents } = await supabase
    .from("events")
    .select("id, calendly_event_uri");

  const existingMap = new Map(
    (existingEvents || [])
      .filter((e: { calendly_event_uri: string | null }) => e.calendly_event_uri)
      .map((e: { id: string; calendly_event_uri: string | null }) => [e.calendly_event_uri!, e.id])
  );

  let created = 0;
  let updated = 0;

  const calendlyUris = new Set<string>();

  for (const ce of calendlyEvents) {
    calendlyUris.add(ce.uri);
    const uuid = ce.uri.split("/").pop()!;

    const syncData = {
      name: ce.name,
      slug: ce.slug,
      duration: ce.duration,
      description_plain: ce.description_plain || null,
      description_html: ce.description_html || null,
      calendly_url: ce.scheduling_url,
      calendly_event_uri: ce.uri,
      calendly_event_uuid: uuid,
      color: ce.color,
    };

    const existingId = existingMap.get(ce.uri);

    if (existingId) {
      // Update existing
      await supabase.from("events").update(syncData).eq("id", existingId);
      updated++;
    } else {
      // Create new
      const maxOrder = (existingEvents || []).length + created;
      await supabase.from("events").insert({
        ...syncData,
        is_active: true,
        display_order: maxOrder,
      });
      created++;
    }
  }

  // 4. Deactivate events not in Calendly
  let deactivated = 0;
  for (const [uri, id] of existingMap) {
    if (!calendlyUris.has(uri)) {
      await supabase.from("events").update({ is_active: false }).eq("id", id);
      deactivated++;
    }
  }

  revalidatePath("/dashboard/events");
  return { success: true, created, updated, deactivated };
}

export async function toggleEventActive(eventId: string, isActive: boolean) {
  const supabase = getSupabase();

  const { error } = await supabase
    .from("events")
    .update({ is_active: isActive })
    .eq("id", eventId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/events");
  return { success: true };
}
