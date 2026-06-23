import { useMemo } from "react";
import { Play, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getMovementById } from "@/data/movements";
import { FORMAT_LABELS } from "@/data/constants";
import { useWizardStore } from "@/store/useWizardStore";
import { simulateMultiple, simulateOnce } from "@/engine/simulator";

const CATEGORY_COLORS: Record<string, string> = {
  weightlifting: "bg-blue-500/20 text-blue-400",
  gymnastics: "bg-green-500/20 text-green-400",
  monostructural: "bg-yellow-500/20 text-yellow-400",
  strongman: "bg-orange-500/20 text-orange-400",
};

export function StepReview() {
  const {
    selectedMovementIds,
    repConfig,
    selectedFormats,
    formatParams,
    formatParamsByFormat,
    simulationCount,
    setGeneratedWorkouts,
    reset,
  } = useWizardStore();

  const selectedMovements = useMemo(
    () =>
      selectedMovementIds
        .map((id) => getMovementById(id))
        .filter((m) => m !== undefined),
    [selectedMovementIds]
  );

  const buildConfig = useMemo(() => {
    const baseConfig = {
      movementIds: selectedMovementIds,
      repConfig,
      formats: selectedFormats,
      formatParams,
      formatParamsByFormat,
      timeDomain: "any" as const,
      simulationCount,
      probabilityWeights: useWizardStore.getState().probabilityWeights,
    };
    return baseConfig;
  }, [selectedMovementIds, repConfig, selectedFormats, formatParams, formatParamsByFormat, simulationCount]);

  const handleGenerate = () => {
    const workouts =
      simulationCount === 1
        ? [simulateOnce(buildConfig)]
        : simulateMultiple(buildConfig);

    setGeneratedWorkouts(workouts);
  };

  const handleSaveConfig = () => {
    const presets = JSON.parse(localStorage.getItem("hopper-presets") || "[]");
    const formatLabel = selectedFormats.includes("random")
      ? "Random"
      : selectedFormats.map((f) => FORMAT_LABELS[f] || f).join(", ");
    presets.push({
      id: crypto.randomUUID(),
      name: `Custom Preset ${presets.length + 1}`,
      description: `${selectedMovementIds.length} movements, ${formatLabel}`,
      config,
      isBuiltIn: false,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("hopper-presets", JSON.stringify(presets));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Review & Generate
        </h2>
        <p className="text-[#A0A0A0] text-sm">
          Review your configuration and generate workouts
        </p>
      </div>

      <div className="p-4 bg-[#1A1A1A] rounded-lg border border-[#333] space-y-4">
        {/* Formats */}
        <div className="flex items-center justify-between">
          <span className="text-[#A0A0A0] text-sm">Format{selectedFormats.length !== 1 ? "s" : ""}</span>
          <div className="flex flex-wrap gap-1 justify-end">
            {selectedFormats.map((f) => (
              <Badge key={f} className="bg-[#C41230]/20 text-[#C41230] text-xs">
                {FORMAT_LABELS[f] || f}
              </Badge>
            ))}
          </div>
        </div>

        <Separator className="bg-[#333]" />

        {/* Movements */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#A0A0A0] text-sm">Movements</span>
            <Badge variant="secondary" className="bg-[#333] text-white">
              {selectedMovementIds.length}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedMovements.map(
              (m) =>
                m && (
                  <Badge
                    key={m.id}
                    variant="secondary"
                    className={`text-xs ${CATEGORY_COLORS[m.category]}`}
                  >
                    {m.name}
                  </Badge>
                )
            )}
          </div>
        </div>

        <Separator className="bg-[#333]" />

        {/* Reps */}
        <div className="flex items-center justify-between">
          <span className="text-[#A0A0A0] text-sm">Rep Scheme</span>
          <span className="text-white text-sm">
            {repConfig.scheme === "random"
              ? `${repConfig.minReps}-${repConfig.maxReps}`
              : repConfig.scheme}
          </span>
        </div>

        <Separator className="bg-[#333]" />

        {/* Simulation count */}
        <div className="flex items-center justify-between">
          <span className="text-[#A0A0A0] text-sm">Workouts</span>
          <span className="text-white text-sm font-medium">
            {simulationCount}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Button
          onClick={handleGenerate}
          size="lg"
          className="bg-[#C41230] hover:bg-[#8B0D22] text-white h-14 text-lg font-semibold"
        >
          <Play className="w-5 h-5 mr-3" />
          Generate Workout{simulationCount !== 1 ? "s" : ""}
        </Button>

        <div className="flex gap-3">
          <Button
            onClick={handleSaveConfig}
            variant="outline"
            className="flex-1 border-[#333] text-[#A0A0A0] hover:text-white hover:border-[#666]"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Config
          </Button>
          <Button
            onClick={reset}
            variant="outline"
            className="flex-1 border-[#333] text-[#A0A0A0] hover:text-white hover:border-[#666]"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
