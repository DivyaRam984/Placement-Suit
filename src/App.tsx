import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { usePlatformStore } from '@/store/usePlatformStore';
import { runNotificationTriggers } from '@/services/notificationTriggers';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Jobs from '@/pages/Jobs';
import Analyze from '@/pages/Analyze';
import Resume from '@/pages/Resume';
import Applications from '@/pages/Applications';
import Dashboard from '@/pages/Dashboard';
import Settings from '@/pages/Settings';
import Proof from '@/pages/Proof';

function App() {
  const triggerDeps = usePlatformStore((s) => ({
    lastActivity: s.lastActivity,
    jobMatchesLen: s.jobMatches.length,
    applicationsLen: s.applications.length,
    jdAnalysesLen: s.jdAnalyses.length,
    readinessScore: s.readinessScore,
    hasResume: !!s.resumeData.name,
  }));

  const recomputeReadiness = usePlatformStore((s) => s.recomputeReadiness);

  useEffect(() => {
    recomputeReadiness();
  }, [recomputeReadiness]);

  useEffect(() => {
    runNotificationTriggers();
  }, [triggerDeps.lastActivity, triggerDeps.jobMatchesLen, triggerDeps.applicationsLen, triggerDeps.jdAnalysesLen, triggerDeps.readinessScore, triggerDeps.hasResume]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="analyze" element={<Analyze />} />
          <Route path="resume" element={<Resume />} />
          <Route path="applications" element={<Applications />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="settings" element={<Settings />} />
          <Route path="proof" element={<Proof />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
