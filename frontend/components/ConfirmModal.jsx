import { X, AlertCircle } from "lucide-react";
import Button from "../app/atoms/Button";
/**
 * ConfirmModal - A reusable bottom-sheet / modal for confirming actions
 *
 * Props:
 *  isOpen - Boolean, show modal or not
 *  onConfirm - Function to call on confirmation
 *  onClose - Function to call on cancel/dismiss
 *  title - Modal title (default: "Confirm Action")
 *  description - Modal description
 *  confirmText - Text for the confirm button (default: "Confirm")
 *  cancelText - Text for the cancel button (default: "Cancel")
 *  processing - Boolean, show loading state
 *  error - String, error message to display
 *  variant - "danger" | "primary" (default: "danger")
 */
export default function ConfirmModal({
  isOpen,
  onConfirm,
  onClose,
  title = "Confirm Action",
  description = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  processing,
  error,
  variant = "danger",
  children,
}) {
  if (!isOpen) return null;

  const isDanger = variant === "danger";

  return (
    <div className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl p-5 sm:p-6 w-full sm:max-w-xs flex flex-col gap-4 z-10 border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="text-center">
          {/* mobile handle bar */}
          <div className="w-8 h-1 rounded-full bg-slate-200 mx-auto mb-4 sm:hidden" />

          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 border ${
              isDanger
                ? "bg-red-50 border-red-100 text-red-500"
                : "bg-rose-50 border-rose-100 text-rose-500"
            }`}
          >
            {isDanger ? <X size={22} /> : <AlertCircle size={22} />}
          </div>

          <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1">
            {title}
          </h3>
          <p className="text-[15px] text-slate-600 leading-normal">{description}</p>
        </div>

        {children}

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-medium text-red-600">
            {error}
          </div>
        )}

        <div className="flex gap-2.5 pt-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onClose}
          >
            {cancelText}
          </Button>
          <Button
            variant={isDanger ? "danger" : "primary"}
            className="flex-1"
            onClick={onConfirm}
            loading={processing}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
