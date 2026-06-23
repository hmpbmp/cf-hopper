# Hopper — Functional Specification

## 1. Overview

**Hopper** is a web application that simulates the CrossFit Hopper model — the concept that the fittest person is the one who performs well no matter what physical challenge "comes out of the hopper." The app randomizes movements, reps, and workout formats to generate infinitely varied workouts, mirroring CrossFit's principle of "constantly varied functional movements performed at high intensity."

### 1.1 Core Concept

The Hopper Model (as described in the CrossFit Level 1 Training Guide) envisions a large hopper, like a lottery drawing, where each slot lists a different physical challenge. The goal is broad, general, inclusive fitness — being prepared for the unknown and unknowable.

### 1.2 Target Users

- CrossFit coaches programming varied class workouts
- Affiliate owners running Hopper-style challenges
- Individual athletes wanting randomized training
- Competition organizers designing events

### 1.3 Tech Stack (Recommended)

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Vite |
| UI Components | shadcn/ui (Radix primitives) |
| State Management | Zustand or React Context |
| Styling | Tailwind CSS |
| Backend (optional) | Node.js + Express or serverless functions |
| Data Persistence | localStorage (MVP) / PostgreSQL (v2) |
| Deployment | Vercel / Netlify |

---

## 2. Movement Library

### 2.1 Movement Taxonomy

Movements are categorized following CrossFit's official taxonomy:

#### Foundational Movements (9 total)

| Category | Movements |
|----------|-----------|
| Squats | Air Squat, Front Squat, Overhead Squat |
| Presses | Shoulder Press, Push Press, Push Jerk |
| Deadlifts | Deadlift, Sumo Deadlift High Pull, Medicine-Ball Clean |

#### Weightlifting — Barbell

| Movement | Variants |
|----------|----------|
| Clean | Power Clean, Hang Power Clean, Squat Clean, Hang Squat Clean |
| Snatch | Power Snatch, Hang Power Snatch, Squat Snatch, Hang Squat Snatch, Muscle Snatch |
| Jerk | Split Jerk, Push Jerk |
| Clean & Jerk | Power Clean + Push Jerk, Squat Clean + Split Jerk |
| Thruster | Barbell Thruster |
| Deadlift | Conventional, Sumo |
| Front Squat | — |
| Back Squat | — |
| Overhead Squat | — |
| Shoulder Press | Strict Press, Push Press, Push Jerk |
| Good Morning | — |
| Barbell Row | Bent-Over Row |

#### Weightlifting — Dumbbell

| Movement |
|----------|
| DB Thruster |
| DB Snatch (alternating) |
| DB Clean & Jerk |
| DB Hang Power Clean |
| DB Push Press |
| DB Front Squat |
| DB Overhead Squat |
| DB Walking Lunge |
| DB Overhead Walking Lunge |
| DB Deadlift |
| DB Farmer's Carry |
| DB Burpee Deadlift |
| Devil Press |

#### Weightlifting — Kettlebell

| Movement |
|----------|
| KB Swing (Russian / American) |
| KB Goblet Squat |
| KB Clean |
| KB Snatch |
| KB Push Press |
| KB Turkish Get-up |
| KB Walking Lunge |

#### Gymnastics — Bodyweight

| Movement | Variants |
|----------|----------|
| Pull-up | Strict, Kipping, Butterfly, Chest-to-Bar |
| Push-up | Standard, Hand Release, Ring |
| Burpee | Standard, Bar-Facing, Box Jump-over |
| Air Squat | — |
| Pistol (Single-leg Squat) | — |
| Sit-up | AbMat, GHD |
| Wall Walk | — |
| Handstand Walk | — |
| Handstand Push-up | Strict, Kipping, Deficit |
| Dip | Bar, Ring |
| L-sit | — |

#### Gymnastics — Bar/Ring

| Movement | Variants |
|----------|----------|
| Toes-to-Bar | Strict, Kipping |
| Knees-to-Elbows | — |
| Muscle-up | Bar, Ring (Strict, Kipping) |
| Pull-over | — |
| Skin the Cat | — |

#### Monostructural / Cardio

| Movement | Equipment |
|----------|-----------|
| Run | — |
| Row | Concept2 Rower |
| Bike | Assault/Echo Bike |
| Ski | Concept2 SkiErg |
| Jump Rope | Single-unders, Double-unders, Triple-unders |
| Box Jump | Standard, Box Jump-over |
| Box Step-up | — |
| Bear Crawl | — |
| Shuttle Sprint | — |
| Swimming | Pool/Open Water |

#### Strongman / Odd Object

| Movement |
|----------|
| Sandbag Clean |
| Sandbag Carry |
| Sandbag Over-shoulder |
| Sled Push |
| Sled Pull (row strap) |
| Plate GTO (Ground-to-Overhead) |
| Plate Carry (Front, Overhead) |
| Wall Ball Shot |
| Slam Ball |
| Rope Climb |
| Farmer's Carry (barbell/dumbbell) |

### 2.2 Movement Properties

Each movement in the library has:

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique identifier |
| `name` | string | Display name (e.g. "Power Clean") |
| `category` | enum | `weightlifting`, `gymnastics`, `monostructural`, `strongman` |
| `subcategory` | string | e.g. `barbell`, `dumbbell`, `kettlebell`, `bodyweight`, `cardio` |
| `equipment` | string[] | Required equipment: `barbell`, `dumbbells`, `kettlebell`, `pull-up-bar`, `rings`, `box`, `rower`, `bike`, `ski`, `jump-rope`, `med-ball`, `sandbag`, `sled`, `rope`, `wall` |
| `modality` | enum | `weightlifting`, `gymnastics`, `monostructural` (CF taxonomy) |
| `isWeighted` | boolean | Whether load can be prescribed |
| `defaultLoad` | object | `{ male: number, female: number }` in lbs/kg |
| `repSchemes` | string[] | Common rep patterns, e.g. `["21-15-9", "5 rounds", "EMOM"]` |
| `scalingOptions` | object | Beginner/Intermediate/Advanced variants |
| `description` | string | Brief movement description |
| `videoUrl` | string | Link to demonstration video |

### 2.3 Equipment Tags

Movements are tagged with required equipment for filtering:

```
barbell, dumbbells, kettlebell, pull-up-bar, rings, box, 
rower, bike, ski-erg, jump-rope, med-ball, sandbag, 
sled, rope, wall, GHD, parallettes
```

---

## 3. Workout Formats

### 3.1 Supported Formats

| Format | Description | Parameters |
|--------|-------------|------------|
| **For Time** | Complete prescribed work as fast as possible | Movements, reps, rounds, time cap |
| **AMRAP** | As Many Rounds/Reps as possible in time window | Movements, reps, time domain |
| **EMOM** | Every Minute On the Minute — perform work at start of each minute | Duration (minutes), work per minute (odd/even or every minute) |
| **Intervals** | Fixed work/rest periods | Work duration, rest duration, rounds, movements |
| **For Load** | Max weight in a given time or for reps | Movement, time or rep target |
| **Chipper** | Single round, high-rep, multi-movement | Movements in sequence with ascending/descending reps |
| **Ladder** | Ascending or descending rep scheme | Start reps, end reps, increment, movements |
| **Tabata** | 20s work / 10s rest × 8 rounds (or custom) | Movement(s), work/rest intervals |

### 3.2 Rep Scheme Patterns

Common CrossFit rep patterns the randomizer can select from:

| Pattern | Example |
|---------|---------|
| Classic Couplet | 21-15-9 |
| Fight Gone Bad style | 5 movements × 1 min each, 3 rounds |
| Ascending Ladder | 1-2-3-4-5... up to 10 or 15 |
| Descending Ladder | 15-12-9-6-3 |
| Pyramids | 3-6-9-6-3 |
| Round-based | 3, 4, 5 rounds of X |
| Tabata | 8 rounds × 20s on / 10s off |
| EMOM blocks | 3 min EMOM / 1 min rest × 4-6 sets |
| Chipper | Large number → small number per movement |

### 3.3 Time Domains

| Domain | Duration | Typical Format |
|--------|----------|----------------|
| Sprint | 1-5 min | For Time, Tabata |
| Short | 5-12 min | For Time, AMRAP, EMOM |
| Medium | 12-20 min | AMRAP, EMOM, Intervals |
| Long | 20-30 min | AMRAP, For Time (chipper) |
| Endurance | 30+ min | For Time, AMRAP |

---

## 4. Wizard Interface

The app uses a step-by-step wizard to configure the hopper before running a simulation.

### Step 1: Movement Selection

**Purpose:** Choose which movements enter the hopper pool.

**UI Elements:**
- Category filter tabs: `All | Weightlifting | Gymnastics | Monostructural | Strongman`
- Subcategory filter dropdown: `Barbell | Dumbbell | Kettlebell | Bodyweight | Cardio | etc.`
- Equipment filter chips: toggle equipment availability
- Movement grid with checkboxes:
  - Movement name
  - Category icon/badge
  - Equipment icon(s)
  - Quick-add button
- Search bar for filtering by name
- "Select All" / "Deselect All" per category
- Selected movements count badge
- Minimum: 3 movements required
- Maximum: No hard limit (recommend 10-30 for best results)

**Validation:** At least 3 movements must be selected to proceed.

### Step 2: Rep Configuration

**Purpose:** Define rep ranges and patterns for each selected movement.

**UI Elements:**
- Table/list of selected movements with editable rep fields:
  - Movement name
  - Min reps (number input)
  - Max reps (number input)
  - Common rep schemes (chips): `3, 5, 7, 9, 10, 12, 15, 20, 21, 25, 30, 50, 100`
  - Weight/load input (if applicable):
    - Rx weight (male/female)
    - Scaled weight option
- Global rep scheme dropdown (applies to all):
  - `Random within range`
  - `Fixed reps` (user specifies exact number)
  - `Classic 21-15-9`
  - `Ascending ladder`
  - `Descending ladder`
  - `Custom pattern`
- "Apply to All" button for bulk editing

**Probability Assignment (Optional):**
- Toggle "Enable probability weights"
- When enabled, each movement gets a weight slider (1-10) or percentage input
- Higher weight = more likely to be selected
- Default: equal probability (all weights = 1)
- Visual representation: pie chart or bar showing relative probabilities

### Step 3: Format Selection

**Purpose:** Choose the workout format and time domain.

**UI Elements:**

#### Format Cards
Selectable cards for each format:

| Card | Description |
|------|-------------|
| **For Time** | Icon: clock. "Complete for time with optional time cap" |
| **AMRAP** | Icon: infinity/loop. "As many rounds as possible" |
| **EMOM** | Icon: minute timer. "Every minute on the minute" |
| **Intervals** | Icon: work/rest bars. "Fixed work and rest periods" |
| **For Load** | Icon: barbell. "Max load for reps" |
| **Chipper** | Icon: checklist. "One big round" |
| **Ladder** | Icon: steps. "Ascending/descending reps" |
| **Tabata** | Icon: hiit. "20/10 protocol" |
| **Random** | Icon: dice. "Let the hopper decide" |

#### Format-Specific Parameters

**For Time:**
- Time cap: dropdown (5, 8, 10, 12, 15, 20, 25, 30 min or none)
- Rounds: number input or "random"

**AMRAP:**
- Duration: dropdown (7, 10, 12, 15, 20, 25, 30 min)
- Round count: derived from duration

**EMOM:**
- Duration: dropdown (8, 10, 12, 15, 20, 24, 30 min)
- Work pattern:
  - Every minute: same work each minute
  - Odd/Even: different movements for odd vs even minutes
  - EMOM blocks: e.g., "3 min work / 1 min rest" repeated

**Intervals:**
- Work duration: seconds
- Rest duration: seconds
- Rounds: number
- Total time: calculated

**For Load:**
- Rep target: 1RM, 3RM, 5RM
- Time limit: optional

**Chipper:**
- Movement count: how many movements in sequence
- Rep pattern: ascending, descending, random

**Ladder:**
- Start reps: number
- End reps: number
- Increment: 1, 2, 3, 5
- Movements: couplet, triplet, etc.

**Tabata:**
- Rounds: 8 (standard) or custom
- Work: 20s (standard) or custom
- Rest: 10s (standard) or custom

### Step 4: Simulation Settings

**Purpose:** Configure how many times to run the hopper.

**UI Elements:**
- Number of simulations: slider (1-50) or number input
- "Run 1 Time" quick button
- "Run 5 Times" quick button
- "Run 10 Times" quick button
- Advanced options:
  - Ensure movement diversity: prevent same movement appearing too frequently across simulations
  - Minimum rest between same movements: slider
  - Exclude recently generated workouts (history-aware)

### Step 5: Review & Generate

**Purpose:** Summary and generation trigger.

**UI Elements:**
- Configuration summary card:
  - Selected movements (count + list)
  - Rep range configured
  - Format selected
  - Number of simulations
- "Generate Workout(s)" primary button
- "Save Configuration" secondary button
- "Reset" tertiary button

---

## 5. Simulation Engine

### 5.1 Randomization Algorithm

```
function generateWorkout(config):
    workout = new Workout()
    
    // 1. Select format (if "Random" chosen)
    if config.format == "Random":
        workout.format = weightedRandom(FORMATS, config.formatWeights)
    else:
        workout.format = config.format
    
    // 2. Select movements from pool
    movementCount = getMovementCountForFormat(workout.format)
    workout.movements = weightedSample(
        config.movementPool, 
        movementCount, 
        config.probabilities
    )
    
    // 3. Assign reps
    for each movement in workout.movements:
        if config.repScheme == "random":
            movement.reps = randomInt(movement.minReps, movement.maxReps)
        elif config.repScheme == "classic":
            movement.reps = getRepPattern("21-15-9", movementCount)
        // ... other patterns
    
    // 4. Apply format-specific structure
    workout.structure = applyFormat(workout.format, workout.movements, config.timeParams)
    
    // 5. Assign loads (if applicable)
    for each movement in workout.movements:
        if movement.isWeighted:
            movement.load = getStandardLoad(movement, config.gender)
    
    return workout
```

### 5.2 Format-Specific Generation Rules

**For Time:**
- Select 1-5 movements (random or based on config)
- Assign reps per movement
- Set time cap (random within domain or user-specified)
- Structure: "For Time: [reps] [movement1], [reps] [movement2], ..."

**AMRAP:**
- Select 2-4 movements
- Assign reps (typically 10-25 per movement)
- Set time domain
- Structure: "AMRAP [duration]: [reps] [movement1], [reps] [movement2], ..."

**EMOM:**
- Duration in minutes (e.g., 12 min)
- Select 1-3 movements per minute
- Assign reps (typically 5-15 per minute depending on movement difficulty)
- Structure: "EMOM [duration] min: Min 1: [reps] [movement], Min 2: [reps] [movement], ..."

**Intervals:**
- Work period (e.g., 40s)
- Rest period (e.g., 20s)
- Rounds (e.g., 5)
- Select 1-2 movements per interval
- Structure: "5 rounds: 40s [movement], 20s rest"

**Chipper:**
- Select 3-6 movements
- Ascending or descending rep scheme
- Structure: "30 [movement1], 25 [movement2], 20 [movement3], 15 [movement4], 10 [movement5]"

**Ladder:**
- Start reps (e.g., 1)
- End reps (e.g., 10)
- Increment (e.g., +1)
- Select 2 movements
- Structure: "1-2-3-4-5-6-7-8-9-10 [movement1] + [movement2]"

### 5.3 Balanced Programming Checks

The engine should apply CrossFit programming principles:

| Check | Rule |
|-------|------|
| Modality Balance | Avoid >70% of one modality (weightlifting/gymnastics/monostructural) |
| Movement Pattern | Avoid consecutive movements using same muscle group |
| Equipment Diversity | Prefer workouts using 2-3 different equipment pieces |
| Load Progression | Heavier lifts paired with lower reps; lighter movements with higher reps |
| Time Domain Match | High-skill gymnastics → shorter time; monostructural → longer time |
| Intensity Balance | Mix high-skill with low-skill movements |

---

## 6. Workout Display

### 6.1 Single Workout View

```
┌─────────────────────────────────────────────┐
│  WORKOUT #1                    For Time     │
├─────────────────────────────────────────────┤
│                                             │
│  5 Rounds for Time:                        │
│                                             │
│  15  Thrusters (95/65 lb)                  │
│  12  Pull-ups                               │
│   9  Box Jumps (24/20 in)                  │
│                                             │
│  Time Cap: 12 minutes                      │
│                                             │
├─────────────────────────────────────────────┤
│  Equipment: Barbell, Pull-up Bar, Box      │
│  Modality: Weightlifting, Gymnastics       │
│  Est. Duration: 8-11 min                   │
│                                             │
│  [Edit] [Share] [Save] [Delete]            │
└─────────────────────────────────────────────┘
```

### 6.2 Multiple Workout View

When running multiple simulations, display in a scrollable list or grid:

- Workout #1 card
- Workout #2 card
- Workout #3 card
- ...

Each card shows:
- Format badge (For Time, AMRAP, etc.)
- Movement list with reps
- Time cap or duration
- Quick actions (Edit, Share, Delete)

### 6.3 Workout Statistics (Multi-Simulation)

When running 5+ simulations, show aggregate stats:
- Most frequently selected movements (bar chart)
- Average estimated duration
- Modality distribution pie chart
- Equipment usage summary
- Rep range distribution

---

## 7. Workout Editor

### 7.1 Editing Capabilities

After generation, each workout can be fine-tuned:

| Editable Field | Input Type |
|----------------|------------|
| Workout name | Text input |
| Format | Dropdown (change format) |
| Movements | Add/remove from library |
| Reps per movement | Number input |
| Rounds | Number input |
| Time cap | Number input or "none" |
| Loads (Rx) | Number input per movement |
| Loads (Scaled) | Number input per movement |
| Movement order | Drag-and-drop reorder |
| Notes | Textarea |

### 7.2 Scaling Options

For each movement, provide scaling presets:
- **Rx** — Prescribed (standard competitive load)
- **Scaled** — Reduced load/complexity
- **Beginner** — Further regression

Example scaling for Pull-ups:
- Rx: Pull-up (kipping)
- Scaled: Banded Pull-up
- Beginner: Ring Row

Example scaling for Thrusters:
- Rx: 95/65 lb
- Scaled: 65/45 lb
- Beginner: Air Squat + Push Press (no load)

### 7.3 Save & Export

| Action | Description |
|--------|-------------|
| Save to Library | Store workout in local browser storage |
| Export as Text | Copy formatted workout text to clipboard |
| Export as Image | Generate shareable workout image |
| Export as PDF | Download printable PDF |
| Share via URL | Generate shareable link with config encoded |
| Import | Paste a CrossFit.com workout URL to add to history |

---

## 8. History & Favorites

### 8.1 Workout History

- Auto-save all generated workouts
- Filter by: date, format, movements, equipment
- Search by movement name
- Duplicate a past workout
- Delete from history

### 8.2 Favorites

- Star/bookmark workouts
- Quick access to favorite configurations
- "Run Again" button on any past workout

---

## 9. Configuration Presets

### 9.1 Built-in Presets

| Preset Name | Description |
|-------------|-------------|
| **CrossFit Open Style** | Competitive movements, standard loads, For Time/AMRAP |
| **Hero WOD Style** | Long chipper or AMRAP, classic movements |
| **Quick Burn** | 5-10 min sprint, simple movements |
| **Gymnastics Focus** | Bodyweight-dominant, high-skill |
| **Strength Focus** | Barbell-dominant, heavier loads, lower reps |
| **Cardio Blast** | Monostructural dominant, longer duration |
| **No Equipment** | Bodyweight only |
| **Minimal Equipment** | Dumbbell or kettlebell only |
| **Partner Workout** | Movements suitable for partner splits |

### 9.2 Custom Presets

- Save any configuration as a named preset
- Load presets from list
- Delete custom presets
- Share presets via URL

---

## 10. Data Model

### 10.1 Core Entities

```typescript
interface Movement {
  id: string;
  name: string;
  category: "weightlifting" | "gymnastics" | "monostructural" | "strongman";
  subcategory: string;
  equipment: string[];
  modality: "weightlifting" | "gymnastics" | "monostructural";
  isWeighted: boolean;
  defaultLoad: { male: number; female: number } | null;
  scalingOptions: ScalingOption[];
  description: string;
  videoUrl: string;
}

interface ScalingOption {
  level: "rx" | "scaled" | "beginner";
  description: string;
  loadModifier?: number; // percentage of Rx
  alternativeMovement?: string;
}

interface WorkoutConfig {
  movements: Movement[];
  repConfig: RepConfig;
  format: WorkoutFormat;
  formatParams: FormatParams;
  simulationCount: number;
  probabilityWeights: Map<string, number>;
}

interface RepConfig {
  scheme: "random" | "fixed" | "classic" | "ladder" | "custom";
  minReps: number;
  maxReps: number;
  customPattern?: number[];
}

type WorkoutFormat = 
  | "for_time" 
  | "amrap" 
  | "emom" 
  | "intervals" 
  | "for_load" 
  | "chipper" 
  | "ladder" 
  | "tabata" 
  | "random";

interface FormatParams {
  duration?: number;       // minutes
  timeCap?: number;        // minutes
  workInterval?: number;   // seconds
  restInterval?: number;   // seconds
  rounds?: number;
  emomPattern?: "every" | "odd_even" | "blocks";
}

interface Workout {
  id: string;
  name: string;
  format: WorkoutFormat;
  formatParams: FormatParams;
  movements: WorkoutMovement[];
  estimatedDuration: string;
  equipment: string[];
  modalityBreakdown: { weightlifting: number; gymnastics: number; monostructural: number };
  notes: string;
  createdAt: string;
}

interface WorkoutMovement {
  movement: Movement;
  reps: number;
  load?: { male: number; female: number };
  order: number;
}

interface Preset {
  id: string;
  name: string;
  description: string;
  config: WorkoutConfig;
  isBuiltIn: boolean;
}
```

---

## 11. User Flow

### 11.1 Primary Flow

```
Landing Page
    │
    ▼
┌──────────────────┐
│  Start New Hopper │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Step 1: Select   │
│ Movements        │──── Browse/Search/Filter
└────────┬─────────┘──── Toggle equipment
         │
         ▼
┌──────────────────┐
│ Step 2: Configure│
│ Reps & Loads     │──── Set rep ranges
└────────┬─────────┘──── Set loads (if weighted)
         │
         ▼
┌──────────────────┐
│ Step 3: Choose   │
│ Format & Time    │──── Select format card
└────────┬─────────┘──── Set parameters
         │
         ▼
┌──────────────────┐
│ Step 4: Set      │
│ Simulation Count │──── Number of workouts
└────────┬─────────┘──── Advanced options
         │
         ▼
┌──────────────────┐
│ Step 5: Review & │
│ Generate         │──── Summary display
└────────┬─────────┘──── [Generate] button
         │
         ▼
┌──────────────────┐
│ Results View     │
│ (1 or more       │──── Scroll through results
│  workouts)       │──── Edit / Save / Share
└──────────────────┘
```

### 11.2 Alternative Flows

**Quick Generate:** Landing page has a "Quick Generate" button that uses default settings (random format, 10 popular movements, random reps) and immediately shows a result.

**Preset Flow:** User selects a preset → skips to Step 5 (Review) → can edit any step via back navigation or step indicators.

**Re-Run Flow:** User views results → clicks "Run Again" → returns to Step 4 with same config → generates new randomized workout.

---

## 12. UI/UX Specifications

### 12.1 Design Principles

- **Clean & Functional** — Minimal chrome, maximum content
- **CrossFit Aesthetic** — Industrial feel, bold typography, red/black/white palette
- **Mobile-First** — Responsive, works on phone in gym
- **Fast** — No unnecessary loading states for local operations
- **Accessible** — WCAG 2.1 AA compliance

### 12.2 Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--primary` | `#C41230` | CrossFit red, primary actions |
| `--primary-dark` | `#8B0D22` | Hover states |
| `--bg` | `#0A0A0A` | Dark background |
| `--surface` | `#1A1A1A` | Card backgrounds |
| `--surface-hover` | `#2A2A2A` | Interactive hover |
| `--text` | `#FFFFFF` | Primary text |
| `--text-muted` | `#A0A0A0` | Secondary text |
| `--accent` | `#F5A623` | Highlights, badges |
| `--success` | `#2ECC71` | Save confirmations |
| `--border` | `#333333` | Dividers |

### 12.3 Typography

| Element | Font | Weight | Size |
|---------|------|--------|------|
| H1 | Inter/Space Grotesk | 800 | 32px |
| H2 | Inter/Space Grotesk | 700 | 24px |
| H3 | Inter/Space Grotesk | 600 | 18px |
| Body | Inter | 400 | 16px |
| Small | Inter | 400 | 14px |
| Workout Title | Space Grotesk | 700 | 20px |
| Movement Name | Inter | 500 | 16px |
| Reps | Space Grotesk | 700 | 24px |

### 12.4 Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 640px | Single column, stacked cards |
| Tablet | 640-1024px | 2-column grid |
| Desktop | > 1024px | 3-column grid, sidebar available |

---

## 13. Implementation Phases

### Phase 1: MVP (4-6 weeks)

- [ ] Movement library (50+ movements with categories)
- [ ] Wizard Steps 1-5 (basic flow)
- [ ] For Time and AMRAP format generation
- [ ] Single workout generation
- [ ] Basic workout display
- [ ] Edit workout (basic fields)
- [ ] localStorage persistence

### Phase 2: Full Features (4-6 weeks)

- [ ] All 8 workout formats
- [ ] Multiple simulation support
- [ ] Probability weights
- [ ] Full workout editor with scaling
- [ ] History and favorites
- [ ] Export (text, image)
- [ ] Built-in presets

### Phase 3: Polish & Advanced (4-6 weeks)

- [ ] Workout statistics dashboard
- [ ] Custom preset saving/sharing
- [ ] URL-based sharing
- [ ] Import from CrossFit.com
- [ ] Progressive Web App (offline support)
- [ ] User accounts (optional)

---

## 14. Appendix

### A. Sample Generated Workouts

**For Time:**
```
21-15-9
  Thrusters (95/65 lb)
  Pull-ups

Time Cap: 10 minutes
```

**AMRAP 12:**
```
AMRAP 12 minutes:
  10 Power Cleans (135/95 lb)
  15 Box Jumps (24/20 in)
  20 Double-unders
```

**EMOM 10:**
```
EMOM 10 minutes:
  Odd: 8 Thrusters (95/65 lb)
  Even: 12-calorie Row
```

**Intervals:**
```
5 rounds:
  40 seconds max effort Row
  20 seconds rest
  40 seconds max effort Burpees
  20 seconds rest
```

**Chipper:**
```
For Time:
  50 Wall-ball Shots (20/14 lb)
  40 Box Jump-overs (24/20 in)
  30 Pull-ups
  20 Deadlifts (225/155 lb)
  10 Muscle-ups
```

**Ladder:**
```
1-2-3-4-5-6-7-8-9-10
  Power Snatches (115/80 lb)
  Bar-facing Burpees
```

### B. Movement Count by Category (Reference)

| Category | Count |
|----------|-------|
| Barbell Weightlifting | ~25 |
| Dumbbell Movements | ~15 |
| Kettlebell Movements | ~8 |
| Gymnastics (Bodyweight) | ~25 |
| Gymnastics (Bar/Ring) | ~10 |
| Monostructural | ~12 |
| Strongman/Odd Object | ~12 |
| **Total** | **~107** |

### C. API Endpoints (Future — Server Version)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /api/movements` | GET | List all movements |
| `POST /api/workouts/generate` | POST | Generate workout(s) |
| `GET /api/workouts/:id` | GET | Get saved workout |
| `PUT /api/workouts/:id` | PUT | Update workout |
| `DELETE /api/workouts/:id` | DELETE | Delete workout |
| `GET /api/presets` | GET | List presets |
| `POST /api/presets` | POST | Save custom preset |
