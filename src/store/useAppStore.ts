import { create } from "zustand";
import type { ArrayState } from "../algorithms/types";

type GameState = {
  challengeMode: boolean;
  xp: number;
  level: number;
  streak: number;
  mastery: Record<string, number>; // per algorithm id: 0..100

  toggleChallengeMode: () => void;
  awardAnswer: (algoId: string, correct: boolean) => void;
  resetGame: () => void;
};

type AppState = {
  algorithmId: string;
  setAlgorithmId: (id: string) => void;

  frames: ArrayState[];
  setFrames: (f: ArrayState[]) => void;

  index: number;
  setIndex: (i: number) => void;

  playing: boolean;
  setPlaying: (p: boolean) => void;

  speedMs: number;
  setSpeedMs: (ms: number) => void;

  game: GameState;
};

function levelFromXp(xp: number) {
  // Simple, predictable leveling: 0-99 => L1, 100-199 => L2, etc.
  return Math.floor(xp / 100) + 1;
}

export const useAppStore = create<AppState>((set, get) => ({
  algorithmId: "bubble-sort",
  setAlgorithmId: (algorithmId) => set({ algorithmId }),

  frames: [],
  setFrames: (frames) => set({ frames }),

  index: 0,
  setIndex: (index) => set({ index }),

  playing: false,
  setPlaying: (playing) => set({ playing }),

  speedMs: 300,
  setSpeedMs: (speedMs) => set({ speedMs }),

  game: {
    challengeMode: false,
    xp: 0,
    level: 1,
    streak: 0,
    mastery: {},

    toggleChallengeMode: () =>
      set((s) => ({
        game: {
          ...s.game,
          challengeMode: !s.game.challengeMode,
        },
      })),

    awardAnswer: (algoId: string, correct: boolean) => {
      const { game } = get();

      const currentMastery = game.mastery[algoId] ?? 0;

      if (correct) {
        // XP logic: base 10 + small streak bonus (capped)
        const newStreak = game.streak + 1;
        const bonus = Math.min(10, newStreak); // max +10 bonus
        const earned = 10 + bonus;

        const newXp = game.xp + earned;
        const newLevel = levelFromXp(newXp);

        const newMastery = Math.min(100, currentMastery + 5);

        set((s) => ({
          game: {
            ...s.game,
            xp: newXp,
            level: newLevel,
            streak: newStreak,
            mastery: { ...s.game.mastery, [algoId]: newMastery },
          },
        }));
      } else {
        // Wrong: streak breaks, slight mastery penalty
        const newMastery = Math.max(0, currentMastery - 2);

        set((s) => ({
          game: {
            ...s.game,
            streak: 0,
            mastery: { ...s.game.mastery, [algoId]: newMastery },
          },
        }));
      }
    },

    resetGame: () =>
      set((s) => ({
        game: {
          ...s.game,
          xp: 0,
          level: 1,
          streak: 0,
          mastery: {},
        },
      })),
  },
}));
