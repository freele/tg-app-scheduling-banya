import { NextRequest, NextResponse } from "next/server";
import { Bot, webhookCallback } from "grammy";

// Lazy initialization to avoid build-time errors
let bot: Bot | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let handleUpdate: ((req: Request) => Promise<Response>) | null = null;

function getBot() {
  if (!bot) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const webAppUrl = process.env.TELEGRAM_WEBAPP_URL;

    if (!token) {
      throw new Error("TELEGRAM_BOT_TOKEN is not set");
    }

    bot = new Bot(token);

    // Handle /start command
    bot.command("start", async (ctx) => {
      await ctx.reply(
        "Welcome to Bania Booking!\n\nClick the button below to book your session.",
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Book a Session",
                  web_app: { url: webAppUrl || "" },
                },
              ],
            ],
          },
        }
      );
    });

    // Handle /help command
    bot.command("help", async (ctx) => {
      await ctx.reply(
        "Bania Booking Bot\n\n" +
          "Use this bot to book your bania sessions.\n\n" +
          "Commands:\n" +
          "/start - Start booking\n" +
          "/help - Show this message"
      );
    });

    handleUpdate = webhookCallback(bot, "std/http");
  }
  return { bot, handleUpdate: handleUpdate! };
}

export async function POST(request: NextRequest) {
  try {
    const { handleUpdate } = getBot();
    return await handleUpdate(request);
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, message: "Telegram webhook endpoint" });
}
