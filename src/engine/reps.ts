import type { RepConfig, WorkoutFormat, Workout, Movement } from "@/types";
import { randomInt } from "./random";
import { getMovementById } from "@/data/movements";

/**
 * Estimate total workout duration in seconds using secondsPerRep data.
 * Accounts for rounds, transitions, rest breaks, and format-specific timing.
 *
 * Calibrated against real benchmark times (Fran, Grace, Helen, Murph, Diane)
 * for intermediate-level athletes.
 */
export function estimateWorkoutDurationSeconds(workout: Workout): number {
  // Format-specific estimations use fixed formulas
  switch (workout.format) {
    case "amrap":
      return (workout.formatParams.duration || 10) * 60;
    case "emom":
      return (workout.formatParams.duration || 10) * 60;
    case "intervals":
      return (
        (workout.formatParams.rounds || 5) *
        ((workout.formatParams.workInterval || 40) +
          (workout.formatParams.restInterval || 20))
      );
    case "for_load":
      return 180 * Math.max(1, workout.movements.length);
  }

  // Distance-based movements have built-in pacing — they don't need rest overhead
  const DISTANCE_UNITS = new Set(["meters", "feet"]);

  // Rep-based formats: calculate raw work time + overhead
  let rawWorkSeconds = 0;
  let weightedWorkSeconds = 0;
  let bodyweightWorkSeconds = 0;
  let totalBodyweightReps = 0;
  for (const wm of workout.movements) {
    const movement = getMovementById(wm.movementId);
    const spr = movement?.secondsPerRep ?? 3.0;
    const reps = typeof wm.reps === "number" ? wm.reps : 0;
    const workTime = reps * spr;
    rawWorkSeconds += workTime;

    // Distance-based movements (run, row, bike) are always "pacing" — no rest breaks
    if (movement?.unit && DISTANCE_UNITS.has(movement.unit)) {
      // Don't count in weighted/bodyweight — they don't generate rest overhead
    } else if (movement?.isWeighted) {
      weightedWorkSeconds += workTime;
    } else {
      bodyweightWorkSeconds += workTime;
      totalBodyweightReps += reps;
    }
  }

  // Multiply by rounds
  const rounds = workout.rounds && workout.rounds > 1 ? workout.rounds : 1;
  rawWorkSeconds *= rounds;
  weightedWorkSeconds *= rounds;
  bodyweightWorkSeconds *= rounds;
  totalBodyweightReps *= rounds;

  // Rest/set-break overhead:
  // Weighted movements: ~50% of work time as rest (heavy barbell cycling)
  // Bodyweight movements: rest rate scales with per-round volume (not total),
  // so 5 rounds of 15 pull-ups gets a lower rate than 1 set of 75 pull-ups.
  const perRoundBWReps = rounds > 1 ? totalBodyweightReps / rounds : totalBodyweightReps;
  const bodyweightRestRate = Math.min(0.45, 0.15 + perRoundBWReps * 0.0006);
  const restOverhead = weightedWorkSeconds * 0.5 + bodyweightWorkSeconds * bodyweightRestRate;

  // Transition time between movements: ~8 sec per transition per round
  const uniqueMovements = new Set(workout.movements.map((m) => m.movementId)).size;
  const transitionsPerRound = Math.max(0, uniqueMovements - 1);
  const transitionSeconds = transitionsPerRound * 8 * rounds;

  // Round transition penalty
  const roundTransitions = Math.max(0, rounds - 1) * 10;

  // Sprint bonus: very short workouts (<2 min raw) have disproportionately
  // more setup/transition time relative to work
  const sprintBonus = rawWorkSeconds < 150 ? 60 : 0;

  const totalSeconds =
    rawWorkSeconds + restOverhead + transitionSeconds + roundTransitions + sprintBonus;

  return totalSeconds;
}

/**
 * Check if a workout fits within 90% of the time cap.
 */
export function workoutFitsTimeCap(workout: Workout, timeCapMinutes: number): boolean {
  const capSeconds = timeCapMinutes * 60;
  const estimated = estimateWorkoutDurationSeconds(workout);
  return estimated <= capSeconds * 0.9;
}

/**
 * Get estimated duration string based on seconds.
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  if (minutes < 1) return "< 1 min";
  if (minutes <= 4) return `${minutes}-${minutes + 2} min`;
  if (minutes <= 8) return `${minutes}-${minutes + 3} min`;
  if (minutes <= 15) return `${minutes + 1}-${minutes + 5} min`;
  if (minutes <= 25) return `${minutes + 2}-${minutes + 8} min`;
  return `${minutes + 3}-${minutes + 10} min`;
}

// --- Rep generation functions below ---

export function randomRepRange(min: number, max: number, count: number): number[] {
  return Array.from({ length: count }, () => randomInt(min, max));
}

export function formatAppropriateReps(format: WorkoutFormat, count: number): number[] {
  switch (format) {
    case "for_time":
      return randomRepRange(5, 25, count);
    case "amrap":
      return randomRepRange(8, 25, count);
    case "emom":
      return randomRepRange(5, 15, count);
    case "intervals":
      return randomRepRange(5, 15, count);
    case "for_load":
      return Array(count).fill(1);
    case "chipper":
      return randomRepRange(10, 50, count);
    case "ladder":
      return randomRepRange(3, 15, count);
    default:
      return randomRepRange(5, 25, count);
  }
}

export function generateReps(
  movementCount: number,
  repConfig: RepConfig,
  _format?: WorkoutFormat,
  movements?: Movement[]
): number[] {
  // If movements provided, use per-movement overrides and defaultValue
  if (movements) {
    return movements.map((m) => {
      // Check for per-movement override (works for all units)
      const override = repConfig.movementOverrides[m.id];
      const min = override?.min ?? m.defaultValue;
      const max = override?.max ?? m.defaultValue;

      switch (repConfig.scheme) {
        case "fixed":
          return min;
        case "random":
        default:
          return randomInt(min, max);
      }
    });
  }

  // Fallback: use global min/max (no movement context)
  switch (repConfig.scheme) {
    case "fixed":
      return Array(movementCount).fill(repConfig.minReps);

    case "random":
    default:
      return randomRepRange(repConfig.minReps, repConfig.maxReps, movementCount);
  }
}

/**
 * Get estimated duration string based on format and movements.
 * @deprecated Use estimateWorkoutDurationSeconds + formatDuration instead.
 */
export function estimateDuration(
  format: WorkoutFormat,
  _movementCount: number,
  totalReps: number
): string {
  let estimatedSeconds: number;

  switch (format) {
    case "for_time":
      estimatedSeconds = totalReps * 1.5;
      break;
    case "amrap":
      estimatedSeconds = totalReps * 1.5;
      break;
    case "emom":
      estimatedSeconds = totalReps * 60;
      break;
    case "intervals":
      estimatedSeconds = totalReps * 40;
      break;
    case "for_load":
      estimatedSeconds = 180;
      break;
    case "chipper":
      estimatedSeconds = totalReps * 1.2;
      break;
    case "ladder":
      estimatedSeconds = totalReps * 2;
      break;
    default:
      estimatedSeconds = totalReps * 1.5;
  }

  return formatDuration(estimatedSeconds);
}
