/**
 * Single global state for Placement Suite.
 * Architecture: one global state, no duplicated logic, deterministic.
 * Persisted as one structured key (no isolated localStorage keys).
 */

import { create } from 'zustand';
import type {
  GlobalUserState,
  JobMatch,
  Application,
  JDAnalysis,
  ResumeData,
  ReadinessScore,
  ApplicationStage,
  PlatformNotification,
} from '@/types/platform';
import { createDefaultGlobalState } from '@/types/platform';
import { persistState, loadState } from '@/services/platformStorage';
import { computeReadinessScore } from '@/services/readinessScore';

const STORAGE_KEY = 'placement_suite_platform_state';

function loadPersisted(): GlobalUserState {
  try {
    const raw = loadState(STORAGE_KEY);
    if (raw && typeof raw === 'object') return raw as GlobalUserState;
  } catch (_) {}
  return createDefaultGlobalState();
}

interface PlatformActions {
  setPreferences: (p: Partial<GlobalUserState['preferences']>) => void;
  setResumeData: (data: ResumeData | null) => void;
  addJobMatch: (job: JobMatch) => void;
  removeJobMatch: (id: string) => void;
  setApplications: (apps: Application[]) => void;
  addApplication: (app: Application) => void;
  updateApplicationStage: (id: string, stage: ApplicationStage, meta?: { interviewAt?: string }) => void;
  addJDAnalysis: (analysis: JDAnalysis) => void;
  setJDAnalysis: (analyses: JDAnalysis[]) => void;
  setReadinessScore: (score: ReadinessScore | null) => void;
  touchLastActivity: () => void;
  addNotification: (n: Omit<PlatformNotification, 'id' | 'read' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  /** Recompute readiness from current state (deterministic) */
  recomputeReadiness: () => void;
  /** Persist current state to storage */
  persist: () => void;
}

export type PlatformStore = GlobalUserState & PlatformActions;

export const usePlatformStore = create<PlatformStore>((set, get) => ({
  ...loadPersisted(),

  setPreferences: (p) => {
    set((s) => ({ preferences: { ...s.preferences, ...p } }));
    get().persist();
  },

  setResumeData: (data) => {
    set({ resumeData: data ?? null });
    get().recomputeReadiness();
    get().persist();
  },

  addJobMatch: (job) => {
    set((s) => ({ jobMatches: [job, ...s.jobMatches.filter((m) => m.id !== job.id)].slice(0, 200) }));
    get().touchLastActivity();
    get().persist();
  },

  removeJobMatch: (id) => {
    set((s) => ({ jobMatches: s.jobMatches.filter((m) => m.id !== id) }));
    get().persist();
  },

  setApplications: (apps) => {
    set({ applications: apps });
    get().recomputeReadiness();
    get().persist();
  },

  addApplication: (app) => {
    set((s) => ({ applications: [app, ...s.applications.filter((a) => a.id !== app.id)] }));
    get().recomputeReadiness();
    get().touchLastActivity();
    get().persist();
  },

  updateApplicationStage: (id, stage, meta) => {
    set((s) => ({
      applications: s.applications.map((a) =>
        a.id === id
          ? {
              ...a,
              stage,
              interviewAt: meta?.interviewAt ?? a.interviewAt,
              updatedAt: new Date().toISOString(),
            }
          : a
      ),
    }));
    get().recomputeReadiness();
    get().touchLastActivity();
    get().persist();
  },

  addJDAnalysis: (analysis) => {
    set((s) => ({
      jdAnalyses: [analysis, ...s.jdAnalyses.filter((a) => a.id !== analysis.id)].slice(0, 100),
    }));
    get().recomputeReadiness();
    get().touchLastActivity();
    get().persist();
  },

  setJDAnalysis: (analyses) => {
    set({ jdAnalyses: analyses });
    get().recomputeReadiness();
    get().persist();
  },

  setReadinessScore: (score) => {
    set({ readinessScore: score });
    get().persist();
  },

  touchLastActivity: () => {
    set({ lastActivity: new Date().toISOString() });
    get().persist();
  },

  addNotification: (n) => {
    const notification: PlatformNotification = {
      ...n,
      id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ notifications: [notification, ...s.notifications].slice(0, 50) }));
    get().persist();
  },

  markNotificationRead: (id) => {
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
    get().persist();
  },

  clearNotifications: () => {
    set({ notifications: [] });
    get().persist();
  },

  recomputeReadiness: () => {
    const state = get();
    const score = computeReadinessScore(state);
    set({ readinessScore: score });
    get().persist();
  },

  persist: () => {
    const state = get();
    const toPersist: GlobalUserState = {
      preferences: state.preferences,
      resumeData: state.resumeData,
      jobMatches: state.jobMatches,
      applications: state.applications,
      jdAnalyses: state.jdAnalyses,
      readinessScore: state.readinessScore,
      lastActivity: state.lastActivity,
      notifications: state.notifications,
    };
    persistState(STORAGE_KEY, toPersist);
  },
}));
