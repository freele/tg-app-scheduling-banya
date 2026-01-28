"use client";

import { useEffect, useRef } from "react";

interface CalendlyEmbedProps {
  url: string;
  prefill?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  telegramUserId?: number;
  className?: string;
}

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement;
        prefill?: Record<string, string>;
      }) => void;
    };
  }
}

export function CalendlyEmbed({ url, prefill, telegramUserId, className }: CalendlyEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!url || !containerRef.current || initializedRef.current) return;

    const initWidget = () => {
      if (window.Calendly && containerRef.current && !initializedRef.current) {
        initializedRef.current = true;

        // Clear container before init
        containerRef.current.innerHTML = "";

        // Build URL with parameters
        const params = new URLSearchParams();
        params.set("hide_gdpr_banner", "1");
        params.set("hide_landing_page_details", "1");

        // Pass Telegram user ID via UTM for tracking in webhook
        if (telegramUserId) {
          params.set("utm_source", "telegram_miniapp");
          params.set("utm_content", telegramUserId.toString());
        }

        const fullUrl = `${url}?${params.toString()}`;

        window.Calendly.initInlineWidget({
          url: fullUrl,
          parentElement: containerRef.current,
          prefill: prefill?.name ? { name: prefill.name } : undefined,
        });
      }
    };

    // Check if Calendly is already loaded
    if (window.Calendly) {
      initWidget();
      return;
    }

    // Check if script is already in DOM
    const existingScript = document.querySelector('script[src*="calendly.com/assets/external/widget.js"]');
    if (existingScript) {
      existingScript.addEventListener("load", initWidget);
      return;
    }

    // Load Calendly script
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    script.onload = initWidget;
    document.head.appendChild(script);

    // Load Calendly CSS if not already loaded
    if (!document.querySelector('link[href*="calendly.com/assets/external/widget.css"]')) {
      const link = document.createElement("link");
      link.href = "https://assets.calendly.com/assets/external/widget.css";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }

    return () => {
      initializedRef.current = false;
    };
  }, [url, prefill, telegramUserId]);

  if (!url) {
    return (
      <div className={className} style={{ padding: "20px", textAlign: "center" }}>
        <p>Calendly URL not configured</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "100vh",
      }}
    />
  );
}
