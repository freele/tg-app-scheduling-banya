"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTelegram } from "@/components/TelegramProvider";
import type { Event } from "@/app/page";

interface EventsListProps {
  events: Event[];
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} hour${hours > 1 ? "s" : ""}`;
  return `${hours}h ${mins}min`;
}

function formatPrice(price: number | null, currency: string): string {
  if (price === null) return "";
  const symbol = currency === "EUR" ? "€" : currency;
  return `${symbol}${price.toFixed(0)}`;
}

export function EventsList({ events }: EventsListProps) {
  const { webApp, user } = useTelegram();

  useEffect(() => {
    // Suppress MetaMask/wallet detection errors from third-party scripts
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
    }

    return () => {
      window.removeEventListener("unhandledrejection", handleError);
    };
  }, [webApp]);

  return (
    <main className="min-h-screen flex flex-col bg-tg-secondary-bg">
      <header className="p-4 pb-2 bg-tg-bg">
        <h1 className="text-xl font-bold text-center">Banya Portugal</h1>
        {user && (
          <p className="text-sm text-tg-hint text-center mt-1">
            Welcome, {user.firstName}!
          </p>
        )}
        <p className="text-sm text-tg-hint text-center mt-2">
          Choose your session type
        </p>
      </header>

      <div className="flex-1 p-4 space-y-3">
        {events.length === 0 && (
          <div className="text-center text-tg-hint py-8">
            No events available
          </div>
        )}
        {events.map((event) => (
          <Link
            key={event.id}
            href={`/book/${event.slug}`}
            className="block bg-tg-bg rounded-xl p-4 shadow-sm active:scale-[0.98] transition-transform"
          >
            <div className="flex gap-3">
              {event.photo_url ? (
                <img
                  src={event.photo_url}
                  alt={event.name}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{ backgroundColor: event.color || "#6B7280" }}
                >
                  {event.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-base leading-tight line-clamp-2">
                      {event.name}
                    </h2>
                    <p className="text-sm text-tg-hint mt-1">
                      {formatDuration(event.duration)}
                      {event.max_guests && event.max_guests > 1
                        ? ` · up to ${event.max_guests} guests`
                        : ""}
                    </p>
                  </div>
                  <span className="text-lg font-bold text-tg-button ml-2 flex-shrink-0">
                    {formatPrice(event.price, event.currency)}
                  </span>
                </div>
                {event.description_plain && (
                  <p className="text-sm text-tg-hint mt-2 line-clamp-2">
                    {event.description_plain}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <footer className="p-4 text-center text-xs text-tg-hint">
        Traditional Russian banya in Portugal
      </footer>
    </main>
  );
}
