import { Link } from 'react-router-dom';
import { usePlatformStore } from '@/store/usePlatformStore';
import styles from './Proof.module.css';

const CHECKLIST = [
  { path: '/jobs', label: 'Job Tracker working', key: 'jobs' },
  { path: '/analyze', label: 'JD Analyzer working', key: 'analyze' },
  { path: '/resume', label: 'Resume Builder working', key: 'resume' },
  { path: '/dashboard', label: 'Unified Dashboard working', key: 'dashboard' },
  { path: '/applications', label: 'Application Pipeline working', key: 'applications' },
  { path: '/dashboard', label: 'Placement Score visible', key: 'score' },
] as const;

export default function Proof() {
  const readinessScore = usePlatformStore((s) => s.readinessScore);

  return (
    <div className={styles.root}>
      <h1>Step 8 — Platform Proof</h1>
      <p className={styles.tagline}>No feature works alone. Everything connects.</p>

      <section className={styles.checklist}>
        <h2>Proof page includes</h2>
        <ul>
          {CHECKLIST.map(({ path, label, key }) => (
            <li key={key}>
              <Link to={path}>{label}</Link>
            </li>
          ))}
          <li className={styles.ok}>
            Placement Score visible: <strong>{readinessScore}</strong>/100
          </li>
          <li>
            <a href="#" onClick={(e) => { e.preventDefault(); }}>Deployment link</a> <span className={styles.muted}>(set after deploy)</span>
          </li>
          <li>
            <a href="https://github.com" target="_blank" rel="noreferrer">GitHub link</a> <span className={styles.muted}>(your repo)</span>
          </li>
        </ul>
      </section>

      <section className={styles.arch}>
        <h2>Architecture principles</h2>
        <p>Placement Suite must:</p>
        <ul>
          <li>Use one global state</li>
          <li>Avoid duplicated logic</li>
          <li>Avoid re-computing same data</li>
          <li>Separate data from presentation</li>
          <li>Be deterministic</li>
        </ul>
        <p className={styles.constraints}>No AI hallucinations. No random scoring. No disconnected tools.</p>
      </section>
    </div>
  );
}
