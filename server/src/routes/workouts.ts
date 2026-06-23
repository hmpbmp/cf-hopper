import { Router } from "express";
import { getDb } from "../db/connection";
import type { WorkoutRow } from "../types";

const router = Router();

function safeParse<T>(json: string | null | undefined, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

interface WorkoutResponse {
  id: string;
  name: string;
  format: string;
  formatParams: Record<string, unknown>;
  movements: Array<{
    movementId: string;
    reps: number | string;
    load?: { male: number; female: number };
    order: number;
    label?: string;
  }>;
  rounds?: number;
  estimatedDuration: string;
  equipment: string[];
  modalityBreakdown: {
    weightlifting: number;
    gymnastics: number;
    monostructural: number;
  };
  notes: string;
  isFavorite: boolean;
  createdAt: string;
}

function rowToWorkout(row: WorkoutRow): WorkoutResponse {
  return {
    id: row.id,
    name: row.name,
    format: row.format,
    formatParams: safeParse(row.format_params, {}),
    movements: safeParse(row.movements, []),
    rounds: row.rounds ?? undefined,
    estimatedDuration: row.estimated_duration,
    equipment: safeParse(row.equipment, []),
    modalityBreakdown: safeParse(row.modality_breakdown, { weightlifting: 0, gymnastics: 0, monostructural: 0 }),
    notes: row.notes,
    isFavorite: row.is_favorite === 1,
    createdAt: row.created_at,
  };
}

// GET /api/workouts - List workouts with optional filters
router.get("/", (req, res) => {
  const db = getDb();
  const { format, movement, search } = req.query;

  let query = "SELECT * FROM workouts";
  const conditions: string[] = [];
  const params: string[] = [];

  if (format && typeof format === "string") {
    conditions.push("format = ?");
    params.push(format);
  }

  if (search && typeof search === "string") {
    conditions.push("(name LIKE ? OR movements LIKE ?)");
    const pattern = `%${search}%`;
    params.push(pattern, pattern);
  }

  if (movement && typeof movement === "string") {
    conditions.push("movements LIKE ?");
    params.push(`%"movementId":"${movement}"%`);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " ORDER BY created_at DESC";

  const rows = db.prepare(query).all(...params) as WorkoutRow[];
  res.json(rows.map(rowToWorkout));
});

// GET /api/workouts/:id - Get single workout
router.get("/:id", (req, res) => {
  const db = getDb();
  const row = db.prepare("SELECT * FROM workouts WHERE id = ?").get(req.params.id) as WorkoutRow | undefined;
  if (!row) {
    res.status(404).json({ error: "Workout not found" });
    return;
  }
  res.json(rowToWorkout(row));
});

// POST /api/workouts - Save a new workout
router.post("/", (req, res) => {
  const db = getDb();
  const workout = req.body;

  db.prepare(`
    INSERT INTO workouts (id, name, format, format_params, movements, rounds, estimated_duration, equipment, modality_breakdown, notes, is_favorite, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    workout.id,
    workout.name,
    workout.format,
    JSON.stringify(workout.formatParams || {}),
    JSON.stringify(workout.movements),
    workout.rounds ?? null,
    workout.estimatedDuration,
    JSON.stringify(workout.equipment),
    JSON.stringify(workout.modalityBreakdown),
    workout.notes || "",
    workout.isFavorite ? 1 : 0,
    workout.createdAt || new Date().toISOString()
  );

  res.status(201).json({ success: true, id: workout.id });
});

// PUT /api/workouts/:id - Update workout
router.put("/:id", (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const updates = req.body;

  const existing = db.prepare("SELECT id FROM workouts WHERE id = ?").get(id);
  if (!existing) {
    res.status(404).json({ error: "Workout not found" });
    return;
  }

  const fields: string[] = [];
  const values: unknown[] = [];

  if (updates.name !== undefined) {
    fields.push("name = ?");
    values.push(updates.name);
  }
  if (updates.format !== undefined) {
    fields.push("format = ?");
    values.push(updates.format);
  }
  if (updates.formatParams !== undefined) {
    fields.push("format_params = ?");
    values.push(JSON.stringify(updates.formatParams));
  }
  if (updates.movements !== undefined) {
    fields.push("movements = ?");
    values.push(JSON.stringify(updates.movements));
  }
  if (updates.rounds !== undefined) {
    fields.push("rounds = ?");
    values.push(updates.rounds);
  }
  if (updates.estimatedDuration !== undefined) {
    fields.push("estimated_duration = ?");
    values.push(updates.estimatedDuration);
  }
  if (updates.equipment !== undefined) {
    fields.push("equipment = ?");
    values.push(JSON.stringify(updates.equipment));
  }
  if (updates.modalityBreakdown !== undefined) {
    fields.push("modality_breakdown = ?");
    values.push(JSON.stringify(updates.modalityBreakdown));
  }
  if (updates.notes !== undefined) {
    fields.push("notes = ?");
    values.push(updates.notes);
  }
  if (updates.isFavorite !== undefined) {
    fields.push("is_favorite = ?");
    values.push(updates.isFavorite ? 1 : 0);
  }

  if (fields.length === 0) {
    res.status(400).json({ error: "No fields to update" });
    return;
  }

  values.push(id);
  db.prepare(`UPDATE workouts SET ${fields.join(", ")} WHERE id = ?`).run(...values);

  const row = db.prepare("SELECT * FROM workouts WHERE id = ?").get(id) as WorkoutRow;
  res.json(rowToWorkout(row));
});

// POST /api/workouts/:id/duplicate - Duplicate a workout
router.post("/:id/duplicate", (req, res) => {
  const db = getDb();
  const row = db.prepare("SELECT * FROM workouts WHERE id = ?").get(req.params.id) as WorkoutRow | undefined;
  if (!row) {
    res.status(404).json({ error: "Workout not found" });
    return;
  }

  const newId = crypto.randomUUID();
  db.prepare(`
    INSERT INTO workouts (id, name, format, format_params, movements, rounds, estimated_duration, equipment, modality_breakdown, notes, is_favorite, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
  `).run(
    newId,
    `${row.name} (Copy)`,
    row.format,
    row.format_params,
    row.movements,
    row.rounds,
    row.estimated_duration,
    row.equipment,
    row.modality_breakdown,
    row.notes,
    new Date().toISOString()
  );

  const newRow = db.prepare("SELECT * FROM workouts WHERE id = ?").get(newId) as WorkoutRow;
  res.status(201).json(rowToWorkout(newRow));
});

// POST /api/workouts/:id/favorite - Toggle favorite
router.post("/:id/favorite", (req, res) => {
  const db = getDb();
  const row = db.prepare("SELECT is_favorite FROM workouts WHERE id = ?").get(req.params.id) as WorkoutRow | undefined;
  if (!row) {
    res.status(404).json({ error: "Workout not found" });
    return;
  }

  const newFavorite = row.is_favorite === 0 ? 1 : 0;
  db.prepare("UPDATE workouts SET is_favorite = ? WHERE id = ?").run(newFavorite, req.params.id);
  res.json({ isFavorite: newFavorite === 1 });
});

// DELETE /api/workouts/:id - Delete workout
router.delete("/:id", (req, res) => {
  const db = getDb();
  db.prepare("DELETE FROM workouts WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

// DELETE /api/workouts - Clear all history
router.delete("/", (_req, res) => {
  const db = getDb();
  db.prepare("DELETE FROM workouts").run();
  res.json({ success: true });
});

export default router;
