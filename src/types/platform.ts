/**
 * Step 2 — Unified Data Model
 * Everything shares one schema. No isolated localStorage keys.
 * One structured platform state.
 */

export type ApplicationStage =
  | 'saved'
  | 'applied'
  | 'interview_scheduled'
  | 'interview_completed'
  | 'offer'
  | 'rejected';

export interface JobMatch {
  id: string;
  title: string;
  company: string;
  source?: string;
  url?: string;
  matchScore: number; // 0–100
  postedAt?: string;
  savedAt: string;
}

export interface JDAnalysis {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  requiredSkills: string[];
  preferredSkills: string[];
  roundMapping?: { round: string; focus: string }[];
  analyzedAt: string;
  alignmentScore?: number; // 0–100
  missingSkills?: string[];
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  stage: ApplicationStage;
  appliedAt?: string;
  interviewAt?: string;
  updatedAt: string;
  jdAnalysisId?: string;
}

export interface ResumeData {
  name: string;
  email: string;
  phone?: string;
  summary?: string;
  skills: string[];
  experience: { title: string; company: string; duration: string; points: string[] }[];
  education: { degree: string; institution: string; year: string }[];
  lastUpdated: string;
}

export interface ReadinessScore {
  placementScore: number; // 0–100 unified
  jobMatchQuality: number; // 30%
  jdSkillAlignment: number; // 25%
  resumeAtsScore: number; // 25%
  applicationProgress: number; // 10%
  practiceCompletion: number; // 10%
  updatedAt: string;
}

export interface UserPreferences {
  roles?: string[];
  locations?: string[];
  minSalary?: number;
  notifyEmail?: boolean;
  notifyHighMatch?: boolean;
}

export interface PlatformNotification {
  id: string;
  type: 'high_match_job' | 'resume_below_70' | 'jd_no_alignment' | 'interview_24h' | 'no_activity_3d';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionPath?: string;
}

/** Global User Object — single source of truth (legacy, use PlacementUser) */
export interface GlobalUserState {
  preferences: UserPreferences;
  resumeData: ResumeData | null;
  jobMatches: JobMatch[];
  applications: Application[];
  jdAnalyses: JDAnalysis[];
  readinessScore: ReadinessScore | null;
  lastActivity: string;
  notifications: PlatformNotification[];
}

/**
 * Unified Data Model — single localStorage key "placementUser".
 * All app state lives here. Future backend-ready.
 */
export interface PlacementUser {
  preferences: UserPreferences;
  resumeData: ResumeData;
  jobMatches: JobMatch[];
  applications: Application[];
  jdAnalyses: JDAnalysis[];
  readinessScore: number;
  lastActivity: string;
  notifications: PlatformNotification[];
}

export const DEFAULT_READINESS: ReadinessScore = {
  placementScore: 0,
  jobMatchQuality: 0,
  jdSkillAlignment: 0,
  resumeAtsScore: 0,
  applicationProgress: 0,
  practiceCompletion: 0,
  updatedAt: new Date().toISOString(),
};

export const createDefaultResumeData = (): ResumeData => ({
  name: '',
  email: '',
  skills: [],
  experience: [],
  education: [],
  lastUpdated: new Date().toISOString(),
});

export const createDefaultGlobalState = (): GlobalUserState => ({
  preferences: {},
  resumeData: null,
  jobMatches: [],
  applications: [],
  jdAnalyses: [],
  readinessScore: null,
  lastActivity: new Date().toISOString(),
  notifications: [],
});
