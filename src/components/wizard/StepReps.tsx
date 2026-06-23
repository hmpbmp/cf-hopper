import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getMovementById } from "@/data/movements";
import { CATEGORY_LABELS } from "@/data/constants";
import { useWizardStore } from "@/store/useWizardStore";
import type { Movement } from "@/types";

const CATEGORY_COLORS: Record<string, string> = {
  weightlifting: "bg-blue-500/20 text-blue-400",
  gymnastics: "bg-green-500/20 text-green-400",
  monostructural: "bg-yellow-500/20 text-yellow-400",
  strongman: "bg-orange-500/20 text-orange-400",
};

const UNIT_LABELS: Record<string, string> = {
  reps: "reps",
  meters: "m",
  calories: "cal",
  feet: "ft",
};

const UNIT_PLACEHOLDERS: Record<string, string> = {
  reps: "Reps",
  meters: "Meters",
  calories: "Calories",
  feet: "Feet",
};

function getQuickChips(movement: Movement): number[] {
  switch (movement.unit) {
    case "meters":
      return [200, 400, 800];
    case "calories":
      return [10, 20, 30, 50];
    case "feet":
      return [50, 100, 200];
    default:
      return [5, 10, 15, 20];
  }
}

export function StepReps() {
  const {
    selectedMovementIds,
    repConfig,
    showProbabilityWeights,
    probabilityWeights,
    setRepConfig,
    setMovementRepOverride,
    toggleProbabilityWeights,
    setProbabilityWeight,
  } = useWizardStore();

  const selectedMovements = useMemo(
    () =>
      selectedMovementIds
        .map((id) => getMovementById(id))
        .filter((m) => m !== undefined),
    [selectedMovementIds]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Configure Reps</h2>
        <p className="text-[#A0A0A0] text-sm">
          Set rep ranges — each movement uses its own unit (reps, meters, calories, or feet)
        </p>
      </div>

      {/* Global rep scheme */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#A0A0A0]">
          Rep Scheme
        </label>
        <Select
          value={repConfig.scheme}
          onValueChange={(v) =>
            setRepConfig({ scheme: v as typeof repConfig.scheme })
          }
        >
          <SelectTrigger className="bg-[#1A1A1A] border-[#333] text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1A1A1A] border-[#333]">
            <SelectItem value="random">Random within range</SelectItem>
            <SelectItem value="fixed">Fixed reps</SelectItem>
          </SelectContent>
        </Select>
      </div>


      {/* Probability weights toggle */}
      <div className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded-lg border border-[#333]">
        <div>
          <p className="text-sm font-medium text-white">
            Probability Weights
          </p>
          <p className="text-xs text-[#666]">
            Weight which movements are more likely to appear
          </p>
        </div>
        <Switch
          checked={showProbabilityWeights}
          onCheckedChange={toggleProbabilityWeights}
        />
      </div>

      {/* Movement list with reps */}
      <ScrollArea className="h-[350px]">
        <div className="space-y-3">
          {selectedMovements.map((movement) => {
            if (!movement) return null;
            const override = repConfig.movementOverrides[movement.id];
            const weight = probabilityWeights[movement.id] ?? 1;
            const unitLabel = UNIT_LABELS[movement.unit] || "reps";
            const quickChips = getQuickChips(movement);

            return (
              <div
                key={movement.id}
                className="p-3 bg-[#1A1A1A] rounded-lg border border-[#333]"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white text-sm">
                      {movement.name}
                    </span>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] ${CATEGORY_COLORS[movement.category]}`}
                    >
                      {CATEGORY_LABELS[movement.category]}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] bg-[#333] text-[#A0A0A0]">
                      {unitLabel}
                    </Badge>
                  </div>
                  {movement.isWeighted && movement.defaultLoad && (
                    <span className="text-xs text-[#666]">
                      Rx: {movement.defaultLoad.male}/{movement.defaultLoad.female} lb
                    </span>
                  )}
                </div>

                {/* Typical range hint */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] text-[#666]">
                    Typical: {movement.typicalRange.min}–{movement.typicalRange.max} {unitLabel}
                  </span>
                  <span className="text-[10px] text-[#666]">
                    (default: {movement.defaultValue} {unitLabel})
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {repConfig.scheme === "fixed" ? (
                    <>
                      <div className="flex-1">
                        <Input
                          type="number"
                          min={1}
                          placeholder={UNIT_PLACEHOLDERS[movement.unit] || "Value"}
                          value={override?.min ?? movement.defaultValue}
                          onChange={(e) => {
                            const v = parseInt(e.target.value) || movement.defaultValue;
                            setMovementRepOverride(movement.id, v, v);
                          }}
                          className="bg-[#0A0A0A] border-[#333] text-white text-sm h-8"
                        />
                      </div>
                      <div className="flex gap-1">
                        {quickChips.map((val) => (
                          <button
                            key={val}
                            onClick={() =>
                              setMovementRepOverride(movement.id, val, val)
                            }
                            className="w-10 h-7 rounded text-[10px] bg-[#0A0A0A] border border-[#333] text-[#666] hover:text-white hover:border-[#666]"
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          min={1}
                          placeholder={`Min ${unitLabel}`}
                          value={override?.min ?? movement.typicalRange.min}
                          onChange={(e) =>
                            setMovementRepOverride(
                              movement.id,
                              parseInt(e.target.value) || movement.typicalRange.min,
                              override?.max ?? movement.typicalRange.max
                            )
                          }
                          className="bg-[#0A0A0A] border-[#333] text-white text-sm h-8"
                        />
                        <Input
                          type="number"
                          min={1}
                          placeholder={`Max ${unitLabel}`}
                          value={override?.max ?? movement.typicalRange.max}
                          onChange={(e) =>
                            setMovementRepOverride(
                              movement.id,
                              override?.min ?? movement.typicalRange.min,
                              parseInt(e.target.value) || movement.typicalRange.max
                            )
                          }
                          className="bg-[#0A0A0A] border-[#333] text-white text-sm h-8"
                        />
                      </div>
                      <div className="flex gap-1">
                        {quickChips.map((val) => (
                          <button
                            key={val}
                            onClick={() =>
                              setMovementRepOverride(movement.id, val, val)
                            }
                            className="w-10 h-7 rounded text-[10px] bg-[#0A0A0A] border border-[#333] text-[#666] hover:text-white hover:border-[#666]"
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Probability weight slider */}
                {showProbabilityWeights && (
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-xs text-[#666] w-16">Weight:</span>
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      value={[weight]}
                      onValueChange={(value: number | readonly number[]) => {
                        const v = Array.isArray(value) ? value[0] : value;
                        setProbabilityWeight(movement.id, v);
                      }}
                      className="flex-1"
                    />
                    <span className="text-xs text-white w-6 text-right">
                      {weight}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
