export const EQUIPMENT_TAGS = [
  "barbell",
  "dumbbells",
  "kettlebell",
  "pull-up-bar",
  "rings",
  "box",
  "rower",
  "bike",
  "ski",
  "jump-rope",
  "med-ball",
  "sandbag",
  "sled",
  "rope",
  "wall",
  "slam-ball",
  "GHD",
  "parallettes",
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  weightlifting: "Weightlifting",
  gymnastics: "Gymnastics",
  monostructural: "Monostructural",
  strongman: "Strongman",
};

export const SUBCATEGORY_LABELS: Record<string, string> = {
  barbell: "Barbell",
  dumbbell: "Dumbbell",
  kettlebell: "Kettlebell",
  bodyweight: "Bodyweight",
  gymnastics_apparatus: "Apparatus",
  cardio: "Cardio",
  strongman: "Strongman",
};

export const FORMAT_LABELS: Record<string, string> = {
  for_time: "For Time",
  amrap: "AMRAP",
  emom: "EMOM",
  intervals: "Intervals",
  for_load: "For Load",
  chipper: "Chipper",
  ladder: "Ladder",
  classic: "Classic rep schemes",
  random: "Random",
};

export const REP_PRESETS = [3, 5, 7, 9, 10, 12, 15, 20, 21, 25, 30, 50, 100] as const;

export const TIME_DOMAINS = {
  sprint: { min: 1, max: 5, label: "Sprint (1-5 min)" },
  short: { min: 5, max: 12, label: "Short (5-12 min)" },
  medium: { min: 12, max: 20, label: "Medium (12-20 min)" },
  long: { min: 20, max: 30, label: "Long (20-30 min)" },
  endurance: { min: 30, max: 45, label: "Endurance (30+ min)" },
} as const;

export const QUICK_MOVEMENTS = [
  "thruster",
  "pull-up",
  "deadlift",
  "box-jump",
  "burpee",
  "kb-swing",
  "power-clean",
  "push-jerk",
  "row",
  "air-squat",
] as const;
