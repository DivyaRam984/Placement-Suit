import { Link } from 'react-router-dom';
import styles from './Home.module.css';

export default function Home() {
  return (
    <div className={styles.root}>
      <h1 className={styles.title}>Placement Suite</h1>
      <p className={styles.tagline}>Full-stack placement operating system. One pipeline.</p>
      <p className={styles.flow}>
        Job → JD Analysis → Resume Optimization → Application Tracking → Readiness Growth
      </p>
      <div className={styles.actions}>
        <Link to="/jobs" className={styles.primary}>Find jobs</Link>
        <Link to="/dashboard" className={styles.secondary}>Dashboard</Link>
        <Link to="/resume" className={styles.secondary}>Resume</Link>
      </div>
    </div>
  );
}
