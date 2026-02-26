import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePlatformStore } from '@/store/usePlatformStore';
import type { JobMatch } from '@/types/platform';
import styles from './Jobs.module.css';

export default function Jobs() {
  const { jobMatches, addJobMatch, removeJobMatch, addApplication } = usePlatformStore();
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [matchScore, setMatchScore] = useState(75);

  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim()) return;
    const id = `job-${Date.now()}`;
    const job: JobMatch = {
      id,
      title: title.trim(),
      company: company.trim(),
      matchScore: Math.min(100, Math.max(0, matchScore)),
      savedAt: new Date().toISOString(),
    };
    addJobMatch(job);
    setTitle('');
    setCompany('');
    setMatchScore(75);
  };

  const handleSaveAndApply = (job: JobMatch) => {
    addApplication({
      id: `app-${Date.now()}-${job.id}`,
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      stage: 'saved',
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className={styles.root}>
      <h1>Job Tracker</h1>
      <p className={styles.sub}>Job Intelligence Engine — save and track matches.</p>

      <form onSubmit={handleAddJob} className={styles.form}>
        <input
          placeholder="Job title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={styles.input}
        />
        <input
          placeholder="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className={styles.input}
        />
        <label className={styles.label}>
          Match % <input type="number" min={0} max={100} value={matchScore} onChange={(e) => setMatchScore(Number(e.target.value))} className={styles.num} />
        </label>
        <button type="submit" className={styles.btn}>Add job</button>
      </form>

      <section className={styles.list}>
        <h2>Saved jobs ({jobMatches.length})</h2>
        {jobMatches.length === 0 ? (
          <p className={styles.empty}>No jobs yet. Add one above or connect a job feed.</p>
        ) : (
          <ul className={styles.ul}>
            {jobMatches.map((job) => (
              <li key={job.id} className={styles.card}>
                <div>
                  <strong>{job.title}</strong> — {job.company}
                  <span className={styles.score}>Match: {job.matchScore}%</span>
                </div>
                <div className={styles.actions}>
                  <Link to={`/analyze?jobId=${job.id}`} className={styles.link}>Analyze JD</Link>
                  <button type="button" onClick={() => handleSaveAndApply(job)} className={styles.linkBtn}>Add to pipeline</button>
                  <button type="button" onClick={() => removeJobMatch(job.id)} className={styles.danger}>Remove</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
