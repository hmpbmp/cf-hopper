import type {
  Workout,
  WorkoutMovement,
  WorkoutFormat,
  FormatParams,
  Movement,
  RepConfig,
} from "@/types";
import { getModalityBreakdown, getRequiredEquipment } from "./selection";
import {
  generateReps,
  estimateWorkoutDurationSeconds,
  formatDuration,
} from "./reps";
import { randomInt, generateId, shuffle } from "./random";

function buildWorkout(
  format: WorkoutFormat,
  formatParams: FormatParams,
  workoutMovements: WorkoutMovement[],
  rounds?: number
): Workout {
  const tempWorkout: Workout = {
    id: "temp",
    name: "",
    format,
    formatParams,
    movements: workoutMovements,
    rounds,
    estimatedDuration: "",
    equipment: [],
    modalityBreakdown: { weightlifting: 0, gymnastics: 0, monostructural: 0 },
    notes: "",
    createdAt: new Date().toISOString(),
  };
  const estimatedDuration = formatDuration(
    estimateWorkoutDurationSeconds(tempWorkout)
  );

  return {
    id: generateId(),
    name: "",
    format,
    formatParams,
    movements: workoutMovements,
    rounds,
    estimatedDuration,
    equipment: [],
    modalityBreakdown: { weightlifting: 0, gymnastics: 0, monostructural: 0 },
    notes: "",
    createdAt: new Date().toISOString(),
  };
}

/**
 * Generate a For Time workout.
 * Structure: "[rounds] rounds for time of: [reps] [movement]"
 * Params: timeCap (minutes), rounds
 */
export function generateForTime(
  movements: Movement[],
  params: FormatParams,
  repConfig?: RepConfig
): Workout {
  const roundCount = params.rounds || 1;
  const timeCap = params.timeCap || 12;

  const workoutMovements: WorkoutMovement[] = [];

  const reps = repConfig
    ? generateReps(movements.length, repConfig, "for_time", movements)
    : movements.map((m) => m.defaultValue || randomInt(8, 25));

  movements.forEach((m, idx) => {
    workoutMovements.push({
      movementId: m.id,
      reps: reps[idx],
      load: m.defaultLoad || undefined,
      order: idx,
    });
  });

  const workout = buildWorkout(
    "for_time",
    { timeCap, rounds: roundCount > 1 ? roundCount : undefined },
    workoutMovements,
    roundCount > 1 ? roundCount : undefined
  );

  workout.name = roundCount > 1 ? `${roundCount} Rounds for Time` : "For Time";

  return workout;
}

/**
 * Generate an AMRAP workout.
 * Structure: "AMRAP [duration]: [reps] [movement]"
 * Params: duration (minutes) - REQUIRED
 */
export function generateAMRAP(
  movements: Movement[],
  params: FormatParams,
  repConfig?: RepConfig
): Workout {
  const duration = params.duration || 10;

  const reps = repConfig
    ? generateReps(movements.length, repConfig, "amrap", movements)
    : movements.map(() => randomInt(8, 25));

  const workoutMovements: WorkoutMovement[] = movements.map((m, idx) => ({
    movementId: m.id,
    reps: reps[idx],
    load: m.defaultLoad || undefined,
    order: idx,
  }));

  const workout = buildWorkout("amrap", { duration }, workoutMovements);
  workout.name = `AMRAP ${duration}`;
  return workout;
}

/**
 * Generate an EMOM workout.
 * Structure: "EMOM [duration] min: Min 1: [reps] [movement]"
 * Params: duration (minutes) - REQUIRED, emomPattern
 */
export function generateEMOM(
  movements: Movement[],
  params: FormatParams,
  repConfig?: RepConfig
): Workout {
  const duration = params.duration || 12;
  const pattern = params.emomPattern || "every";

  const workoutMovements: WorkoutMovement[] = [];

  if (pattern === "odd_even" && movements.length >= 2) {
    const oddReps = repConfig
      ? generateReps(1, repConfig, "emom", [movements[0]])[0]
      : movements[0].defaultValue || randomInt(8, 15);
    const evenReps = repConfig
      ? generateReps(1, repConfig, "emom", [movements[1]])[0]
      : movements[1]?.defaultValue || randomInt(8, 15);

    workoutMovements.push({
      movementId: movements[0].id,
      reps: oddReps,
      load: movements[0].defaultLoad || undefined,
      order: 0,
      label: "Odd:",
    });

    if (movements.length > 1) {
      workoutMovements.push({
        movementId: movements[1].id,
        reps: evenReps,
        load: movements[1].defaultLoad || undefined,
        order: 1,
        label: "Even:",
      });
    }
  } else {
    movements.forEach((m, idx) => {
      const reps = repConfig
        ? generateReps(1, repConfig, "emom", [m])[0]
        : m.defaultValue || randomInt(8, 15);
      workoutMovements.push({
        movementId: m.id,
        reps,
        load: m.defaultLoad || undefined,
        order: idx,
        label: `Min ${idx + 1}:`,
      });
    });
  }

  const workout = buildWorkout("emom", { duration }, workoutMovements);
  workout.name = `EMOM ${duration} min`;
  return workout;
}

/**
 * Generate an Intervals workout.
 * Structure: "[rounds] rounds: [work]s [movement], [rest]s rest"
 * Params: workInterval (sec), restInterval (sec), rounds - REQUIRED
 */
export function generateIntervals(
  movements: Movement[],
  params: FormatParams,
  _repConfig?: RepConfig // eslint-disable-line @typescript-eslint/no-unused-vars
): Workout {
  const workSeconds = params.workInterval || 40;
  const restSeconds = params.restInterval || 20;
  const rounds = params.rounds || 5;

  const workoutMovements: WorkoutMovement[] = movements.map((m, idx) => ({
    movementId: m.id,
    reps: `${workSeconds}s`,
    load: m.defaultLoad || undefined,
    order: idx,
  }));

  const workout = buildWorkout(
    "intervals",
    { workInterval: workSeconds, restInterval: restSeconds, rounds },
    workoutMovements,
    rounds
  );

  workout.name = `${rounds} Rounds`;
  return workout;
}

/**
 * Generate a For Load workout.
 * Structure: "For [time/rep target]: Find max [movement]"
 * Params: rounds (rep target: 1, 3, or 5)
 */
export function generateForLoad(
  movements: Movement[],
  params: FormatParams
): Workout {
  const movement = movements[0];
  const repTarget = params.rounds || 1;

  const workoutMovements: WorkoutMovement[] = [
    {
      movementId: movement.id,
      reps: repTarget,
      load: movement.defaultLoad || undefined,
      order: 0,
    },
  ];

  const workout = buildWorkout("for_load", params, workoutMovements);
  workout.name =
    repTarget === 1
      ? "Find 1RM"
      : repTarget === 3
        ? "Find 3RM"
        : `Find ${repTarget}RM`;
  return workout;
}

/**
 * Generate a Chipper workout.
 * Structure: "For Time: [reps] [movement1], [reps] [movement2], ..."
 * Descending rep scheme.
 * Params: rounds (movement count, 3-6)
 */
export function generateChipper(
  movements: Movement[],
  params: FormatParams
): Workout {
  const sortedMovements = shuffle([...movements]);
  const count = params.rounds || Math.min(4, sortedMovements.length);
  const limitedMovements = sortedMovements.slice(0, count);

  // Descending reps: start high, end low
  const baseReps = count * 10;
  const repsArray = Array.from(
    { length: count },
    (_, i) => baseReps - i * 5
  );

  const workoutMovements: WorkoutMovement[] = limitedMovements.map(
    (m, idx) => ({
      movementId: m.id,
      reps: repsArray[idx],
      load: m.defaultLoad || undefined,
      order: idx,
    })
  );

  const workout = buildWorkout("chipper", params, workoutMovements);
  workout.name = "Chipper";
  return workout;
}

/**
 * Generate a Ladder workout.
 * Structure: "[start]-[start+inc]-...-[end] [movement1] + [movement2]"
 * Params: rounds (start reps, default 1)
 */
export function generateLadder(
  movements: Movement[],
  params: FormatParams
): Workout {
  const startReps = params.rounds || 1;
  const endReps = startReps + 9;

  const workoutMovements: WorkoutMovement[] = movements
    .slice(0, 2)
    .map((m, idx) => ({
      movementId: m.id,
      reps: `${startReps}-${endReps}`,
      load: m.defaultLoad || undefined,
      order: idx,
    }));

  const workout = buildWorkout("ladder", params, workoutMovements);
  workout.name = `${startReps}-${endReps} Ladder`;
  return workout;
}

/**
 * Generate a Classic format workout.
 * Structure: "[pattern] for time of: [reps] [movement]"
 * Params: rounds (pattern index 1-6)
 */
export function generateClassic(
  movements: Movement[],
  params: FormatParams
): Workout {
  const CLASSIC_PATTERNS: number[][] = [
    [21, 15, 9],
    [15, 12, 9],
    [21, 15, 9, 3],
    [15, 15, 15],
    [12, 9, 6],
    [10, 10, 10],
  ];
    const patternIndex = params.rounds
    ? Math.min(params.rounds - 1, CLASSIC_PATTERNS.length - 1)
    : randomInt(0, CLASSIC_PATTERNS.length - 1);
  const pattern = CLASSIC_PATTERNS[patternIndex];

  const workoutMovements: WorkoutMovement[] = movements.map((m, idx) => ({
    movementId: m.id,
    reps: pattern[idx % pattern.length],
    load: m.defaultLoad || undefined,
    order: idx,
  }));

  const workout = buildWorkout("classic", { rounds: pattern.length }, workoutMovements);
  workout.name = pattern.join("-") + " For Time";
  return workout;
}

/**
 * Main dispatcher — generates a complete workout for any format.
 */
export function generateWorkoutForFormat(
  format: WorkoutFormat,
  movements: Movement[],
  params: FormatParams,
  repConfig?: RepConfig
): Workout {
  let workout: Workout;

  switch (format) {
    case "for_time":
      workout = generateForTime(movements, params, repConfig);
      break;
    case "amrap":
      workout = generateAMRAP(movements, params, repConfig);
      break;
    case "emom":
      workout = generateEMOM(movements, params, repConfig);
      break;
    case "intervals":
      workout = generateIntervals(movements, params, repConfig);
      break;
    case "for_load":
      workout = generateForLoad(movements, params);
      break;
    case "chipper":
      workout = generateChipper(movements, params);
      break;
    case "ladder":
      workout = generateLadder(movements, params);
      break;
    case "classic":
      workout = generateClassic(movements, params);
      break;
    default:
      workout = generateForTime(movements, params, repConfig);
  }

  // Set equipment and modality breakdown
  workout.equipment = getRequiredEquipment(movements);
  workout.modalityBreakdown = getModalityBreakdown(movements);

  return workout;
}
