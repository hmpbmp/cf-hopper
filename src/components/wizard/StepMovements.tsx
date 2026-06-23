import { useMemo, useState } from "react";
import { Search, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ALL_MOVEMENTS, getMovementById } from "@/data/movements";
import {
  CATEGORY_LABELS,
  SUBCATEGORY_LABELS,
  EQUIPMENT_TAGS,
} from "@/data/constants";
import { useWizardStore } from "@/store/useWizardStore";

const CATEGORY_COLORS: Record<string, string> = {
  weightlifting: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  gymnastics: "bg-green-500/20 text-green-400 border-green-500/30",
  monostructural: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  strongman: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

const UNIT_LABELS: Record<string, string> = {
  reps: "reps",
  meters: "m",
  calories: "cal",
  feet: "ft",
};

export function StepMovements() {
  const {
    selectedMovementIds,
    searchQuery,
    categoryFilter,
    equipmentFilter,
    toggleMovement,
    setSearchQuery,
    setCategoryFilter,
    toggleEquipmentFilter,
  } = useWizardStore();

  const [localSearch, setLocalSearch] = useState(searchQuery);

  const selectedMovements = useMemo(
    () =>
      selectedMovementIds
        .map((id) => getMovementById(id))
        .filter((m) => m !== undefined),
    [selectedMovementIds]
  );

  const filteredMovements = useMemo(() => {
    let movements = [...ALL_MOVEMENTS];

    if (categoryFilter) {
      movements = movements.filter((m) => m.category === categoryFilter);
    }

    if (equipmentFilter.length > 0) {
      movements = movements.filter((m) =>
        equipmentFilter.some((eq) => m.equipment.includes(eq))
      );
    }

    if (localSearch) {
      const q = localSearch.toLowerCase();
      movements = movements.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.subcategory.toLowerCase().includes(q) ||
          m.equipment.some((eq) => eq.toLowerCase().includes(q))
      );
    }

    // Sort: selected first, then alphabetical
    movements.sort((a, b) => {
      const aSelected = selectedMovementIds.includes(a.id);
      const bSelected = selectedMovementIds.includes(b.id);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return a.name.localeCompare(b.name);
    });

    return movements;
  }, [categoryFilter, equipmentFilter, localSearch, selectedMovementIds]);

  const handleSearch = (value: string) => {
    setLocalSearch(value);
    setSearchQuery(value);
  };

  const selectAll = () => {
    const ids = filteredMovements.map((m) => m.id);
    const newSelected = [...new Set([...selectedMovementIds, ...ids])];
    useWizardStore.setState({ selectedMovementIds: newSelected });
  };

  const deselectAll = () => {
    const ids = new Set(filteredMovements.map((m) => m.id));
    useWizardStore.setState({
      selectedMovementIds: selectedMovementIds.filter((id) => !ids.has(id)),
    });
  };

  const removeSelected = (id: string) => {
    useWizardStore.setState({
      selectedMovementIds: selectedMovementIds.filter((i) => i !== id),
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Select Movements</h2>
        <p className="text-[#A0A0A0] text-sm">
          Choose at least 3 movements for the hopper pool
        </p>
      </div>

      {/* Selected movements panel */}
      {selectedMovements.length > 0 && (
        <div className="p-3 bg-[#1A1A1A] rounded-lg border border-[#333]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">
                Selected
              </span>
              <Badge
                variant={selectedMovementIds.length >= 3 ? "default" : "destructive"}
                className={
                  selectedMovementIds.length >= 3
                    ? "bg-green-500/20 text-green-400 text-xs"
                    : "bg-[#C41230]/20 text-[#C41230] text-xs"
                }
              >
                {selectedMovementIds.length}
              </Badge>
            </div>
            {selectedMovementIds.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  useWizardStore.setState({ selectedMovementIds: [] })
                }
                className="text-[#666] hover:text-[#C41230] h-6 px-2 text-xs"
              >
                Clear all
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedMovements.map(
              (m) =>
                m && (
                  <button
                    key={m.id}
                    onClick={() => removeSelected(m.id)}
                    className={`
                      group flex items-center gap-1.5 px-2 py-1 rounded-md text-xs
                      border transition-all hover:opacity-80
                      ${CATEGORY_COLORS[m.category]}
                    `}
                  >
                    <span>{m.name}</span>
                    <X className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                  </button>
                )
            )}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
        <Input
          placeholder="Search movements by name, type, or equipment..."
          value={localSearch}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 bg-[#1A1A1A] border-[#333] text-white"
        />
        {localSearch && (
          <button
            onClick={() => handleSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="w-4 h-4 text-[#666] hover:text-white" />
          </button>
        )}
      </div>

      {/* Category tabs */}
      <Tabs
        value={categoryFilter || "all"}
        onValueChange={(v) => setCategoryFilter(v === "all" ? null : v)}
      >
        <TabsList className="bg-[#1A1A1A] border border-[#333]">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-[#C41230] data-[state=active]:text-white"
          >
            All
          </TabsTrigger>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <TabsTrigger
              key={key}
              value={key}
              className="data-[state=active]:bg-[#C41230] data-[state=active]:text-white"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Equipment filter */}
      <div className="flex flex-wrap gap-2">
        {EQUIPMENT_TAGS.slice(0, 10).map((eq) => (
          <button
            key={eq}
            onClick={() => toggleEquipmentFilter(eq)}
            className={`
              px-3 py-1 rounded-full text-xs font-medium transition-all
              ${
                equipmentFilter.includes(eq)
                  ? "bg-[#C41230] text-white"
                  : "bg-[#1A1A1A] text-[#A0A0A0] border border-[#333] hover:border-[#666]"
              }
            `}
          >
            {SUBCATEGORY_LABELS[eq] || eq}
          </button>
        ))}
      </div>

      {/* Bulk actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={selectAll}
          className="border-[#333] text-[#A0A0A0]"
        >
          Select All ({filteredMovements.length})
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={deselectAll}
          className="border-[#333] text-[#A0A0A0]"
        >
          Deselect All
        </Button>
      </div>

      <Separator className="bg-[#333]" />

      {/* Movement library */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[#A0A0A0]">
            Library ({filteredMovements.length} movements)
          </span>
        </div>
        <ScrollArea className="h-[350px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {filteredMovements.map((movement) => {
              const isSelected = selectedMovementIds.includes(movement.id);
              return (
                <button
                  key={movement.id}
                  onClick={() => toggleMovement(movement.id)}
                  className={`
                    p-3 rounded-lg text-left transition-all border
                    ${
                      isSelected
                        ? "bg-[#C41230]/10 border-[#C41230]/50"
                        : "bg-[#0A0A0A] border-[#333] hover:border-[#666]"
                    }
                  `}
                >
                  <div className="flex items-start gap-2">
                    <Checkbox
                      checked={isSelected}
                      className="mt-0.5 border-[#666] data-[state=checked]:bg-[#C41230] data-[state=checked]:border-[#C41230]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-white text-sm truncate">
                          {movement.name}
                        </span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-[#C41230] flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <Badge
                          variant="secondary"
                          className={`text-[10px] ${CATEGORY_COLORS[movement.category]}`}
                        >
                          {CATEGORY_LABELS[movement.category]}
                        </Badge>
                        <span className="text-[10px] text-[#666]">
                          {UNIT_LABELS[movement.unit]}
                        </span>
                        {movement.defaultLoad && (
                          <span className="text-[10px] text-[#666]">
                            {movement.defaultLoad.male}/{movement.defaultLoad.female} lb
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
