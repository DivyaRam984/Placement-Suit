import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePlatformStore } from '@/store/usePlatformStore';
import { getReadinessBreakdown } from '@/services/readinessScore';
import type { PlacementUser } from '@/types/platform';
import styles from './Dashboard.module.css';

/** Compute JD Readiness Score (0–100): ATS≥70 +30, skills≥5 +30, apps≥3 +20, JD analyzed +20. */
function computeJDReadinessScore(user: PlacementUser): number {
  const ats = getReadinessBreakdown(user).resumeAtsScore;
  const skillsCount = user.resumeData?.skills?.length ?? 0;
  const applicationsCount = user.applications?.length ?? 0;
  const hasJDAnalyzed = (user.jdAnalyses?.length ?? 0) > 0;

  let score = 0;
  if (ats >= 70) score += 30;
  if (skillsCount >= 5) score += 30;
  if (applicationsCount >= 3) score += 20;
  if (hasJDAnalyzed) score += 20;

  return Math.min(100, score);
}

/** Pipeline counts: Applied, Interview, Offer. */
function getPipelineCounts(applications: PlacementUser['applications']) {
  const applied = applications.filter((a) => a.stage === 'applied').length;
  const interview = applications.filter((a) =>
    a.stage === 'interview_scheduled' || a.stage === 'interview_completed'
  ).length;
  const offer = applications.filter((a) => a.stage === 'offer').length;
  return { applied, interview, offer };
}

/** One next action based on lowest scoring area. */
function getNextActionRecommendation(user: PlacementUser, atsScore: number): string {
  const skillsCount = user.resumeData?.skills?.length ?? 0;
  const applicationsCount = user.applications?.length ?? 0;

  if (atsScore < 70) return 'Improve Resume';
  if (applicationsCount === 0) return 'Start Applying';
  if (skillsCount < 5) return 'Add Relevant Skills';
  return "You're on track — keep applying and preparing.";
}

export default function Dashboard() {
  // Data comes from placementUser (localStorage key) via userStore → usePlatformStore
  const {
    jobMatches,
    applications,
    readinessScore: placementScore,
    jdAnalyses,
    resumeData,
    notifications,
    markNotificationRead,
    preferences,
    lastActivity,
  } = usePlatformStore();

  const currentUser = useMemo<PlacementUser>(
    () => ({
      preferences,
      resumeData,
      jobMatches,
      applications,
      jdAnalyses,
      readinessScore: placementScore,
      lastActivity,
      notifications,
    }),
    [
      preferences,
      resumeData,
      jobMatches,
      applications,
      jdAnalyses,
      placementScore,
      lastActivity,
      notifications,
    ]
  );

  const breakdown = useMemo(() => getReadinessBreakdown(currentUser), [currentUser]);
  const atsScore = breakdown.resumeAtsScore;
  const jdReadinessScore = useMemo(() => computeJDReadinessScore(currentUser), [currentUser]);
  const pipeline = useMemo(() => getPipelineCounts(applications), [applications]);
  const nextAction = useMemo(
    () => getNextActionRecommendation(currentUser, atsScore),
    [currentUser, atsScore]
  );

  const skillsCount = resumeData?.skills?.length ?? 0;
  const weakSkillAlerts = useMemo(() => {
    const alerts: string[] = [];
    if (skillsCount < 5) alerts.push('Add more skills from job descriptions.');
    if (atsScore < 70) alerts.push('Improve summary and experience sections.');
    return alerts;
  }, [skillsCount, atsScore]);

  const top5Jobs = jobMatches.slice(0, 5);

  return (
    <div className={styles.root}>
      <h1>Unified Dashboard</h1>
      <p className={styles.sub}>Intelligent control center. Real-time metrics from your data.</p>

      <div className={styles.grid}>
        <section className={styles.card}>
          <h2>Placement Score</h2>
          <div className={styles.bigScore}>{placementScore}</div>
          <p className={styles.muted}>0–100 unified</p>
        </section>

        <section className={styles.card}>
          <h2>Resume ATS Score</h2>
          <div className={styles.score}>{atsScore}%</div>
          <Link to="/resume">Edit resume</Link>
        </section>

        <section className={styles.card}>
          <h2>JD Readiness Score</h2>
          <div className={styles.score}>{jdReadinessScore}%</div>
          <p className={styles.muted}>ATS≥70, skills≥5, apps≥3, JD analyzed</p>
          <Link to="/analyze">Analyze JD</Link>
        </section>
      </div>

      <section className={styles.section}>
        <h2>Applications pipeline</h2>
        <div className={styles.pipeline}>
          <span>Applied: <strong>{pipeline.applied}</strong></span>
          <span>Interview: <strong>{pipeline.interview}</strong></span>
          <span>Offer: <strong>{pipeline.offer}</strong></span>
        </div>
        <Link to="/applications">View pipeline →</Link>
      </section>

      <section className={styles.section}>
        <h2>Daily job matches (top 5)</h2>
        {top5Jobs.length === 0 ? (
          <p className={styles.muted}>No saved jobs. <Link to="/jobs">Find jobs</Link>.</p>
        ) : (
          <ul className={styles.jobList}>
            {top5Jobs.map((j) => (
              <li key={j.id}>
                <Link to="/jobs">{j.title}</Link> @ {j.company} — {j.matchScore}%
              </li>
            ))}
          </ul>
        )}
      </section>

      {weakSkillAlerts.length > 0 && (
        <section className={styles.alert}>
          <h2>Weak skill alert</h2>
          <ul className={styles.alertList}>
            {weakSkillAlerts.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
          <Link to="/resume">Edit resume</Link>
        </section>
      )}

      <section className={styles.section}>
        <h2>Next action</h2>
        <p className={styles.nextAction}>{nextAction}</p>
      </section>

      {notifications.length > 0 && (
        <section className={styles.section}>
          <h2>Notifications</h2>
          <ul className={styles.notifList}>
            {notifications.slice(0, 5).map((n) => (
              <li key={n.id} className={n.read ? styles.read : ''}>
                <strong>{n.title}</strong> — {n.message}
                {n.actionPath && <Link to={n.actionPath}>Go</Link>}
                {!n.read && (
                  <button type="button" onClick={() => markNotificationRead(n.id)}>
                    Mark read
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
