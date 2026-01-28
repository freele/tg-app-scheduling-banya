"use client";

import { useEffect, useRef } from "react";

interface CalendlyEmbedProps {
  url: string;
  prefill?: {
    name?: string;
    email?: string;
    phone?: string;
  };
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

export function CalendlyEmbed({ url, prefill, className }: CalendlyEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!url || !containerRef.current) return;

    // Load Calendly script
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;

    script.onload = () => {
      if (window.Calendly && containerRef.current) {
        // Build URL with parameters
        const params = new URLSearchParams();
        params.set("hide_gdpr_banner", "1");
        params.set("hide_landing_page_details", "1");

        const fullUrl = `${url}?${params.toString()}`;

        window.Calendly.initInlineWidget({
          url: fullUrl,
          parentElement: containerRef.current,
          prefill: prefill?.name ? { name: prefill.name } : undefined,
        });
      }
    };

    document.head.appendChild(script);

    // Load Calendly CSS
    const link = document.createElement("link");
    link.href = "https://assets.calendly.com/assets/external/widget.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      // Cleanup
      if (script.parentNode) script.parentNode.removeChild(script);
      if (link.parentNode) link.parentNode.removeChild(link);
    };
  }, [url, prefill]);

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
        minHeight: "700px",
      }}
    />
  );
}
