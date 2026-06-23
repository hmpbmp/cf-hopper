import { Router } from "express";
import { getDb } from "../db/connection";
import type { PresetRow } from "../types";

const router = Router();

function safeParse<T>(json: string | null | undefined, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

interface PresetResponse {
  id: string;
  name: string;
  description: string;
  config: Record<string, unknown>;
  isBuiltIn: boolean;
}

function rowToPreset(row: PresetRow): PresetResponse {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    config: safeParse(row.config, {}),
    isBuiltIn: row.is_built_in === 1,
  };
}

// GET /api/presets - List all presets
router.get("/", (_req, res) => {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM presets ORDER BY is_built_in DESC, name").all() as PresetRow[];
  res.json(rows.map(rowToPreset));
});

// POST /api/presets - Save custom preset
router.post("/", (req, res) => {
  const db = getDb();
  const preset = req.body;

  db.prepare(`
    INSERT INTO presets (id, name, description, config, is_built_in)
    VALUES (?, ?, ?, ?, 0)
  `).run(
    preset.id || crypto.randomUUID(),
    preset.name,
    preset.description || "",
    JSON.stringify(preset.config)
  );

  res.status(201).json({ success: true, id: preset.id });
});

// DELETE /api/presets/:id - Delete custom preset (not built-in)
router.delete("/:id", (req, res) => {
  const db = getDb();
  const row = db.prepare("SELECT is_built_in FROM presets WHERE id = ?").get(req.params.id) as PresetRow | undefined;
  if (!row) {
    res.status(404).json({ error: "Preset not found" });
    return;
  }
  if (row.is_built_in === 1) {
    res.status(403).json({ error: "Cannot delete built-in preset" });
    return;
  }
  db.prepare("DELETE FROM presets WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

export default router;
