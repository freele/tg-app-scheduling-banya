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
  if (hours === 0) return `${mins} мин`;
  if (mins === 0) return `${hours} ч`;
  return `${hours}ч ${mins}мин`;
}

function formatPrice(price: number | null, currency: string): string {
  if (price === null) return "";
  const symbol = currency === "EUR" ? "€" : currency;
  return `${symbol}${price.toFixed(0)}`;
}

export function BookingPage({ event }: BookingPageProps) {
  const router = useRouter();
  const { webApp, user } = useTelegram();

  useEffect(() => {
    const handleError = (e: PromiseRejectionEvent) => {
      if (e.reason?.message?.includes("MetaMask")) {
        e.preventDefault();
      }
    };
    window.addEventListener("unhandledrejection", handleError);

    if (webApp) {
      webApp.ready();
      webApp.expand();

      webApp.BackButton.show();
      webApp.BackButton.onClick(() => router.back());
    }

    return () => {
      window.removeEventListener("unhandledrejection", handleError);
      webApp?.BackButton.hide();
    };
  }, [webApp, router]);

  const prefill = user
    ? { name: [user.firstName, user.lastName].filter(Boolean).join(" ") }
    : undefined;

  return (
    <main className="min-h-screen flex flex-col bg-tg-secondary-bg">
      {/* Header */}
      <header className="bg-tg-bg border-b border-tg-secondary-bg">
        <div className="px-4 py-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-tg-link text-sm mb-2"
          >
            ← Назад
          </button>

          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-tg-text leading-tight">
                {event.name}
              </h1>
              <p className="text-tg-hint text-sm mt-1">
                ⏱ {formatDuration(event.duration)}
              </p>
            </div>
            <div className="bg-tg-button text-tg-button-text px-3 py-1.5 rounded-xl text-sm font-bold flex-shrink-0">
              {formatPrice(event.price, event.currency)}
            </div>
          </div>
        </div>
      </header>

      {/* Calendly Embed */}
      <div className="flex-1 bg-white min-h-0">
        <CalendlyEmbed
          url={event.calendly_url}
          prefill={prefill}
          telegramUserId={user?.id}
          className="h-full w-full"
        />
      </div>
    </main>
  );
}
