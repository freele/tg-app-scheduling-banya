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
  if (hours === 0) return `${mins} мин`;
  if (mins === 0) return `${hours} ч`;
  return `${hours}ч ${mins}мин`;
}

function formatPrice(price: number | null, currency: string): string {
  if (price === null) return "";
  const symbol = currency === "EUR" ? "€" : currency;
  return `${symbol}${price.toFixed(0)}`;
}

export function EventsList({ events }: EventsListProps) {
  const { webApp } = useTelegram();

  useEffect(() => {
    const handleError = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes("MetaMask")) {
        event.preventDefault();
      }
    };
    window.addEventListener("unhandledrejection", handleError);

    if (webApp) {
      webApp.ready();
      webApp.expand();
    }

    return () => {
      window.removeEventListener("unhandledrejection", handleError);
    };
  }, [webApp]);

  return (
    <main className="min-h-screen flex flex-col bg-tg-secondary-bg">
      {/* Header */}
      <header className="bg-tg-bg px-4 pt-4 pb-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-tg-text">🧖 Баня на даче</h1>
          <p className="text-tg-text text-sm mt-2 leading-relaxed">
            Привет! :) Здесь вы можете забронировать банные сеансы в &laquo;Бане на даче&raquo; на севере Португалии (50 минут от г. Порту).
          </p>
        </div>
      </header>

      {/* Events List */}
      <div className="flex-1 px-4 pb-4 space-y-3">
        {events.length === 0 && (
          <div className="text-center text-tg-hint py-8">
            Нет доступных программ
          </div>
        )}

        {events.map((event) => (
          <Link
            key={event.id}
            href={`/book/${event.slug}`}
            className="block active:opacity-80 transition-opacity"
          >
            <div className="bg-tg-bg rounded-2xl overflow-hidden shadow-sm">
              {/* Photo or Gradient Header */}
              {event.photo_url ? (
                <div className="relative h-40">
                  <img
                    src={event.photo_url}
                    alt={event.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  {/* Price on photo */}
                  <div className="absolute top-3 right-3 bg-tg-button text-tg-button-text px-3 py-1 rounded-full text-sm font-bold">
                    {formatPrice(event.price, event.currency)}
                  </div>

                  {/* Title on photo */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h2 className="text-white font-bold text-lg leading-tight">
                      {event.name}
                    </h2>
                  </div>
                </div>
              ) : (
                <div
                  className="relative h-24 flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${event.color || '#8B5A2B'} 0%, ${event.color ? event.color + 'aa' : '#D2691E'} 100%)`
                  }}
                >
                  <span className="text-4xl">🧖</span>

                  {/* Price */}
                  <div className="absolute top-3 right-3 bg-white/90 text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
                    {formatPrice(event.price, event.currency)}
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-4">
                {!event.photo_url && (
                  <h2 className="font-bold text-tg-text text-base leading-tight mb-2">
                    {event.name}
                  </h2>
                )}

                {/* Meta */}
                <div className="flex items-center gap-3 text-tg-hint text-sm mb-2">
                  <span>⏱ {formatDuration(event.duration)}</span>
                  {event.max_guests && event.max_guests > 1 && (
                    <span>👥 до {event.max_guests} чел.</span>
                  )}
                </div>

                {/* Description */}
                {event.description_plain && (
                  <p className="text-tg-text text-sm leading-relaxed opacity-80">
                    {event.description_plain}
                  </p>
                )}

                {/* Book Button */}
                <div className="mt-3 pt-3 border-t border-tg-secondary-bg flex items-center justify-between">
                  <span className="text-tg-hint text-xs">
                    Нажмите для бронирования
                  </span>
                  <div className="bg-tg-button text-tg-button-text px-4 py-2 rounded-xl text-sm font-medium">
                    Выбрать →
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <footer className="p-4 text-center bg-tg-bg border-t border-tg-secondary-bg">
        <p className="text-tg-hint text-xs">
          🇵🇹 Баня на даче • Португалия
        </p>
      </footer>
    </main>
  );
}
