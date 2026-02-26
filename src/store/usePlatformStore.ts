/**
 * Single global state — reads/writes only via userStore.
 * No direct localStorage. All persistence through getUser() / updateUser().
 */

import { create } from 'zustand';
import type {
  PlacementUser,
  JobMatch,
  Application,
  JDAnalysis,
  ResumeData,
  ApplicationStage,
  PlatformNotification,
} from '@/types/platform';
import { getDefaultUser } from '@/store/userStore';
import { getUser, updateUser } from '@/store/userStore';

function syncFromStorage(): PlacementUser {
  return getUser();
}

interface PlatformActions {
  setPreferences: (p: Partial<PlacementUser['preferences']>) => void;
  setResumeData: (data: ResumeData | null) => void;
  addJobMatch: (job: JobMatch) => void;
  removeJobMatch: (id: string) => void;
  setApplications: (apps: Application[]) => void;
  addApplication: (app: Application) => void;
  updateApplicationStage: (id: string, stage: ApplicationStage, meta?: { interviewAt?: string }) => void;
  addJDAnalysis: (analysis: JDAnalysis) => void;
  setJDAnalysis: (analyses: JDAnalysis[]) => void;
  addNotification: (n: Omit<PlatformNotification, 'id' | 'read' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  /** Sync state from storage (e.g. after migration). Readiness is auto-updated in userStore. */
  recomputeReadiness: () => void;
}

export type PlatformStore = PlacementUser & PlatformActions;

export const usePlatformStore = create<PlatformStore>((set, get) => ({
  ...syncFromStorage(),

  setPreferences: (p) => {
    updateUser({ preferences: { ...get().preferences, ...p } });
    set((s) => ({ ...s, ...syncFromStorage() }));
  },

  setResumeData: (data) => {
    const next = data ?? getDefaultUser().resumeData;
    updateUser({ resumeData: next });
    set((s) => ({ ...s, ...syncFromStorage() }));
  },

  addJobMatch: (job) => {
    const current = get();
    const jobMatches = [job, ...current.jobMatches.filter((m) => m.id !== job.id)].slice(0, 200);
    updateUser({ jobMatches });
    set((s) => ({ ...s, ...syncFromStorage() }));
  },

  removeJobMatch: (id) => {
    updateUser({ jobMatches: get().jobMatches.filter((m) => m.id !== id) });
    set((s) => ({ ...s, ...syncFromStorage() }));
  },

  setApplications: (apps) => {
    updateUser({ applications: apps });
    set((s) => ({ ...s, ...syncFromStorage() }));
  },

  addApplication: (app) => {
    const current = get();
    const applications = [app, ...current.applications.filter((a) => a.id !== app.id)];
    updateUser({ applications });
    set((s) => ({ ...s, ...syncFromStorage() }));
  },

  updateApplicationStage: (id, stage, meta) => {
    const applications = get().applications.map((a) =>
      a.id === id
        ? {
            ...a,
            stage,
            interviewAt: meta?.interviewAt ?? a.interviewAt,
            updatedAt: new Date().toISOString(),
          }
        : a
    );
    updateUser({ applications });
    set((s) => ({ ...s, ...syncFromStorage() }));
  },

  addJDAnalysis: (analysis) => {
    const current = get();
    const jdAnalyses = [analysis, ...current.jdAnalyses.filter((a) => a.id !== analysis.id)].slice(0, 100);
    updateUser({ jdAnalyses });
    set((s) => ({ ...s, ...syncFromStorage() }));
  },

  setJDAnalysis: (analyses) => {
    updateUser({ jdAnalyses: analyses });
    set((s) => ({ ...s, ...syncFromStorage() }));
  },

  addNotification: (n) => {
    const notification: PlatformNotification = {
      ...n,
      id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    const current = get();
    const notifications = [notification, ...current.notifications].slice(0, 50);
    updateUser({ notifications });
    set((s) => ({ ...s, ...syncFromStorage() }));
  },

  markNotificationRead: (id) => {
    const notifications = get().notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    updateUser({ notifications });
    set((s) => ({ ...s, ...syncFromStorage() }));
  },

  clearNotifications: () => {
    updateUser({ notifications: [] });
    set((s) => ({ ...s, ...syncFromStorage() }));
  },

  recomputeReadiness: () => {
    updateUser({});
    set((s) => ({ ...s, ...syncFromStorage() }));
  },
}));
