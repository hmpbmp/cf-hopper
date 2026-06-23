import type { Movement } from "@/types";
import { WEIGHTLIFTING_MOVEMENTS } from "./movements-weightlifting";
import {
  GYMNASTICS_MOVEMENTS,
  MONOSTRUCTURAL_MOVEMENTS,
  STRONGMAN_MOVEMENTS,
} from "./movements-other";

export const ALL_MOVEMENTS: Movement[] = [
  ...WEIGHTLIFTING_MOVEMENTS,
  ...GYMNASTICS_MOVEMENTS,
  ...MONOSTRUCTURAL_MOVEMENTS,
  ...STRONGMAN_MOVEMENTS,
];

export function invalidateOverridesCache() {
  // No-op: overrides are now managed via API
}

export function getMovementById(id: string): Movement | undefined {
  return ALL_MOVEMENTS.find((m) => m.id === id);
}

export function getMovementsByCategory(category: string): Movement[] {
  return ALL_MOVEMENTS.filter((m) => m.category === category);
}

export function getMovementsBySubcategory(subcategory: string): Movement[] {
  return ALL_MOVEMENTS.filter((m) => m.subcategory === subcategory);
}

export function getMovementsByEquipment(equipment: string): Movement[] {
  return ALL_MOVEMENTS.filter((m) => m.equipment.includes(equipment));
}

export function getMovementsByModality(modality: string): Movement[] {
  return ALL_MOVEMENTS.filter((m) => m.modality === modality);
}
