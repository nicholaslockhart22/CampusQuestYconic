"use client";

import type { CampusQuestState } from "@/lib/types";

export const STORAGE_KEY = "campusquest-uri-state";

export function loadState(): CampusQuestState | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as CampusQuestState;
  } catch {
    return null;
  }
}

export function saveState(state: CampusQuestState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
