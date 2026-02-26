/**
 * Central Readiness Score — deterministic, single number 0–100.
 * Weighted: Job Match 30% + JD Alignment 25% + Resume ATS 25% + App Progress 10% + Practice 10%.
 */

import type { PlacementUser } from '@/types/platform';

export function computeReadinessScoreNumber(user: PlacementUser): number {
  const jobMatchQuality = computeJobMatchQuality(user);
  const jdSkillAlignment = computeJDSkillAlignment(user);
  const resumeAtsScore = computeResumeAtsScore(user);
  const applicationProgress = computeApplicationProgress(user);
  const practiceCompletion = 0; // optional future: user.practiceCompletion ?? 0

  const score = Math.round(
    jobMatchQuality * 0.3 +
      jdSkillAlignment * 0.25 +
      resumeAtsScore * 0.25 +
      applicationProgress * 0.1 +
      practiceCompletion * 0.1
  );
  return Math.min(100, Math.max(0, score));
}

/** For UI: breakdown of readiness components (not persisted). */
export interface ReadinessBreakdown {
  placementScore: number;
  jobMatchQuality: number;
  jdSkillAlignment: number;
  resumeAtsScore: number;
  applicationProgress: number;
}

export function getReadinessBreakdown(user: PlacementUser): ReadinessBreakdown {
  return {
    placementScore: user.readinessScore,
    jobMatchQuality: computeJobMatchQuality(user),
    jdSkillAlignment: computeJDSkillAlignment(user),
    resumeAtsScore: computeResumeAtsScore(user),
    applicationProgress: computeApplicationProgress(user),
  };
}

function computeJobMatchQuality(user: PlacementUser): number {
  if (user.jobMatches.length === 0) return 0;
  const top = user.jobMatches.slice(0, 10);
  const sum = top.reduce((a, j) => a + j.matchScore, 0);
  return Math.round(sum / top.length);
}

function computeJDSkillAlignment(user: PlacementUser): number {
  if (user.jdAnalyses.length === 0) return 0;
  return user.jdAnalyses[0].alignmentScore ?? 0;
}

function computeResumeAtsScore(user: PlacementUser): number {
  const r = user.resumeData;
  let score = 0;
  if (r.name && r.email) score += 20;
  if (r.summary && r.summary.length > 50) score += 15;
  if (r.skills.length >= 5) score += 25;
  else if (r.skills.length >= 3) score += 15;
  if (r.experience.length > 0) score += 25;
  if (r.education.length > 0) score += 15;
  return Math.min(100, score);
}

function computeApplicationProgress(user: PlacementUser): number {
  const apps = user.applications;
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
