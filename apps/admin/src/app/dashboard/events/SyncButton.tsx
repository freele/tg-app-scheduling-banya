"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { syncEventsFromCalendly } from "./actions";

export function SyncButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSync = async () => {
    setIsSyncing(true);
    setMessage(null);

    const result = await syncEventsFromCalendly();

    if (result.success) {
      const parts: string[] = [];
      if (result.created) parts.push(`${result.created} created`);
      if (result.updated) parts.push(`${result.updated} updated`);
      if (result.deactivated) parts.push(`${result.deactivated} deactivated`);
      setMessage(parts.length > 0 ? parts.join(", ") : "Everything up to date");
      router.refresh();
    } else {
      setMessage(`Error: ${result.error}`);
    }

    setIsSyncing(false);
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div className="relative">
      <button
        onClick={handleSync}
        disabled={isSyncing}
        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
      >
        {isSyncing ? "Syncing..." : "Sync from Calendly"}
      </button>
      {message && (
        <div
          className={`absolute top-full right-0 mt-1 px-3 py-1.5 rounded text-xs whitespace-nowrap ${
            message.startsWith("Error")
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
