import { request } from "./client";
import type { Workout } from "@/types";

export interface WorkoutFilters {
  format?: string;
  movement?: string;
  search?: string;
}

export async function fetchWorkouts(
  filters?: WorkoutFilters
): Promise<Workout[]> {
  const params = new URLSearchParams();
  if (filters?.format) params.set("format", filters.format);
  if (filters?.movement) params.set("movement", filters.movement);
  if (filters?.search) params.set("search", filters.search);
  const query = params.toString();
  return request<Workout[]>(`/workouts${query ? `?${query}` : ""}`);
}

export async function fetchWorkout(id: string): Promise<Workout> {
  return request<Workout>(`/workouts/${id}`);
}

export async function saveWorkout(workout: Workout): Promise<void> {
  await request("/workouts", {
    method: "POST",
    body: JSON.stringify({
      id: workout.id,
      name: workout.name,
      format: workout.format,
      formatParams: workout.formatParams,
      movements: workout.movements,
      rounds: workout.rounds,
      estimatedDuration: workout.estimatedDuration,
      equipment: workout.equipment,
      modalityBreakdown: workout.modalityBreakdown,
      notes: workout.notes,
      createdAt: workout.createdAt,
    }),
  });
}

export async function updateWorkout(
  id: string,
  updates: Partial<Workout>
): Promise<Workout> {
  return request<Workout>(`/workouts/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

export async function deleteWorkout(id: string): Promise<void> {
  await request(`/workouts/${id}`, { method: "DELETE" });
}

export async function clearWorkouts(): Promise<void> {
  await request("/workouts", { method: "DELETE" });
}

export async function duplicateWorkout(id: string): Promise<Workout> {
  return request<Workout>(`/workouts/${id}/duplicate`, { method: "POST" });
}

export async function toggleFavorite(id: string): Promise<boolean> {
  const res = await request<{ isFavorite: boolean }>(
    `/workouts/${id}/favorite`,
    { method: "POST" }
  );
  return res.isFavorite;
}
