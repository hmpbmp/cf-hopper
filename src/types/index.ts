export interface Movement {
  id: string;
  name: string;
  category: "weightlifting" | "gymnastics" | "monostructural" | "strongman";
  subcategory: string;
  equipment: string[];
  modality: "weightlifting" | "gymnastics" | "monostructural";
  isWeighted: boolean;
  defaultLoad: { male: number; female: number } | null;
  scalingOptions: ScalingOption[];
  description: string;
  secondsPerRep: number;
  unit: "reps" | "meters" | "calories" | "feet";
  defaultValue: number;
  typicalRange: { min: number; max: number };
}

export interface ScalingOption {
  level: "rx" | "scaled" | "beginner";
  description: string;
  loadModifier?: number;
  alternativeMovement?: string;
}

export type WorkoutFormat =
  | "for_time"
  | "amrap"
  | "emom"
  | "intervals"
  | "for_load"
  | "chipper"
  | "ladder"
  | "classic"
  | "random";

export type TimeDomain = "sprint" | "short" | "medium" | "long" | "endurance" | "any";

export interface WorkoutConfig {
  movementIds: string[];
  repConfig: RepConfig;
  formats: WorkoutFormat[];
  formatParams: FormatParams;
  formatParamsByFormat?: Partial<Record<WorkoutFormat, FormatParams>>;
  timeDomain: TimeDomain;
  simulationCount: number;
  probabilityWeights: Record<string, number>;
}

export interface RepConfig {
  scheme: "random" | "fixed";
  minReps: number;
  maxReps: number;
  customPattern?: number[];
  movementOverrides: Record<string, { min: number; max: number }>;
}

export interface FormatParams {
  duration?: number;
  timeCap?: number;
  workInterval?: number;
  restInterval?: number;
  rounds?: number;
  emomPattern?: "every" | "odd_even" | "blocks";
}

export interface Workout {
  id: string;
  name: string;
  format: WorkoutFormat;
  formatParams: FormatParams;
  movements: WorkoutMovement[];
  rounds?: number;
  estimatedDuration: string;
  equipment: string[];
  modalityBreakdown: {
    weightlifting: number;
    gymnastics: number;
    monostructural: number;
  };
  notes: string;
  createdAt: string;
  isFavorite?: boolean;
}

export interface WorkoutMovement {
  movementId: string;
  reps: number | string;
  load?: { male: number; female: number };
  order: number;
  label?: string;
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  config: WorkoutConfig;
  isBuiltIn: boolean;
}
