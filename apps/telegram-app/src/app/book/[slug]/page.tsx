"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTelegram } from "@/components/TelegramProvider";
import { CalendlyEmbed } from "@/components/CalendlyEmbed";

const CALENDLY_BASE_URL = process.env.NEXT_PUBLIC_CALENDLY_URL || "";

// Event metadata for display
const EVENTS: Record<string, { title: string; duration: string }> = {
  "30min": { title: "Quick Session", duration: "30 min" },
  "60min": { title: "Classic Banya", duration: "1 hour" },
  "2hour": { title: "Full Experience", duration: "2 hours" },
};

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const { webApp, user } = useTelegram();
  const slug = params.slug as string;

  const event = EVENTS[slug];
  const calendlyUrl = `${CALENDLY_BASE_URL}/${slug}`;

  useEffect(() => {
    // Suppress MetaMask errors
    const handleError = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes("MetaMask")) {
        event.preventDefault();
      }
    };
    window.addEventListener("unhandledrejection", handleError);

    if (webApp) {
      webApp.ready();
      webApp.expand();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (webApp as any).setHeaderColor?.("secondary_bg_color");

      // Show back button
      webApp.BackButton.show();
      webApp.BackButton.onClick(() => router.back());
    }

    return () => {
      window.removeEventListener("unhandledrejection", handleError);
      webApp?.BackButton.hide();
    };
  }, [webApp, router]);

  // Prefill with Telegram user info
  const prefill = user
    ? { name: [user.firstName, user.lastName].filter(Boolean).join(" ") }
    : undefined;

  if (!CALENDLY_BASE_URL) {
    return (
      <main className="min-h-screen p-4 flex items-center justify-center">
        <p className="text-tg-hint">Booking not configured</p>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="min-h-screen p-4 flex flex-col items-center justify-center">
        <p className="text-tg-hint">Event not found</p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 px-4 py-2 bg-tg-button text-tg-button-text rounded-lg"
        >
          Back to events
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      <header className="p-4 pb-2 bg-tg-bg border-b">
        <button
          onClick={() => router.back()}
          className="text-tg-link text-sm mb-2"
        >
          ← Back
        </button>
        <h1 className="text-lg font-bold">{event.title}</h1>
        <p className="text-sm text-tg-hint">{event.duration}</p>
      </header>

      <div className="flex-1">
        <CalendlyEmbed url={calendlyUrl} prefill={prefill} className="h-full" />
      </div>
    </main>
  );
}
