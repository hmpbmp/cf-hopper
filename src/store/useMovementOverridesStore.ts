import { create } from "zustand";
import { invalidateOverridesCache } from "@/data/movements";
import type { Movement } from "@/types";
import * as api from "@/api/movements";

interface MovementOverride {
  secondsPerRep?: number;
  defaultValue?: number;
  typicalRange?: { min: number; max: number };
  unit?: Movement["unit"];
}

interface MovementOverridesState {
  overrides: Record<string, MovementOverride>;
  loading: boolean;
  loaded: boolean;
  loadOverrides: () => Promise<void>;
  setOverride: (movementId: string, override: MovementOverride) => Promise<void>;
  resetOverride: (movementId: string) => Promise<void>;
  resetAll: () => Promise<void>;
  getEffective: (movement: Movement) => Movement;
}

export const useMovementOverridesStore = create<MovementOverridesState>()(
  (set, get) => ({
    overrides: {},
    loading: false,
    loaded: false,

    loadOverrides: async () => {
      if (get().loaded) return;
      set({ loading: true });
      try {
        const overrides = await api.fetchOverrides();
        set({ overrides, loaded: true });
      } catch (err) {
        console.error("Failed to load overrides:", err);
      } finally {
        set({ loading: false });
      }
    },

    setOverride: async (movementId, override) => {
      invalidateOverridesCache();
      try {
        await api.updateOverride(movementId, override);
        set((s) => ({
          overrides: {
            ...s.overrides,
            [movementId]: { ...s.overrides[movementId], ...override },
          },
        }));
      } catch (err) {
        console.error("Failed to save override:", err);
      }
    },

    resetOverride: async (movementId) => {
      invalidateOverridesCache();
      try {
        await api.deleteOverride(movementId);
        set((s) => {
          const newOverrides = { ...s.overrides };
          delete newOverrides[movementId];
          return { overrides: newOverrides };
        });
      } catch (err) {
        console.error("Failed to delete override:", err);
      }
    },

    resetAll: async () => {
      invalidateOverridesCache();
      const { overrides } = get();
      try {
        // Delete all overrides one by one
        for (const id of Object.keys(overrides)) {
          await api.deleteOverride(id);
        }
        set({ overrides: {} });
      } catch (err) {
        console.error("Failed to reset overrides:", err);
      }
    },

    getEffective: (movement) => {
      const override = get().overrides[movement.id];
      if (!override) return movement;
      return {
        ...movement,
        ...(override.secondsPerRep !== undefined && {
          secondsPerRep: override.secondsPerRep,
        }),
        ...(override.defaultValue !== undefined && {
          defaultValue: override.defaultValue,
        }),
        ...(override.typicalRange !== undefined && {
          typicalRange: override.typicalRange,
        }),
        ...(override.unit !== undefined && { unit: override.unit }),
      };
    },
  })
);
