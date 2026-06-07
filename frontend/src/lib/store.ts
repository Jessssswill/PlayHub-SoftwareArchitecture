import { create } from "zustand";
import { GameSession, GameState, MoveRecord, GameStatus } from "./types";

export interface EndResult {
  isOver: boolean;
  winnerId: string | null;
  isDraw: boolean;
}

interface GameStore {
  currentSession: GameSession | null;
  gameState: GameState | null;
  moveHistory: MoveRecord[];
  myPlayerId: string | null;
  endResult: EndResult | null;

  setSession: (s: GameSession) => void;
  updateSessionStatus: (status: GameStatus) => void;
  setGameState: (state: GameState) => void;
  setMyPlayerId: (id: string) => void;
  setEndResult: (result: EndResult) => void;
  applyMove: (state: GameState, record: MoveRecord) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  currentSession: null,
  gameState: null,
  moveHistory: [],
  myPlayerId: null,
  endResult: null,

  setSession: (s) => set({ currentSession: s, gameState: s.currentState }),

  updateSessionStatus: (status) =>
    set((prev) =>
      prev.currentSession
        ? { currentSession: { ...prev.currentSession, status } }
        : {},
    ),

  setGameState: (state) => set({ gameState: state }),

  setMyPlayerId: (id) => set({ myPlayerId: id }),

  setEndResult: (result) => set({ endResult: result }),

  applyMove: (state, record) =>
    set((prev) => ({
      gameState: state,
      moveHistory: [...prev.moveHistory.slice(-9), record],
    })),

  reset: () =>
    set({
      currentSession: null,
      gameState: null,
      moveHistory: [],
      myPlayerId: null,
      endResult: null,
    }),
}));
