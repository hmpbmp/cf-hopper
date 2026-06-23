import { useState, useEffect } from "react";
import { ArrowLeft, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FORMAT_LABELS, TIME_DOMAINS } from "@/data/constants";
import { useWizardStore } from "@/store/useWizardStore";
import * as presetsApi from "@/api/presets";
import type { Preset } from "@/types";

const BUILT_IN_PRESETS: Preset[] = [
  {
    id: "crossfit-open",
    name: "CrossFit Open Style",
    description: "Competitive movements, standard loads, For Time/AMRAP",
    config: {
      movementIds: [
        "thruster",
        "pull-up",
        "box-jump",
        "bar-facing-burpee",
        "power-clean",
        "push-jerk",
        "row",
      ],
      repConfig: { scheme: "random", minReps: 5, maxReps: 25, movementOverrides: {} },
      formats: ["random"],
      formatParams: {},
      timeDomain: "any",
      simulationCount: 1,
      probabilityWeights: {},
    },
    isBuiltIn: true,
  },
  {
    id: "hero-wod",
    name: "Hero WOD Style",
    description: "Long chipper/AMRAP, classic movements",
    config: {
      movementIds: [
        "deadlift",
        "run",
        "pull-up",
        "box-jump",
        "burpee",
        "kb-swing",
        "thruster",
      ],
      repConfig: { scheme: "random", minReps: 10, maxReps: 50, movementOverrides: {} },
      formats: ["random"],
      formatParams: {},
      timeDomain: "long",
      simulationCount: 1,
      probabilityWeights: {},
    },
    isBuiltIn: true,
  },
  {
    id: "quick-burn",
    name: "Quick Burn",
    description: "5-10 min sprint, simple movements",
    config: {
      movementIds: ["burpee", "air-squat", "box-jump", "row", "double-under"],
      repConfig: { scheme: "random", minReps: 10, maxReps: 20, movementOverrides: {} },
      formats: ["for_time"],
      formatParams: { timeCap: 10 },
      timeDomain: "sprint",
      simulationCount: 1,
      probabilityWeights: {},
    },
    isBuiltIn: true,
  },
  {
    id: "gymnastics-focus",
    name: "Gymnastics Focus",
    description: "Bodyweight dominant, high-skill",
    config: {
      movementIds: [
        "pull-up",
        "push-up",
        "sit-up",
        "wall-walk",
        "handstand-push-up",
        "toes-to-bar",
        "muscle-up",
        "burpee",
      ],
      repConfig: { scheme: "random", minReps: 5, maxReps: 25, movementOverrides: {} },
      formats: ["random"],
      formatParams: {},
      timeDomain: "any",
      simulationCount: 1,
      probabilityWeights: {},
    },
    isBuiltIn: true,
  },
  {
    id: "strength-focus",
    name: "Strength Focus",
    description: "Barbell dominant, heavier loads, lower reps",
    config: {
      movementIds: [
        "deadlift",
        "back-squat",
        "front-squat",
        "power-clean",
        "push-jerk",
        "thruster",
      ],
      repConfig: { scheme: "random", minReps: 3, maxReps: 15, movementOverrides: {} },
      formats: ["random"],
      formatParams: {},
      timeDomain: "any",
      simulationCount: 1,
      probabilityWeights: {},
    },
    isBuiltIn: true,
  },
  {
    id: "cardio-blast",
    name: "Cardio Blast",
    description: "Monostructural dominant, longer duration",
    config: {
      movementIds: ["row", "bike", "run", "ski", "double-under", "box-jump"],
      repConfig: { scheme: "random", minReps: 10, maxReps: 30, movementOverrides: {} },
      formats: ["amrap"],
      formatParams: { duration: 20 },
      timeDomain: "medium",
      simulationCount: 1,
      probabilityWeights: {},
    },
    isBuiltIn: true,
  },
  {
    id: "no-equipment",
    name: "No Equipment",
    description: "Bodyweight only",
    config: {
      movementIds: [
        "air-squat",
        "push-up",
        "burpee",
        "sit-up",
        "lunge",
        "bear-crawl",
      ],
      repConfig: { scheme: "random", minReps: 10, maxReps: 30, movementOverrides: {} },
      formats: ["random"],
      formatParams: {},
      timeDomain: "any",
      simulationCount: 1,
      probabilityWeights: {},
    },
    isBuiltIn: true,
  },
  {
    id: "minimal-equipment",
    name: "Minimal Equipment",
    description: "Dumbbell or kettlebell only",
    config: {
      movementIds: [
        "db-thruster",
        "db-snatch",
        "kb-swing",
        "db-deadlift",
        "db-walking-lunge",
        "devil-press",
      ],
      repConfig: { scheme: "random", minReps: 8, maxReps: 20, movementOverrides: {} },
      formats: ["random"],
      formatParams: {},
      timeDomain: "any",
      simulationCount: 1,
      probabilityWeights: {},
    },
    isBuiltIn: true,
  },
];

interface PresetsPageProps {
  onBack: () => void;
  onLoadPreset: () => void;
}

export function PresetsPage({ onBack, onLoadPreset }: PresetsPageProps) {
  const { loadConfig } = useWizardStore();
  const [customPresets, setCustomPresets] = useState<Preset[]>([]);

  useEffect(() => {
    const loadCustomPresets = async () => {
      try {
        const allPresets = await presetsApi.fetchPresets();
        const custom = allPresets.filter((p) => !p.isBuiltIn);
        setCustomPresets(custom);
      } catch (err) {
        console.error("Failed to load presets:", err);
      }
    };
    loadCustomPresets();
  }, []);

  const handleUsePreset = (preset: Preset) => {
    loadConfig(preset.config);
    onLoadPreset();
  };

  const handleDeletePreset = async (id: string) => {
    try {
      await presetsApi.deletePreset(id);
      setCustomPresets((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Failed to delete preset:", err);
    }
  };

  const getFormatLabel = (formats: string[]) => {
    if (formats.includes("random")) return "Random";
    return formats.map((f) => FORMAT_LABELS[f] || f).join(", ");
  };

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-[#A0A0A0] hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h2 className="text-2xl font-bold text-white">Presets</h2>
        </div>

        {/* Built-in presets */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-[#A0A0A0] mb-4">
            Built-in Presets
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BUILT_IN_PRESETS.map((preset) => (
              <div
                key={preset.id}
                className="p-4 bg-[#1A1A1A] rounded-lg border border-[#333]"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-white">{preset.name}</h4>
                  <Badge variant="secondary" className="bg-[#333] text-[#A0A0A0] text-xs">
                    {preset.config.movementIds.length} movements
                  </Badge>
                </div>
                <p className="text-sm text-[#666] mb-3">
                  {preset.description}
                </p>
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-[#C41230]/20 text-[#C41230] text-xs">
                    {getFormatLabel(preset.config.formats)}
                  </Badge>
                  {preset.config.timeDomain !== "any" && (
                    <Badge className="bg-[#F5A623]/20 text-[#F5A623] text-xs">
                      {TIME_DOMAINS[preset.config.timeDomain]?.label || preset.config.timeDomain}
                    </Badge>
                  )}
                  <span className="text-xs text-[#666]">
                    Reps: {preset.config.repConfig.minReps}-{preset.config.repConfig.maxReps}
                  </span>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleUsePreset(preset)}
                  className="bg-[#C41230] hover:bg-[#8B0D22] text-white w-full"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Use This Preset
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Custom presets */}
        {customPresets.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-[#A0A0A0] mb-4">
              Custom Presets
            </h3>
            <ScrollArea className="max-h-[400px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customPresets.map((preset) => (
                  <div
                    key={preset.id}
                    className="p-4 bg-[#1A1A1A] rounded-lg border border-[#333]"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-white">{preset.name}</h4>
                      <button
                        onClick={() => handleDeletePreset(preset.id)}
                        className="p-1 text-[#666] hover:text-[#C41230]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-[#666] mb-3">
                      {preset.description}
                    </p>
                    <Button
                      size="sm"
                      onClick={() => handleUsePreset(preset)}
                      className="bg-[#C41230] hover:bg-[#8B0D22] text-white w-full"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Use This Preset
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}
