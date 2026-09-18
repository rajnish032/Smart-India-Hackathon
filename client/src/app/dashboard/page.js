"use client";

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import RoleGuard from '../../components/auth/RoleGuard';
import { useAuthStore } from '../../store/useAuthStore';
import { apiFetch } from '../../services/api';
import { LearnerSidebar } from '../../components/sidebar';
import DashboardNavbar from '../../components/navbar/DashboardNavbar';
import {
  LearnerOverview,
  ExperimentsView,
  BackendCompareView,
  SimulationHistoryView,
  SavedCircuitsView,
} from '../../components/learner';

const TAB_CONFIG = {
  overview: { title: 'Dashboard', component: null }, // uses LearnerOverview with hubData
  experiments: { title: 'Experiments', component: ExperimentsView },
  'backend-compare': { title: 'Backend Comparison', component: BackendCompareView },
  'sim-history': { title: 'Simulation History', component: SimulationHistoryView },
  'saved-circuits': { title: 'Saved Circuits', component: SavedCircuitsView },
};

function LearnerDashboardInner() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const tab = searchParams?.get('tab') || 'overview';

  const [hubData, setHubData] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const tabConfig = TAB_CONFIG[tab] || TAB_CONFIG.overview;
  const isOverview = tab === 'overview' || !TAB_CONFIG[tab];

  const fetchHubData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/learner/dashboard');
      if (res?.success) setHubData(res.data);
    } catch (err) {
      console.warn('Could not fetch learner hub data, using mock data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOverview) return;
    fetchHubData();

    const handleStorage = (e) => {
      if (e.key === 'learner_activity_sync') {
        fetchHubData();
      }
    };

    window.addEventListener('focus', fetchHubData);
    window.addEventListener('learner:activity-updated', fetchHubData);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('focus', fetchHubData);
      window.removeEventListener('learner:activity-updated', fetchHubData);
      window.removeEventListener('storage', handleStorage);
    };
  }, [isOverview, fetchHubData]);

  const TabComponent = tabConfig.component;

  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={['LEARNER', 'INSTRUCTOR', 'ADMIN']}>
        <div className="h-screen overflow-hidden bg-[var(--color-background)] text-[var(--color-text)] flex">
          <LearnerSidebar
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
            isMobileOpen={isMobileOpen}
            onMobileClose={() => setIsMobileOpen(false)}
          />

          <div
            className={`flex-1 flex flex-col min-w-0 h-screen transition-all duration-300 ${
              isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
            }`}
          >
            <DashboardNavbar
              title={tabConfig.title}
              isCollapsed={isCollapsed}
              onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
              onMobileMenuClick={() => setIsMobileOpen(true)}
            />

            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
              {isOverview ? (
                loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
                      <span className="text-sm text-[var(--color-muted)]">Loading your dashboard...</span>
                    </div>
                  </div>
                ) : (
                  <LearnerOverview user={user} hubData={hubData} />
                )
              ) : (
                TabComponent ? <TabComponent /> : <LearnerOverview user={user} hubData={hubData} />
              )}
            </main>
          </div>
        </div>
      </RoleGuard>
    </ProtectedRoute>
  );
}

export default function LearnerDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
      </div>
    }>
      <LearnerDashboardInner />
    </Suspense>
  );
}
