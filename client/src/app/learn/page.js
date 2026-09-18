"use client";

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { LearnerSidebar } from '../../components/sidebar';
import DashboardNavbar from '../../components/navbar/DashboardNavbar';
import CourseCard from '../../components/learner/learn/CourseCard';
import CourseDetail from '../../components/learner/learn/CourseDetail';
import ModuleOverview from '../../components/learner/learn/ModuleOverview';
import LessonView from '../../components/learner/learn/LessonView';
import InteractiveExperiment from '../../components/learner/learn/InteractiveExperiment';
import { apiFetch } from '../../services/api';
import {
  LuBookOpen, LuCompass, LuStar, LuGraduationCap, LuSparkles,
  LuArrowLeft, LuSearch, LuFilter, LuFlaskConical,
  LuTrendingUp, LuClock, LuZap, LuBrain, LuCheck,
} from 'react-icons/lu';

// ─── Course catalogue data ────────────────────────────────────────────────────
const COURSES = [
  {
    id: 'c1',
    title: 'Quantum Fundamentals: From Bits to Qubits',
    description: 'Master the core principles of quantum mechanics and how they form the foundation of quantum computing.',
    difficulty: 'Beginner',
    duration: '8 hrs',
    modules: 5,
    lessons: 24,
    instructor: 'Dr. Anjali Singh',
    progress: 0,
    enrolled: false,
    studentsEnrolled: 3420,
    category: 'Foundations',
    rating: 4.9,
  },
  {
    id: 'c2',
    title: 'Quantum Algorithms Masterclass',
    description: "Deep dive into Grover's search, Shor's factoring, and quantum phase estimation with working Qiskit implementations.",
    difficulty: 'Intermediate',
    duration: '14 hrs',
    modules: 6,
    lessons: 38,
    instructor: 'Dr. Priya Nair',
    progress: 0,
    enrolled: false,
    studentsEnrolled: 1840,
    category: 'Algorithms',
    rating: 4.8,
  },
  {
    id: 'c3',
    title: 'Quantum Error Correction & Fault Tolerance',
    description: 'Learn stabilizer codes, surface codes, and logical qubit construction to build noise-resilient quantum computers.',
    difficulty: 'Advanced',
    duration: '18 hrs',
    modules: 7,
    lessons: 42,
    instructor: 'Prof. Rajan Mehta',
    progress: 0,
    enrolled: false,
    studentsEnrolled: 720,
    category: 'Error Correction',
    rating: 4.7,
  },
  {
    id: 'c4',
    title: 'Quantum Machine Learning',
    description: 'Explore variational quantum circuits, quantum kernels, and hybrid QML algorithms for near-term quantum devices.',
    difficulty: 'Advanced',
    duration: '16 hrs',
    modules: 8,
    lessons: 45,
    instructor: 'Dr. Kavya Iyer',
    progress: 0,
    enrolled: false,
    studentsEnrolled: 560,
    category: 'QML',
    rating: 4.6,
  },
  {
    id: 'c5',
    title: 'Quantum Cryptography & BB84',
    description: 'From no-cloning theorem to quantum key distribution protocols. Build provably secure communication channels.',
    difficulty: 'Intermediate',
    duration: '10 hrs',
    modules: 4,
    lessons: 22,
    instructor: 'Dr. Aryan Kapoor',
    progress: 0,
    enrolled: false,
    studentsEnrolled: 980,
    category: 'Cryptography',
    rating: 4.8,
  },
  {
    id: 'c6',
    title: 'Variational Quantum Eigensolver (VQE)',
    description: 'Master the VQE hybrid algorithm for molecular simulation and quantum chemistry applications.',
    difficulty: 'Advanced',
    duration: '12 hrs',
    modules: 5,
    lessons: 28,
    instructor: 'Dr. Sruthi Varma',
    progress: 0,
    enrolled: false,
    studentsEnrolled: 340,
    category: 'Quantum Chemistry',
    rating: 4.5,
  },
];

const LEARNING_PATHS = [
  {
    id: 'p1',
    title: 'Quantum Computing Foundations',
    description: 'The complete beginner to intermediate path. Start from zero and build up to running real quantum algorithms.',
    courses: 3,
    totalHours: '32 hrs',
    difficulty: 'Beginner → Intermediate',
    progress: 0,
    enrolled: false,
    color: 'from-[var(--color-primary)] to-violet-500',
    icon: LuBookOpen,
  },
  {
    id: 'p2',
    title: 'Quantum Algorithm Specialist',
    description: 'Deep dive into the canonical quantum algorithms. Implement Grover, Shor, QFT, and QPE from scratch.',
    courses: 2,
    totalHours: '24 hrs',
    difficulty: 'Intermediate → Advanced',
    progress: 0,
    enrolled: false,
    color: 'from-cyan-500 to-[var(--color-secondary)]',
    icon: LuBrain,
  },
  {
    id: 'p3',
    title: 'Quantum Machine Learning Track',
    description: 'Combine classical ML with quantum advantage. Build VQC, quantum kernels, and quantum GANs.',
    courses: 3,
    totalHours: '40 hrs',
    difficulty: 'Advanced',
    progress: 0,
    enrolled: false,
    color: 'from-violet-500 to-rose-500',
    icon: LuSparkles,
  },
  {
    id: 'p4',
    title: 'Quantum Security & Cryptography',
    description: 'From BB84 to post-quantum cryptography. Master quantum-resistant algorithms and QKD protocols.',
    courses: 2,
    totalHours: '18 hrs',
    difficulty: 'Intermediate',
    progress: 0,
    enrolled: false,
    color: 'from-emerald-500 to-cyan-500',
    icon: LuTrendingUp,
  },
];

const RECOMMENDED = [
  { ...COURSES[2], recommendedReason: 'Next step in your algorithm track' },
  { ...COURSES[4], recommendedReason: 'Based on your cryptography quiz scores' },
  { ...COURSES[3], recommendedReason: 'Matches your interest in ML' },
];

const CATEGORIES = ['All', 'Foundations', 'Algorithms', 'Error Correction', 'QML', 'Cryptography', 'Quantum Chemistry'];

// ─── Sub-views ────────────────────────────────────────────────────────────────

function LearningPathCard({ path }) {
  const Icon = path.icon;
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:shadow-xl hover:-translate-y-0.5 transition-all group cursor-pointer`}>
      {/* Gradient header strip */}
      <div className={`h-1.5 bg-gradient-to-r ${path.color}`} />

      <div className="p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${path.color} flex items-center justify-center flex-shrink-0 opacity-90`}>
            <Icon size={22} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">{path.title}</h3>
            <p className="text-xs text-[var(--color-muted)] mt-1 line-clamp-2 leading-relaxed">{path.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-[var(--color-muted)] font-mono flex-wrap">
          <span className="flex items-center gap-1"><LuBookOpen size={10} />{path.courses} courses</span>
          <span className="flex items-center gap-1"><LuClock size={10} />{path.totalHours}</span>
          <span className="flex items-center gap-1"><LuZap size={10} />{path.difficulty}</span>
        </div>

        {path.enrolled && (
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-[var(--color-muted)]">
              <span>Progress</span><span>{path.progress}%</span>
            </div>
            <div className="h-1.5 bg-[var(--color-border)]/40 rounded-full overflow-hidden">
              <div className={`h-full bg-gradient-to-r ${path.color} rounded-full transition-all duration-700`} style={{ width: `${path.progress}%` }} />
            </div>
          </div>
        )}

        <button className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
          path.enrolled
            ? `bg-gradient-to-r ${path.color} text-white hover:opacity-90 shadow-md`
            : 'border border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
        }`}>
          {path.enrolled ? '▶ Continue Path' : '+ Enroll in Path'}
        </button>
      </div>
    </div>
  );
}

function CoursesGrid({ courses, onSelect, filter }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = courses.filter(c => {
    const matchesFilter = filter === 'all' || (filter === 'my' ? c.enrolled : !c.enrolled);
    const matchesCategory = category === 'All' || c.category === category;
    const matchesSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-5">
      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <LuSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] placeholder-[var(--color-muted)] focus:outline-none focus:border-[var(--color-primary)]/50 transition-colors"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                category === cat
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[var(--color-muted)]">
          <LuSearch size={32} className="mx-auto mb-3 opacity-40" />
          <p>No courses found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(course => (
            <CourseCard key={course.id} course={course} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────
const TABS = [
  { id: 'paths', label: 'Learning Paths', icon: LuCompass },
  { id: 'courses', label: 'Courses', icon: LuBookOpen },
  { id: 'my', label: 'My Courses', icon: LuGraduationCap },
  { id: 'recommended', label: 'Recommended', icon: LuSparkles },
];

export default function LearnPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('paths');
  const [courses, setCourses] = useState(COURSES);
  const [paths, setPaths] = useState(LEARNING_PATHS);
  const [loading, setLoading] = useState(false);

  // Drill-down state
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showExperiment, setShowExperiment] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadCourses() {
      try {
        setLoading(true);
        const res = await apiFetch('/learner/courses');
        if (mounted && res?.data?.courses?.length) {
          setCourses(res.data.courses);
          if (res.data.paths?.length) {
            setPaths(res.data.paths.map(p => ({
              ...p,
              icon: p.id === 'p1' ? LuBookOpen : p.id === 'p2' ? LuBrain : p.id === 'p3' ? LuSparkles : LuTrendingUp,
              color: p.id === 'p1' ? 'from-[var(--color-primary)] to-violet-500' :
                     p.id === 'p2' ? 'from-cyan-500 to-[var(--color-secondary)]' :
                     p.id === 'p3' ? 'from-violet-500 to-rose-500' : 'from-emerald-500 to-cyan-500',
            })));
          }
        }
      } catch (err) {
        console.warn('LearnPage using fallback static data:', err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadCourses();
    return () => { mounted = false; };
  }, []);

  async function handleEnroll(courseId) {
    try {
      await apiFetch(`/learner/courses/${courseId}/enroll`, { method: 'POST' });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('learner:activity-updated'));
        try { localStorage.setItem('learner_activity_sync', String(Date.now())); } catch (e) {}
      }
    } catch {}
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, enrolled: true, progress: 0 } : c));
  }

  // View stack: 'list' | 'course' | 'lesson' | 'experiment'
  const view = showExperiment ? 'experiment' : selectedLesson ? 'lesson' : selectedCourse ? 'course' : 'list';

  function goBack() {
    if (showExperiment) { setShowExperiment(false); return; }
    if (selectedLesson) { setSelectedLesson(null); return; }
    if (selectedCourse) { setSelectedCourse(null); return; }
  }

  function handleSelectLesson(item) {
    if (item.type === 'experiment') {
      setShowExperiment(true);
    } else {
      setSelectedLesson(item);
    }
  }

  const pageTitle = view === 'experiment' ? 'Interactive Lab' :
                    view === 'lesson' ? selectedLesson?.title || 'Lesson' :
                    view === 'course' ? 'Course Overview' :
                    'Learn';

  return (
    <ProtectedRoute>
      <div className="h-screen overflow-hidden bg-[var(--color-background)] text-[var(--color-text)] flex">
        <LearnerSidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          isMobileOpen={isMobileOpen}
          onMobileClose={() => setIsMobileOpen(false)}
        />

        <div className={`flex-1 flex flex-col min-w-0 h-screen transition-all duration-300 ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
          <DashboardNavbar
            title={pageTitle}
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
            onMobileMenuClick={() => setIsMobileOpen(true)}
          />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">

            {/* Breadcrumb / Back button for drill-down views */}
            {view !== 'list' && (
              <button
                onClick={goBack}
                className="flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors group"
              >
                <LuArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                {view === 'course' ? 'Back to Courses' :
                 view === 'lesson' ? 'Back to Course' :
                 'Back to Course'}
              </button>
            )}

            {/* ── DRILL-DOWN VIEWS ── */}
            {view === 'experiment' && (
              <InteractiveExperiment onClose={goBack} />
            )}

            {view === 'lesson' && (
              <LessonView
                lesson={selectedLesson}
                onClose={goBack}
                onNext={() => setSelectedLesson(null)}
                onPrev={() => setSelectedLesson(null)}
                lessonIndex={3}
                totalLessons={6}
              />
            )}

            {view === 'course' && (
              <CourseDetail
                course={selectedCourse}
                onClose={goBack}
                onSelectLesson={handleSelectLesson}
              />
            )}

            {/* ── LIST VIEW ── */}
            {view === 'list' && (
              <>
                {/* Hero */}
                <div className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-surface)] via-[var(--color-surface)] to-cyan-500/10 p-6 sm:p-8">
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-[var(--color-primary)]/10 blur-3xl pointer-events-none" />
                  <div className="relative z-10 space-y-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      Interactive Quantum Academy
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[var(--color-text)]">
                      Your Learning Journey
                    </h1>
                    <p className="text-sm text-[var(--color-muted)] max-w-xl">
                      Structured paths, expert-taught courses, interactive experiments, and AI-powered personalization.
                    </p>
                    <div className="flex items-center gap-4 pt-2 text-xs font-mono text-[var(--color-muted)] flex-wrap">
                      <span className="flex items-center gap-1.5 text-emerald-400"><LuCheck size={12} />{courses.filter(c => c.enrolled).length} enrolled</span>
                      <span className="flex items-center gap-1.5"><LuBookOpen size={12} />{courses.length} courses available</span>
                      <span className="flex items-center gap-1.5"><LuFlaskConical size={12} />12 labs</span>
                    </div>
                  </div>
                </div>

                {/* Tab bar */}
                <div className="flex gap-1 p-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-fit">
                  {TABS.map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          activeTab === tab.id
                            ? 'bg-[var(--color-primary)] text-white shadow-md'
                            : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                        }`}
                      >
                        <Icon size={14} />
                        <span className="hidden sm:inline">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Learning Paths tab */}
                {activeTab === 'paths' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {paths.map(path => (
                      <LearningPathCard key={path.id} path={path} />
                    ))}
                  </div>
                )}

                {/* Courses tab */}
                {activeTab === 'courses' && (
                  <CoursesGrid courses={courses} onSelect={setSelectedCourse} filter="all" />
                )}

                {/* My Courses tab */}
                {activeTab === 'my' && (
                  <div className="space-y-5">
                    <div className="text-sm text-[var(--color-muted)]">
                      You are enrolled in <span className="text-[var(--color-text)] font-semibold">{courses.filter(c => c.enrolled).length} courses</span>.
                    </div>
                    <CoursesGrid courses={courses} onSelect={setSelectedCourse} filter="my" />
                  </div>
                )}

                {/* Recommended tab */}
                {activeTab === 'recommended' && (
                  <div className="space-y-5">
                    <div className="rounded-2xl border border-[var(--color-secondary)]/20 bg-gradient-to-r from-cyan-500/5 to-violet-500/5 p-4 flex items-start gap-3">
                      <LuSparkles size={18} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-semibold text-[var(--color-text)]">AI-Powered Recommendations</div>
                        <div className="text-xs text-[var(--color-muted)] mt-1">Based on your progress, quiz scores, and learning history, here's what we suggest next.</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {RECOMMENDED.map(course => (
                        <div key={course.id} className="space-y-2">
                          <div className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
                            <LuSparkles size={11} /> {course.recommendedReason}
                          </div>
                          <CourseCard course={course} onSelect={setSelectedCourse} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
