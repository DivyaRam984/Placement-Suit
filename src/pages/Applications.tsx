import { usePlatformStore } from '@/store/usePlatformStore';
import type { ApplicationStage } from '@/types/platform';
import styles from './Applications.module.css';

const STAGES: { value: ApplicationStage; label: string }[] = [
  { value: 'saved', label: 'Saved' },
  { value: 'applied', label: 'Applied' },
  { value: 'interview_scheduled', label: 'Interview Scheduled' },
  { value: 'interview_completed', label: 'Interview Completed' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
];

export default function Applications() {
  const { applications, updateApplicationStage } = usePlatformStore();

  const byStage = (stage: ApplicationStage) => applications.filter((a) => a.stage === stage);

  return (
    <div className={styles.root}>
      <h1>Application Pipeline</h1>
      <p className={styles.sub}>Track each job through stages. Progress affects your readiness score.</p>

      <div className={styles.pipeline}>
        {STAGES.map(({ value, label }) => (
          <div key={value} className={styles.column}>
            <h3>{label}</h3>
            <span className={styles.count}>{byStage(value).length}</span>
            {byStage(value).map((app) => (
              <div key={app.id} className={styles.card}>
                <strong>{app.jobTitle}</strong>
                <span className={styles.company}>{app.company}</span>
                {value === 'interview_scheduled' && (
                  <input
                    type="datetime-local"
                    value={app.interviewAt ? app.interviewAt.slice(0, 16) : ''}
                    onChange={(e) => updateApplicationStage(app.id, 'interview_scheduled', { interviewAt: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                    className={styles.date}
                  />
                )}
                <div className={styles.stageBtns}>
                  {STAGES.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => updateApplicationStage(app.id, s.value)}
                      className={app.stage === s.value ? styles.active : styles.stageBtn}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {applications.length === 0 && (
        <p className={styles.empty}>No applications yet. Save a job from <a href="/jobs">Jobs</a> and add it to the pipeline.</p>
      )}
    </div>
  );
}
