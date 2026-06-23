# Hopper — Implementation Plan

## Overview

This plan breaks the Hopper implementation into **30 atomic tasks** organized across **5 phases**. Each task is designed to be self-contained enough to delegate to a small model with a clear prompt, input context, and expected output.

**Estimated total effort:** 2-3 weeks with parallel delegation.

---

## Phase 0: Project Scaffolding (Tasks 1-4)

> Dependencies: None (all 4 tasks can run in parallel)

### Task 1: Initialize Vite + React + TypeScript Project

**Prompt to model:**
> Create a new Vite project at `/var/home/hmpbmp/Documents/Development/hopper` using React + TypeScript. Use `npm create vite@latest . -- --template react-ts` from within the directory. Then run `npm install`. Verify the dev server starts with `npm run dev`. Return the project structure and confirmation it works.

**Input:** Empty directory
**Output:** Working Vite + React + TS project
**Depends on:** None

---

### Task 2: Install and Configure Tailwind CSS

**Prompt to model:**
> In the project at `/var/home/hmpbmp/Documents/Development/hopper`, install Tailwind CSS v4 for Vite. Follow the official Tailwind + Vite guide: `npm install tailwindcss @tailwindcss/vite`, add the Vite plugin to `vite.config.ts`, add `@import "tailwindcss"` to the main CSS file. Verify it works by adding a utility class to `App.tsx`. Return the final config files.

**Input:** Vite + React + TS project (from Task 1)
**Output:** Tailwind CSS configured and working
**Depends on:** Task 1

---

### Task 3: Install and Configure shadcn/ui

**Prompt to model:**
> In the project at `/var/home/hmpbmp/Documents/Development/hopper`, install shadcn/ui. Follow the official guide: initialize with `npx shadcn@latest init`, select the default options (New York style, Zinc base color, CSS variables: yes). Then install these components: `button`, `card`, `badge`, `tabs`, `input`, `slider`, `select`, `checkbox`, `dialog`, `separator`, `scroll-area`. Return the component directory structure and the `components.json` config.

**Input:** Vite + React + TS + Tailwind project (from Tasks 1-2)
**Output:** shadcn/ui installed with required components
**Depends on:** Tasks 1, 2

---

### Task 4: Install Additional Dependencies and Configure Path Aliases

**Prompt to model:**
> In the project at `/var/home/hmpbmp/Documents/Development/hopper`, install these dependencies: `zustand`, `uuid`, `lucide-react`, `html2canvas`. Add path aliases in both `vite.config.ts` and `tsconfig.json` so `@/` maps to `./src/`. Create the directory structure:
> ```
> src/
>   components/
>     ui/          (shadcn components go here)
>     wizard/      (wizard step components)
>     workout/     (workout display components)
>     layout/      (header, footer, etc.)
>   data/          (movement library)
>   engine/        (simulation engine)
>   store/         (zustand stores)
>   types/         (TypeScript interfaces)
>   lib/           (utilities)
>   hooks/         (custom hooks)
> ```
> Return the final directory tree and config files.

**Input:** Project from Tasks 1-3
**Output:** Dependencies installed, path aliases, directory structure
**Depends on:** Tasks 1, 2, 3

---

## Phase 1: Data Layer (Tasks 5-8)

> Dependencies: Phase 0 complete. Tasks 5-8 can run in parallel.

### Task 5: Define Core TypeScript Interfaces

**Prompt to model:**
> Create the file `/var/home/hmpbmp/Documents/Development/hopper/src/types/index.ts` containing all TypeScript interfaces for the Hopper application. Use this specification:
>
> ```typescript
> export interface Movement {
>   id: string;
>   name: string;
>   category: "weightlifting" | "gymnastics" | "monostructural" | "strongman";
>   subcategory: string; // "barbell" | "dumbbell" | "kettlebell" | "bodyweight" | "cardio" | "strongman"
>   equipment: string[];
>   modality: "weightlifting" | "gymnastics" | "monostructural";
>   isWeighted: boolean;
>   defaultLoad: { male: number; female: number } | null;
>   scalingOptions: ScalingOption[];
>   description: string;
> }
>
> export interface ScalingOption {
>   level: "rx" | "scaled" | "beginner";
>   description: string;
>   loadModifier?: number;
>   alternativeMovement?: string;
> }
>
> export type WorkoutFormat = "for_time" | "amrap" | "emom" | "intervals" | "for_load" | "chipper" | "ladder" | "tabata" | "random";
>
> export interface WorkoutConfig {
>   movementIds: string[];
>   repConfig: RepConfig;
>   format: WorkoutFormat;
>   formatParams: FormatParams;
>   simulationCount: number;
>   probabilityWeights: Record<string, number>;
> }
>
> export interface RepConfig {
>   scheme: "random" | "fixed" | "classic" | "ladder" | "custom";
>   minReps: number;
>   maxReps: number;
>   customPattern?: number[];
>   movementOverrides: Record<string, { min: number; max: number }>;
> }
>
> export interface FormatParams {
>   duration?: number;
>   timeCap?: number;
>   workInterval?: number;
>   restInterval?: number;
>   rounds?: number;
>   emomPattern?: "every" | "odd_even" | "blocks";
> }
>
> export interface Workout {
>   id: string;
>   name: string;
>   format: WorkoutFormat;
>   formatParams: FormatParams;
>   movements: WorkoutMovement[];
>   rounds?: number;
>   estimatedDuration: string;
>   equipment: string[];
>   modalityBreakdown: { weightlifting: number; gymnastics: number; monostructural: number };
>   notes: string;
>   createdAt: string;
> }
>
> export interface WorkoutMovement {
>   movementId: string;
>   reps: number | string; // number or "max" for AMRAP
>   load?: { male: number; female: number };
>   order: number;
>   label?: string; // e.g. "Odd:" or "Min 3:"
> }
>
> export interface Preset {
>   id: string;
>   name: string;
>   description: string;
>   config: WorkoutConfig;
>   isBuiltIn: boolean;
> }
> ```
>
> Export all interfaces. Return the complete file content.

**Input:** Data model from spec section 10
**Output:** `src/types/index.ts`
**Depends on:** Task 4

---

### Task 6: Create Movement Library Data File (Part A — Weightlifting Movements)

**Prompt to model:**
> Create the file `/var/home/hmpbmp/Documents/Development/hopper/src/data/movements-weightlifting.ts` containing a typed array of CrossFit weightlifting movements. Import the `Movement` type from `@/types`. Include ALL of the following movements with realistic default loads (in lbs) for male/female Rx:
>
> **Barbell (subcategory: "barbell"):**
> - Power Clean (135/95), Hang Power Clean (135/95), Squat Clean (135/95)
> - Power Snatch (115/80), Hang Power Snatch (115/80), Squat Snatch (115/80), Muscle Snatch (115/80)
> - Clean and Jerk (135/95), Split Jerk (135/95), Push Jerk (135/95)
> - Thruster (95/65), Front Squat (135/95), Back Squat (185/125), Overhead Squat (115/80)
> - Deadlift (225/155), Sumo Deadlift High Pull (115/80)
> - Shoulder Press (95/65), Push Press (115/80)
> - Good Morning (95/65), Barbell Bent-Over Row (95/65)
> - Sumo Deadlift (225/155)
>
> **Dumbbell (subcategory: "dumbbell"):**
> - DB Thruster (50/35), DB Snatch (50/35), DB Clean and Jerk (50/35)
> - DB Hang Power Clean (50/35), DB Push Press (50/35)
> - DB Front Squat (50/35), DB Overhead Squat (35/25)
> - DB Walking Lunge (50/35), DB Overhead Walking Lunge (50/35)
> - DB Deadlift (50/35), DB Farmer's Carry (50/35), Devil Press (50/35)
>
> **Kettlebell (subcategory: "kettlebell"):**
> - KB Swing (53/35), KB Goblet Squat (53/35), KB Clean (53/35)
> - KB Snatch (53/35), KB Push Press (53/35), KB Turkish Get-up (53/35)
> - KB Walking Lunge (53/35)
>
> Each movement should have:
> - `id`: kebab-case string (e.g. "power-clean")
> - `category`: "weightlifting"
> - `modality`: "weightlifting"
> - `isWeighted`: true
> - `equipment`: array of required equipment strings
> - `scalingOptions`: 3 options (rx, scaled, beginner) with descriptions
> - `description`: one-line description
>
> Export as `export const WEIGHTLIFTING_MOVEMENTS: Movement[]`.
> Return the complete file content.

**Input:** Movement taxonomy from spec section 2.1
**Output:** `src/data/movements-weightlifting.ts`
**Depends on:** Tasks 4, 5

---

### Task 7: Create Movement Library Data File (Part B — Gymnastics + Monostructural + Strongman Movements)

**Prompt to model:**
> Create the file `/var/home/hmpbmp/Documents/Development/hopper/src/data/movements-other.ts` containing typed arrays of CrossFit movements in three categories. Import the `Movement` type from `@/types`.
>
> **GYMNASTICS (category: "gymnastics"):**
>
> Bodyweight (subcategory: "bodyweight"):
> - Pull-up (isWeighted: false), Chest-to-Bar Pull-up, Butterfly Pull-up
> - Push-up, Hand Release Push-up
> - Burpee, Bar-Facing Burpee, Burpee Box Jump-over
> - Air Squat, Pistol
> - Sit-up, GHD Sit-up
> - Wall Walk, Handstand Walk
> - Handstand Push-up, Deficit Handstand Push-up
> - Dip, Ring Dip
>
> Bar/Ring (subcategory: "gymnastics_apparatus"):
> - Toes-to-Bar, Knees-to-Elbows
> - Bar Muscle-up, Ring Muscle-up
> - Pull-over, Skin the Cat
> - Rope Climb, Legless Rope Climb
>
> **MONOSTRUCTURAL (category: "monostructural"):**
>
> Cardio (subcategory: "cardio"):
> - Row (isWeighted: false), Bike (isWeighted: false), Ski (isWeighted: false)
> - Run (isWeighted: false), Shuttle Sprint (isWeighted: false)
> - Jump Rope (isWeighted: false), Double-under, Triple-under
> - Box Jump (isWeighted: false, equipment: ["box"]), Box Step-up
> - Bear Crawl (isWeighted: false)
>
> **STRONGMAN (category: "strongman"):**
>
> Odd Object (subcategory: "strongman"):
> - Wall Ball Shot (20/14, equipment: ["med-ball", "wall"])
> - Sandbag Clean (equipment: ["sandbag"]), Sandbag Carry, Sandbag Over-shoulder
> - Sled Push, Sled Pull (equipment: ["sled"])
> - Plate Ground-to-Overhead (45/25, equipment: ["barbell"]) — note: uses plate only
> - Slam Ball (equipment: ["slam-ball"])
> - Farmer's Carry (50/35 each hand, equipment: ["dumbbells"])
>
> Each movement needs: id (kebab-case), category, modality, isWeighted, equipment, scalingOptions (rx/scaled/beginner), description.
>
> Export as `export const GYMNASTICS_MOVEMENTS: Movement[]`, `export const MONOSTRUCTURAL_MOVEMENTS: Movement[]`, `export const STRONGMAN_MOVEMENTS: Movement[]`.
> Return the complete file content.

**Input:** Movement taxonomy from spec section 2.1
**Output:** `src/data/movements-other.ts`
**Depends on:** Tasks 4, 5

---

### Task 8: Create Movement Index and Equipment/Category Constants

**Prompt to model:**
> Create the file `/var/home/hmpbmp/Documents/Development/hopper/src/data/movements.ts` that:
>
> 1. Imports all movement arrays from `./movements-weightlifting` and `./movements-other`
> 2. Combines them into a single `export const ALL_MOVEMENTS: Movement[]` array
> 3. Creates helper functions:
>    - `getMovementById(id: string): Movement | undefined`
>    - `getMovementsByCategory(category: string): Movement[]`
>    - `getMovementsBySubcategory(subcategory: string): Movement[]`
>    - `getMovementsByEquipment(equipment: string): Movement[]`
>    - `getMovementsByModality(modality: string): Movement[]`
>
> Also create the file `/var/home/hmpbmp/Documents/Development/hopper/src/data/constants.ts` with:
>
> ```typescript
> export const EQUIPMENT_TAGS = [
>   "barbell", "dumbbells", "kettlebell", "pull-up-bar", "rings",
>   "box", "rower", "bike", "ski", "jump-rope", "med-ball",
>   "sandbag", "sled", "rope", "wall", "slam-ball"
> ] as const;
>
> export const CATEGORY_LABELS: Record<string, string> = {
>   weightlifting: "Weightlifting",
>   gymnastics: "Gymnastics",
>   monostructural: "Monostructural",
>   strongman: "Strongman"
> };
>
> export const SUBCATEGORY_LABELS: Record<string, string> = {
>   barbell: "Barbell",
>   dumbbell: "Dumbbell",
>   kettlebell: "Kettlebell",
>   bodyweight: "Bodyweight",
>   gymnastics_apparatus: "Apparatus",
>   cardio: "Cardio",
>   strongman: "Strongman"
> };
>
> export const FORMAT_LABELS: Record<string, string> = {
>   for_time: "For Time",
>   amrap: "AMRAP",
>   emom: "EMOM",
>   intervals: "Intervals",
>   for_load: "For Load",
>   chipper: "Chipper",
>   ladder: "Ladder",
>   tabata: "Tabata",
>   random: "Random"
> };
>
> export const REP_PRESETS = [3, 5, 7, 9, 10, 12, 15, 20, 21, 25, 30, 50, 100] as const;
>
> export const TIME_DOMAINS = {
>   sprint: { min: 1, max: 5, label: "Sprint (1-5 min)" },
>   short: { min: 5, max: 12, label: "Short (5-12 min)" },
>   medium: { min: 12, max: 20, label: "Medium (12-20 min)" },
>   long: { min: 20, max: 30, label: "Long (20-30 min)" },
>   endurance: { min: 30, max: 45, label: "Endurance (30+ min)" }
> } as const;
>
> export const QUICK_MOVEMENTS = [
>   "thruster", "pull-up", "deadlift", "box-jump", "burpee",
>   "kettlebell-swing", "power-clean", "push-jerk", "row", "air-squat"
> ] as const;
> ```
>
> Return both complete file contents.

**Input:** Tasks 6, 7 (movement data files)
**Output:** `src/data/movements.ts` and `src/data/constants.ts`
**Depends on:** Tasks 6, 7

---

## Phase 2: Simulation Engine (Tasks 9-13)

> Dependencies: Phase 1 complete. Tasks 9-12 can run in parallel. Task 13 depends on 9-12.

### Task 9: Create Random Utility Functions

**Prompt to model:**
> Create the file `/var/home/hmpbmp/Documents/Development/hopper/src/engine/random.ts` with these utility functions:
>
> ```typescript
> // Random integer between min and max (inclusive)
> export function randomInt(min: number, max: number): number
>
> // Pick one random item from array
> export function randomPick<T>(arr: T[]): T
>
> // Pick N random items from array (no duplicates)
> export function randomSample<T>(arr: T[], n: number): T[]
>
> // Weighted random pick — weights array must same length as items
> export function weightedPick<T>(items: T[], weights: number[]): T
>
> // Weighted random sample of N items
> export function weightedSample<T>(items: T[], n: number, weights: number[]): T[]
>
> // Shuffle array (Fisher-Yates)
> export function shuffle<T>(arr: T[]): T[]
>
> // Generate a UUID v4
> export function generateId(): string
>
> // Pick random from const array
> export function randomFromConst<T extends readonly string[]>(arr: T): T[number]
> ```
>
> Use `crypto.getRandomValues` for randomness if available, fallback to `Math.random`. Test that functions work correctly. Return the complete file content.

**Input:** TypeScript project setup
**Output:** `src/engine/random.ts`
**Depends on:** Task 4

---

### Task 10: Create Rep Assignment Logic

**Prompt to model:**
> Create the file `/var/home/hmpbmp/Documents/Development/hopper/src/engine/reps.ts` that handles rep scheme generation for workouts. Import types from `@/types` and random utils from `./random`.
>
> Implement these functions:
>
> ```typescript
> import { RepConfig, WorkoutFormat } from "@/types";
>
> // Generate reps for a set of movements based on rep config
> export function generateReps(
>   movementCount: number,
>   repConfig: RepConfig,
>   format: WorkoutFormat
> ): number[]
>
> // Generate classic 21-15-9 pattern for N movements
> export function classicCoupletReps(movementCount: number): number[]
>
> // Generate ascending ladder (1,2,3...N)
> export function ascendingLadderReps(start: number, end: number, increment: number): number[]
>
> // Generate descending ladder
> export function descendingLadderReps(start: number, end: number, decrement: number): number[]
>
> // Generate random reps within min/max range
> export function randomRepRange(min: number, max: number, count: number): number[]
>
> // Generate reps appropriate for a format
> // For Time/AMRAP: typically 5-25 per movement
> // EMOM: typically 5-15 per minute
> // Chipper: typically 10-50 per movement
> // Tabata: use "max" for time-based
> export function formatAppropriateReps(format: WorkoutFormat, count: number): number[]
>
> // Get estimated duration string based on format and movements
> export function estimateDuration(format: WorkoutFormat, movementCount: number, totalReps: number): string
> ```
>
> Return the complete file content.

**Input:** Types from Task 5, random utils from Task 9
**Output:** `src/engine/reps.ts`
**Depends on:** Tasks 5, 9

---

### Task 11: Create Movement Selection Logic

**Prompt to model:**
> Create the file `/var/home/hmpbmp/Documents/Development/hopper/src/engine/selection.ts` that handles selecting movements from the pool. Import types from `@/types`, movement data helpers from `@/data/movements`, and random utils from `./random`.
>
> Implement these functions:
>
> ```typescript
> import { Movement, WorkoutFormat, WorkoutConfig } from "@/types";
>
> // Get how many movements a format typically uses
> export function getMovementCountForFormat(format: WorkoutFormat): { min: number; max: number }
>
> // Select movements for a workout based on config
> // Respects: probability weights, equipment availability, format requirements
> export function selectMovements(config: WorkoutConfig): Movement[]
>
> // Check modality balance — return true if balance is acceptable
> // Rule: no single modality should exceed 70% of movements
> export function checkModalityBalance(movements: Movement[]): boolean
>
> // Ensure consecutive movements don't all use same muscle group
> // Simple check: not all weightlifting or all gymnastics in a row
> export function checkMovementPattern(movements: Movement[]): boolean
>
> // Get unique equipment list from movements
> export function getRequiredEquipment(movements: Movement[]): string[]
>
> // Calculate modality breakdown percentages
> export function getModalityBreakdown(movements: Movement[]): {
>   weightlifting: number;
>   gymnastics: number;
>   monostructural: number;
> }
>
> // Filter movements by available equipment
> export function filterByEquipment(movements: Movement[], availableEquipment: string[]): Movement[]
>
> // Select movements with retry for balance
> // Tries up to 10 times to get a balanced selection
> export function selectBalancedMovements(config: WorkoutConfig): Movement[]
> ```
>
> Return the complete file content.

**Input:** Types from Task 5, movement data from Task 8, random from Task 9
**Output:** `src/engine/selection.ts`
**Depends on:** Tasks 5, 8, 9

---

### Task 12: Create Format Generators

**Prompt to model:**
> Create the file `/var/home/hmpbmp/Documents/Development/hopper/src/engine/formats.ts` that generates workout structures for each format. Import types from `@/types`, selection from `./selection`, reps from `./reps`, random from `./random`.
>
> Implement a generator function for each format:
>
> ```typescript
> import { Workout, WorkoutMovement, WorkoutFormat, FormatParams, Movement } from "@/types";
>
> // Main dispatcher — generates a complete workout for any format
> export function generateWorkoutForFormat(
>   format: WorkoutFormat,
>   movements: Movement[],
>   params: FormatParams,
>   repConfig?: RepConfig
> ): Workout
>
> // Individual format generators (called by dispatcher):
>
> export function generateForTime(movements: Movement[], params: FormatParams): Workout
> // Structure: "[rounds] rounds for time of: [reps] [movement], [reps] [movement]"
> // Or for couplets: "21-15-9" style
> // Includes time cap
>
> export function generateAMRAP(movements: Movement[], params: FormatParams): Workout
> // Structure: "AMRAP [duration]: [reps] [movement], [reps] [movement]"
>
> export function generateEMOM(movements: Movement[], params: FormatParams): Workout
> // Structure: "EMOM [duration] min: Min 1: [reps] [movement], Min 2: [reps] [movement]"
> // Supports odd/even patterns
>
> export function generateIntervals(movements: Movement[], params: FormatParams): Workout
> // Structure: "[rounds] rounds: [work]s [movement], [rest]s rest"
>
> export function generateForLoad(movements: Movement[], params: FormatParams): Workout
> // Structure: "For [time/rep target]: Find max [movement]"
>
> export function generateChipper(movements: Movement[], params: FormatParams): Workout
> // Structure: "For Time: [reps] [movement1], [reps] [movement2], ..."
> // Descending rep scheme
>
> export function generateLadder(movements: Movement[], params: FormatParams): Workout
> // Structure: "[start]-[start+inc]-...-[end] [movement1] + [movement2]"
>
> export function generateTabata(movements: Movement[], params: FormatParams): Workout
> // Structure: "Tabata [movement]: [rounds] rounds of [work]s on / [rest]s off"
>
> // Format name mapping
> export const FORMAT_GENERATORS: Record<WorkoutFormat, (movements: Movement[], params: FormatParams) => Workout>
> ```
>
> Each generator should produce a fully formed `Workout` object with all fields populated. Return the complete file content.

**Input:** Types from Task 5, random from Task 9, reps from Task 10, selection from Task 11
**Output:** `src/engine/formats.ts`
**Depends on:** Tasks 5, 9, 10, 11

---

### Task 13: Create Main Simulation Engine (Orchestrator)

**Prompt to model:**
> Create the file `/var/home/hmpbmp/Documents/Development/hopper/src/engine/simulator.ts` that orchestrates the full workout generation. Import everything from the engine module and types.
>
> ```typescript
> import { WorkoutConfig, Workout } from "@/types";
> import { selectBalancedMovements } from "./selection";
> import { generateWorkoutForFormat } from "./formats";
> import { randomPick } from "./random";
>
> // Generate a single workout from config
> export function simulateOnce(config: WorkoutConfig): Workout {
>   // 1. Determine format (if random, pick one)
>   const format = config.format === "random"
>     ? randomPick(["for_time", "amrap", "emom", "intervals", "chipper", "ladder", "tabata"] as const)
>     : config.format;
>
>   // 2. Select movements from pool
>   const movements = selectBalancedMovements(config);
>
>   // 3. Generate workout for that format
>   const workout = generateWorkoutForFormat(format, movements, config.formatParams, config.repConfig);
>
>   // 4. Return completed workout
>   return workout;
> }
>
> // Generate multiple workouts from same config
> // Applies diversity: tries to avoid repeating same movements across simulations
> export function simulateMultiple(config: WorkoutConfig): Workout[] {
>   const workouts: Workout[] = [];
>   const usedMovementCombinations = new Set<string>();
>
>   for (let i = 0; i < config.simulationCount; i++) {
>     let workout: Workout;
>     let attempts = 0;
>
>     do {
>       workout = simulateOnce(config);
>       const comboKey = workout.movements.map(m => m.movementId).sort().join(",");
>       if (!usedMovementCombinations.has(comboKey) || attempts > 10) {
>         usedMovementCombinations.add(comboKey);
>         break;
>       }
>       attempts++;
>     } while (true);
>
>     workouts.push(workout);
>   }
>
>   return workouts;
> }
>
> // Quick generate with default settings (for "Quick Generate" button)
> export function quickGenerate(): Workout {
>   const QUICK_CONFIG: WorkoutConfig = {
>     movementIds: ["thruster", "pull-up", "deadlift", "box-jump", "burpee",
>                   "kettlebell-swing", "power-clean", "row", "air-squat", "push-jerk"],
>     repConfig: { scheme: "random", minReps: 5, maxReps: 25, movementOverrides: {} },
>     format: "random",
>     formatParams: {},
>     simulationCount: 1,
>     probabilityWeights: {}
>   };
>   return simulateOnce(QUICK_CONFIG);
> }
> ```
>
> Return the complete file content.

**Input:** All engine modules (Tasks 9-12)
**Output:** `src/engine/simulator.ts`
**Depends on:** Tasks 9, 10, 11, 12

---

### Task 14: Create Engine Index File

**Prompt to model:**
> Create the barrel export file `/var/home/hmpbmp/Documents/Development/hopper/src/engine/index.ts` that re-exports everything from the engine sub-modules:
>
> ```typescript
> export * from "./random";
> export * from "./reps";
> export * from "./selection";
> export * from "./formats";
> export * from "./simulator";
> ```
>
> Return the complete file content.

**Input:** Tasks 9-13
**Output:** `src/engine/index.ts`
**Depends on:** Tasks 9, 10, 11, 12, 13

---

## Phase 3: Zustand Store (Tasks 15-16)

> Dependencies: Phases 1-2 complete.

### Task 15: Create Zustand Store for Wizard State

**Prompt to model:**
> Create the file `/var/home/hmpbmp/Documents/Development/hopper/src/store/useWizardStore.ts` using Zustand. This store manages the wizard flow state.
>
> ```typescript
> import { create } from "zustand";
> import { WorkoutConfig, WorkoutFormat, Workout, RepConfig, FormatParams } from "@/types";
> import { ALL_MOVEMENTS } from "@/data/movements";
>
> interface WizardState {
>   // Current step (0-4)
>   currentStep: number;
>
>   // Step 1: Movement selection
>   selectedMovementIds: string[];
>   searchQuery: string;
>   categoryFilter: string | null;
>   subcategoryFilter: string | null;
>   equipmentFilter: string[];
>
>   // Step 2: Rep config
>   repConfig: RepConfig;
>   showProbabilityWeights: boolean;
>   probabilityWeights: Record<string, number>;
>
>   // Step 3: Format
>   format: WorkoutFormat;
>   formatParams: FormatParams;
>
>   // Step 4: Simulation
>   simulationCount: number;
>
>   // Results
>   generatedWorkouts: Workout[];
>
>   // Actions
>   nextStep: () => void;
>   prevStep: () => void;
>   goToStep: (step: number) => void;
>
>   toggleMovement: (id: string) => void;
>   selectAllMovements: (category?: string) => void;
>   deselectAllMovements: () => void;
>   setSearchQuery: (q: string) => void;
>   setCategoryFilter: (cat: string | null) => void;
>   setSubcategoryFilter: (sub: string | null) => void;
>   toggleEquipmentFilter: (eq: string) => void;
>
>   setRepConfig: (config: Partial<RepConfig>) => void;
>   setMovementRepOverride: (movementId: string, min: number, max: number) => void;
>   toggleProbabilityWeights: () => void;
>   setProbabilityWeight: (movementId: string, weight: number) => void;
>
>   setFormat: (format: WorkoutFormat) => void;
>   setFormatParams: (params: Partial<FormatParams>) => void;
>
>   setSimulationCount: (count: number) => void;
>
>   setGeneratedWorkouts: (workouts: Workout[]) => void;
>   updateWorkout: (id: string, updates: Partial<Workout>) => void;
>   deleteWorkout: (id: string) => void;
>
>   reset: () => void;
>   loadConfig: (config: WorkoutConfig) => void;
> }
>
> // Implement the store with all actions
> // Use zustand persist middleware to save to localStorage under key "hopper-wizard"
> ```
>
> Include full implementation of all actions. Return the complete file content.

**Input:** Types from Task 5, movements from Task 8
**Output:** `src/store/useWizardStore.ts`
**Depends on:** Tasks 5, 8

---

### Task 16: Create Zustand Store for History

**Prompt to model:**
> Create the file `/var/home/hmpbmp/Documents/Development/hopper/src/store/useHistoryStore.ts` using Zustand. This store manages workout history and favorites.
>
> ```typescript
> import { create } from "zustand";
> import { Workout } from "@/types";
>
> interface HistoryState {
>   workouts: Workout[];
>   favorites: string[]; // workout IDs
>   searchQuery: string;
>   filterFormat: string | null;
>   filterMovement: string | null;
>
>   // Actions
>   addWorkout: (workout: Workout) => void;
>   removeWorkout: (id: string) => void;
>   duplicateWorkout: (id: string) => Workout | null;
>   toggleFavorite: (id: string) => void;
>   isFavorite: (id: string) => boolean;
>   setSearchQuery: (q: string) => void;
>   setFilterFormat: (fmt: string | null) => void;
>   setFilterMovement: (mov: string | null) => void;
>   getFilteredWorkouts: () => Workout[];
>   clearHistory: () => void;
>   exportHistory: () => string; // JSON string
>   importHistory: (json: string) => void;
> }
>
> // Implement with zustand persist middleware, localStorage key "hopper-history"
> // getFilteredWorkouts should filter by search query, format, and movement
> ```
>
> Return the complete file content.

**Input:** Types from Task 5
**Output:** `src/store/useHistoryStore.ts`
**Depends on:** Task 5

---

## Phase 4: Wizard UI Components (Tasks 17-24)

> Dependencies: Phase 3 complete. Tasks 17, 18 can run in parallel. Tasks 19-22 can run in parallel (after 17). Tasks 23-24 depend on 19-22.

### Task 17: Create Layout Components (Header + Wizard Shell)

**Prompt to model:**
> Create layout components for the Hopper app. All files go in `/var/home/hmpbmp/Documents/Development/hopper/src/components/layout/`.
>
> **File 1: `Header.tsx`**
> - Fixed top header bar
> - Left: App name "HOPPER" in bold Space Grotesk font (or bold sans-serif)
> - Right: "History" and "Presets" text buttons
> - Dark background (#0A0A0A), border-bottom with #333
> - Height: 60px
>
> **File 2: `WizardShell.tsx`**
> - Main wrapper for the wizard flow
> - Displays step indicator at top (Step 1-5 with labels)
> - Shows current step component as children
> - Previous/Next navigation buttons at bottom
> - Step indicator: circles connected by lines, active step highlighted in red (#C41230)
> - Step labels: "Movements", "Reps", "Format", "Simulate", "Review"
> - Disable Next when validation fails (e.g., < 3 movements selected)
> - Responsive: full width on mobile
>
> **File 3: `StepIndicator.tsx`**
> - Reusable step indicator component
> - Props: `currentStep: number`, `steps: { label: string; isValid: boolean }[]`
> - Circles with numbers, active circle has red background
> - Completed steps show checkmark
> - Lines between circles (gray default, red when completed)
>
> Return all 3 complete file contents.

**Input:** Project setup from Phase 0
**Output:** 3 layout components
**Depends on:** Task 4

---

### Task 18: Create Landing Page Component

**Prompt to model:**
> Create the file `/var/home/hmpbmp/Documents/Development/hopper/src/components/layout/LandingPage.tsx`. This is the first screen users see.
>
> Design:
> - Full viewport height, centered content
> - Dark background (#0A0A0A)
> - Large title "HOPPER" in bold uppercase, white, ~64px font
> - Subtitle: "Randomized CrossFit Workout Generator" in gray (#A0A0A0), 18px
> - Two main action buttons centered vertically:
>   1. "Start New Hopper" — primary red button (#C41230), large, with icon
>   2. "Quick Generate" — secondary/outline button, "Surprise me" subtitle
> - Below buttons: small text "Configure movements, reps, and format to generate randomized workouts"
> - Optional: small icon or simple SVG of a hopper/lottery box (use lucide-react icons or simple CSS shapes)
>
> Props: `onStartWizard: () => void`, `onQuickGenerate: () => void`
>
> Return the complete file content.

**Input:** shadcn button component from Task 3
**Output:** `src/components/layout/LandingPage.tsx`
**Depends on:** Task 3

---

### Task 19: Create Wizard Step 1 — Movement Selection

**Prompt to model:**
> Create the file `/var/home/hmpbmp/Documents/Development/hopper/src/components/wizard/StepMovements.tsx`. This is Step 1 of the wizard — selecting movements for the hopper pool.
>
> Import the wizard store from `@/store/useWizardStore` and movement data from `@/data/movements` and constants from `@/data/constants`.
>
> **Layout:**
> - Top: Search input (lucide Search icon) for filtering by name
> - Below search: Category tabs using shadcn Tabs — "All", "Weightlifting", "Gymnastics", "Monostructural", "Strongman"
> - Below tabs: Equipment filter chips — toggle buttons for each equipment tag (click to include/exclude)
> - Movement count badge: "X movements selected" (green if >= 3, red if < 3)
>
> **Movement Grid:**
> - Responsive grid: 1 col mobile, 2 col tablet, 3 col desktop
> - Each movement card shows:
>   - Checkbox (shadcn Checkbox) for selection
>   - Movement name (bold)
>   - Category badge (colored: weightlifting=blue, gymnastics=green, monostructural=yellow, strongman=orange)
>   - Subcategory label (small gray text)
>   - Equipment icons/tags (small pills)
> - Cards selected: slightly highlighted border (red tint)
>
> **Actions:**
> - "Select All" button per category
> - "Deselect All" button
> - Filter works combining search + category + equipment (AND logic)
>
> **Validation:**
> - Show warning if < 3 movements selected
> - Disable Next button (via store step validation) if < 3
>
> Return the complete file content.

**Input:** Store from Task 15, movements from Task 8, constants from Task 8
**Output:** `src/components/wizard/StepMovements.tsx`
**Depends on:** Tasks 8, 15

---

### Task 20: Create Wizard Step 2 — Rep Configuration

**Prompt to model:**
> Create the file `/var/home/hmpbmp/Documents/Development/hopper/src/components/wizard/StepReps.tsx`. This is Step 2 — configuring rep ranges and loads.
>
> Import wizard store from `@/store/useWizardStore`, movement data helpers from `@/data/movements`, and REP_PRESETS from `@/data/constants`.
>
> **Layout:**
> - Top: Global rep scheme selector — shadcn Select dropdown with options:
>   - "Random within range"
>   - "Fixed reps"
>   - "Classic 21-15-9"
>   - "Ascending ladder"
>   - "Descending ladder"
>
> - If "Random within range": show min/max inputs applied to all movements
>
> **Movement Rep Table:**
> - Scrollable table/list of selected movements
> - Each row:
>   - Movement name
>   - Category badge
>   - Min reps input (number)
>   - Max reps input (number)
>   - Quick-select chips for common reps (from REP_PRESETS)
>   - If `isWeighted`: Rx weight inputs (male/female)
>
> **Probability Section:**
> - Toggle: "Enable probability weights" (shadcn Switch)
> - When enabled, each movement gets a slider (1-10) and weight display
> - Visual: small bar chart showing relative weights
>
> **Bulk Actions:**
> - "Apply to All" button — copies first movement's reps to all
>
> Return the complete file content.

**Input:** Store from Task 15, movement helpers from Task 8
**Output:** `src/components/wizard/StepReps.tsx`
**Depends on:** Tasks 8, 15

---

### Task 21: Create Wizard Step 3 — Format Selection

**Prompt to model:**
> Create the file `/var/home/hmpbmp/Documents/Development/hopper/src/components/wizard/StepFormat.tsx`. This is Step 3 — selecting workout format and parameters.
>
> Import wizard store from `@/store/useWizardStore`, FORMAT_LABELS from `@/data/constants`.
>
> **Format Cards Grid:**
> - Grid of selectable cards (3 columns on desktop, 2 on tablet, 1 on mobile)
> - Each card:
>   - Icon (use lucide-react: Clock for ForTime, Repeat for AMRAP, Timer for EMOM, etc.)
>   - Format name (bold)
>   - Short description
>   - Selected state: red border + slight red background tint
> - Cards for: For Time, AMRAP, EMOM, Intervals, For Load, Chipper, Ladder, Tabata, Random
>
> **Format-Specific Parameters Panel:**
> - Appears below cards when a format is selected
> - Dynamically shows relevant inputs:
>
>   **For Time:** Time cap dropdown (5/8/10/12/15/20/25/30/None), rounds input or "random"
>   **AMRAP:** Duration dropdown (7/10/12/15/20/25/30 min)
>   **EMOM:** Duration dropdown, Work pattern radio (Every minute / Odd-Even / Blocks)
>   **Intervals:** Work seconds input, Rest seconds input, Rounds input
>   **For Load:** Rep target dropdown (1RM/3RM/5RM), Time limit optional input
>   **Chipper:** Movement count input, Rep pattern radio (Ascending/Descending/Random)
>   **Ladder:** Start reps, End reps, Increment dropdown
>   **Tabata:** Rounds (default 8), Work (default 20s), Rest (default 10s)
>   **Random:** Shows message "Format will be randomly selected"
>
> Return the complete file content.

**Input:** Store from Task 15, constants from Task 8
**Output:** `src/components/wizard/StepFormat.tsx`
**Depends on:** Tasks 8, 15

---

### Task 22: Create Wizard Step 4 — Simulation Settings

**Prompt to model:**
> Create the file `/var/home/hmpbmp/Documents/Development/hopper/src/components/wizard/StepSimulate.tsx`. This is Step 4 — configuring how many simulations to run.
>
> Import wizard store from `@/store/useWizardStore`.
>
> **Layout:**
> - Centered card with simulation count controls
>
> **Simulation Count:**
> - Large display showing current count
> - Slider (1-50) using shadcn Slider
> - Number input field
> - Quick buttons: "1", "5", "10", "25" — each a shadcn Button variant
>
> **Advanced Options (collapsible section):**
> - "Ensure movement diversity" toggle — prevents same movements across simulations
> - "Exclude recent workouts" toggle — avoids repeating recent history
>
> **Preview Info:**
> - Text: "Will generate X workout(s)"
> - If > 10: warning "Large batch — may take a moment"
>
> Return the complete file content.

**Input:** Store from Task 15
**Output:** `src/components/wizard/StepSimulate.tsx`
**Depends on:** Task 15

---

### Task 23: Create Wizard Step 5 — Review & Generate

**Prompt to model:**
> Create the file `/var/home/hmpbmp/Documents/Development/hopper/src/components/wizard/StepReview.tsx`. This is Step 5 — review configuration and trigger generation.
>
> Import wizard store from `@/store/useWizardStore`, movement helpers from `@/data/movements`, FORMAT_LABELS from `@/data/constants`, and the simulation engine from `@/engine/simulator`.
>
> **Layout:**
> - Summary card with configuration overview
>
> **Summary Sections:**
> 1. **Format:** Selected format name with icon
> 2. **Movements:** Count badge, scrollable list of selected movement names with category badges
> 3. **Reps:** Configured rep scheme + range
> 4. **Simulation:** "Generate X workout(s)"
>
> **Actions:**
> - "Generate Workout(s)" — primary red button, calls `simulateMultiple` or `simulateOnce` from engine, stores results in wizard store, then navigates to results view
> - "Save Configuration" — secondary button, saves config to localStorage as a preset
> - "Reset" — tertiary/danger button, calls `store.reset()`
>
> **Back Button:** "Back to previous step"
>
> Return the complete file content.

**Input:** Store from Task 15, engine from Task 13, movement helpers from Task 8
**Output:** `src/components/wizard/StepReview.tsx`
**Depends on:** Tasks 8, 13, 15

---

### Task 24: Create Results View Component

**Prompt to model:**
> Create the file `/var/home/hmpbmp/Documents/Development/hopper/src/components/wizard/ResultsView.tsx`. This displays generated workouts after the simulation runs.
>
> Import wizard store from `@/store/useWizardStore`, history store from `@/store/useHistoryStore`, FORMAT_LABELS from `@/data/constants`, movement helpers from `@/data/movements`.
>
> **Layout:**
> - Top bar: "X Workouts Generated" title, "Run Again" button, "New Hopper" button
>
> **Single Workout Card (if count = 1):**
> - Full-width card
> - Header: Workout name (editable text) + Format badge
> - Movement list: each movement shows reps (large bold) + name + load if applicable
> - For EMOM: show minute-by-minute breakdown
> - For Intervals: show work/rest pattern
> - Footer: Equipment list, Modality breakdown (colored pills), Estimated duration
> - Action buttons: Edit, Copy Text, Save to History, Delete
>
> **Multiple Workout Cards (if count > 1):**
> - Scrollable list or grid of workout cards
> - Each card is compact: format badge, movement list, action buttons
> - Click card to expand full view
>
> **Copy Text Action:**
> - Formats workout as CrossFit-style text
> - Copies to clipboard with toast notification
> - Example output:
>   ```
>   AMRAP 12 minutes:
>     10 Power Cleans (135/95 lb)
>     15 Box Jumps (24/20 in)
>     20 Double-unders
>   ```
>
> **Edit Action:**
> - Opens a simple inline editor or modal
> - Allows changing: workout name, reps per movement, loads, notes
> - Saves changes back to store
>
> Return the complete file content.

**Input:** Stores from Tasks 15-16, movement helpers from Task 8
**Output:** `src/components/wizard/ResultsView.tsx`
**Depends on:** Tasks 8, 15, 16

---

## Phase 5: Assembly & Polish (Tasks 25-30)

> Dependencies: Phase 4 complete. Tasks 25-27 can run in parallel.

### Task 25: Assemble App.tsx — Main Application Flow

**Prompt to model:**
> Create the file `/var/home/hmpbmp/Documents/Development/hopper/src/App.tsx`. This is the main application component that orchestrates the entire flow.
>
> **State:**
> - `view`: "landing" | "wizard" | "results"
> - Uses wizard store for wizard state
>
> **Flow:**
> 1. If `view === "landing"`: Show `LandingPage`
>    - "Start New Hopper" → set view to "wizard", reset store
>    - "Quick Generate" → call `quickGenerate()`, add to store, set view to "results"
>
> 2. If `view === "wizard"`: Show `WizardShell` wrapping the current step
>    - Step 0: `StepMovements`
>    - Step 1: `StepReps`
>    - Step 2: `StepFormat`
>    - Step 3: `StepSimulate`
>    - Step 4: `StepReview`
>    - On generate: run simulation, set view to "results"
>
> 3. If `view === "results"`: Show `ResultsView`
>    - "New Hopper" → reset store, set view to "landing"
>    - "Run Again" → re-run simulation with same config
>
> **Global:**
> - Import and render `Header` at top
> - Main content below header with proper padding
> - Wrap in dark background div
>
> Return the complete file content.

**Input:** All components from Phase 4
**Output:** `src/App.tsx`
**Depends on:** Tasks 17, 18, 19, 20, 21, 22, 23, 24

---

### Task 26: Update main.tsx and Global Styles

**Prompt to model:**
> Update `/var/home/hmpbmp/Documents/Development/hopper/src/main.tsx` and `/var/home/hmpbmp/Documents/Development/hopper/src/index.css`.
>
> **main.tsx:**
> ```typescript
> import React from "react";
> import ReactDOM from "react-dom/client";
> import App from "./App";
> import "./index.css";
>
> ReactDOM.createRoot(document.getElementById("root")!).render(
>   <React.StrictMode>
>     <App />
>   </React.StrictMode>
> );
> ```
>
> **index.css:**
> - Import Tailwind CSS: `@import "tailwindcss";`
> - Import Google Fonts (Inter + Space Grotesk) via @import url()
> - Set global styles:
>   - `body`: bg #0A0A0A, color #FFFFFF, font-family Inter
>   - `h1, h2, h3`: font-family Space Grotesk
>   - Smooth scrolling
>   - Custom scrollbar styling (dark theme)
>   - Utility classes for the color palette:
>     - `.bg-hopper`: #0A0A0A
>     - `.bg-surface`: #1A1A1A
>     - `.text-primary`: #C41230
>     - `.text-muted`: #A0A0A0
>     - `.border-hopper`: #333333
>
> Return both complete file contents.

**Input:** Project from Phase 0
**Output:** Updated `main.tsx` and `index.css`
**Depends on:** Task 4

---

### Task 27: Create History Page Component

**Prompt to model:**
> Create the file `/var/home/hmpbmp/Documents/Development/hopper/src/components/workout/HistoryPage.tsx`. This is a full-page view for browsing workout history.
>
> Import history store from `@/store/useHistoryStore`, FORMAT_LABELS from `@/data/constants`, movement helpers from `@/data/movements`.
>
> **Layout:**
> - Header: "Workout History" title
> - Search bar + format filter dropdown + movement filter dropdown
> - Workout list (scrollable)
>
> **Each History Card:**
> - Date created (relative: "2 hours ago", "Yesterday", etc.)
> - Format badge
> - Movement list summary (first 3 movements + "and X more")
> - Estimated duration
> - Star/favorite toggle (filled star if favorited)
> - Actions: "Run Again" (loads config and goes to wizard), "Delete", "View"
>
> **Empty State:**
> - "No workouts yet" message
> - "Generate your first workout!" with link to start
>
> **Actions:**
> - "Clear History" button (with confirmation dialog)
> - "Export" button — downloads history as JSON
>
> Return the complete file content.

**Input:** Store from Task 16, movement helpers from Task 8
**Output:** `src/components/workout/HistoryPage.tsx`
**Depends on:** Tasks 8, 16

---

### Task 28: Create Presets Page Component

**Prompt to model:**
> Create the file `/var/home/hmpbmp/Documents/Development/hopper/src/components/workout/PresetsPage.tsx`. This shows built-in and custom presets.
>
> Import types from `@/types`, wizard store from `@/store/useWizardStore`, movement helpers from `@/data/movements`, FORMAT_LABELS from `@/data/constants`.
>
> **Built-in Presets Data:**
> Define these presets inline (or in a separate data file):
>
> 1. **CrossFit Open Style** — Competitive movements, For Time/AMRAP, standard loads
>    - Movements: thruster, pull-up, box-jump, bar-facing-burpee, power-clean, push-jerk, row
>    - Format: random (for_time, amrap)
>    - Reps: 5-25 range
>
> 2. **Hero WOD Style** — Long chipper/AMRAP, classic movements
>    - Movements: deadlift, run, pull-up, box-jump, burpee, kettlebell-swing, thruster
>    - Format: random (for_time, amrap, chipper)
>    - Reps: 10-50 range
>
> 3. **Quick Burn** — 5-10 min sprint
>    - Movements: burpee, air-squat, box-jump, row, double-under
>    - Format: for_time or amrap
>    - Duration: 5-8 min
>    - Reps: 10-20 range
>
> 4. **Gymnastics Focus** — Bodyweight dominant
>    - Movements: pull-up, push-up, sit-up, wall-walk, handstand-push-up, toes-to-bar, muscle-up, burpee
>    - Format: amrap or for_time
>
> 5. **Strength Focus** — Barbell dominant
>    - Movements: deadlift, back-squat, front-squat, power-clean, push-jerk, thruster
>    - Format: for_time or for_load
>    - Reps: 3-15 range
>
> 6. **Cardio Blast** — Monostructural dominant
>    - Movements: row, bike, run, ski, double-under, box-jump
>    - Format: amrap or intervals
>    - Duration: 15-25 min
>
> 7. **No Equipment** — Bodyweight only
>    - Movements: air-squat, push-up, burpee, sit-up, lunge, plank, bear-crawl
>    - Format: amrap or for_time
>
> 8. **Minimal Equipment** — DB or KB only
>    - Movements: db-thruster, db-snatch, kb-swing, db-deadlift, db-walking-lunge, devil-press
>    - Format: amrap or for_time
>
> **Layout:**
> - Grid of preset cards
> - Each card: name, description, movement count, format, "Use This Preset" button
> - Click "Use" → loads config into wizard store, navigates to Step 5 (Review)
>
> **Custom Presets Section:**
> - "Save Current Configuration" button (if config exists)
> - List of saved custom presets with Load/Delete actions
>
> Return the complete file content.

**Input:** Types from Task 5, store from Task 15, movements from Task 8
**Output:** `src/components/workout/PresetsPage.tsx`
**Depends on:** Tasks 5, 8, 15

---

### Task 29: Wire History and Presets into App.tsx

**Prompt to model:**
> Update `/var/home/hmpbmp/Documents/Development/hopper/src/App.tsx` to integrate History and Presets pages.
>
> Add view states:
> - `"landing"` — LandingPage
> - `"wizard"` — WizardShell with steps
> - `"results"` — ResultsView
> - `"history"` — HistoryPage (NEW)
> - `"presets"` — PresetsPage (NEW)
>
> Update Header to navigate to history/presets views.
>
> HistoryPage and PresetsPage both have a "Back" button to return to landing.
>
> Return the complete updated file content.

**Input:** App.tsx from Task 25, HistoryPage from Task 27, PresetsPage from Task 28
**Output:** Updated `src/App.tsx`
**Depends on:** Tasks 25, 27, 28

---

### Task 30: Final Integration Testing and Bug Fixes

**Prompt to model:**
> Test the complete Hopper application at `/var/home/hmpbmp/Documents/Development/hopper`. Run `npm run dev` and verify:
>
> 1. App loads without errors
> 2. Landing page renders with both buttons
> 3. "Quick Generate" produces a valid workout
> 4. "Start New Hopper" opens wizard
> 5. Wizard Step 1: movements load, search/filter works, selection works, min 3 validation
> 6. Wizard Step 2: rep config loads for selected movements, chips work
> 7. Wizard Step 3: format cards render, selecting one shows parameters
> 8. Wizard Step 4: slider and quick buttons work
> 9. Wizard Step 5: summary displays correctly
> 10. Generate produces valid workout(s)
> 11. Results view shows workout with correct format
> 12. Copy text works
> 13. History page shows saved workouts
> 14. Presets page loads and "Use Preset" works
>
> Fix any TypeScript errors, runtime errors, or UI issues found. Return a summary of what was fixed.

**Input:** All completed components
**Output:** Working, tested application
**Depends on:** All previous tasks

---

## Task Dependency Graph

```
Phase 0 (Scaffolding)
  Task 1 ──────────┐
  Task 2 ──────────┤
  Task 3 ──────────┤
  Task 4 ──────────┴──→ Phase 1 (Data Layer)
                            Task 5 ───┐
                            Task 6 ───┤
                            Task 7 ───┤
                            Task 8 ───┴──→ Phase 2 (Engine)
                                             Task 9 ───┐
                                             Task 10 ──┤
                                             Task 11 ──┤
                                             Task 12 ──┤
                                             Task 13 ──┤
                                             Task 14 ──┴──→ Phase 3 (Store)
                                                               Task 15 ──┐
                                                               Task 16 ──┴──→ Phase 4 (UI)
                                                                                Task 17 ──┐
                                                                                Task 18 ──┤
                                                                                Task 19 ──┤
                                                                                Task 20 ──┤
                                                                                Task 21 ──┤
                                                                                Task 22 ──┤
                                                                                Task 23 ──┤
                                                                                Task 24 ──┴──→ Phase 5 (Assembly)
                                                                                                 Task 25 ──┐
                                                                                                 Task 26 ──┤
                                                                                                 Task 27 ──┤
                                                                                                 Task 28 ──┤
                                                                                                 Task 29 ──┤
                                                                                                 Task 30 ──┘
```

---

## Parallelism Summary

| Phase | Tasks | Can Parallelize |
|-------|-------|-----------------|
| Phase 0 | 1-4 | All 4 in parallel (but 2-3 need 1, so: 1 first, then 2+3, then 4) |
| Phase 1 | 5-8 | 5 first, then 6+7 in parallel, then 8 |
| Phase 2 | 9-14 | 9 first, then 10+11+12 in parallel, then 13, then 14 |
| Phase 3 | 15-16 | Both in parallel |
| Phase 4 | 17-24 | 17+18 in parallel, then 19+20+21+22 in parallel, then 23+24 in parallel |
| Phase 5 | 25-30 | 25+26+27+28 in parallel, then 29, then 30 |

**Critical path:** Task 1 → 4 → 5 → 8 → 9 → 11 → 13 → 15 → 19 → 23 → 25 → 29 → 30

**Maximum parallelism:** 4-5 tasks simultaneously during Phases 1-4.
