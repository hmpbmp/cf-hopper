import express from "express";
import cors from "cors";
import path from "path";
import { getDb } from "./db/connection";
import movementsRouter from "./routes/movements";
import workoutsRouter from "./routes/workouts";
import presetsRouter from "./routes/presets";

const PORT = process.env.PORT || 3001;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database on startup
getDb();
console.log("Database initialized");

// API routes
app.use("/api/movements", movementsRouter);
app.use("/api/workouts", workoutsRouter);
app.use("/api/presets", presetsRouter);

// Serve static frontend in production
const distPath = path.resolve(__dirname, "../../dist");
app.use(express.static(distPath));

// SPA fallback - serve index.html for non-API routes
app.get("/{*splat}", (req, res) => {
  if (!req.path.startsWith("/api")) {
    res.sendFile(path.join(distPath, "index.html"));
  } else {
    res.status(404).json({ error: "API endpoint not found" });
  }
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Hopper server running on http://localhost:${PORT}`);
});
