// Configuration for Booking Statuses
const STATUS_CONFIG = {
  confirmed: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    label: "Confirmed",
  },
  pending: {
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
    label: "Pending",
  },
  cancelled: {
    badge: "bg-red-50 text-red-500 border-red-200",
    dot: "bg-red-400",
    label: "Cancelled",
  },
};

// Configuration for Payment Statuses
const PAYMENT_CONFIG = {
  paid: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    label: "Paid",
  },
  pending: {
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    label: "Unpaid",
  },
  failed: { badge: "bg-red-50 text-red-500 border-red-200", label: "Failed" },
};

/**
 * StatusBadge - Renders either a Booking Status pill (with a dot) or a Payment Status pill
 *
 * Props:
 *  type - "booking" | "payment"
 *  status - the status string from the backend (e.g. "pending", "confirmed")
 *  className - optional extra CSS classes
 */
export default function StatusBadge({ type, status, className = "" }) {
  if (type === "booking") {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return (
      <span
        className={`inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full border whitespace-nowrap ${config.badge} ${className}`}
      >
        <span
          className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${config.dot}`}
        />
        {config.label}
      </span>
    );
  }

  if (type === "payment") {
    const config = PAYMENT_CONFIG[status] || PAYMENT_CONFIG.pending;
    return (
      <span
        className={`inline-flex text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full border whitespace-nowrap ${config.badge} ${className}`}
      >
        {config.label}
      </span>
    );
  }

  return null;
}
