export interface MovementRow {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  equipment: string; // JSON array
  modality: string;
  is_weighted: number; // 0 or 1
  default_load: string | null; // JSON or null
  scaling_options: string; // JSON array
  description: string;
  seconds_per_rep: number;
  unit: string;
  default_value: number;
  typical_range: string; // JSON {min, max}
}

export interface OverrideRow {
  movement_id: string;
  seconds_per_rep: number | null;
  default_value: number | null;
  typical_range: string | null; // JSON
  unit: string | null;
  updated_at: string;
}

export interface WorkoutRow {
  id: string;
  name: string;
  format: string;
  format_params: string; // JSON
  movements: string; // JSON array
  rounds: number | null;
  estimated_duration: string;
  equipment: string; // JSON array
  modality_breakdown: string; // JSON
  notes: string;
  is_favorite: number; // 0 or 1
  created_at: string;
}

export interface PresetRow {
  id: string;
  name: string;
  description: string;
  config: string; // JSON
  is_built_in: number; // 0 or 1
}
