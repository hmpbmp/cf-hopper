import { create } from "zustand";
import type { Workout } from "@/types";
import * as api from "@/api/workouts";

interface HistoryState {
  workouts: Workout[];
  favorites: Set<string>;
  searchQuery: string;
  filterFormat: string | null;
  filterMovement: string | null;
  loading: boolean;
  loaded: boolean;

  loadWorkouts: () => Promise<void>;
  addWorkout: (workout: Workout) => Promise<void>;
  removeWorkout: (id: string) => Promise<void>;
  duplicateWorkout: (id: string) => Promise<Workout | null>;
  toggleFavorite: (id: string) => Promise<void>;
  isFavorite: (id: string) => boolean;
  setSearchQuery: (q: string) => void;
  setFilterFormat: (fmt: string | null) => void;
  setFilterMovement: (mov: string | null) => void;
  getFilteredWorkouts: () => Workout[];
  clearHistory: () => Promise<void>;
  exportHistory: () => string;
  importHistory: (json: string) => Promise<void>;
}

export const useHistoryStore = create<HistoryState>()((set, get) => ({
  workouts: [],
  favorites: new Set<string>(),
  searchQuery: "",
  filterFormat: null,
  filterMovement: null,
  loading: false,
  loaded: false,

  loadWorkouts: async () => {
    if (get().loaded) return;
    set({ loading: true });
    try {
      const workouts = await api.fetchWorkouts();
      const favorites = new Set<string>(
        workouts.filter((w) => w.isFavorite).map((w) => w.id)
      );
      set({ workouts, favorites, loaded: true });
    } catch (err) {
      console.error("Failed to load workouts:", err);
    } finally {
      set({ loading: false });
    }
  },

  addWorkout: async (workout) => {
    try {
      await api.saveWorkout(workout);
      set((s) => ({ workouts: [workout, ...s.workouts] }));
    } catch (err) {
      console.error("Failed to save workout:", err);
    }
  },

  removeWorkout: async (id) => {
    try {
      await api.deleteWorkout(id);
      set((s) => {
        const newFavorites = new Set(s.favorites);
        newFavorites.delete(id);
        return {
          workouts: s.workouts.filter((w) => w.id !== id),
          favorites: newFavorites,
        };
      });
    } catch (err) {
      console.error("Failed to delete workout:", err);
    }
  },

  duplicateWorkout: async (id) => {
    try {
      const duplicate = await api.duplicateWorkout(id);
      set((s) => ({ workouts: [duplicate, ...s.workouts] }));
      return duplicate;
    } catch (err) {
      console.error("Failed to duplicate workout:", err);
      return null;
    }
  },

  toggleFavorite: async (id) => {
    try {
      const isFavorite = await api.toggleFavorite(id);
      set((s) => {
        const newFavorites = new Set(s.favorites);
        if (isFavorite) {
          newFavorites.add(id);
        } else {
          newFavorites.delete(id);
        }
        return {
          favorites: newFavorites,
          workouts: s.workouts.map((w) =>
            w.id === id ? { ...w, isFavorite } : w
          ),
        };
      });
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  },

  isFavorite: (id) => get().favorites.has(id),

  setSearchQuery: (q) => set({ searchQuery: q }),
  setFilterFormat: (fmt) => set({ filterFormat: fmt }),
  setFilterMovement: (mov) => set({ filterMovement: mov }),

  getFilteredWorkouts: () => {
    const { workouts, searchQuery, filterFormat, filterMovement } = get();
    let filtered = [...workouts];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.movements.some((m) => m.movementId.toLowerCase().includes(q))
      );
    }

    if (filterFormat) {
      filtered = filtered.filter((w) => w.format === filterFormat);
    }

    if (filterMovement) {
      filtered = filtered.filter((w) =>
        w.movements.some((m) => m.movementId === filterMovement)
      );
    }

    return filtered;
  },

  clearHistory: async () => {
    try {
      await api.clearWorkouts();
      set({ workouts: [], favorites: new Set() });
    } catch (err) {
      console.error("Failed to clear history:", err);
    }
  },

  exportHistory: () => {
    const { workouts } = get();
    return JSON.stringify(
      { workouts },
      null,
      2
    );
  },

  importHistory: async (json) => {
    try {
      const data = JSON.parse(json);
      if (data.workouts && Array.isArray(data.workouts)) {
        for (const workout of data.workouts) {
          await api.saveWorkout(workout);
        }
        // Reload from server
        const allWorkouts = await api.fetchWorkouts();
        const favorites = new Set<string>(
          allWorkouts.filter((w) => w.isFavorite).map((w) => w.id)
        );
        set({ workouts: allWorkouts, favorites });
      }
    } catch {
      // Invalid JSON, ignore
    }
  },
}));
