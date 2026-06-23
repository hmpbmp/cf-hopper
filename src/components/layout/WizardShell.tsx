import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "./StepIndicator";
import { useWizardStore } from "@/store/useWizardStore";

interface WizardShellProps {
  children: ReactNode;
}

const STEPS = [
  { label: "Movements", isValid: false },
  { label: "Reps", isValid: true },
  { label: "Format", isValid: true },
  { label: "How Many", isValid: true },
  { label: "Review", isValid: true },
];

const LAST_STEP = 4;

export function WizardShell({ children }: WizardShellProps) {
  const { currentStep, nextStep, prevStep, goToStep, selectedMovementIds } =
    useWizardStore();

  const steps = [...STEPS];
  steps[0].isValid = selectedMovementIds.length >= 3;

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === LAST_STEP;
  const canNext = currentStep < LAST_STEP && steps[currentStep].isValid;

  return (
    <div className="min-h-screen pt-20 pb-24 px-4">
      <div className="max-w-4xl mx-auto">
        <StepIndicator
          currentStep={currentStep}
          steps={steps}
          onStepClick={goToStep}
        />

        <div className="mt-6">{children}</div>

        <div className="fixed bottom-0 left-0 right-0 bg-[#0A0A0A] border-t border-[#333] p-4">
          <div className="max-w-4xl mx-auto flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={isFirstStep}
              className="border-[#333] text-[#A0A0A0] hover:text-white hover:border-[#666]"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {!isLastStep && (
              <Button
                onClick={nextStep}
                disabled={!canNext}
                className="bg-[#C41230] hover:bg-[#8B0D22] text-white"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
