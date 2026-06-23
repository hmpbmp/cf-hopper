import { useState, useMemo, useEffect } from "react";
import { ArrowLeft, Search, Edit3, RotateCcw, Check, X, Dumbbell, Footprints, Zap, Weight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ALL_MOVEMENTS } from "@/data/movements";
import { CATEGORY_LABELS } from "@/data/constants";
import { useMovementOverridesStore } from "@/store/useMovementOverridesStore";
import type { Movement } from "@/types";

const CATEGORY_COLORS: Record<string, string> = {
  weightlifting: "bg-blue-500/20 text-blue-400",
  gymnastics: "bg-green-500/20 text-green-400",
  monostructural: "bg-yellow-500/20 text-yellow-400",
  strongman: "bg-orange-500/20 text-orange-400",
};

const UNIT_ICONS: Record<string, React.ElementType> = {
  reps: Dumbbell,
  meters: Footprints,
  calories: Zap,
  feet: Weight,
};

const UNIT_LABELS: Record<string, string> = {
  reps: "reps",
  meters: "m",
  calories: "cal",
  feet: "ft",
};

interface MovementLibraryPageProps {
  onBack: () => void;
}

export function MovementLibraryPage({ onBack }: MovementLibraryPageProps) {
  const { overrides, setOverride, resetOverride, resetAll, getEffective, loadOverrides } =
    useMovementOverridesStore();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [editingMovement, setEditingMovement] = useState<Movement | null>(null);
  const [editForm, setEditForm] = useState({
    secondsPerRep: 0,
    defaultValue: 0,
    typicalRangeMin: 0,
    typicalRangeMax: 0,
    unit: "reps" as Movement["unit"],
  });

  useEffect(() => {
    loadOverrides();
  }, [loadOverrides]);

  const filteredMovements = useMemo(() => {
    return ALL_MOVEMENTS.filter((m) => {
      const matchesSearch =
        !search ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.subcategory.toLowerCase().includes(search.toLowerCase()) ||
        m.equipment.some((e) => e.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = !categoryFilter || m.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [search, categoryFilter]);

  const categories = useMemo(() => {
    const cats = new Set(ALL_MOVEMENTS.map((m) => m.category));
    return Array.from(cats);
  }, []);

  const handleEdit = (movement: Movement) => {
    const effective = getEffective(movement);
    setEditingMovement(movement);
    setEditForm({
      secondsPerRep: effective.secondsPerRep,
      defaultValue: effective.defaultValue,
      typicalRangeMin: effective.typicalRange.min,
      typicalRangeMax: effective.typicalRange.max,
      unit: effective.unit,
    });
  };

  const handleSave = () => {
    if (!editingMovement) return;
    setOverride(editingMovement.id, {
      secondsPerRep: editForm.secondsPerRep,
      defaultValue: editForm.defaultValue,
      typicalRange: { min: editForm.typicalRangeMin, max: editForm.typicalRangeMax },
      unit: editForm.unit,
    });
    setEditingMovement(null);
  };

  const handleReset = (movementId: string) => {
    resetOverride(movementId);
  };

  const hasOverride = (id: string) => id in overrides;

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="max-w-5xl mx-auto">
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
            <h2 className="text-2xl font-bold text-white">Movement Library</h2>
            <Badge variant="secondary" className="bg-[#333] text-[#A0A0A0]">
              {ALL_MOVEMENTS.length} movements
            </Badge>
          </div>
          {Object.keys(overrides).length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetAll}
              className="border-[#333] text-[#A0A0A0] hover:text-[#C41230] hover:border-[#C41230]"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset All ({Object.keys(overrides).length})
            </Button>
          )}
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
            <Input
              placeholder="Search movements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#1A1A1A] border-[#333] text-white pl-9"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCategoryFilter(null)}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                !categoryFilter
                  ? "bg-[#C41230] text-white"
                  : "bg-[#1A1A1A] border border-[#333] text-[#A0A0A0] hover:text-white"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  categoryFilter === cat
                    ? "bg-[#C41230] text-white"
                    : "bg-[#1A1A1A] border border-[#333] text-[#A0A0A0] hover:text-white"
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Movement list */}
        <ScrollArea className="h-[calc(100vh-220px)]">
          <div className="space-y-2">
            {filteredMovements.map((movement) => {
              const effective = getEffective(movement);
              const overridden = hasOverride(movement.id);
              const UnitIcon = UNIT_ICONS[effective.unit] || Dumbbell;

              return (
                <div
                  key={movement.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    overridden
                      ? "bg-[#C41230]/5 border-[#C41230]/30"
                      : "bg-[#1A1A1A] border-[#333]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white text-sm">
                          {effective.name}
                        </h3>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] ${CATEGORY_COLORS[effective.category]}`}
                        >
                          {CATEGORY_LABELS[effective.category]}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] bg-[#333] text-[#A0A0A0]">
                          {effective.subcategory}
                        </Badge>
                        {overridden && (
                          <Badge variant="secondary" className="text-[10px] bg-[#C41230]/20 text-[#C41230]">
                            Custom
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-[#666] mb-2 line-clamp-2">
                        {effective.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <div className="flex items-center gap-1 text-[#A0A0A0]">
                          <UnitIcon className="w-3 h-3" />
                          <span>{effective.defaultValue} {UNIT_LABELS[effective.unit]}</span>
                        </div>
                        <div className="text-[#666]">
                          Range: {effective.typicalRange.min}–{effective.typicalRange.max} {UNIT_LABELS[effective.unit]}
                        </div>
                        <div className="text-[#666]">
                          {effective.secondsPerRep}s/rep
                        </div>
                        {effective.isWeighted && effective.defaultLoad && (
                          <div className="text-[#666]">
                            Rx: {effective.defaultLoad.male}/{effective.defaultLoad.female} lb
                          </div>
                        )}
                        <div className="flex gap-1">
                          {effective.equipment.map((eq) => (
                            <Badge key={eq} variant="secondary" className="text-[9px] bg-[#222] text-[#888]">
                              {eq}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {overridden && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReset(movement.id)}
                          className="h-7 px-2 text-[#666] hover:text-[#C41230]"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(movement)}
                        className="h-7 px-2 text-[#666] hover:text-white"
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredMovements.length === 0 && (
              <div className="text-center py-12 text-[#666]">
                No movements found
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editingMovement} onOpenChange={() => setEditingMovement(null)}>
        <DialogContent className="bg-[#1A1A1A] border-[#333] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">
              Edit {editingMovement?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs text-[#666]">Unit</label>
              <Select
                value={editForm.unit}
                onValueChange={(v) =>
                  setEditForm({ ...editForm, unit: v as Movement["unit"] })
                }
              >
                <SelectTrigger className="bg-[#0A0A0A] border-[#333] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#333]">
                  <SelectItem value="reps">Reps</SelectItem>
                  <SelectItem value="meters">Meters</SelectItem>
                  <SelectItem value="calories">Calories</SelectItem>
                  <SelectItem value="feet">Feet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-[#666]">
                Default Value ({UNIT_LABELS[editForm.unit]})
              </label>
              <Input
                type="number"
                min={1}
                value={editForm.defaultValue}
                onChange={(e) =>
                  setEditForm({ ...editForm, defaultValue: Number(e.target.value) || 1 })
                }
                className="bg-[#0A0A0A] border-[#333] text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-[#666]">
                  Typical Min ({UNIT_LABELS[editForm.unit]})
                </label>
                <Input
                  type="number"
                  min={1}
                  value={editForm.typicalRangeMin}
                  onChange={(e) =>
                    setEditForm({ ...editForm, typicalRangeMin: Number(e.target.value) || 1 })
                  }
                  className="bg-[#0A0A0A] border-[#333] text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-[#666]">
                  Typical Max ({UNIT_LABELS[editForm.unit]})
                </label>
                <Input
                  type="number"
                  min={1}
                  value={editForm.typicalRangeMax}
                  onChange={(e) =>
                    setEditForm({ ...editForm, typicalRangeMax: Number(e.target.value) || 1 })
                  }
                  className="bg-[#0A0A0A] border-[#333] text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-[#666]">Seconds per Rep</label>
              <Input
                type="number"
                min={0.1}
                step={0.1}
                value={editForm.secondsPerRep}
                onChange={(e) =>
                  setEditForm({ ...editForm, secondsPerRep: Number(e.target.value) || 1 })
                }
                className="bg-[#0A0A0A] border-[#333] text-white"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingMovement(null)}
              className="border-[#333] text-[#A0A0A0]"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-[#C41230] hover:bg-[#8B0D22] text-white"
            >
              <Check className="w-4 h-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
