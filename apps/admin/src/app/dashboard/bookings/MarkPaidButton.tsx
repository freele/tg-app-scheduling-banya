"use client";

import { useState } from "react";
import { markBookingPaid } from "./actions";

interface MarkPaidButtonProps {
  bookingId: string;
  currentStatus: string;
}

export function MarkPaidButton({ bookingId, currentStatus }: MarkPaidButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (currentStatus === "paid") {
    return null;
  }

  const handleMarkPaid = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);

    try {
      const result = await markBookingPaid(bookingId);
      if (!result.success) {
        console.error("Failed to mark as paid:", result.error);
      }
    } catch (err) {
      console.error("Failed to mark as paid:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleMarkPaid}
      disabled={isLoading}
      className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
    >
      {isLoading ? "..." : "Mark Paid"}
    </button>
  );
}
