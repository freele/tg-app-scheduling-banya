"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTelegram } from "@/components/TelegramProvider";
import { CalendlyEmbed } from "@/components/CalendlyEmbed";
import type { BookingEvent } from "./page";

interface BookingPageProps {
  event: BookingEvent;
}

export function BookingPage({ event }: BookingPageProps) {
  const router = useRouter();
  const { webApp, user } = useTelegram();
  const [isBooked, setIsBooked] = useState(false);

  const goHome = useCallback(() => {
    router.push("/");
  }, [router]);

  useEffect(() => {
    const handleError = (e: PromiseRejectionEvent) => {
      if (e.reason?.message?.includes("MetaMask")) {
        e.preventDefault();
      }
    };
    window.addEventListener("unhandledrejection", handleError);

    // Listen for Calendly booking completion
    const handleCalendlyEvent = (e: MessageEvent) => {
      if (e.data.event === "calendly.event_scheduled") {
        setIsBooked(true);
      }
    };
    window.addEventListener("message", handleCalendlyEvent);

    if (webApp) {
      webApp.ready();
      webApp.expand();

      if (!isBooked) {
        webApp.BackButton.show();
        webApp.BackButton.onClick(goHome);
      } else {
        webApp.BackButton.hide();
      }
    }

    return () => {
      window.removeEventListener("unhandledrejection", handleError);
      window.removeEventListener("message", handleCalendlyEvent);
      webApp?.BackButton.hide();
    };
  }, [webApp, goHome, isBooked]);

  const prefill = user
    ? { name: [user.firstName, user.lastName].filter(Boolean).join(" ") }
    : undefined;

  // Show success screen after booking
  if (isBooked) {
    return (
      <main className="h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="text-6xl mb-6">✅</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Бронирование подтверждено!
        </h1>
        <p className="text-gray-600 mb-8">
          Мы отправим вам напоминание перед визитом
        </p>
        <button
          onClick={goHome}
          className="px-8 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors"
        >
          ОК
        </button>
      </main>
    );
  }

  return (
    <main className="h-screen bg-white">
      <CalendlyEmbed
        url={event.calendly_url}
        prefill={prefill}
        telegramUserId={user?.id}
        className="h-full w-full"
      />
    </main>
  );
}
