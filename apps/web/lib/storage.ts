"use client";

import { getSession } from "@/lib/campus-auth";
import type { CampusQuestState } from "@/lib/types";

export const STORAGE_KEY = "campusquest-uri-state";

export function getGameStorageKey(): string {
  const s = getSession();
  if (!s) return STORAGE_KEY;
  return `${STORAGE_KEY}:${s.email.toLowerCase()}`;
}

export function loadState(): CampusQuestState | null {
  if (typeof window === "undefined") {
    return null;
  }

  const key = getGameStorageKey();
  const raw = window.localStorage.getItem(key);
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
  if (!getSession()) {
    return;
  }

  window.localStorage.setItem(
    getGameStorageKey(),
    JSON.stringify({ ...state, activityLogBanner: null })
  );
}
