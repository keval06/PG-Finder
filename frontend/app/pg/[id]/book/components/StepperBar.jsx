import { Check } from "lucide-react";

/**
 * StepperBar — shows step progress for multi-step wizard
 *
 * Props:
 *   steps  — string[]  e.g. ["Room", "Dates", "Confirm"]
 *   currentStep — number   index of the active step (0-based)
 */
export default function StepperBar({ steps, currentStep }) {
  return (
    <div className="flex items-center mb-6 sm:mb-8">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center flex-1">
          {/* circle + label */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold transition-all ${
                i < currentStep
                  ? "bg-green-500 text-white"
                  : i === currentStep
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-400"
              }`}
            >
              {i < currentStep ? <Check size={11} /> : i + 1}
            </div>
            <span
              className={`text-[11px] sm:text-sm font-medium ${
                i === currentStep ? "text-slate-900" : "text-slate-400"
              }`}
            >
              {label}
            </span>
          </div>

          {/* connector line */}
          {i < steps.length - 1 && (
            <div className="flex-1 h-px bg-slate-200 mx-2 sm:mx-3" />
          )}
        </div>
      ))}
    </div>
  );
}
