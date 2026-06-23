import { useState } from "react";
import {
  ArrowLeft,
  RotateCcw,
  Copy,
  Save,
  Trash2,
  Edit3,
  Check,
  Timer,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { getMovementById } from "@/data/movements";
import { FORMAT_LABELS } from "@/data/constants";
import { useWizardStore } from "@/store/useWizardStore";
import { useHistoryStore } from "@/store/useHistoryStore";
import type { Workout, WorkoutMovement } from "@/types";

function formatWorkoutText(workout: Workout): string {
  const lines: string[] = [];

  switch (workout.format) {
    case "for_time":
      if (workout.rounds) {
        lines.push(`${workout.rounds} Rounds for Time:`);
      } else if (workout.movements.length <= 2) {
        lines.push("21-15-9 For Time:");
      } else {
        lines.push("For Time:");
      }
      break;
    case "amrap":
      lines.push(`AMRAP ${workout.formatParams.duration || "?"} minutes:`);
      break;
    case "emom":
      lines.push(`EMOM ${workout.formatParams.duration || "?"} minutes:`);
      break;
    case "intervals":
      lines.push(
        `${workout.rounds || "?"} rounds: ${workout.formatParams.workInterval || 40}s on / ${workout.formatParams.restInterval || 20}s rest`
      );
      break;
    case "for_load":
      lines.push(`${workout.name || "Find Max"}:`);
      break;
    case "chipper":
      lines.push("For Time:");
      break;
    case "ladder":
      lines.push(`${workout.name || "Ladder"}:`);
      break;
    case "classic":
      lines.push(`${workout.name || "Classic"}:`);
      break;
    default:
      lines.push("Workout:");
  }

  for (const wm of workout.movements) {
    const movement = getMovementById(wm.movementId);
    const name = movement?.name || wm.movementId;
    const unitLabel = movement?.unit === "meters" ? " m"
      : movement?.unit === "calories" ? " cal"
      : movement?.unit === "feet" ? " ft"
      : "";
    const load = wm.load ? ` (${wm.load.male}/${wm.load.female} lb)` : "";
    const label = wm.label ? `${wm.label} ` : "";
    lines.push(`  ${label}${wm.reps}${unitLabel} ${name}${load}`);
  }

  if (workout.formatParams.timeCap) {
    lines.push(`\nTime Cap: ${workout.formatParams.timeCap} minutes`);
  }

  if (workout.formatParams.duration && (workout.format === "amrap" || workout.format === "emom")) {
    lines.push(`\nDuration: ${workout.formatParams.duration} minutes`);
  }

  return lines.join("\n");
}

function getTimeDescription(workout: Workout): { label: string; icon: "timer" | "clock" | null } {
  const { format, formatParams } = workout;

  if (format === "amrap" && formatParams.duration) {
    return { label: `${formatParams.duration} min AMRAP`, icon: "timer" };
  }
  if (format === "emom" && formatParams.duration) {
    return { label: `EMOM ${formatParams.duration} min`, icon: "timer" };
  }
  if (format === "for_time" && formatParams.timeCap) {
    return { label: `Time Cap: ${formatParams.timeCap} min`, icon: "clock" };
  }
  if (format === "intervals" && formatParams.rounds && formatParams.workInterval && formatParams.restInterval) {
    const totalMin = Math.round((formatParams.rounds * (formatParams.workInterval + formatParams.restInterval)) / 60);
    return { label: `${formatParams.rounds} rounds · ~${totalMin} min`, icon: "timer" };
  }
  if (format === "classic" && formatParams.rounds) {
    return { label: `${formatParams.rounds} rounds · ${workout.estimatedDuration}`, icon: null };
  }

  return { label: workout.estimatedDuration, icon: null };
}

interface ResultsViewProps {
  onNewHopper: () => void;
  onRunAgain: () => void;
}

export function ResultsView({ onNewHopper, onRunAgain }: ResultsViewProps) {
  const { generatedWorkouts, updateWorkout, deleteWorkout } = useWizardStore();
  const { addWorkout } = useHistoryStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const handleCopyText = async (workout: Workout) => {
    const text = formatWorkoutText(workout);
    await navigator.clipboard.writeText(text);
    setCopiedId(workout.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveToHistory = (workout: Workout) => {
    addWorkout(workout);
  };

  const handleStartEdit = (workout: Workout) => {
    setEditingId(workout.id);
    setEditName(workout.name);
    setEditNotes(workout.notes);
  };

  const handleSaveEdit = (id: string) => {
    updateWorkout(id, { name: editName, notes: editNotes });
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    deleteWorkout(id);
  };

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {generatedWorkouts.length} Workout
              {generatedWorkouts.length !== 1 ? "s" : ""} Generated
            </h2>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onRunAgain}
              className="border-[#333] text-[#A0A0A0] hover:text-white hover:border-[#666]"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Run Again
            </Button>
            <Button
              onClick={onNewHopper}
              className="bg-[#C41230] hover:bg-[#8B0D22] text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              New Hopper
            </Button>
          </div>
        </div>

        {/* Workout cards */}
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-4">
            {generatedWorkouts.map((workout, idx) => {
              const timeInfo = getTimeDescription(workout);
              return (
                <div
                  key={workout.id}
                  className="p-5 bg-[#1A1A1A] rounded-lg border border-[#333]"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {editingId === workout.id ? (
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="bg-[#0A0A0A] border-[#333] text-white h-8 w-48"
                        />
                      ) : (
                        <h3 className="text-lg font-bold text-white">
                          {workout.name || `Workout #${idx + 1}`}
                        </h3>
                      )}
                      <Badge className="bg-[#C41230]/20 text-[#C41230]">
                        {FORMAT_LABELS[workout.format]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {timeInfo.icon === "timer" ? (
                        <Timer className="w-4 h-4 text-[#F5A623]" />
                      ) : timeInfo.icon === "clock" ? (
                        <Clock className="w-4 h-4 text-[#C41230]" />
                      ) : (
                        <Timer className="w-4 h-4 text-[#666]" />
                      )}
                      <span className={`text-sm ${timeInfo.icon ? "text-[#F5A623] font-medium" : "text-[#A0A0A0]"}`}>
                        {timeInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* Movements */}
                  <div className="space-y-2 mb-4">
                    {workout.movements.map((wm: WorkoutMovement, mIdx: number) => {
                      const movement = getMovementById(wm.movementId);
                      const unitLabel = movement?.unit === "meters" ? "m"
                        : movement?.unit === "calories" ? "cal"
                        : movement?.unit === "feet" ? "ft"
                        : "";
                      return (
                        <div
                          key={mIdx}
                          className="flex items-center gap-3 py-2 px-3 bg-[#0A0A0A] rounded"
                        >
                          <span className="text-2xl font-bold text-[#C41230] w-12 text-right">
                            {wm.reps}
                          </span>
                          <div className="flex-1">
                            <span className="text-white font-medium">
                              {movement?.name || wm.movementId}
                            </span>
                            {unitLabel && (
                              <span className="text-[#666] text-sm ml-1">
                                {unitLabel}
                              </span>
                            )}
                            {wm.load && (
                              <span className="text-[#666] text-sm ml-2">
                                ({wm.load.male}/{wm.load.female} lb)
                              </span>
                            )}
                            {wm.label && (
                              <span className="text-[#F5A623] text-sm ml-2">
                                {wm.label}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Time cap / duration callout */}
                  {workout.formatParams.timeCap && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-[#C41230]/10 border border-[#C41230]/30 rounded mb-3">
                      <Clock className="w-4 h-4 text-[#C41230]" />
                      <span className="text-sm text-[#C41230] font-medium">
                        Time Cap: {workout.formatParams.timeCap} minutes
                      </span>
                    </div>
                  )}
                  {workout.formatParams.duration && (workout.format === "amrap" || workout.format === "emom") && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-[#F5A623]/10 border border-[#F5A623]/30 rounded mb-3">
                      <Timer className="w-4 h-4 text-[#F5A623]" />
                      <span className="text-sm text-[#F5A623] font-medium">
                        Duration: {workout.formatParams.duration} minutes
                      </span>
                    </div>
                  )}

                  <Separator className="bg-[#333] my-3" />

                  {/* Meta */}
                  <div className="flex flex-wrap gap-4 text-xs text-[#666] mb-4">
                    <div>
                      <span className="text-[#A0A0A0]">Equipment: </span>
                      {workout.equipment.length > 0
                        ? workout.equipment.join(", ")
                        : "Bodyweight"}
                    </div>
                    <div>
                      <span className="text-[#A0A0A0]">Modality: </span>
                      {workout.modalityBreakdown.weightlifting > 0 &&
                        `WL ${workout.modalityBreakdown.weightlifting}% `}
                      {workout.modalityBreakdown.gymnastics > 0 &&
                        `Gym ${workout.modalityBreakdown.gymnastics}% `}
                      {workout.modalityBreakdown.monostructural > 0 &&
                        `Mono ${workout.modalityBreakdown.monostructural}%`}
                    </div>
                  </div>

                  {/* Notes */}
                  {editingId === workout.id ? (
                    <Textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Add notes..."
                      className="bg-[#0A0A0A] border-[#333] text-white mb-3"
                    />
                  ) : (
                    workout.notes && (
                      <p className="text-sm text-[#A0A0A0] mb-3">{workout.notes}</p>
                    )
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {editingId === workout.id ? (
                      <Button
                        size="sm"
                        onClick={() => handleSaveEdit(workout.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStartEdit(workout)}
                        className="border-[#333] text-[#A0A0A0]"
                      >
                        <Edit3 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyText(workout)}
                      className="border-[#333] text-[#A0A0A0]"
                    >
                      {copiedId === workout.id ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" />
                          Copy Text
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSaveToHistory(workout)}
                      className="border-[#333] text-[#A0A0A0]"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(workout.id)}
                      className="border-[#333] text-[#C41230] hover:bg-[#C41230]/10"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
