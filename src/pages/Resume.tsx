import { usePlatformStore } from '@/store/usePlatformStore';
import { createDefaultResumeData } from '@/types/platform';
import type { ResumeData } from '@/types/platform';
import styles from './Resume.module.css';

export default function Resume() {
  const { resumeData, setResumeData, readinessScore } = usePlatformStore();
  const data = resumeData ?? createDefaultResumeData();

  const atsScore = readinessScore?.resumeAtsScore ?? 0;
  const below70 = atsScore > 0 && atsScore < 70;

  const update = (patch: Partial<ResumeData>) => {
    setResumeData({
      ...data,
      ...patch,
      lastUpdated: new Date().toISOString(),
    });
  };

  const addSkill = () => {
    const skill = prompt('Skill name');
    if (skill?.trim()) update({ skills: [...data.skills, skill.trim()] });
  };

  const removeSkill = (i: number) => {
    update({ skills: data.skills.filter((_, idx) => idx !== i) });
  };

  return (
    <div className={styles.root}>
      <h1>Resume Builder</h1>
      <p className={styles.sub}>Resume data feeds ATS score and JD alignment. One source of truth.</p>

      <div className={styles.atsBox}>
        <strong>Resume ATS Score:</strong> <span className={below70 ? styles.warn : styles.good}>{atsScore}%</span>
        {below70 && <p className={styles.nudge}>Score below 70 — add more sections and skills to improve.</p>}
      </div>

      <div className={styles.form}>
        <label>Name</label>
        <input
          value={data.name}
          onChange={(e) => update({ name: e.target.value })}
          className={styles.input}
          placeholder="Your name"
        />
        <label>Email</label>
        <input
          type="email"
          value={data.email}
          onChange={(e) => update({ email: e.target.value })}
          className={styles.input}
          placeholder="email@example.com"
        />
        <label>Summary</label>
        <textarea
          value={data.summary ?? ''}
          onChange={(e) => update({ summary: e.target.value })}
          className={styles.textarea}
          placeholder="Short professional summary (50+ chars helps ATS)"
          rows={3}
        />
        <label>Skills</label>
        <div className={styles.skills}>
          {data.skills.map((s, i) => (
            <span key={i} className={styles.skillTag}>
              {s} <button type="button" onClick={() => removeSkill(i)} aria-label="Remove">×</button>
            </span>
          ))}
          <button type="button" onClick={addSkill} className={styles.addBtn}>+ Add skill</button>
        </div>
        <p className={styles.hint}>Skills here are used for JD alignment. Add keywords from job descriptions.</p>
      </div>

      <section className={styles.section}>
        <h2>Experience</h2>
        {data.experience.length === 0 ? (
          <button type="button" onClick={() => update({ experience: [...data.experience, { title: '', company: '', duration: '', points: [] }] })} className={styles.addBtn}>
            + Add experience
          </button>
        ) : (
          data.experience.map((exp, i) => (
            <div key={i} className={styles.card}>
              <input placeholder="Title" value={exp.title} onChange={(e) => {
                const copy = [...data.experience];
                copy[i] = { ...copy[i], title: e.target.value };
                update({ experience: copy });
              }} className={styles.input} />
              <input placeholder="Company" value={exp.company} onChange={(e) => {
                const copy = [...data.experience];
                copy[i] = { ...copy[i], company: e.target.value };
                update({ experience: copy });
              }} className={styles.input} />
              <input placeholder="Duration" value={exp.duration} onChange={(e) => {
                const copy = [...data.experience];
                copy[i] = { ...copy[i], duration: e.target.value };
                update({ experience: copy });
              }} className={styles.input} />
            </div>
          ))
        )}
      </section>

      <section className={styles.section}>
        <h2>Education</h2>
        {data.education.length === 0 ? (
          <button type="button" onClick={() => update({ education: [...data.education, { degree: '', institution: '', year: '' }] })} className={styles.addBtn}>
            + Add education
          </button>
        ) : (
          data.education.map((edu, i) => (
            <div key={i} className={styles.card}>
              <input placeholder="Degree" value={edu.degree} onChange={(e) => {
                const copy = [...data.education];
                copy[i] = { ...copy[i], degree: e.target.value };
                update({ education: copy });
              }} className={styles.input} />
              <input placeholder="Institution" value={edu.institution} onChange={(e) => {
                const copy = [...data.education];
                copy[i] = { ...copy[i], institution: e.target.value };
                update({ education: copy });
              }} className={styles.input} />
              <input placeholder="Year" value={edu.year} onChange={(e) => {
                const copy = [...data.education];
                copy[i] = { ...copy[i], year: e.target.value };
                update({ education: copy });
              }} className={styles.input} />
            </div>
          ))
        )}
      </section>
    </div>
  );
}
