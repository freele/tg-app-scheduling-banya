"use client";

interface CalendlyEmbedProps {
  url: string;
  prefill?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  className?: string;
}

export function CalendlyEmbed({ url, prefill, className }: CalendlyEmbedProps) {
  // Build iframe URL with parameters
  const buildIframeUrl = () => {
    if (!url) return "";
    const params = new URLSearchParams();
    params.set("hide_gdpr_banner", "1");
    params.set("embed_type", "Inline");
    if (prefill?.name) params.set("name", prefill.name);
    if (prefill?.email) params.set("email", prefill.email);
    return `${url}?${params.toString()}`;
  };

  if (!url) {
    return (
      <div className={className} style={{ padding: "20px", textAlign: "center" }}>
        <p>Calendly URL not configured</p>
      </div>
    );
  }

  return (
    <iframe
      src={buildIframeUrl()}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "700px",
        border: "none",
      }}
      title="Schedule a booking"
    />
  );
}

