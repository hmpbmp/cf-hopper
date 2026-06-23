import { request } from "./client";
import type { Preset, WorkoutConfig } from "@/types";

export async function fetchPresets(): Promise<Preset[]> {
  return request<Preset[]>("/presets");
}

export async function savePreset(preset: {
  id?: string;
  name: string;
  description?: string;
  config: WorkoutConfig;
}): Promise<void> {
  await request("/presets", {
    method: "POST",
    body: JSON.stringify(preset),
  });
}

export async function deletePreset(id: string): Promise<void> {
  await request(`/presets/${id}`, { method: "DELETE" });
}
