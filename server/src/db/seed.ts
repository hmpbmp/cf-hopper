import { getDb, closeDb } from "./connection";
import path from "path";
import fs from "fs";

interface Movement {
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

function parseMovementFile(content: string): Movement[] {
  const movements: Movement[] = [];

  // Match each movement object block
  const objectRegex = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
  let blockMatch;

  while ((blockMatch = objectRegex.exec(content)) !== null) {
    const block = blockMatch[0];

    // Extract fields
    const idMatch = block.match(/id:\s*"([^"]+)"/);
    const nameMatch = block.match(/name:\s*"([^"]+)"/);
    const categoryMatch = block.match(/category:\s*"([^"]+)"/);
    const subcategoryMatch = block.match(/subcategory:\s*"([^"]+)"/);
    const modalityMatch = block.match(/modality:\s*"([^"]+)"/);
    const isWeightedMatch = block.match(/isWeighted:\s*(true|false)/);
    const descriptionMatch = block.match(/description:\s*"([^"]+)"/);
    const secondsPerRepMatch = block.match(/secondsPerRep:\s*([\d.]+)/);
    const unitMatch = block.match(/unit:\s*"([^"]+)"/);
    const defaultValueMatch = block.match(/defaultValue:\s*([\d.]+)/);

    if (!idMatch || !nameMatch || !categoryMatch) continue;

    // Extract equipment array
    const equipMatch = block.match(/equipment:\s*\[([^\]]*)\]/);
    const equipment = equipMatch
      ? equipMatch[1].match(/"([^"]+)"/g)?.map((s) => s.replace(/"/g, "")) || []
      : [];

    // Extract defaultLoad
    let defaultLoad: { male: number; female: number } | null = null;
    const loadMatch = block.match(/defaultLoad:\s*\{\s*male:\s*(\d+),\s*female:\s*(\d+)\s*\}/);
    if (loadMatch) {
      defaultLoad = { male: parseInt(loadMatch[1]), female: parseInt(loadMatch[2]) };
    }

    // Extract scalingOptions (simplified - just get the count)
    const scalingMatch = block.match(/scalingOptions:\s*\[/);
    const scalingOptions = scalingMatch
      ? [{ level: "rx", description: "Prescribed" }, { level: "scaled", description: "Scaled" }, { level: "beginner", description: "Beginner" }]
      : [];

    // Extract typicalRange
    let typicalRange = { min: 5, max: 25 };
    const rangeMatch = block.match(/typicalRange:\s*\{\s*min:\s*(\d+),\s*max:\s*(\d+)\s*\}/);
    if (rangeMatch) {
      typicalRange = { min: parseInt(rangeMatch[1]), max: parseInt(rangeMatch[2]) };
    }

    movements.push({
      id: idMatch[1],
      name: nameMatch[1],
      category: categoryMatch[1],
      subcategory: subcategoryMatch?.[1] || "general",
      equipment,
      modality: modalityMatch?.[1] || categoryMatch[1],
      isWeighted: isWeightedMatch?.[1] === "true",
      defaultLoad,
      scalingOptions,
      description: descriptionMatch?.[1] || "",
      secondsPerRep: secondsPerRepMatch ? parseFloat(secondsPerRepMatch[1]) : 3,
      unit: unitMatch?.[1] || "reps",
      defaultValue: defaultValueMatch ? parseFloat(defaultValueMatch[1]) : 15,
      typicalRange,
    });
  }

  return movements;
}

async function seed() {
  console.log("Seeding database...");

  const db = getDb();

  // Check if already seeded
  const count = db.prepare("SELECT COUNT(*) as count FROM movements").get() as { count: number };
  if (count.count > 0) {
    console.log(`Database already has ${count.count} movements. Skipping seed.`);
    closeDb();
    return;
  }

  // Read movement files
  const srcDir = path.resolve(__dirname, "../../../src/data");
  const wlPath = path.join(srcDir, "movements-weightlifting.ts");
  const otherPath = path.join(srcDir, "movements-other.ts");

  const allMovements: Movement[] = [];

  for (const filePath of [wlPath, otherPath]) {
    const content = fs.readFileSync(filePath, "utf-8");
    const movements = parseMovementFile(content);
    allMovements.push(...movements);
    console.log(`Parsed ${movements.length} movements from ${path.basename(filePath)}`);
  }

  console.log(`Total movements to seed: ${allMovements.length}`);

  // Insert all movements
  const insert = db.prepare(`
    INSERT OR IGNORE INTO movements (id, name, category, subcategory, equipment, modality, is_weighted, default_load, scaling_options, description, seconds_per_rep, unit, default_value, typical_range)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((movements: Movement[]) => {
    for (const m of movements) {
      insert.run(
        m.id,
        m.name,
        m.category,
        m.subcategory,
        JSON.stringify(m.equipment),
        m.modality,
        m.isWeighted ? 1 : 0,
        m.defaultLoad ? JSON.stringify(m.defaultLoad) : null,
        JSON.stringify(m.scalingOptions),
        m.description,
        m.secondsPerRep,
        m.unit,
        m.defaultValue,
        JSON.stringify(m.typicalRange)
      );
    }
  });

  insertMany(allMovements);

  const finalCount = db.prepare("SELECT COUNT(*) as count FROM movements").get() as { count: number };
  console.log(`Seeded ${finalCount.count} movements into database.`);

  closeDb();
}

seed().catch(console.error);
