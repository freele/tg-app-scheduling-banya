"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTelegram } from "@/components/TelegramProvider";

// Event types - can be moved to config/database later
const EVENTS = [
  {
    slug: "30min",
    title: "Quick Session",
    duration: "30 min",
    description: "Perfect for a quick steam and relaxation. Ideal for first-timers or busy schedules.",
    price: "€25",
  },
  {
    slug: "60min",
    title: "Classic Banya",
    duration: "1 hour",
    description: "The traditional banya experience with steam, veniks, and cold plunge. Our most popular option.",
    price: "€45",
  },
  {
    slug: "2hour",
    title: "Full Experience",
    duration: "2 hours",
    description: "Complete relaxation journey including extended steam sessions, tea ceremony, and rest time.",
    price: "€75",
  },
];

export default function Home() {
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
        {EVENTS.map((event) => (
          <Link
            key={event.slug}
            href={`/book/${event.slug}`}
            className="block bg-tg-bg rounded-xl p-4 shadow-sm active:scale-[0.98] transition-transform"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h2 className="font-semibold text-lg">{event.title}</h2>
                <p className="text-sm text-tg-hint mt-1">{event.duration}</p>
              </div>
              <span className="text-lg font-bold text-tg-button">{event.price}</span>
            </div>
            <p className="text-sm text-tg-hint mt-2">{event.description}</p>
          </Link>
        ))}
      </div>

      <footer className="p-4 text-center text-xs text-tg-hint">
        Traditional Russian banya in Portugal
      </footer>
    </main>
  );
}
