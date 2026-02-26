/**
 * Step 7 — Notification Intelligence Layer
 * Behavior-based nudges. Not random notifications.
 * System triggers: high match job, resume < 70, JD analyzed no alignment, interview 24h, no activity 3d
 */

import type { GlobalUserState, PlatformNotification } from '@/types/platform';
import { usePlatformStore } from '@/store/usePlatformStore';

const NOTIFICATION_TYPES = {
  high_match_job: { title: 'New high match job', message: 'A job closely matching your profile was found.' },
  resume_below_70: { title: 'Resume score low', message: 'Your resume ATS score is below 70. Consider improving it.' },
  jd_no_alignment: {
    title: 'JD analyzed — weak alignment',
    message: 'Job description was analyzed but your resume does not align well. Add suggested skills.',
  },
  interview_24h: { title: 'Interview tomorrow', message: 'You have an interview in the next 24 hours.' },
  no_activity_3d: { title: 'We miss you', message: "You haven't been active for 3 days. Pick up where you left off." },
} as const;

function daysSince(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000);
}

function hasNotification(state: GlobalUserState, type: PlatformNotification['type']): boolean {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  return state.notifications.some((n) => n.type === type && n.createdAt >= cutoff);
}

/** Runs behavior-based notification triggers from current platform state. */
export function runNotificationTriggers(): void {
  const state = usePlatformStore.getState() as unknown as GlobalUserState;
  const add = usePlatformStore.getState().addNotification;

  // New high match job (if we have a job with matchScore >= 80 and not already notified recently)
  if (!hasNotification(state, 'high_match_job')) {
    const highMatch = state.jobMatches.find((j) => j.matchScore >= 80);
    if (highMatch) {
      add({
        type: 'high_match_job',
        title: NOTIFICATION_TYPES.high_match_job.title,
        message: `"${highMatch.title}" at ${highMatch.company} matches your profile (${highMatch.matchScore}%).`,
        actionPath: '/jobs',
      });
      return; // one at a time
    }
  }

  // Resume score below 70
  const ats = state.readinessScore?.resumeAtsScore ?? 0;
  if (ats > 0 && ats < 70 && !hasNotification(state, 'resume_below_70')) {
    add({
      type: 'resume_below_70',
      title: NOTIFICATION_TYPES.resume_below_70.title,
      message: NOTIFICATION_TYPES.resume_below_70.message,
      actionPath: '/resume',
    });
    return;
  }

  // JD analyzed but no resume alignment (latest JD has low alignment and we have resume)
  if (state.jdAnalyses.length > 0 && state.resumeData) {
    const latest = state.jdAnalyses[0];
    const alignment = latest.alignmentScore ?? 0;
    if (alignment < 50 && latest.missingSkills && latest.missingSkills.length > 0 && !hasNotification(state, 'jd_no_alignment')) {
      add({
        type: 'jd_no_alignment',
        title: NOTIFICATION_TYPES.jd_no_alignment.title,
        message: `For "${latest.jobTitle}": add skills like ${latest.missingSkills.slice(0, 3).join(', ')}.`,
        actionPath: '/analyze',
      });
      return;
    }
  }

  // Interview in 24 hours
  const in24h = state.applications.filter((a) => {
    if (a.stage !== 'interview_scheduled' || !a.interviewAt) return false;
    const h = (new Date(a.interviewAt).getTime() - Date.now()) / (60 * 60 * 1000);
    return h > 0 && h <= 24;
  });
  if (in24h.length > 0 && !hasNotification(state, 'interview_24h')) {
    add({
      type: 'interview_24h',
      title: NOTIFICATION_TYPES.interview_24h.title,
      message: in24h.map((a) => a.jobTitle).join(', '),
      actionPath: '/applications',
    });
    return;
  }

  // No activity for 3 days
  if (daysSince(state.lastActivity) >= 3 && !hasNotification(state, 'no_activity_3d')) {
    add({
      type: 'no_activity_3d',
      title: NOTIFICATION_TYPES.no_activity_3d.title,
      message: NOTIFICATION_TYPES.no_activity_3d.message,
      actionPath: '/dashboard',
    });
  }
}
