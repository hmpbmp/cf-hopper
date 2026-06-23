import { request } from "./client";
import type { Movement } from "@/types";

interface MovementOverride {
  secondsPerRep?: number;
  defaultValue?: number;
  typicalRange?: { min: number; max: number };
  unit?: Movement["unit"];
}

export async function fetchMovements(): Promise<Movement[]> {
  return request<Movement[]>("/movements");
}

export async function fetchMovement(id: string): Promise<Movement> {
  return request<Movement>(`/movements/${id}`);
}

export async function fetchCategories(): Promise<string[]> {
  return request<string[]>("/movements/categories");
}

export async function fetchOverrides(): Promise<
  Record<string, MovementOverride>
> {
  return request<Record<string, MovementOverride>>("/movements/overrides/all");
}

export async function updateOverride(
  movementId: string,
  override: MovementOverride
): Promise<void> {
  await request(`/movements/${movementId}/override`, {
    method: "PUT",
    body: JSON.stringify(override),
  });
}

export async function deleteOverride(movementId: string): Promise<void> {
  await request(`/movements/${movementId}/override`, {
    method: "DELETE",
  });
}
