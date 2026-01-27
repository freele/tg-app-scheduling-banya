"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function markBookingPaid(bookingId: string) {
  const supabase = getSupabase();

  const { error } = await supabase
    .from("bookings")
    .update({ payment_status: "paid" })
    .eq("id", bookingId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/bookings");
  return { success: true };
}

export async function updatePayment(
  bookingId: string,
  data: {
    payment_status: "pending" | "paid" | "refunded";
    payment_amount?: number | null;
    payment_notes?: string | null;
  }
) {
  const supabase = getSupabase();

  const { error } = await supabase
    .from("bookings")
    .update({
      payment_status: data.payment_status,
      payment_amount: data.payment_amount,
      payment_notes: data.payment_notes,
    })
    .eq("id", bookingId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/bookings");
  revalidatePath(`/dashboard/bookings/${bookingId}`);
  return { success: true };
}
