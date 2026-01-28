"use client";

import { useEffect } from "react";
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

  // Full screen Calendly - no header, Telegram BackButton handles navigation
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
