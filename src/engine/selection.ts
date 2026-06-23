import type { Movement, WorkoutFormat, WorkoutConfig } from "@/types";
import { ALL_MOVEMENTS } from "@/data/movements";
import { weightedSample, randomSample } from "./random";

/**
 * Get how many movements a format typically uses.
 */
export function getMovementCountForFormat(format: WorkoutFormat): {
  min: number;
  max: number;
} {
  switch (format) {
    case "for_time":
      return { min: 2, max: 5 };
    case "amrap":
      return { min: 2, max: 4 };
    case "emom":
      return { min: 1, max: 3 };
    case "intervals":
      return { min: 1, max: 3 };
    case "for_load":
      return { min: 1, max: 1 };
    case "chipper":
      return { min: 3, max: 6 };
    case "ladder":
      return { min: 2, max: 3 };
    case "classic":
      return { min: 2, max: 4 };
    case "random":
      return { min: 2, max: 4 };
    default:
      return { min: 2, max: 4 };
  }
}

/**
 * Select movements for a workout based on config.
 */
export function selectMovements(config: WorkoutConfig): Movement[] {
  const pool = config.movementIds
    .map((id) => ALL_MOVEMENTS.find((m) => m.id === id))
    .filter((m): m is Movement => m !== undefined);

  if (pool.length === 0) return [];

  const format =
    config.formats.includes("random") || config.formats.length === 0
      ? (["for_time", "amrap", "emom", "chipper"] as const)[
          Math.floor(Math.random() * 4)
        ]
      : config.formats[Math.floor(Math.random() * config.formats.length)];

  const { min, max } = getMovementCountForFormat(format);
  const count = Math.floor(Math.random() * (max - min + 1)) + min;

  // Use probability weights if provided
  const hasWeights = Object.keys(config.probabilityWeights).length > 0;
  if (hasWeights) {
    const weights = pool.map(
      (m) => config.probabilityWeights[m.id] ?? 1
    );
    return weightedSample(pool, count, weights);
  }

  return randomSample(pool, count);
}

/**
 * Check modality balance — return true if balance is acceptable.
 * Rule: no single modality should exceed 70% of movements.
 */
export function checkModalityBalance(movements: Movement[]): boolean {
  if (movements.length === 0) return true;

  const breakdown = getModalityBreakdown(movements);
  const total = movements.length;

  return (
    breakdown.weightlifting / total <= 0.7 &&
    breakdown.gymnastics / total <= 0.7 &&
    breakdown.monostructural / total <= 0.7
  );
}

/**
 * Ensure consecutive movements don't all use same modality.
 */
export function checkMovementPattern(movements: Movement[]): boolean {
  if (movements.length <= 2) return true;

  let consecutiveSame = 1;
  for (let i = 1; i < movements.length; i++) {
    if (movements[i].modality === movements[i - 1].modality) {
      consecutiveSame++;
      if (consecutiveSame >= 3) return false;
    } else {
      consecutiveSame = 1;
    }
  }
  return true;
}

/**
 * Get unique equipment list from movements.
 */
export function getRequiredEquipment(movements: Movement[]): string[] {
  const equipment = new Set<string>();
  movements.forEach((m) => m.equipment.forEach((e) => equipment.add(e)));
  return Array.from(equipment);
}

/**
 * Calculate modality breakdown percentages.
 */
export function getModalityBreakdown(
  movements: Movement[]
): { weightlifting: number; gymnastics: number; monostructural: number } {
  const total = movements.length || 1;
  const counts = { weightlifting: 0, gymnastics: 0, monostructural: 0 };

  movements.forEach((m) => {
    if (m.modality in counts) {
      counts[m.modality as keyof typeof counts]++;
    }
  });

  return {
    weightlifting: Math.round((counts.weightlifting / total) * 100),
    gymnastics: Math.round((counts.gymnastics / total) * 100),
    monostructural: Math.round((counts.monostructural / total) * 100),
  };
}

/**
 * Filter movements by available equipment.
 */
export function filterByEquipment(
  movements: Movement[],
  availableEquipment: string[]
): Movement[] {
  return movements.filter((m) =>
    m.equipment.length === 0
      ? true // Bodyweight movements always available
      : m.equipment.some((e) => availableEquipment.includes(e))
  );
}

/**
 * Select movements with retry for balance.
 * Tries up to 10 times to get a balanced selection.
 */
export function selectBalancedMovements(config: WorkoutConfig): Movement[] {
  for (let attempt = 0; attempt < 10; attempt++) {
    const movements = selectMovements(config);

    if (
      movements.length >= 2 &&
      checkModalityBalance(movements) &&
      checkMovementPattern(movements)
    ) {
      return movements;
    }
  }

  // Fallback: just return whatever we got
  return selectMovements(config);
}
