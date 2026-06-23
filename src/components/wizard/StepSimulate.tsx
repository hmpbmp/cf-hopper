import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useWizardStore } from "@/store/useWizardStore";

const QUICK_COUNTS = [1, 5, 10, 25];

export function StepSimulate() {
  const { simulationCount, setSimulationCount } = useWizardStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Simulation</h2>
        <p className="text-[#A0A0A0] text-sm">
          How many workouts should the hopper generate?
        </p>
      </div>

      <div className="p-6 bg-[#1A1A1A] rounded-lg border border-[#333] text-center">
        <div className="text-6xl font-bold text-[#C41230] mb-6">
          {simulationCount}
        </div>

        <Slider
          min={1}
          max={50}
          step={1}
          value={[simulationCount]}
          onValueChange={(value: number | readonly number[]) => {
            const v = Array.isArray(value) ? value[0] : value;
            setSimulationCount(v);
          }}
          className="mb-6"
        />

        <div className="flex justify-center gap-3">
          {QUICK_COUNTS.map((count) => (
            <Button
              key={count}
              variant="outline"
              onClick={() => setSimulationCount(count)}
              className={`${
                simulationCount === count
                  ? "bg-[#C41230] text-white border-[#C41230]"
                  : "border-[#333] text-[#A0A0A0] hover:text-white hover:border-[#666]"
              }`}
            >
              {count}
            </Button>
          ))}
        </div>

        <p className="text-[#666] text-sm mt-6">
          Will generate{" "}
          <span className="text-white font-medium">{simulationCount}</span>{" "}
          workout{simulationCount !== 1 ? "s" : ""}
        </p>

        {simulationCount > 10 && (
          <p className="text-[#F5A623] text-xs mt-2">
            Large batch — may take a moment
          </p>
        )}
      </div>
    </div>
  );
}
