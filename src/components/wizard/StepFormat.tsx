import type { ElementType } from "react";
import {
  Clock,
  Repeat,
  Timer,
  ArrowUpDown,
  Dumbbell,
  ListChecks,
  TrendingUp,
  Zap,
  Shuffle,
  Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FORMAT_LABELS } from "@/data/constants";
import { useWizardStore } from "@/store/useWizardStore";
import type { WorkoutFormat, FormatParams } from "@/types";

const FORMAT_CARDS: {
  format: WorkoutFormat;
  icon: ElementType;
  description: string;
}[] = [
  {
    format: "for_time",
    icon: Clock,
    description: "Complete for time with optional time cap",
  },
  {
    format: "amrap",
    icon: Repeat,
    description: "As many rounds as possible",
  },
  {
    format: "emom",
    icon: Timer,
    description: "Every minute on the minute",
  },
  {
    format: "intervals",
    icon: ArrowUpDown,
    description: "Fixed work and rest periods",
  },
  {
    format: "for_load",
    icon: Dumbbell,
    description: "Max load for reps",
  },
  {
    format: "chipper",
    icon: ListChecks,
    description: "One big round",
  },
  {
    format: "ladder",
    icon: TrendingUp,
    description: "Ascending/descending reps",
  },
  {
    format: "classic",
    icon: Zap,
    description: "Classic 21-15-9 style descending reps",
  },
  {
    format: "random",
    icon: Shuffle,
    description: "Let the hopper decide",
  },
];

export function StepFormat() {
  const { selectedFormats, formatParamsByFormat, toggleFormat, selectAllFormats, setFormatParamsForFormat } =
    useWizardStore();

  const isRandom = selectedFormats.includes("random");
  const activeFormats = selectedFormats.filter((f) => f !== "random");

  // Helper to get params for a specific format
  const getParams = (fmt: WorkoutFormat): FormatParams =>
    formatParamsByFormat[fmt] || {};


  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Choose Format</h2>
        <p className="text-[#A0A0A0] text-sm">
          Select one or more workout formats — each generated workout will pick from your selection
        </p>
      </div>

      {/* Select All */}
      <div className="flex justify-end">
        <button
          onClick={selectAllFormats}
          className="text-xs text-[#C41230] hover:text-[#ff4d6a] transition-colors"
        >
          Select All
        </button>
      </div>

      {/* Format cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {FORMAT_CARDS.map(({ format: fmt, icon: Icon, description }) => {
          const selected = selectedFormats.includes(fmt);
          return (
            <button
              key={fmt}
              onClick={() => toggleFormat(fmt)}
              className={`
                p-4 rounded-lg text-left transition-all border relative
                ${
                  selected
                    ? "bg-[#C41230]/10 border-[#C41230]/50"
                    : "bg-[#1A1A1A] border-[#333] hover:border-[#666]"
                }
              `}
            >
              {selected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-[#C41230] rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              <div className="flex items-center gap-3 mb-2">
                <Icon
                  className={`w-5 h-5 ${
                    selected ? "text-[#C41230]" : "text-[#666]"
                  }`}
                />
                <span
                  className={`font-semibold ${
                    selected ? "text-white" : "text-[#A0A0A0]"
                  }`}
                >
                  {FORMAT_LABELS[fmt]}
                </span>
              </div>
              <p className="text-xs text-[#666]">{description}</p>
            </button>
          );
        })}
      </div>

      {/* Format-specific parameters — show for each active format */}
      {!isRandom && activeFormats.length > 0 && (
        <div className="space-y-4">
          {activeFormats.map((fmt) => (
            <div
              key={fmt}
              className="p-4 bg-[#1A1A1A] rounded-lg border border-[#333] space-y-4"
            >
              <h3 className="text-sm font-medium text-[#A0A0A0]">
                {FORMAT_LABELS[fmt]} Settings
              </h3>

              {fmt === "for_time" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-[#666]">Time Cap (min)</label>
                    <Select
                      value={String(getParams(fmt).timeCap || "")}
                      onValueChange={(v) =>
                        setFormatParamsForFormat(fmt, { timeCap: v ? Number(v) : undefined })
                      }
                    >
                      <SelectTrigger className="bg-[#0A0A0A] border-[#333] text-white">
                        <SelectValue placeholder="No cap" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1A1A1A] border-[#333]">
                        <SelectItem value="5">5 min</SelectItem>
                        <SelectItem value="8">8 min</SelectItem>
                        <SelectItem value="10">10 min</SelectItem>
                        <SelectItem value="12">12 min</SelectItem>
                        <SelectItem value="15">15 min</SelectItem>
                        <SelectItem value="20">20 min</SelectItem>
                        <SelectItem value="25">25 min</SelectItem>
                        <SelectItem value="30">30 min</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-[#666]">Rounds</label>
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      placeholder="Random"
                      value={getParams(fmt).rounds || ""}
                      onChange={(e) =>
                        setFormatParamsForFormat(fmt, {
                          rounds: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      className="bg-[#0A0A0A] border-[#333] text-white"
                    />
                  </div>
                </div>
              )}

              {fmt === "amrap" && (
                <div className="space-y-2">
                  <label className="text-xs text-[#666]">Duration (minutes)</label>
                  <Select
                    value={String(getParams(fmt).duration || "")}
                    onValueChange={(v) =>
                      setFormatParamsForFormat(fmt, { duration: v ? Number(v) : undefined })
                    }
                  >
                    <SelectTrigger className="bg-[#0A0A0A] border-[#333] text-white">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1A1A] border-[#333]">
                      <SelectItem value="7">7 min</SelectItem>
                      <SelectItem value="10">10 min</SelectItem>
                      <SelectItem value="12">12 min</SelectItem>
                      <SelectItem value="15">15 min</SelectItem>
                      <SelectItem value="20">20 min</SelectItem>
                      <SelectItem value="25">25 min</SelectItem>
                      <SelectItem value="30">30 min</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {fmt === "emom" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs text-[#666]">Duration (minutes)</label>
                    <Select
                      value={String(getParams(fmt).duration || "")}
                      onValueChange={(v) =>
                        setFormatParamsForFormat(fmt, { duration: v ? Number(v) : undefined })
                      }
                    >
                      <SelectTrigger className="bg-[#0A0A0A] border-[#333] text-white">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1A1A1A] border-[#333]">
                        <SelectItem value="8">8 min</SelectItem>
                        <SelectItem value="10">10 min</SelectItem>
                        <SelectItem value="12">12 min</SelectItem>
                        <SelectItem value="15">15 min</SelectItem>
                        <SelectItem value="20">20 min</SelectItem>
                        <SelectItem value="24">24 min</SelectItem>
                        <SelectItem value="30">30 min</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-[#666]">Work Pattern</label>
                    <Select
                      value={getParams(fmt).emomPattern || "every"}
                      onValueChange={(v) =>
                        setFormatParamsForFormat(fmt, {
                          emomPattern: v as "every" | "odd_even" | "blocks",
                        })
                      }
                    >
                      <SelectTrigger className="bg-[#0A0A0A] border-[#333] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1A1A1A] border-[#333]">
                        <SelectItem value="every">Every minute</SelectItem>
                        <SelectItem value="odd_even">Odd/Even</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {fmt === "intervals" && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-[#666]">Work (sec)</label>
                    <Input
                      type="number"
                      min={10}
                      max={120}
                      value={getParams(fmt).workInterval || 40}
                      onChange={(e) =>
                        setFormatParamsForFormat(fmt, { workInterval: Number(e.target.value) })
                      }
                      className="bg-[#0A0A0A] border-[#333] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-[#666]">Rest (sec)</label>
                    <Input
                      type="number"
                      min={5}
                      max={60}
                      value={getParams(fmt).restInterval || 20}
                      onChange={(e) =>
                        setFormatParamsForFormat(fmt, { restInterval: Number(e.target.value) })
                      }
                      className="bg-[#0A0A0A] border-[#333] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-[#666]">Rounds</label>
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      value={getParams(fmt).rounds || 5}
                      onChange={(e) =>
                        setFormatParamsForFormat(fmt, { rounds: Number(e.target.value) })
                      }
                      className="bg-[#0A0A0A] border-[#333] text-white"
                    />
                  </div>
                </div>
              )}

              {fmt === "for_load" && (
                <div className="space-y-2">
                  <label className="text-xs text-[#666]">Rep Target</label>
                  <Select
                    value={String(getParams(fmt).rounds || 1)}
                    onValueChange={(v) =>
                      setFormatParamsForFormat(fmt, { rounds: Number(v) })
                    }
                  >
                    <SelectTrigger className="bg-[#0A0A0A] border-[#333] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1A1A] border-[#333]">
                      <SelectItem value="1">1RM (Find max)</SelectItem>
                      <SelectItem value="3">3RM</SelectItem>
                      <SelectItem value="5">5RM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {fmt === "chipper" && (
                <div className="space-y-2">
                  <label className="text-xs text-[#666]">Movement Count</label>
                  <Input
                    type="number"
                    min={3}
                    max={8}
                    placeholder="3-6"
                    value={getParams(fmt).rounds || ""}
                    onChange={(e) =>
                      setFormatParamsForFormat(fmt, {
                        rounds: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="bg-[#0A0A0A] border-[#333] text-white"
                  />
                </div>
              )}

              {fmt === "ladder" && (
                <div className="space-y-2">
                  <label className="text-xs text-[#666]">Start Reps</label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={getParams(fmt).rounds || 1}
                    onChange={(e) =>
                      setFormatParamsForFormat(fmt, { rounds: Number(e.target.value) })
                    }
                    className="bg-[#0A0A0A] border-[#333] text-white"
                  />
                </div>
              )}

              {fmt === "classic" && (
                <div className="space-y-2">
                  <label className="text-xs text-[#666]">Pattern</label>
                  <Select
                    value={String(getParams(fmt).rounds || "")}
                    onValueChange={(v) =>
                      setFormatParamsForFormat(fmt, { rounds: v ? Number(v) : undefined })
                    }
                  >
                    <SelectTrigger className="bg-[#0A0A0A] border-[#333] text-white">
                      <SelectValue placeholder="Random pattern" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1A1A] border-[#333]">
                      <SelectItem value="1">21-15-9</SelectItem>
                      <SelectItem value="2">15-12-9</SelectItem>
                      <SelectItem value="3">21-15-9-3</SelectItem>
                      <SelectItem value="4">15-15-15</SelectItem>
                      <SelectItem value="5">12-9-6</SelectItem>
                      <SelectItem value="6">10-10-10</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isRandom && (
        <div className="space-y-4">
          <div className="p-4 bg-[#1A1A1A] rounded-lg border border-[#333] text-center">
            <Shuffle className="w-8 h-8 text-[#C41230] mx-auto mb-2" />
            <p className="text-sm text-[#A0A0A0]">
              Format will be randomly selected from all available options
            </p>
          </div>
          <p className="text-xs text-[#666]">
            Configure defaults for each format — the generator will use these when the format is randomly selected:
          </p>
          {(["for_time", "amrap", "emom", "intervals", "for_load", "chipper", "ladder", "classic"] as WorkoutFormat[]).map((fmt) => (
            <div
              key={fmt}
              className="p-4 bg-[#1A1A1A] rounded-lg border border-[#333] space-y-4"
            >
              <h3 className="text-sm font-medium text-[#A0A0A0]">
                {FORMAT_LABELS[fmt]} Settings
              </h3>

              {fmt === "for_time" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-[#666]">Time Cap (min)</label>
                    <Select
                      value={String(getParams(fmt).timeCap || "")}
                      onValueChange={(v) =>
                        setFormatParamsForFormat(fmt, { timeCap: v ? Number(v) : undefined })
                      }
                    >
                      <SelectTrigger className="bg-[#0A0A0A] border-[#333] text-white">
                        <SelectValue placeholder="No cap" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1A1A1A] border-[#333]">
                        <SelectItem value="5">5 min</SelectItem>
                        <SelectItem value="8">8 min</SelectItem>
                        <SelectItem value="10">10 min</SelectItem>
                        <SelectItem value="12">12 min</SelectItem>
                        <SelectItem value="15">15 min</SelectItem>
                        <SelectItem value="20">20 min</SelectItem>
                        <SelectItem value="25">25 min</SelectItem>
                        <SelectItem value="30">30 min</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-[#666]">Rounds</label>
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      placeholder="Random"
                      value={getParams(fmt).rounds || ""}
                      onChange={(e) =>
                        setFormatParamsForFormat(fmt, {
                          rounds: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      className="bg-[#0A0A0A] border-[#333] text-white"
                    />
                  </div>
                </div>
              )}

              {fmt === "amrap" && (
                <div className="space-y-2">
                  <label className="text-xs text-[#666]">Duration (minutes)</label>
                  <Select
                    value={String(getParams(fmt).duration || "")}
                    onValueChange={(v) =>
                      setFormatParamsForFormat(fmt, { duration: v ? Number(v) : undefined })
                    }
                  >
                    <SelectTrigger className="bg-[#0A0A0A] border-[#333] text-white">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1A1A] border-[#333]">
                      <SelectItem value="7">7 min</SelectItem>
                      <SelectItem value="10">10 min</SelectItem>
                      <SelectItem value="12">12 min</SelectItem>
                      <SelectItem value="15">15 min</SelectItem>
                      <SelectItem value="20">20 min</SelectItem>
                      <SelectItem value="25">25 min</SelectItem>
                      <SelectItem value="30">30 min</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {fmt === "emom" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs text-[#666]">Duration (minutes)</label>
                    <Select
                      value={String(getParams(fmt).duration || "")}
                      onValueChange={(v) =>
                        setFormatParamsForFormat(fmt, { duration: v ? Number(v) : undefined })
                      }
                    >
                      <SelectTrigger className="bg-[#0A0A0A] border-[#333] text-white">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1A1A1A] border-[#333]">
                        <SelectItem value="8">8 min</SelectItem>
                        <SelectItem value="10">10 min</SelectItem>
                        <SelectItem value="12">12 min</SelectItem>
                        <SelectItem value="15">15 min</SelectItem>
                        <SelectItem value="20">20 min</SelectItem>
                        <SelectItem value="24">24 min</SelectItem>
                        <SelectItem value="30">30 min</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-[#666]">Work Pattern</label>
                    <Select
                      value={getParams(fmt).emomPattern || "every"}
                      onValueChange={(v) =>
                        setFormatParamsForFormat(fmt, {
                          emomPattern: v as "every" | "odd_even" | "blocks",
                        })
                      }
                    >
                      <SelectTrigger className="bg-[#0A0A0A] border-[#333] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1A1A1A] border-[#333]">
                        <SelectItem value="every">Every minute</SelectItem>
                        <SelectItem value="odd_even">Odd/Even</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {fmt === "intervals" && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-[#666]">Work (sec)</label>
                    <Input
                      type="number"
                      min={10}
                      max={120}
                      value={getParams(fmt).workInterval || 40}
                      onChange={(e) =>
                        setFormatParamsForFormat(fmt, { workInterval: Number(e.target.value) })
                      }
                      className="bg-[#0A0A0A] border-[#333] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-[#666]">Rest (sec)</label>
                    <Input
                      type="number"
                      min={5}
                      max={60}
                      value={getParams(fmt).restInterval || 20}
                      onChange={(e) =>
                        setFormatParamsForFormat(fmt, { restInterval: Number(e.target.value) })
                      }
                      className="bg-[#0A0A0A] border-[#333] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-[#666]">Rounds</label>
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      value={getParams(fmt).rounds || 5}
                      onChange={(e) =>
                        setFormatParamsForFormat(fmt, { rounds: Number(e.target.value) })
                      }
                      className="bg-[#0A0A0A] border-[#333] text-white"
                    />
                  </div>
                </div>
              )}

              {fmt === "for_load" && (
                <div className="space-y-2">
                  <label className="text-xs text-[#666]">Rep Target</label>
                  <Select
                    value={String(getParams(fmt).rounds || 1)}
                    onValueChange={(v) =>
                      setFormatParamsForFormat(fmt, { rounds: Number(v) })
                    }
                  >
                    <SelectTrigger className="bg-[#0A0A0A] border-[#333] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1A1A] border-[#333]">
                      <SelectItem value="1">1RM (Find max)</SelectItem>
                      <SelectItem value="3">3RM</SelectItem>
                      <SelectItem value="5">5RM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {fmt === "chipper" && (
                <div className="space-y-2">
                  <label className="text-xs text-[#666]">Movement Count</label>
                  <Input
                    type="number"
                    min={3}
                    max={8}
                    placeholder="3-6"
                    value={getParams(fmt).rounds || ""}
                    onChange={(e) =>
                      setFormatParamsForFormat(fmt, {
                        rounds: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="bg-[#0A0A0A] border-[#333] text-white"
                  />
                </div>
              )}

              {fmt === "ladder" && (
                <div className="space-y-2">
                  <label className="text-xs text-[#666]">Start Reps</label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={getParams(fmt).rounds || 1}
                    onChange={(e) =>
                      setFormatParamsForFormat(fmt, { rounds: Number(e.target.value) })
                    }
                    className="bg-[#0A0A0A] border-[#333] text-white"
                  />
                </div>
              )}

              {fmt === "classic" && (
                <div className="space-y-2">
                  <label className="text-xs text-[#666]">Pattern</label>
                  <Select
                    value={String(getParams(fmt).rounds || "")}
                    onValueChange={(v) =>
                      setFormatParamsForFormat(fmt, { rounds: v ? Number(v) : undefined })
                    }
                  >
                    <SelectTrigger className="bg-[#0A0A0A] border-[#333] text-white">
                      <SelectValue placeholder="Random pattern" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1A1A] border-[#333]">
                      <SelectItem value="1">21-15-9</SelectItem>
                      <SelectItem value="2">15-12-9</SelectItem>
                      <SelectItem value="3">21-15-9-3</SelectItem>
                      <SelectItem value="4">15-15-15</SelectItem>
                      <SelectItem value="5">12-9-6</SelectItem>
                      <SelectItem value="6">10-10-10</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
