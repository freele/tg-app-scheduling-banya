import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { calendlyWebhookPayloadSchema } from "@bania/shared";
import crypto from "crypto";

const calendlyWebhookKey = process.env.CALENDLY_WEBHOOK_SIGNING_KEY;
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;

// Lazy client initialization to avoid build-time errors
let supabase: SupabaseClient | null = null;
function getSupabase() {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return supabase;
}

// Verify Calendly webhook signature
function verifySignature(
  payload: string,
  signature: string,
  timestamp: string
): boolean {
  if (!calendlyWebhookKey) {
    console.warn("CALENDLY_WEBHOOK_SIGNING_KEY not set, skipping verification");
    return true;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expectedSignature = crypto
    .createHmac("sha256", calendlyWebhookKey)
    .update(signedPayload)
    .digest("hex");

  // Signature format: t=timestamp,v1=signature
  const signatureParts = signature.split(",");
  const v1Signature = signatureParts
    .find((part) => part.startsWith("v1="))
    ?.replace("v1=", "");

  return v1Signature === expectedSignature;
}

// Extract phone number from custom questions
function extractPhone(
  questions: { question: string; answer: string }[]
): string | null {
  const phoneQuestion = questions.find(
    (q) =>
      q.question.toLowerCase().includes("phone") ||
      q.question.toLowerCase().includes("телефон")
  );
  return phoneQuestion?.answer || null;
}

// Extract guests count from custom questions
function extractGuestsCount(
  questions: { question: string; answer: string }[]
): number {
  const guestsQuestion = questions.find(
    (q) =>
      q.question.toLowerCase().includes("guest") ||
      q.question.toLowerCase().includes("people") ||
      q.question.toLowerCase().includes("человек") ||
      q.question.toLowerCase().includes("гост")
  );

  if (guestsQuestion?.answer) {
    const count = parseInt(guestsQuestion.answer, 10);
    if (!isNaN(count) && count > 0) {
      return count;
    }
  }

  return 1;
}

// Extract Telegram user ID from tracking data
function extractTelegramUserId(
  tracking?: { utm_source?: string | null; utm_content?: string | null }
): number | null {
  if (tracking?.utm_source === "telegram_miniapp" && tracking?.utm_content) {
    const userId = parseInt(tracking.utm_content, 10);
    if (!isNaN(userId) && userId > 0) {
      return userId;
    }
  }
  return null;
}

// Format date for message
function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Lisbon",
  });
}

// Send Telegram message to user
async function sendTelegramMessage(
  chatId: number,
  text: string
): Promise<boolean> {
  if (!telegramBotToken) {
    console.warn("TELEGRAM_BOT_TOKEN not set, skipping message");
    return false;
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
        }),
      }
    );

    const result = await response.json();
    if (!result.ok) {
      console.error("Telegram API error:", result);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Failed to send Telegram message:", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("calendly-webhook-signature") || "";
    const timestamp =
      signature.match(/t=(\d+)/)?.[1] || Date.now().toString();

    // Verify signature in production
    if (
      process.env.NODE_ENV === "production" &&
      calendlyWebhookKey &&
      !verifySignature(rawBody, signature, timestamp)
    ) {
      console.error("Invalid Calendly webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const parseResult = calendlyWebhookPayloadSchema.safeParse(body);

    if (!parseResult.success) {
      console.error("Invalid webhook payload:", parseResult.error);
      return NextResponse.json(
        { error: "Invalid payload", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { event, payload } = parseResult.data;

    if (event === "invitee.created") {
      // New booking created
      const phone = extractPhone(payload.questions_and_answers);
      const guestsCount = extractGuestsCount(payload.questions_and_answers);
      const telegramUserId = extractTelegramUserId(payload.tracking);

      const { error } = await getSupabase().from("bookings").insert({
        calendly_event_uri: payload.event,
        calendly_invitee_uri: payload.uri,
        event_type_name: payload.scheduled_event.name,
        event_type_uuid: payload.scheduled_event.event_type,
        start_time: payload.scheduled_event.start_time,
        end_time: payload.scheduled_event.end_time,
        invitee_name: payload.name,
        invitee_email: payload.email,
        invitee_phone: phone,
        telegram_user_id: telegramUserId,
        guests_count: guestsCount,
        status: "scheduled",
        payment_status: "pending",
        calendly_payload: body,
      });

      if (error) {
        console.error("Error inserting booking:", error);

        // Handle duplicate (idempotency)
        if (error.code === "23505") {
          return NextResponse.json({ ok: true, message: "Already processed" });
        }

        return NextResponse.json(
          { error: "Database error", details: error.message },
          { status: 500 }
        );
      }

      console.log(`Booking created: ${payload.name} - ${payload.scheduled_event.name}`);

      // Send confirmation message via Telegram
      if (telegramUserId) {
        const firstName = payload.name.split(" ")[0];
        const dateTime = formatDateTime(payload.scheduled_event.start_time);
        const eventName = payload.scheduled_event.name;

        const message = `Здравствуйте, ${firstName}! 🌿

Рады, что вы выбрали нашу баню! Ваша бронь подтверждена:

📅 ${eventName}
🕐 ${dateTime}

Для завершения бронирования, пожалуйста, оплатите сумму в течение 24 часов.

💳 Реквизиты для оплаты:
[PLACEHOLDER: реквизиты]

После оплаты пришлите, пожалуйста, чек @PLACEHOLDER_CONTACT

Ждём вас с нетерпением! 🙏`;

        await sendTelegramMessage(telegramUserId, message);
      }
    }

    if (event === "invitee.canceled") {
      // Booking cancelled
      const { error } = await getSupabase()
        .from("bookings")
        .update({
          status: "cancelled",
          calendly_payload: body,
        })
        .eq("calendly_invitee_uri", payload.uri);

      if (error) {
        console.error("Error updating booking:", error);
        return NextResponse.json(
          { error: "Database error", details: error.message },
          { status: 500 }
        );
      }

      console.log(`Booking cancelled: ${payload.name}`);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Calendly webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Calendly webhook endpoint",
    timestamp: new Date().toISOString(),
  });
}
