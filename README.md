# Placement Suite

**Full-stack placement operating system.** One pipeline: Job → JD Analysis → Resume Optimization → Application Tracking → Readiness Growth.

Not three products — one ecosystem. Students don't need tools; they need flow.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Routes (Master Shell)

| Path | Purpose |
|------|--------|
| `/` | Home |
| `/jobs` | Job Tracker (Job Intelligence Engine) |
| `/analyze` | JD Analyzer + round mapping |
| `/resume` | Resume Builder + ATS scoring |
| `/applications` | Application pipeline (Saved → Applied → Interview → Offer/Rejected) |
| `/dashboard` | Unified dashboard (control center) |
| `/settings` | Preferences |
| `/proof` | Platform proof + architecture principles |

## Architecture

- **One global state** — single Zustand store; one localStorage key (`placement_suite_platform_state`). No isolated keys.
- **Unified data model** — `GlobalUserState`: preferences, resumeData, jobMatches, applications, jdAnalyses, readinessScore, lastActivity, notifications.
- **Central Readiness Score** — 0–100: Job Match 30%, JD Skill Alignment 25%, Resume ATS 25%, Application Progress 10%, Practice 10%.
- **Notification triggers** — behavior-based: high match job, resume &lt; 70, JD no alignment, interview in 24h, no activity 3 days.
- **Deterministic** — no random scoring; data separate from presentation.

## Merging existing projects

This repo is the **Master Shell**. To plug in existing code:

1. **Job Intelligence Engine (Project 1)** — Replace or extend the Jobs page and any job-fetch logic in `src/pages/Jobs.tsx` and add a job feed service under `src/services/`.
2. **JD Analyzer + Round Mapping (Project 2)** — Enhance `src/services/jdAnalyzer.ts` and `src/pages/Analyze.tsx` with your extraction/round-mapping logic.
3. **Resume Builder + ATS (Project 3)** — Replace or extend `src/pages/Resume.tsx` and the ATS logic in `src/services/readinessScore.ts` (e.g. real ATS scoring).

All modules read/write the same global state so the dashboard, pipeline, and readiness score stay in sync.

## Build & deploy

```bash
npm run build
```

Output is in `dist/`. Deploy to Vercel, Netlify, or any static host. After deploy, set the **Deployment link** and **GitHub link** on the Proof page (`/proof`).

**Vercel:** The project is pinned to **Node 20** (`.nvmrc` and `package.json` engines). If Runtime Settings show a Node.js version warning, open **Project Settings → General → Node.js Version** and select **20.x**.
