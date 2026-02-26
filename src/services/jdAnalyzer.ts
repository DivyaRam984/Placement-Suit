/**
 * JD Analyzer — extract required/preferred skills from job description text.
 * Deterministic extraction (keyword-based). No AI hallucinations.
 */

const SKILL_PATTERNS = [
  /\b(JavaScript|TypeScript|React|Node\.?js|Python|Java|C\+\+|Go|Rust|SQL|AWS|Docker|Kubernetes|Git|REST|GraphQL|MongoDB|Redis|Linux)\b/gi,
  /\b(communication|leadership|problem solving|teamwork|analytical|agile|scrum)\b/gi,
  /\b(machine learning|ML|data structures|algorithms|system design|OOP)\b/gi,
  /\b(HTML|CSS|SASS|Redux|Vue|Angular|Next\.?js|Express|Django|Flask|Spring)\b/gi,
];

export interface ExtractedJD {
  requiredSkills: string[];
  preferredSkills: string[];
  rawText: string;
}

export function extractSkillsFromJD(text: string): ExtractedJD {
  const normalized = text.replace(/\s+/g, ' ').trim();
  const required: Set<string> = new Set();
  const preferred: Set<string> = new Set();

  for (const pattern of SKILL_PATTERNS) {
    let m: RegExpExecArray | null;
    pattern.lastIndex = 0;
    while ((m = pattern.exec(normalized)) !== null) {
      const skill = m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase();
      if (normalized.toLowerCase().includes('preferred') && normalized.indexOf(m[0]) > normalized.toLowerCase().indexOf('preferred')) {
        preferred.add(skill);
      } else {
        required.add(skill);
      }
    }
  }

  // Also split by common delimiters and take likely skills (short words 2–20 chars)
  const chunks = normalized.split(/[,;.\n•·–—]/).map((s) => s.trim()).filter((s) => s.length >= 2 && s.length <= 30);
  for (const chunk of chunks) {
    if (/^[A-Za-z\s]+$/.test(chunk) && !/^(the|and|for|with|or|years|experience)$/i.test(chunk)) {
      if (chunk.length <= 20) required.add(chunk);
    }
  }

  return {
    requiredSkills: Array.from(required),
    preferredSkills: Array.from(preferred),
    rawText: normalized,
  };
}

export function computeAlignment(
  requiredSkills: string[],
  resumeSkills: string[]
): { alignmentScore: number; missingSkills: string[] } {
  if (requiredSkills.length === 0) return { alignmentScore: 100, missingSkills: [] };
  const resumeLower = resumeSkills.map((s) => s.toLowerCase());
  const missing: string[] = [];
  for (const r of requiredSkills) {
    const match = resumeLower.some((s) => s.includes(r.toLowerCase()) || r.toLowerCase().includes(s));
    if (!match) missing.push(r);
  }
  const hit = requiredSkills.length - missing.length;
  const alignmentScore = Math.round((hit / requiredSkills.length) * 100);
  return { alignmentScore, missingSkills: missing };
}
