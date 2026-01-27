"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTelegram } from "@/components/TelegramProvider";
import { CalendlyEmbed } from "@/components/CalendlyEmbed";
import type { BookingEvent } from "./page";

interface BookingPageProps {
  event: BookingEvent;
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} hour${hours > 1 ? "s" : ""}`;
  return `${hours}h ${mins}min`;
}

export function BookingPage({ event }: BookingPageProps) {
  const router = useRouter();
  const { webApp, user } = useTelegram();

  useEffect(() => {
    // Suppress MetaMask errors
    const handleError = (e: PromiseRejectionEvent) => {
      if (e.reason?.message?.includes("MetaMask")) {
        e.preventDefault();
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

  return (
    <main className="min-h-screen flex flex-col">
      <header className="p-4 pb-2 bg-tg-bg border-b">
        <button
          onClick={() => router.back()}
          className="text-tg-link text-sm mb-2"
        >
          ← Back
        </button>
        <h1 className="text-lg font-bold">{event.name}</h1>
        <p className="text-sm text-tg-hint">{formatDuration(event.duration)}</p>
      </header>

      <div className="flex-1">
        <CalendlyEmbed
          url={event.calendly_url}
          prefill={prefill}
          className="h-full"
        />
      </div>
    </main>
  );
}
