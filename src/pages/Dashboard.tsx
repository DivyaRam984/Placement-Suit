import { Link } from 'react-router-dom';
import { usePlatformStore } from '@/store/usePlatformStore';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const {
    jobMatches,
    applications,
    readinessScore,
    jdAnalyses,
    resumeData,
    notifications,
    markNotificationRead,
  } = usePlatformStore();

  const top5Jobs = jobMatches.slice(0, 5);
  const atsScore = readinessScore?.resumeAtsScore ?? 0;
  const jdScore = jdAnalyses[0]?.alignmentScore ?? 0;
  const placementScore = readinessScore?.placementScore ?? 0;

  const applied = applications.filter((a) => a.stage === 'applied' || a.stage === 'interview_scheduled' || a.stage === 'interview_completed').length;
  const interviews = applications.filter((a) => a.stage === 'interview_scheduled' || a.stage === 'interview_completed').length;
  const offers = applications.filter((a) => a.stage === 'offer').length;

  const weakSkillAlert = jdAnalyses[0]?.missingSkills?.length ? jdAnalyses[0].missingSkills.slice(0, 3) : null;

  const nextAction = !resumeData?.name
    ? 'Complete your resume'
    : atsScore < 70
    ? 'Improve resume ATS score (add skills & experience)'
    : jobMatches.length === 0
    ? 'Add and save relevant jobs'
    : jdAnalyses.length === 0
    ? 'Analyze a JD for your saved jobs'
    : applications.length === 0
    ? 'Move saved jobs into the application pipeline'
    : 'Keep applications updated and prepare for interviews';

  return (
    <div className={styles.root}>
      <h1>Unified Dashboard</h1>
      <p className={styles.sub}>Control center. Everything connects.</p>

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
          <h2>Current JD Readiness</h2>
          <div className={styles.score}>{jdScore}%</div>
          <Link to="/analyze">Analyze JD</Link>
        </section>
      </div>

      <section className={styles.section}>
        <h2>Applications pipeline</h2>
        <div className={styles.pipeline}>
          <span>Applied: <strong>{applied}</strong></span>
          <span>Interview: <strong>{interviews}</strong></span>
          <span>Offer: <strong>{offers}</strong></span>
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

      {weakSkillAlert && weakSkillAlert.length > 0 && (
        <section className={styles.alert}>
          <h2>Weak skill alert</h2>
          <p>Consider adding to resume: <strong>{weakSkillAlert.join(', ')}</strong></p>
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
                {!n.read && <button type="button" onClick={() => markNotificationRead(n.id)}>Mark read</button>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
