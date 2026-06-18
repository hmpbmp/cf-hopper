# cf-hopper

> ⚠️ **VIBE-CODED / LLM-POWERED**  
> Most of this codebase was written with AI assistance. It works, it generates real CrossFit workouts, but the style, structure, and occasional quirks reflect that process. Read at your own risk.

## What's a Hopper?

In CrossFit, the Hopper is a model for randomizing workouts — write movements, reps, and formats on slips of paper, toss them in a hopper, and draw blindly to build a workout. This app automates that process, ensuring balanced modality distribution, realistic time domains, and CrossFit-typical rep schemes.

## What It Does

- **Randomizes movements** from a database of 86 CrossFit exercises (weightlifting, gymnastics, monostructural)
- **Balances modalities** — ensures no single type exceeds 70% of the workout
- **Validates time caps** — scales reps so average athletes finish near the cap, not way under or over
- **Generates formats** — For Time, AMRAP, EMOM, Intervals, Chipper, Ladder, Classic patterns
- **Limits barbell weights** — consolidates to at most 3 distinct loads per workout
- **Uses nice numbers** — round reps (5, 8, 10, 12, 15, 20, 21, 25) and distances (50m increments)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + TypeScript + Vite 8 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| State | Zustand |
| Backend | Node.js + Express 5 + TypeScript |
| Database | SQLite (better-sqlite3) |

## Getting Started

```bash
# Install dependencies
npm install
cd server && npm install && cd ..

# Seed database
npm run seed

# Start dev servers (frontend + backend)
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:3001`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend + backend |
| `npm run dev:client` | Frontend only |
| `npm run dev:server` | Backend only |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run seed` | Seed database |
| `npm run lint` | Run ESLint |

## Project Structure

```
├── server/
│   ├── src/
│   │   ├── index.ts
│   │   ├── db/
│   │   │   ├── connection.ts
│   │   │   ├── schema.ts
│   │   │   └── seed.ts
│   │   └── routes/
│   │       ├── movements.ts
│   │       ├── workouts.ts
│   │       └── presets.ts
│   └── data/hopper.db
└── src/
    ├── api/
    ├── components/
    │   ├── layout/
    │   ├── ui/
    │   ├── wizard/
    │   └── workout/
    ├── data/
    ├── engine/
    ├── store/
    └── types/
```

## API Endpoints

### Movements
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/movements` | List all (with overrides applied) |
| GET | `/api/movements/:id` | Get single |
| PUT | `/api/movements/:id/override` | Set override |
| DELETE | `/api/movements/:id/override` | Remove override |

### Workouts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workouts` | List history |
| POST | `/api/workouts` | Save workout |
| PUT | `/api/workouts/:id` | Update |
| DELETE | `/api/workouts/:id` | Delete |
| POST | `/api/workouts/:id/favorite` | Toggle favorite |

### Presets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/presets` | List all |
| POST | `/api/presets` | Save custom |
| DELETE | `/api/presets/:id` | Delete custom |

## Database Schema

- **movements** — 86 CrossFit movements with properties
- **movement_overrides** — User-customized properties
- **workouts** — Saved history with favorites
- **presets** — Built-in and custom configurations

## Build Output

Frontend: ~548 KB JS, ~62 KB CSS (gzipped: ~164 KB + ~11 KB)
