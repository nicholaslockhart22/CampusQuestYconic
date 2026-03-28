"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useLocalGameState } from "@/hooks/use-local-game-state";

type GameContextValue = ReturnType<typeof useLocalGameState>;

const GameStateContext = createContext<GameContextValue | null>(null);

export function GameStateProvider({ children }: { children: ReactNode }) {
  const value = useLocalGameState();
  return <GameStateContext.Provider value={value}>{children}</GameStateContext.Provider>;
}

export function useGameState(): GameContextValue {
  const ctx = useContext(GameStateContext);
  if (!ctx) {
    throw new Error("useGameState must be used within GameStateProvider");
  }
  return ctx;
}
