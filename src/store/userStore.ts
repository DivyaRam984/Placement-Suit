/**
 * Centralized storage — single key "placementUser".
 * No direct localStorage in pages/components. Load via getUser(), save via updateUser().
 * Future backend-ready: swap implementation to API.
 */

import type { PlacementUser } from '@/types/platform';
import {
  createDefaultResumeData,
  type GlobalUserState,
} from '@/types/platform';
import { computeReadinessScoreNumber } from '@/services/readinessScore';

const STORAGE_KEY = 'placementUser';

/** Keys we may migrate from (then delete). */
const LEGACY_KEYS = ['placement_suite_platform_state'];

function now(): string {
  return new Date().toISOString();
}

function readFromStorage(key: string): PlacementUser | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const data = JSON.parse(raw) as unknown;
    if (data && typeof data === 'object') return data as PlacementUser;
  } catch {
    // ignore
  }
  return null;
}

function writeToStorage(key: string, user: PlacementUser): void {
  try {
    localStorage.setItem(key, JSON.stringify(user));
  } catch {
    // ignore
  }
}

function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

/** Map legacy GlobalUserState to PlacementUser. */
function migrateFromLegacy(raw: unknown): PlacementUser {
  const legacy = raw as GlobalUserState;
  const base = getDefaultUser();
  const resumeData = legacy.resumeData ?? base.resumeData;
  const readinessScore =
    typeof legacy.readinessScore === 'object' && legacy.readinessScore != null
      ? (legacy.readinessScore as { placementScore?: number }).placementScore ?? 0
      : typeof legacy.readinessScore === 'number'
        ? legacy.readinessScore
        : 0;

  const user: PlacementUser = {
    preferences: legacy.preferences ?? base.preferences,
    resumeData,
    jobMatches: Array.isArray(legacy.jobMatches) ? legacy.jobMatches : base.jobMatches,
    applications: Array.isArray(legacy.applications) ? legacy.applications : base.applications,
    jdAnalyses: Array.isArray(legacy.jdAnalyses) ? legacy.jdAnalyses : base.jdAnalyses,
    readinessScore,
    lastActivity: legacy.lastActivity ?? now(),
    notifications: Array.isArray(legacy.notifications) ? legacy.notifications : base.notifications,
  };
  user.readinessScore = computeReadinessScoreNumber(user);
  return user;
}

/** Run migration from old keys into placementUser, then delete old keys. */
function migrateIfNeeded(): void {
  for (const key of LEGACY_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as unknown;
      const user = migrateFromLegacy(parsed);
      writeToStorage(STORAGE_KEY, user);
      removeFromStorage(key);
    } catch {
      // leave key as-is on error
    }
  }
}

export function getDefaultUser(): PlacementUser {
  return {
    preferences: {},
    resumeData: createDefaultResumeData(),
    jobMatches: [],
    applications: [],
    jdAnalyses: [],
    readinessScore: 0,
    lastActivity: now(),
    notifications: [],
  };
}

export function getUser(): PlacementUser {
  migrateIfNeeded();
  const user = readFromStorage(STORAGE_KEY);
  if (user) return user;
  return getDefaultUser();
}

export function saveUser(user: PlacementUser): void {
  writeToStorage(STORAGE_KEY, user);
}

/**
 * Merge partial into current user, recompute readinessScore when relevant,
 * set lastActivity, then persist. Use this for all updates from pages.
 */
export function updateUser(partial: Partial<PlacementUser>): void {
  const current = getUser();
  const next: PlacementUser = {
    ...current,
    ...partial,
    lastActivity: now(),
  };

  const dataAffectsReadiness =
    partial.resumeData !== undefined ||
    partial.jdAnalyses !== undefined ||
    partial.applications !== undefined ||
    partial.jobMatches !== undefined;

  if (dataAffectsReadiness || partial.readinessScore === undefined) {
    next.readinessScore = computeReadinessScoreNumber(next);
  }

  saveUser(next);
}
