import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  WorkoutConfig,
  WorkoutFormat,
  Workout,
  RepConfig,
  FormatParams,
} from "@/types";
import { ALL_MOVEMENTS, getMovementById } from "@/data/movements";

interface WizardState {
  currentStep: number;
  selectedMovementIds: string[];
  searchQuery: string;
  categoryFilter: string | null;
  subcategoryFilter: string | null;
  equipmentFilter: string[];
  repConfig: RepConfig;
  showProbabilityWeights: boolean;
  probabilityWeights: Record<string, number>;
  selectedFormats: WorkoutFormat[];
  formatParams: FormatParams;
  formatParamsByFormat: Partial<Record<WorkoutFormat, FormatParams>>;
  simulationCount: number;
  generatedWorkouts: Workout[];
  generationCount: number;

  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;

  toggleMovement: (id: string) => void;
  selectAllMovements: (category?: string) => void;
  deselectAllMovements: () => void;
  setSearchQuery: (q: string) => void;
  setCategoryFilter: (cat: string | null) => void;
  setSubcategoryFilter: (sub: string | null) => void;
  toggleEquipmentFilter: (eq: string) => void;

  setRepConfig: (config: Partial<RepConfig>) => void;
  setMovementRepOverride: (movementId: string, min: number, max: number) => void;
  toggleProbabilityWeights: () => void;
  setProbabilityWeight: (movementId: string, weight: number) => void;

  toggleFormat: (format: WorkoutFormat) => void;
  selectAllFormats: () => void;
  setFormatParams: (params: Partial<FormatParams>) => void;
  setFormatParamsForFormat: (format: WorkoutFormat, params: Partial<FormatParams>) => void;

  setSimulationCount: (count: number) => void;

  setGeneratedWorkouts: (workouts: Workout[]) => void;
  updateWorkout: (id: string, updates: Partial<Workout>) => void;
  deleteWorkout: (id: string) => void;

  reset: () => void;
  loadConfig: (config: WorkoutConfig) => void;
}

const ALL_FORMATS: WorkoutFormat[] = [
  "for_time", "amrap", "emom", "intervals", "for_load", "chipper", "ladder", "classic",
];

const defaultRepConfig: RepConfig = {
  scheme: "random",
  minReps: 5,
  maxReps: 25,
  movementOverrides: {},
};

const initialState = {
  currentStep: 0,
  selectedMovementIds: [] as string[],
  searchQuery: "",
  categoryFilter: null as string | null,
  subcategoryFilter: null as string | null,
  equipmentFilter: [] as string[],
  repConfig: defaultRepConfig,
  showProbabilityWeights: false,
  probabilityWeights: {} as Record<string, number>,
  selectedFormats: ["random"] as WorkoutFormat[],
  formatParams: {} as FormatParams,
  formatParamsByFormat: {} as Partial<Record<WorkoutFormat, FormatParams>>,
  simulationCount: 1,
  generatedWorkouts: [] as Workout[],
  generationCount: 0,
};

export const useWizardStore = create<WizardState>()(
  persist(
    (set) => ({
      ...initialState,

      nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, 4) })),
      prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 0) })),
      goToStep: (step) => set({ currentStep: step }),

      toggleMovement: (id) =>
        set((s) => {
          const exists = s.selectedMovementIds.includes(id);
          return {
            selectedMovementIds: exists
              ? s.selectedMovementIds.filter((i) => i !== id)
              : [...s.selectedMovementIds, id],
          };
        }),

      selectAllMovements: (category) =>
        set((s) => {
          const targetIds = category
            ? ALL_MOVEMENTS.filter((m) => m.category === category).map((m) => m.id)
            : ALL_MOVEMENTS.map((m) => m.id);
          const newSelected = [...new Set([...s.selectedMovementIds, ...targetIds])];
          return { selectedMovementIds: newSelected };
        }),

      deselectAllMovements: () => set({ selectedMovementIds: [] }),

      setSearchQuery: (q) => set({ searchQuery: q }),
      setCategoryFilter: (cat) => set({ categoryFilter: cat, subcategoryFilter: null }),
      setSubcategoryFilter: (sub) => set({ subcategoryFilter: sub }),

      toggleEquipmentFilter: (eq) =>
        set((s) => {
          const exists = s.equipmentFilter.includes(eq);
          return {
            equipmentFilter: exists
              ? s.equipmentFilter.filter((e) => e !== eq)
              : [...s.equipmentFilter, eq],
          };
        }),

      setRepConfig: (config) =>
        set((s) => ({ repConfig: { ...s.repConfig, ...config } })),

      setMovementRepOverride: (movementId, min, max) =>
        set((s) => ({
          repConfig: {
            ...s.repConfig,
            movementOverrides: {
              ...s.repConfig.movementOverrides,
              [movementId]: { min, max },
            },
          },
        })),

      toggleProbabilityWeights: () =>
        set((s) => ({ showProbabilityWeights: !s.showProbabilityWeights })),

      setProbabilityWeight: (movementId, weight) =>
        set((s) => ({
          probabilityWeights: { ...s.probabilityWeights, [movementId]: weight },
        })),

      toggleFormat: (format) =>
        set((s) => {
          if (format === "random") {
            return { selectedFormats: ["random"] };
          }
          const withoutRandom = s.selectedFormats.filter((f) => f !== "random");
          const exists = withoutRandom.includes(format);
          const next = exists
            ? withoutRandom.filter((f) => f !== format)
            : [...withoutRandom, format];
          return { selectedFormats: next.length === 0 ? ["random"] : next };
        }),

      selectAllFormats: () =>
        set({ selectedFormats: [...ALL_FORMATS] }),

      setFormatParams: (params) =>
        set((s) => ({ formatParams: { ...s.formatParams, ...params } })),

      setFormatParamsForFormat: (format, params) =>
        set((s) => ({
          formatParamsByFormat: {
            ...s.formatParamsByFormat,
            [format]: { ...s.formatParamsByFormat[format], ...params },
          },
        })),

      setSimulationCount: (count) =>
        set({ simulationCount: count }),

      setGeneratedWorkouts: (workouts) =>
        set((s) => ({ generatedWorkouts: workouts, generationCount: s.generationCount + 1 })),

      updateWorkout: (id, updates) =>
        set((s) => ({
          generatedWorkouts: s.generatedWorkouts.map((w) =>
            w.id === id ? { ...w, ...updates } : w
          ),
        })),

      deleteWorkout: (id) =>
        set((s) => ({
          generatedWorkouts: s.generatedWorkouts.filter((w) => w.id !== id),
        })),

      reset: () => set(initialState),

      loadConfig: (config) =>
        set({
          selectedMovementIds: config.movementIds,
          repConfig: config.repConfig,
          selectedFormats: config.formats || ["random"],
          formatParams: config.formatParams,
          formatParamsByFormat: config.formatParamsByFormat || {},
          simulationCount: config.simulationCount,
          probabilityWeights: config.probabilityWeights,
          currentStep: 4,
        }),
    }),
    {
      name: "hopper-wizard",
      partialize: (state) => ({
        selectedMovementIds: state.selectedMovementIds,
        repConfig: state.repConfig,
        selectedFormats: state.selectedFormats,
        formatParams: state.formatParams,
        formatParamsByFormat: state.formatParamsByFormat,
        simulationCount: state.simulationCount,
        probabilityWeights: state.probabilityWeights,
      }),
    }
  )
);
