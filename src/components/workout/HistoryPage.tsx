import { useEffect } from "react";
import {
  ArrowLeft,
  Star,
  Trash2,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getMovementById } from "@/data/movements";
import { FORMAT_LABELS } from "@/data/constants";
import { useHistoryStore } from "@/store/useHistoryStore";

interface HistoryPageProps {
  onBack: () => void;
}

export function HistoryPage({ onBack }: HistoryPageProps) {
  const {
    searchQuery,
    filterFormat,
    setSearchQuery,
    setFilterFormat,
    getFilteredWorkouts,
    toggleFavorite,
    isFavorite,
    removeWorkout,
    duplicateWorkout,
    clearHistory,
    loadWorkouts,
  } = useHistoryStore();

  useEffect(() => {
    loadWorkouts();
  }, [loadWorkouts]);

  const filteredWorkouts = getFilteredWorkouts();

  const handleRunAgain = (workout: (typeof filteredWorkouts)[0]) => {
    const duplicate = duplicateWorkout(workout.id);
    if (duplicate) {
      // Could navigate to results with this workout
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-[#A0A0A0] hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h2 className="text-2xl font-bold text-white">History</h2>
            <Badge variant="secondary" className="bg-[#333] text-white">
              {filteredWorkouts.length}
            </Badge>
          </div>
          {filteredWorkouts.length > 0 && (
            <Button
              variant="outline"
              onClick={clearHistory}
              className="border-[#333] text-[#C41230] hover:bg-[#C41230]/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
            <Input
              placeholder="Search by name or movement..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#1A1A1A] border-[#333] text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-[#666] hover:text-white" />
              </button>
            )}
          </div>
          <Select
            value={filterFormat || "all"}
            onValueChange={(v) => setFilterFormat(v === "all" ? null : v)}
          >
            <SelectTrigger className="w-40 bg-[#1A1A1A] border-[#333] text-white">
              <SelectValue placeholder="All formats" />
            </SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-[#333]">
              <SelectItem value="all">All formats</SelectItem>
              {Object.entries(FORMAT_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Workout list */}
        {filteredWorkouts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[#666] text-lg mb-4">No workouts yet</p>
            <p className="text-[#666] text-sm">
              Generate your first workout to see it here
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="space-y-3">
              {filteredWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  className="p-4 bg-[#1A1A1A] rounded-lg border border-[#333]"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-white">
                        {workout.name || "Untitled"}
                      </h3>
                      <Badge className="bg-[#C41230]/20 text-[#C41230] text-xs">
                        {FORMAT_LABELS[workout.format]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleFavorite(workout.id)}
                        className="p-1"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            isFavorite(workout.id)
                              ? "fill-[#F5A623] text-[#F5A623]"
                              : "text-[#666]"
                          }`}
                        />
                      </button>
                      <span className="text-xs text-[#666]">
                        {new Date(workout.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Movement summary */}
                  <p className="text-sm text-[#A0A0A0] mb-3">
                    {workout.movements
                      .slice(0, 3)
                      .map((wm) => {
                        const m = getMovementById(wm.movementId);
                        return `${wm.reps} ${m?.name || wm.movementId}`;
                      })
                      .join(", ")}
                    {workout.movements.length > 3 &&
                      ` +${workout.movements.length - 3} more`}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-[#666] mb-3">
                    <span>{workout.estimatedDuration}</span>
                    <span>|</span>
                    <span>
                      {workout.equipment.length > 0
                        ? workout.equipment.join(", ")
                        : "Bodyweight"}
                    </span>
                  </div>

                  <Separator className="bg-[#333] mb-3" />

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRunAgain(workout)}
                      className="border-[#333] text-[#A0A0A0] hover:text-white"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Run Again
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeWorkout(workout.id)}
                      className="border-[#333] text-[#C41230] hover:bg-[#C41230]/10"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
