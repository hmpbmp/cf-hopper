import { Router } from "express";
import { getDb } from "../db/connection";
import type { MovementRow, OverrideRow } from "../types";

const router = Router();

function safeParse<T>(json: string | null | undefined, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

interface MovementResponse {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  equipment: string[];
  modality: string;
  isWeighted: boolean;
  defaultLoad: { male: number; female: number } | null;
  scalingOptions: Array<{
    level: string;
    description: string;
    loadModifier?: number;
    alternativeMovement?: string;
  }>;
  description: string;
  secondsPerRep: number;
  unit: string;
  defaultValue: number;
  typicalRange: { min: number; max: number };
}

function rowToMovement(row: MovementRow, override?: OverrideRow | null): MovementResponse {
  const base: MovementResponse = {
    id: row.id,
    name: row.name,
    category: row.category,
    subcategory: row.subcategory,
    equipment: safeParse(row.equipment, []),
    modality: row.modality,
    isWeighted: row.is_weighted === 1,
    defaultLoad: row.default_load ? safeParse(row.default_load, null) : null,
    scalingOptions: safeParse(row.scaling_options, []),
    description: row.description,
    secondsPerRep: row.seconds_per_rep,
    unit: row.unit,
    defaultValue: row.default_value,
    typicalRange: safeParse(row.typical_range, { min: 1, max: 10 }),
  };

  if (override) {
    if (override.seconds_per_rep !== null) base.secondsPerRep = override.seconds_per_rep;
    if (override.default_value !== null) base.defaultValue = override.default_value;
    if (override.typical_range !== null) base.typicalRange = safeParse(override.typical_range, base.typicalRange);
    if (override.unit !== null) base.unit = override.unit;
  }

  return base;
}

// GET /api/movements - List all movements with overrides applied
router.get("/", (_req, res) => {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM movements ORDER BY category, name").all() as MovementRow[];
  const overrides = db.prepare("SELECT * FROM movement_overrides").all() as OverrideRow[];
  const overrideMap = new Map(overrides.map((o) => [o.movement_id, o]));

  const movements = rows.map((row) => rowToMovement(row, overrideMap.get(row.id)));
  res.json(movements);
});

// GET /api/movements/categories - List distinct categories
router.get("/categories", (_req, res) => {
  const db = getDb();
  const rows = db.prepare("SELECT DISTINCT category FROM movements ORDER BY category").all() as { category: string }[];
  res.json(rows.map((r) => r.category));
});

// GET /api/movements/:id - Get single movement
router.get("/:id", (req, res) => {
  const db = getDb();
  const row = db.prepare("SELECT * FROM movements WHERE id = ?").get(req.params.id) as MovementRow | undefined;
  if (!row) {
    res.status(404).json({ error: "Movement not found" });
    return;
  }
  const override = db.prepare("SELECT * FROM movement_overrides WHERE movement_id = ?").get(req.params.id) as OverrideRow | undefined;
  res.json(rowToMovement(row, override));
});

// GET /api/movements/overrides - Get all overrides
router.get("/overrides/all", (_req, res) => {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM movement_overrides").all() as OverrideRow[];
  const overrides: Record<string, { secondsPerRep?: number; defaultValue?: number; typicalRange?: { min: number; max: number }; unit?: string }> = {};
  for (const row of rows) {
    overrides[row.movement_id] = {
      ...(row.seconds_per_rep !== null && { secondsPerRep: row.seconds_per_rep }),
      ...(row.default_value !== null && { defaultValue: row.default_value }),
      ...(row.typical_range !== null && { typicalRange: safeParse(row.typical_range, { min: 1, max: 10 }) }),
      ...(row.unit !== null && { unit: row.unit }),
    };
  }
  res.json(overrides);
});

// PUT /api/movements/:id/override - Set/update override
router.put("/:id/override", (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const { secondsPerRep, defaultValue, typicalRange, unit } = req.body;

  // Verify movement exists
  const movement = db.prepare("SELECT id FROM movements WHERE id = ?").get(id);
  if (!movement) {
    res.status(404).json({ error: "Movement not found" });
    return;
  }

  db.prepare(`
    INSERT INTO movement_overrides (movement_id, seconds_per_rep, default_value, typical_range, unit, updated_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(movement_id) DO UPDATE SET
      seconds_per_rep = COALESCE(excluded.seconds_per_rep, movement_overrides.seconds_per_rep),
      default_value = COALESCE(excluded.default_value, movement_overrides.default_value),
      typical_range = COALESCE(excluded.typical_range, movement_overrides.typical_range),
      unit = COALESCE(excluded.unit, movement_overrides.unit),
      updated_at = datetime('now')
  `).run(
    id,
    secondsPerRep ?? null,
    defaultValue ?? null,
    typicalRange ? JSON.stringify(typicalRange) : null,
    unit ?? null
  );

  res.json({ success: true });
});

// DELETE /api/movements/:id/override - Remove override
router.delete("/:id/override", (req, res) => {
  const db = getDb();
  db.prepare("DELETE FROM movement_overrides WHERE movement_id = ?").run(req.params.id);
  res.json({ success: true });
});

export default router;
