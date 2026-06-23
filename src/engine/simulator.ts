import type { WorkoutConfig, Workout, WorkoutFormat } from "@/types";
import { selectBalancedMovements } from "./selection";
import { generateWorkoutForFormat } from "./formats";
import { randomPick } from "./random";

const ALL_FORMATS: WorkoutFormat[] = [
  "for_time", "amrap", "emom", "intervals", "chipper", "ladder", "classic",
];

function resolveFormat(formats: WorkoutFormat[]): WorkoutFormat {
  if (formats.includes("random") || formats.length === 0) {
    return randomPick(ALL_FORMATS);
  }
  return randomPick(formats);
}

function generateSingleWorkout(config: WorkoutConfig): Workout {
  const format = resolveFormat(config.formats);
  const movements = selectBalancedMovements(config);
  // Use per-format params if available, otherwise fall back to shared params
  const baseParams = config.formatParamsByFormat?.[format] || config.formatParams;
  const workout = generateWorkoutForFormat(format, movements, baseParams, config.repConfig);
  return workout;
}

/**
 * Generate a single workout from config.
 */
export function simulateOnce(config: WorkoutConfig): Workout {
  return generateSingleWorkout(config);
}

/**
 * Generate multiple workouts from same config.
 * Applies diversity: tries to avoid repeating same movements across simulations.
 */
export function simulateMultiple(config: WorkoutConfig): Workout[] {
  const workouts: Workout[] = [];
  const usedMovementCombinations = new Set<string>();

  for (let i = 0; i < config.simulationCount; i++) {
    let workout: Workout;
    let attempts = 0;

    do {
      workout = generateSingleWorkout(config);
      const comboKey = workout.movements
        .map((m) => m.movementId)
        .sort()
        .join(",");

      if (!usedMovementCombinations.has(comboKey) || attempts > 10) {
        usedMovementCombinations.add(comboKey);
        break;
      }
      attempts++;
      // eslint-disable-next-line no-constant-condition
    } while (true);

    workout.name = `Workout #${workouts.length + 1}`;
    workouts.push(workout);
  }

  return workouts;
}

/**
 * Quick generate with default settings (for "Quick Generate" button).
 */
export function quickGenerate(): Workout {
  const QUICK_CONFIG: WorkoutConfig = {
    movementIds: [
      "thruster",
      "pull-up",
      "deadlift",
      "box-jump",
      "burpee",
      "kb-swing",
      "power-clean",
      "row",
      "air-squat",
      "push-jerk",
    ],
    repConfig: {
      scheme: "random",
      minReps: 5,
      maxReps: 25,
      movementOverrides: {},
    },
    formats: ["random"],
    formatParams: {},
    timeDomain: "any",
    simulationCount: 1,
    probabilityWeights: {},
  };

  const workout = simulateOnce(QUICK_CONFIG);
  workout.name = "Quick Generate";
  return workout;
}
