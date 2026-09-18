"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import RoleGuard from '../../components/auth/RoleGuard';
import { useAuthStore } from '../../store/useAuthStore';
import { apiFetch } from '../../services/api';
import { InstructorSidebar } from '../../components/sidebar';
import DashboardNavbar from '../../components/navbar/DashboardNavbar';
import {
  InstructorOverview,
  CourseManagement,
  CourseBuilder,
  LessonBuilder,
  QuizBuilder,
  ChallengeBuilder,
  StudentManagement,
  InstructorAnalytics,
  ContentManagement,
  InstructorSettings,
  CoursePreview,
} from '../../components/instructor';
import {
  LuChevronRight,
  LuCircleAlert,
  LuArrowLeft,
} from 'react-icons/lu';

// ─── All valid tabs configuration (Sidebar & Routing) ──────────────────────
const ALL_TAB_META = {
  overview:            { label: 'Dashboard',         group: 'Manage' },
  courses:             { label: 'Courses',           group: 'Manage' },
  students:            { label: 'Students',          group: 'Manage' },
  analytics:           { label: 'Analytics',         group: 'Manage' },
  content:             { label: 'Content',           group: 'Manage' },
  'course-builder':    { label: 'Course Builder',    group: 'Create' },
  'course-preview':    { label: 'Course Preview',    group: 'Manage' },
  'lesson-builder':    { label: 'Lesson Builder',    group: 'Create' },
  'quiz-builder':      { label: 'Quiz Builder',      group: 'Create' },
  'challenge-builder': { label: 'Challenge Builder', group: 'Create' },
  settings:            { label: 'Settings',          group: 'Account' },
};

const VALID_TAB_IDS = Object.keys(ALL_TAB_META);

// ─── Breadcrumb ────────────────────────────────────────────────────────────────
function Breadcrumb({ activeTab }) {
  const meta = ALL_TAB_META[activeTab] || { label: 'Dashboard', group: 'Manage' };
  return (
    <div className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--color-muted)]">
      <span>Instructor</span>
      <LuChevronRight size={10} />
      {meta.group && meta.group !== 'Manage' && (
        <>
          <span>{meta.group}</span>
          <LuChevronRight size={10} />
        </>
      )}
      <span className="text-[var(--color-text)] font-semibold">{meta.label}</span>
    </div>
  );
}

// ─── Main Content ─────────────────────────────────────────────────────────────
function InstructorPortalContent() {
  const { user } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawTab = searchParams.get('tab');
  const activeTab = VALID_TAB_IDS.includes((rawTab || '').toLowerCase())
    ? rawTab.toLowerCase()
    : 'overview';

  // Context from URL (safe: null if not present)
  const urlCourseId  = searchParams.get('courseId')  || null;
  const urlModuleId  = searchParams.get('moduleId')  || null;
  const urlItemId    = searchParams.get('itemId')    || null;
  const urlItemType  = searchParams.get('itemType')  || null; // 'lesson' | 'quiz' | 'challenge'
  const urlGradingFocus = searchParams.get('grading') === '1';

  const [portalData, setPortalData] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Ephemeral builder context (kept in memory; URL is source of truth for IDs)
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    async function fetchPortalData() {
      try {
        const res = await apiFetch('/instructor/portal');
        if (res?.success) setPortalData(res.data);
      } catch (err) {
        console.warn('Could not fetch instructor data:', err);
      }
    }
    fetchPortalData();
  }, []);

  // ── Navigation helpers ────────────────────────────────────────────────────
  const handleTabChange = (tabId) => {
    if (tabId === 'overview') {
      router.push('/instructor');
    } else {
      router.push(`/instructor?tab=${tabId}`);
    }
  };

  /** Navigate to CourseBuilder with an optional course object in memory */
  const handleOpenBuilder = (course) => {
    if (course) setSelectedCourse(course);
    const id = course?.id ? `&courseId=${course.id}` : '';
    router.push(`/instructor?tab=course-builder${id}`);
  };

  /** Navigate to CoursePreview with a course object */
  const handleOpenPreview = (course) => {
    if (course) setSelectedCourse(course);
    const id = course?.id ? `&courseId=${course.id}` : '';
    router.push(`/instructor?tab=course-preview${id}`);
  };

  /** Navigate to LessonBuilder with full context */
  const handleOpenLesson = ({ courseId, moduleId, lessonId } = {}) => {
    let qs = `/instructor?tab=lesson-builder`;
    if (courseId)  qs += `&courseId=${courseId}`;
    if (moduleId)  qs += `&moduleId=${moduleId}`;
    if (lessonId)  qs += `&itemId=${lessonId}&itemType=lesson`;
    router.push(qs);
  };

  /** Navigate to QuizBuilder with full context */
  const handleOpenQuiz = ({ courseId, moduleId, quizId } = {}) => {
    let qs = `/instructor?tab=quiz-builder`;
    if (courseId)  qs += `&courseId=${courseId}`;
    if (moduleId)  qs += `&moduleId=${moduleId}`;
    if (quizId)    qs += `&itemId=${quizId}&itemType=quiz`;
    router.push(qs);
  };

  /** Navigate to ChallengeBuilder with full context */
  const handleOpenChallenge = ({ courseId, moduleId, challengeId } = {}) => {
    let qs = `/instructor?tab=challenge-builder`;
    if (courseId)     qs += `&courseId=${courseId}`;
    if (moduleId)     qs += `&moduleId=${moduleId}`;
    if (challengeId)  qs += `&itemId=${challengeId}&itemType=challenge`;
    router.push(qs);
  };

  /** Navigate to Students tab, optionally focus on grading queue */
  const handleOpenStudents = ({ focusGrading } = {}) => {
    router.push(`/instructor?tab=students${focusGrading ? '&grading=1' : ''}`);
  };

  /** Navigate to ContentManagement, pre-filtering by type */
  const handleOpenContent = ({ filterType } = {}) => {
    router.push(`/instructor?tab=content${filterType ? `&filterType=${filterType}` : ''}`);
  };

  const isValidTab = VALID_TAB_IDS.includes(activeTab);

  return (
    <div className="h-screen overflow-hidden bg-[var(--color-background)] text-[var(--color-text)] flex">
      {/* Sidebar */}
      <InstructorSidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-w-0 h-screen transition-all duration-300 ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <DashboardNavbar
          title="Instructor Portal"
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          onMobileMenuClick={() => setIsMobileOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Breadcrumb */}
          <Breadcrumb activeTab={activeTab} />

          {/* Tab Content */}
          {isValidTab ? (
            <div className="animate-fadeIn">
              {activeTab === 'overview' && (
                <InstructorOverview
                  user={user}
                  portalData={portalData}
                  onTabChange={handleTabChange}
                  onOpenBuilder={handleOpenBuilder}
                  onOpenLesson={handleOpenLesson}
                  onOpenQuiz={handleOpenQuiz}
                  onOpenChallenge={handleOpenChallenge}
                  onOpenStudents={handleOpenStudents}
                />
              )}
              {activeTab === 'courses' && (
                <CourseManagement
                  onOpenBuilder={handleOpenBuilder}
                  onOpenPreview={handleOpenPreview}
                />
              )}
              {activeTab === 'course-preview' && (
                <CoursePreview
                  course={selectedCourse}
                  courseId={urlCourseId}
                  onOpenBuilder={handleOpenBuilder}
                  onOpenLesson={handleOpenLesson}
                  onOpenQuiz={handleOpenQuiz}
                  onOpenChallenge={handleOpenChallenge}
                  onBack={() => router.push('/instructor?tab=courses')}
                />
              )}
              {activeTab === 'course-builder' && (
                <CourseBuilder
                  course={selectedCourse}
                  courseId={urlCourseId}
                  onOpenLesson={handleOpenLesson}
                  onOpenQuiz={handleOpenQuiz}
                  onOpenChallenge={handleOpenChallenge}
                  onOpenPreview={handleOpenPreview}
                  onBack={() => router.push('/instructor?tab=courses')}
                />
              )}
              {activeTab === 'lesson-builder' && (
                <LessonBuilder
                  courseId={urlCourseId}
                  moduleId={urlModuleId}
                  lessonId={urlItemId}
                  onBack={() => {
                    if (urlCourseId) {
                      router.push(`/instructor?tab=course-builder&courseId=${urlCourseId}${urlModuleId ? `&moduleId=${urlModuleId}` : ''}`);
                    } else {
                      router.push('/instructor?tab=course-builder');
                    }
                  }}
                />
              )}
              {activeTab === 'quiz-builder' && (
                <QuizBuilder
                  courseId={urlCourseId}
                  moduleId={urlModuleId}
                  quizId={urlItemId}
                  onBack={() => {
                    if (urlCourseId) {
                      router.push(`/instructor?tab=course-builder&courseId=${urlCourseId}${urlModuleId ? `&moduleId=${urlModuleId}` : ''}`);
                    } else {
                      router.push('/instructor?tab=course-builder');
                    }
                  }}
                />
              )}
              {activeTab === 'challenge-builder' && (
                <ChallengeBuilder
                  courseId={urlCourseId}
                  moduleId={urlModuleId}
                  challengeId={urlItemId}
                  onBack={() => {
                    if (urlCourseId) {
                      router.push(`/instructor?tab=course-builder&courseId=${urlCourseId}${urlModuleId ? `&moduleId=${urlModuleId}` : ''}`);
                    } else {
                      router.push('/instructor?tab=course-builder');
                    }
                  }}
                />
              )}
              {activeTab === 'students' && (
                <StudentManagement focusGrading={urlGradingFocus} />
              )}
              {activeTab === 'analytics' && (
                <InstructorAnalytics
                  onOpenLesson={handleOpenLesson}
                  onTabChange={handleTabChange}
                />
              )}
              {activeTab === 'content' && (
                <ContentManagement
                  initialFilterType={searchParams.get('filterType') || 'All'}
                  onOpenLesson={handleOpenLesson}
                  onOpenQuiz={handleOpenQuiz}
                  onOpenChallenge={handleOpenChallenge}
                  onOpenBuilder={handleOpenBuilder}
                />
              )}
              {activeTab === 'settings' && (
                <InstructorSettings user={user} />
              )}
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-[var(--color-surface)] border border-amber-500/30 space-y-4">
              <div className="flex items-center gap-3 text-amber-500">
                <LuCircleAlert size={24} />
                <h3 className="text-lg font-bold">Tab &ldquo;{rawTab}&rdquo; Not Found</h3>
              </div>
              <p className="text-xs text-[var(--color-muted)]">The requested tab doesn&apos;t exist.</p>
              <Link href="/instructor" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold hover:bg-violet-500 transition-colors">
                <LuArrowLeft size={14} /> Return to Dashboard
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function InstructorPortalPage() {
  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={['INSTRUCTOR', 'ADMIN']}>
        <Suspense fallback={null}>
          <InstructorPortalContent />
        </Suspense>
      </RoleGuard>
    </ProtectedRoute>
  );
}
