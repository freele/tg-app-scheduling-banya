import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import sharp from "sharp";

// Image settings
const MAX_WIDTH = 800;
const MAX_HEIGHT = 600;
const QUALITY = 85;

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const eventId = formData.get("eventId") as string;

    if (!file || !eventId) {
      return NextResponse.json(
        { success: false, error: "Missing file or eventId" },
        { status: 400 }
      );
    }

    // Check file size (max 10MB before processing)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "File too large. Max 10MB." },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // Resize and optimize image with sharp
    const optimizedBuffer = await sharp(inputBuffer)
      .resize(MAX_WIDTH, MAX_HEIGHT, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: QUALITY })
      .toBuffer();

    // Create unique filename (always .jpg after optimization)
    const filename = `${eventId}-${Date.now()}.jpg`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("event-photos")
      .upload(filename, optimizedBuffer, {
        contentType: "image/jpeg",
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { success: false, error: uploadError.message },
        { status: 500 }
      );
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
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    revalidatePath("/dashboard/events");
    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 }
    );
  }
}
