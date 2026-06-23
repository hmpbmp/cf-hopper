import { Check } from "lucide-react";

interface Step {
  label: string;
  isValid: boolean;
}

interface StepIndicatorProps {
  currentStep: number;
  steps: Step[];
  onStepClick?: (step: number) => void;
}

export function StepIndicator({
  currentStep,
  steps,
  onStepClick,
}: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 md:gap-4 py-4">
      {steps.map((step, idx) => (
        <div key={idx} className="flex items-center">
          <button
            onClick={() => onStepClick?.(idx)}
            disabled={!onStepClick}
            className={`
              flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold
              transition-all duration-200
              ${
                idx === currentStep
                  ? "bg-[#C41230] text-white scale-110"
                  : idx < currentStep || step.isValid
                    ? "bg-[#C41230]/20 text-[#C41230]"
                    : "bg-[#1A1A1A] text-[#666] border border-[#333]"
              }
              ${onStepClick ? "cursor-pointer hover:scale-105" : "cursor-default"}
            `}
          >
            {idx < currentStep || (step.isValid && idx !== currentStep) ? (
              <Check className="w-4 h-4" />
            ) : (
              idx + 1
            )}
          </button>
          <span
            className={`hidden md:inline ml-2 text-sm ${
              idx === currentStep
                ? "text-white font-medium"
                : "text-[#666]"
            }`}
          >
            {step.label}
          </span>
          {idx < steps.length - 1 && (
            <div
              className={`hidden md:block w-8 md:w-12 h-0.5 mx-2 ${
                idx < currentStep ? "bg-[#C41230]/40" : "bg-[#333]"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
