/**
 * Step 5 — Central Readiness Score
 * Unified formula. Deterministic. No random scoring.
 * Placement Score 0–100 = weighted sum of:
 *   Job Match Quality 30% + JD Skill Alignment 25% + Resume ATS 25% + Application Progress 10% + Practice Completion 10%
 */

import type { GlobalUserState, ReadinessScore } from '@/types/platform';
import { DEFAULT_READINESS } from '@/types/platform';

export function computeReadinessScore(state: GlobalUserState): ReadinessScore {
  const jobMatchQuality = computeJobMatchQuality(state);
  const jdSkillAlignment = computeJDSkillAlignment(state);
  const resumeAtsScore = computeResumeAtsScore(state);
  const applicationProgress = computeApplicationProgress(state);
  const practiceCompletion = state.readinessScore?.practiceCompletion ?? 0; // could be from practice module

  const placementScore = Math.round(
    jobMatchQuality * 0.3 +
      jdSkillAlignment * 0.25 +
      resumeAtsScore * 0.25 +
      applicationProgress * 0.1 +
      practiceCompletion * 0.1
  );

  return {
    ...DEFAULT_READINESS,
    placementScore: Math.min(100, Math.max(0, placementScore)),
    jobMatchQuality,
    jdSkillAlignment,
    resumeAtsScore,
    applicationProgress,
    practiceCompletion,
    updatedAt: new Date().toISOString(),
  };
}

function computeJobMatchQuality(state: GlobalUserState): number {
  if (state.jobMatches.length === 0) return 0;
  const top = state.jobMatches.slice(0, 10);
  const sum = top.reduce((a, j) => a + j.matchScore, 0);
  return Math.round(sum / top.length);
}

function computeJDSkillAlignment(state: GlobalUserState): number {
  if (state.jdAnalyses.length === 0) return 0;
  const latest = state.jdAnalyses[0];
  return latest.alignmentScore ?? 0;
}

function computeResumeAtsScore(state: GlobalUserState): number {
  if (!state.resumeData) return 0;
  // Deterministic ATS-style score: based on sections filled and skill count
  let score = 0;
  const r = state.resumeData;
  if (r.name && r.email) score += 20;
  if (r.summary && r.summary.length > 50) score += 15;
  if (r.skills.length >= 5) score += 25;
  else if (r.skills.length >= 3) score += 15;
  if (r.experience.length > 0) score += 25;
  if (r.education.length > 0) score += 15;
  return Math.min(100, score);
}

function computeApplicationProgress(state: GlobalUserState): number {
  const apps = state.applications;
  if (apps.length === 0) return 0;
  const weights: Record<string, number> = {
    saved: 10,
    applied: 30,
    interview_scheduled: 50,
    interview_completed: 70,
    offer: 100,
    rejected: 0,
  };
  const total = apps.reduce((a, app) => a + (weights[app.stage] ?? 0), 0);
  return Math.round(total / apps.length);
}
