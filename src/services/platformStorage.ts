/**
 * Single structured platform state persistence.
 * No isolated localStorage keys — one key for the whole suite.
 */

import type { GlobalUserState } from '@/types/platform';

export function loadState(key: string): GlobalUserState | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as GlobalUserState;
  } catch {
    return null;
  }
}

export function persistState(key: string, state: GlobalUserState): void {
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch (_) {}
}
