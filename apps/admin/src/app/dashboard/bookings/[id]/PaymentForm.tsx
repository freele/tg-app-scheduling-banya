"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updatePayment } from "../actions";

interface Booking {
  id: string;
  payment_status: "pending" | "paid" | "refunded";
  payment_amount: number | null;
  payment_notes: string | null;
}

interface PaymentFormProps {
  booking: Booking;
}

export function PaymentForm({ booking }: PaymentFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [paymentStatus, setPaymentStatus] = useState(booking.payment_status);
  const [paymentAmount, setPaymentAmount] = useState(
    booking.payment_amount?.toString() || ""
  );
  const [paymentNotes, setPaymentNotes] = useState(booking.payment_notes || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await updatePayment(booking.id, {
        payment_status: paymentStatus,
        payment_amount: paymentAmount ? parseFloat(paymentAmount) : null,
        payment_notes: paymentNotes || null,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update payment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickMark = async (status: "paid" | "pending" | "refunded") => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await updatePayment(booking.id, {
        payment_status: status,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      setPaymentStatus(status);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update payment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Current Status */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <span className="text-sm text-gray-500">Current Status</span>
        <PaymentBadge status={paymentStatus} />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handleQuickMark("paid")}
          disabled={isLoading || paymentStatus === "paid"}
          className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Mark Paid
        </button>
        <button
          type="button"
          onClick={() => handleQuickMark("pending")}
          disabled={isLoading || paymentStatus === "pending"}
          className="flex-1 px-3 py-2 text-sm bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Mark Pending
        </button>
      </div>

      <hr />

      {/* Payment Details Form */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Payment Status
        </label>
        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value as typeof paymentStatus)}
          className="w-full border rounded-md px-3 py-2 text-sm"
        >
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Amount
        </label>
        <div className="relative">
          <span className="absolute left-3 top-2 text-gray-500">$</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            placeholder="0.00"
            className="w-full border rounded-md px-3 py-2 pl-7 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Payment Notes
        </label>
        <textarea
          value={paymentNotes}
          onChange={(e) => setPaymentNotes(e.target.value)}
          placeholder="e.g., Cash payment, Venmo, etc."
          rows={2}
          className="w-full border rounded-md px-3 py-2 text-sm"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const styles = {
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    refunded: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={`px-2 py-1 text-xs rounded-full capitalize font-medium ${styles[status as keyof typeof styles] || styles.pending}`}
    >
      {status}
    </span>
  );
}
