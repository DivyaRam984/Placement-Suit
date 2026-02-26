import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePlatformStore } from '@/store/usePlatformStore';
import { extractSkillsFromJD, computeAlignment } from '@/services/jdAnalyzer';
import type { JDAnalysis } from '@/types/platform';
import styles from './Analyze.module.css';

const PLACEHOLDER_JD = `Senior Software Engineer

Requirements:
- 3+ years JavaScript/TypeScript, React
- Experience with Node.js, REST APIs, SQL
- Strong problem solving and communication
- Preferred: AWS, Docker, system design`;

export default function Analyze() {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId');
  const { jobMatches, resumeData, addJDAnalysis, jdAnalyses } = usePlatformStore();
  const [jdText, setJdText] = useState('');
  const [selectedJobId, setSelectedJobId] = useState(jobId || '');

  const job = useMemo(() => jobMatches.find((j) => j.id === selectedJobId), [jobMatches, selectedJobId]);

  const analyzed = useMemo(() => {
    if (!jdText.trim()) return null;
    const extracted = extractSkillsFromJD(jdText);
    const resumeSkills = resumeData?.skills ?? [];
    const { alignmentScore, missingSkills } = computeAlignment(extracted.requiredSkills, resumeSkills);
    return {
      ...extracted,
      alignmentScore,
      missingSkills,
    };
  }, [jdText, resumeData?.skills]);

  const handleAnalyze = () => {
    if (!analyzed) return;
    const id = `jd-${Date.now()}`;
    const analysis: JDAnalysis = {
      id,
      jobId: selectedJobId || id,
      jobTitle: job?.title ?? 'Unknown',
      company: job?.company ?? 'Unknown',
      requiredSkills: analyzed.requiredSkills,
      preferredSkills: analyzed.preferredSkills,
      analyzedAt: new Date().toISOString(),
      alignmentScore: analyzed.alignmentScore,
      missingSkills: analyzed.missingSkills,
    };
    addJDAnalysis(analysis);
  };

  return (
    <div className={styles.root}>
      <h1>JD Analyzer</h1>
      <p className={styles.sub}>Paste a job description. We extract skills and compare with your resume.</p>

      {jobMatches.length > 0 && (
        <div className={styles.selectRow}>
          <label>Load saved job:</label>
          <select
            value={selectedJobId}
            onChange={(e) => {
              setSelectedJobId(e.target.value);
              const j = jobMatches.find((x) => x.id === e.target.value);
              if (j) setJdText(PLACEHOLDER_JD);
            }}
            className={styles.select}
          >
            <option value="">— Select —</option>
            {jobMatches.map((j) => (
              <option key={j.id} value={j.id}>{j.title} @ {j.company}</option>
            ))}
          </select>
        </div>
      )}

      <textarea
        placeholder="Paste job description here..."
        value={jdText}
        onChange={(e) => setJdText(e.target.value)}
        className={styles.textarea}
        rows={12}
      />

      {analyzed && (
        <div className={styles.results}>
          <h2>Analysis</h2>
          <p><strong>Required skills:</strong> {analyzed.requiredSkills.join(', ') || '—'}</p>
          <p><strong>Preferred skills:</strong> {analyzed.preferredSkills.join(', ') || '—'}</p>
          <p><strong>Resume alignment:</strong> <span className={analyzed.alignmentScore >= 70 ? styles.good : styles.warn}>{analyzed.alignmentScore}%</span></p>
          {analyzed.missingSkills.length > 0 && (
            <p><strong>Missing in resume:</strong> {analyzed.missingSkills.join(', ')}. <a href="/resume">Edit resume</a> to add these.</p>
          )}
          <button type="button" onClick={handleAnalyze} className={styles.btn}>Save analysis &amp; update readiness</button>
        </div>
      )}

      <section className={styles.past}>
        <h2>Recent analyses ({jdAnalyses.length})</h2>
        {jdAnalyses.length === 0 ? (
          <p className={styles.empty}>No analyses yet.</p>
        ) : (
          <ul className={styles.ul}>
            {jdAnalyses.slice(0, 5).map((a) => (
              <li key={a.id} className={styles.card}>
                {a.jobTitle} @ {a.company} — Alignment: {a.alignmentScore ?? 0}%
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
