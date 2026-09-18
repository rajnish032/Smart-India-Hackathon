"use client";

import React, { useState, useRef, useEffect } from 'react';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { LearnerSidebar } from '../../components/sidebar';
import DashboardNavbar from '../../components/navbar/DashboardNavbar';
import QuantumVideoPlayer from '../../components/learner/ai/QuantumVideoPlayer';
import { apiFetch } from '../../services/api';
import {
  LuBot, LuSend, LuSparkles, LuBookOpen, LuCpu, LuCode,
  LuFlaskConical, LuUser, LuZap, LuRefreshCw, LuThumbsUp,
  LuThumbsDown, LuCopy, LuCheck, LuBrain, LuMessageSquare,
  LuVideo, LuKey, LuSettings, LuPlay, LuExternalLink, LuX,
  LuShieldAlert, LuActivity, LuFileText, LuUpload, LuCircleCheck,
  LuTriangleAlert, LuChevronDown, LuChevronRight, LuCompass,
  LuTarget, LuAward, LuHistory, LuPlus, LuTrash2,
} from 'react-icons/lu';

const AGENTIC_API_URL = process.env.NEXT_PUBLIC_AGENTIC_ENGINE_URL || 'http://localhost:8001';
const LEGACY_AI_URL = process.env.NEXT_PUBLIC_AI_ENGINE_URL || 'http://localhost:8000';
const AGENTIC_PORT_LABEL = (AGENTIC_API_URL.match(/:(\d+)/) || [])[1] || '8001';

const SUGGESTIONS = [
  { label: '⚛️ Bell State Circuit', query: 'make a simple qiskit circut and excute it' },
  { label: '📐 Superposition Concept', query: 'Explain quantum superposition with Dirac notation and a physical analogy' },
  { label: '🎯 Quiz Me', query: 'Quiz me on quantum gates, superposition, and entanglement' },
  { label: '🔄 Cirq GHZ Simulation', query: 'Simulate a 3-qubit GHZ state in Cirq and print measurement distribution' },
  { label: '🛡️ Test Guardrail', query: 'What is the weather forecast for tomorrow in Tokyo?' },
];

const VIDEO_PRESETS = [
  { topic: '3D Bloch Sphere & Qubit State Geometry', desc: 'Visualizing single-qubit states, poles, and rotation gates', level: 'Beginner' },
  { topic: 'Quantum Superposition & The Hadamard Gate', desc: 'From classical bits to probability amplitudes and wave interference', level: 'Beginner' },
  { topic: 'Bell State Entanglement & EPR Paradox', desc: 'Two-qubit non-local correlations and CNOT entanglement', level: 'Intermediate' },
  { topic: "Grover's Search Algorithm & Amplitude Amplification", desc: 'Quadratic speedup, oracles, and the inversion about the mean', level: 'Intermediate' },
  { topic: 'Quantum Teleportation Protocol', desc: 'Transmitting quantum states using classical bits and entanglement', level: 'Advanced' },
];

const INITIAL_MESSAGES = [
  {
    id: 'ai-0',
    role: 'ai',
    agent: 'supervisor',
    content: (
      "Welcome to the **Quantum Agentic Learning Studio** ⚛️🤖.\n\n"
      + "I coordinate a team of autonomous quantum agents to guide your learning:\n"
      + "- **Teaching Agent 📚**: Conceptual rigor, textbook RAG, and live Tavily research.\n"
      + "- **Coding Agent 💻**: Qiskit & Cirq circuit generation with a **5-iteration self-healing execution loop** and Matplotlib plots.\n"
      + "- **Assessment Agent 🎯**: Topic-specific adaptive MCQs and mastery gap analysis.\n"
      + "- **Research Agent 📄**: Academic paper breakdown and circuit implementation.\n"
      + "- **Quantum Guardrail 🛡️**: Enforces domain focus so you stay on track.\n\n"
      + "What quantum topic or circuit would you like to explore today?"
    ),
    thought_log: [
      { agent: 'Supervisor Agent', action: 'System Initialized', detail: 'Agent team ready with Qiskit & Cirq sandboxes.' }
    ],
    timestamp: new Date(),
  },
];

/* ==========================================================================
   CHAT SESSION PERSISTENCE (client-side history: localStorage)
   ========================================================================== */
const SESSIONS_STORAGE_KEY = 'qm_ai_tutor_sessions_v1';

function loadSessionsFromStorage() {
  try {
    const raw = window.localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSessionsToStorage(sessions) {
  try {
    window.localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // Storage unavailable or quota exceeded - chat still works in-memory for this tab.
  }
}

function makeSessionTitle(messages) {
  const firstUser = (messages || []).find(m => m.role === 'user');
  if (!firstUser || !firstUser.content) return 'New Quantum Chat';
  const text = firstUser.content.trim();
  return text.length > 42 ? `${text.slice(0, 42)}…` : text;
}

function createEmptySession() {
  const now = new Date().toISOString();
  return {
    id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: 'New Quantum Chat',
    messages: INITIAL_MESSAGES,
    activePlots: [],
    activeCode: '',
    codeFramework: 'qiskit',
    executionHistory: [],
    activeAssessment: null,
    createdAt: now,
    updatedAt: now,
  };
}

/* ==========================================================================
   LIGHTWEIGHT MARKDOWN -> HTML RENDERER
   Handles headings, bold/italic/inline-code, fenced code blocks, and
   ordered/unordered lists so agent responses render as real HTML instead of
   raw asterisks/hashes. No external markdown library dependency.
   ========================================================================== */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderInline(text) {
  let s = escapeHtml(text);
  s = s.replace(/`([^`]+)`/g, '<code class="qm-inline-code">$1</code>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
  return s;
}

function renderMarkdown(rawText) {
  const text = rawText || '';
  const codeBlocks = [];
  const withPlaceholders = text.replace(/```(\w+)?\n?([\s\S]*?)```/g, (_match, lang, code) => {
    const idx = codeBlocks.length;
    codeBlocks.push({ lang: (lang || 'text').trim(), code: code.replace(/\n$/, '') });
    return `@@QM_CODEBLOCK_${idx}@@`;
  });

  const blocks = withPlaceholders.split(/\n{2,}/);

  const html = blocks.map(block => {
    const trimmed = block.trim();
    if (!trimmed) return '';

    const codeMatch = trimmed.match(/^@@QM_CODEBLOCK_(\d+)@@$/);
    if (codeMatch) {
      const { lang, code } = codeBlocks[Number(codeMatch[1])];
      return (
        `<div class="qm-codeblock">`
        + `<div class="qm-codeblock-lang">${escapeHtml(lang)}</div>`
        + `<pre><code>${escapeHtml(code)}</code></pre>`
        + `</div>`
      );
    }

    const lines = trimmed.split('\n');

    if (lines.length === 1) {
      const headingMatch = lines[0].match(/^(#{1,4})\s+(.+)$/);
      if (headingMatch) {
        const tag = ['h5', 'h4', 'h4', 'h5'][headingMatch[1].length - 1] || 'h5';
        return `<${tag} class="qm-heading">${renderInline(headingMatch[2])}</${tag}>`;
      }
    }

    const isUnordered = lines.every(l => /^\s*[-*]\s+/.test(l));
    if (isUnordered) {
      const items = lines.map(l => `<li>${renderInline(l.replace(/^\s*[-*]\s+/, ''))}</li>`).join('');
      return `<ul class="qm-list">${items}</ul>`;
    }

    const isOrdered = lines.every(l => /^\s*\d+[.)]\s+/.test(l));
    if (isOrdered) {
      const items = lines.map(l => `<li>${renderInline(l.replace(/^\s*\d+[.)]\s+/, ''))}</li>`).join('');
      return `<ol class="qm-list qm-list-ol">${items}</ol>`;
    }

    return `<p class="qm-paragraph">${lines.map(renderInline).join('<br/>')}</p>`;
  }).join('');

  return html;
}

export default function AITutorPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Studio workspace tab
  const [workspaceTab, setWorkspaceTab] = useState('viz');

  // Chat session management (client-side history)
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const sessionsHydrated = useRef(false);

  // Multi-agent state
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [studentLevel, setStudentLevel] = useState('Beginner');
  const [activeAgent, setActiveAgent] = useState('supervisor');
  const [currentTopic, setCurrentTopic] = useState('Quantum Foundations');

  // Artifacts captured from agents
  const [activePlots, setActivePlots] = useState([]);
  const [activeCode, setActiveCode] = useState('');
  const [codeFramework, setCodeFramework] = useState('qiskit');
  const [executionHistory, setExecutionHistory] = useState([]);
  const [selectedAttemptIdx, setSelectedAttemptIdx] = useState(0);

  // Assessment state
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [selectedQuizOption, setSelectedQuizOption] = useState(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  // Research paper upload state
  const [paperFile, setPaperFile] = useState(null);
  const [uploadingPaper, setUploadingPaper] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  // Video generator state (legacy feature preserved)
  const [videoTopic, setVideoTopic] = useState('');
  const [videoLevel, setVideoLevel] = useState('Beginner');
  const [videoDuration, setVideoDuration] = useState('standard');
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);

  // Engine health
  const [engineConnected, setEngineConnected] = useState(false);

  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  // Hydrate chat sessions from localStorage on mount
  useEffect(() => {
    const stored = loadSessionsFromStorage();
    if (stored.length > 0) {
      const latest = stored[0];
      setSessions(stored);
      setCurrentSessionId(latest.id);
      setMessages(latest.messages && latest.messages.length ? latest.messages : INITIAL_MESSAGES);
      setActivePlots(latest.activePlots || []);
      setActiveCode(latest.activeCode || '');
      setCodeFramework(latest.codeFramework || 'qiskit');
      setExecutionHistory(latest.executionHistory || []);
      setActiveAssessment(latest.activeAssessment || null);
    } else {
      const fresh = createEmptySession();
      setSessions([fresh]);
      setCurrentSessionId(fresh.id);
    }
    sessionsHydrated.current = true;
  }, []);

  // Persist the active session's live state back into history on every change
  useEffect(() => {
    if (!sessionsHydrated.current || !currentSessionId) return;
    setSessions(prev => {
      const updated = prev.map(s => (
        s.id === currentSessionId
          ? {
              ...s,
              title: makeSessionTitle(messages),
              messages,
              activePlots,
              activeCode,
              codeFramework,
              executionHistory,
              activeAssessment,
              updatedAt: new Date().toISOString(),
            }
          : s
      ));
      saveSessionsToStorage(updated);
      return updated;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, activePlots, activeCode, codeFramework, executionHistory, activeAssessment]);

  function startNewChat() {
    const fresh = createEmptySession();
    setSessions(prev => {
      const updated = [fresh, ...prev];
      saveSessionsToStorage(updated);
      return updated;
    });
    setCurrentSessionId(fresh.id);
    setMessages(INITIAL_MESSAGES);
    setActivePlots([]);
    setActiveCode('');
    setCodeFramework('qiskit');
    setExecutionHistory([]);
    setActiveAssessment(null);
    setSelectedQuizOption(null);
    setWorkspaceTab('viz');
    setShowHistoryPanel(false);
  }

  function switchToSession(id) {
    const target = sessions.find(s => s.id === id);
    if (!target) return;
    setCurrentSessionId(id);
    setMessages(target.messages && target.messages.length ? target.messages : INITIAL_MESSAGES);
    setActivePlots(target.activePlots || []);
    setActiveCode(target.activeCode || '');
    setCodeFramework(target.codeFramework || 'qiskit');
    setExecutionHistory(target.executionHistory || []);
    setActiveAssessment(target.activeAssessment || null);
    setSelectedQuizOption(null);
    setWorkspaceTab('viz');
    setShowHistoryPanel(false);
  }

  function deleteSession(id, e) {
    e.stopPropagation();
    const remaining = sessions.filter(s => s.id !== id);

    if (id === currentSessionId) {
      if (remaining.length > 0) {
        const next = remaining[0];
        setCurrentSessionId(next.id);
        setMessages(next.messages && next.messages.length ? next.messages : INITIAL_MESSAGES);
        setActivePlots(next.activePlots || []);
        setActiveCode(next.activeCode || '');
        setCodeFramework(next.codeFramework || 'qiskit');
        setExecutionHistory(next.executionHistory || []);
        setActiveAssessment(next.activeAssessment || null);
        setSessions(remaining);
        saveSessionsToStorage(remaining);
      } else {
        const fresh = createEmptySession();
        setCurrentSessionId(fresh.id);
        setMessages(INITIAL_MESSAGES);
        setActivePlots([]);
        setActiveCode('');
        setCodeFramework('qiskit');
        setExecutionHistory([]);
        setActiveAssessment(null);
        setSessions([fresh]);
        saveSessionsToStorage([fresh]);
      }
    } else {
      setSessions(remaining);
      saveSessionsToStorage(remaining);
    }
  }

  // Check Agentic Engine health on mount
  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch(`${AGENTIC_API_URL}/api/v1/agentic/health`);
        if (res.ok) {
          setEngineConnected(true);
        }
      } catch {
        setEngineConnected(false);
      }
    }
    checkHealth();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Submit query to Agentic Engine
  async function sendMessage(text = input) {
    if (!text.trim() || loading) return;
    const queryText = text.trim();
    const userMsg = { id: `u-${Date.now()}`, role: 'user', content: queryText, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      let data = null;

      // 1. Try Agentic Engine
      try {
        const agenticRes = await fetch(`${AGENTIC_API_URL}/api/v1/agentic/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: queryText,
            student_level: studentLevel,
            topic: currentTopic,
          }),
        });

        if (agenticRes.ok) {
          data = await agenticRes.json();
          setEngineConnected(true);
        }
      } catch (err) {
        console.warn('Agentic engine unreachable, falling back to basic AI engine:', err);
      }

      // 2. Fallback to AI Engine if agentic engine is offline
      if (!data) {
        const fallbackRes = await fetch(`${LEGACY_AI_URL}/api/v1/ai/tutor/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: queryText,
            context: 'general',
          }),
        });
        if (fallbackRes.ok) {
          const fbData = await fallbackRes.json();
          data = {
            active_agent: 'teacher',
            route: 'teacher',
            final_response: fbData.reply,
            guardrail_blocked: false,
            thought_log: [
              { agent: 'Fallback AI Tutor', action: 'Standard Response', detail: 'Agentic Engine offline; served via AI Engine.' }
            ],
            plots_base64: [],
            execution_history: [],
          };
        }
      }

      if (data) {
        setActiveAgent(data.active_agent || 'supervisor');

        // Update plots & code artifacts if provided
        if (data.plots_base64 && data.plots_base64.length > 0) {
          setActivePlots(data.plots_base64);
          setWorkspaceTab('viz');
        }
        if (data.code_snippet) {
          setActiveCode(data.code_snippet);
          setCodeFramework(data.code_framework || 'qiskit');
          if (data.execution_history && data.execution_history.length > 0) {
            setExecutionHistory(data.execution_history);
            setSelectedAttemptIdx(data.execution_history.length - 1);
          }
          if (!data.plots_base64 || data.plots_base64.length === 0) {
            setWorkspaceTab('code');
          }
        }
        if (data.assessment) {
          setActiveAssessment(data.assessment);
          setSelectedQuizOption(null);
          setWorkspaceTab('quiz');
        }

        const aiMsg = {
          id: `ai-${Date.now()}`,
          role: 'ai',
          agent: data.active_agent,
          content: data.final_response,
          guardrail_blocked: data.guardrail_blocked,
          thought_log: data.thought_log || [],
          code_snippet: data.code_snippet,
          plots_base64: data.plots_base64 || [],
          rag_sources: data.rag_sources || [],
          assessment: data.assessment,
          execution_success: data.execution_success,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, aiMsg]);
      } else {
        throw new Error('Could not connect to quantum backend services.');
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: 'ai',
          agent: 'supervisor',
          content: `⚠️ **Connection Notice:** Could not reach the quantum agent engine. Please ensure the agentic server is running at \`${AGENTIC_API_URL}\` (run \`uvicorn app.main:app --port ${AGENTIC_PORT_LABEL}\`).\n\n*Error details: ${err.message}*`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // Submit assessment answer
  async function submitQuizAnswer() {
    if (selectedQuizOption === null || !activeAssessment || submittingQuiz) return;
    setSubmittingQuiz(true);

    try {
      const res = await fetch(`${AGENTIC_API_URL}/api/v1/agentic/assess/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessment: activeAssessment,
          selected_option: selectedQuizOption,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveAssessment(data.assessment);
      }
    } catch (err) {
      console.error('Quiz submission failed:', err);
    } finally {
      setSubmittingQuiz(false);
    }
  }

  // Upload research paper PDF
  async function handlePaperUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPaperFile(file);
    setUploadingPaper(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${AGENTIC_API_URL}/api/v1/agentic/upload-paper`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setUploadStatus({
          success: true,
          message: data.message,
          title: data.title,
          chunks: data.chunks_count,
        });
        setMessages(prev => [
          ...prev,
          {
            id: `ai-paper-${Date.now()}`,
            role: 'ai',
            agent: 'researcher',
            content: `📄 **Research Paper Ingested:** \`${file.name}\`\n\nI parsed and indexed **${data.chunks_count} sections** into the local quantum vector store. You can now ask me to explain its methodology, summarize key theorems, or implement its quantum algorithms in Qiskit!`,
            timestamp: new Date(),
          },
        ]);
      } else {
        const err = await res.json().catch(() => ({}));
        setUploadStatus({
          success: false,
          message: err.detail || 'Failed to upload and parse paper.',
        });
      }
    } catch (err) {
      setUploadStatus({
        success: false,
        message: `Network error: ${err.message}`,
      });
    } finally {
      setUploadingPaper(false);
    }
  }

  // Generate explanation video (legacy feature)
  async function generateVideo(topic = videoTopic) {
    if (!topic.trim() || generatingVideo) return;
    setGeneratingVideo(true);
    try {
      const data = await apiFetch(`${LEGACY_AI_URL}/api/v1/ai/tutor/generate-video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, level: videoLevel, duration: videoDuration }),
      });
      if (data?.data) {
        setCurrentVideo(data.data);
        setWorkspaceTab('video');
      }
    } catch (err) {
      alert('Video generation failed: ' + err.message);
    } finally {
      setGeneratingVideo(false);
    }
  }

  return (
    <ProtectedRoute>
      <div className="h-screen bg-[var(--color-background)] text-[var(--color-text)] overflow-hidden font-sans flex">
        {/* Navigation Sidebar */}
        <LearnerSidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          isMobileOpen={isMobileOpen}
          onMobileClose={() => setIsMobileOpen(false)}
        />

        <div
          className={`flex-1 flex flex-col min-w-0 h-screen overflow-hidden transition-all duration-300 ${
            isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
          }`}
        >
          <DashboardNavbar
            title="Quantum Agent Studio"
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
            onMobileMenuClick={() => setIsMobileOpen(true)}
          />

          {/* Top Agent Studio Bar */}
          <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur px-6 py-2.5 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${engineConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${engineConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                </span>
                <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-500 font-semibold">
                  {engineConnected ? `Agentic Engine Online (Port ${AGENTIC_PORT_LABEL})` : 'Offline / Reconnecting'}
                </span>
              </div>

              {/* Active Agent Badge */}
              <AgentBadge agent={activeAgent} />
            </div>

            {/* Level Selector & Capabilities */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
                <span>Level:</span>
                <select
                  value={studentLevel}
                  onChange={e => setStudentLevel(e.target.value)}
                  className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg px-2.5 py-1 text-cyan-500 text-xs font-medium focus:outline-none"
                >
                  <option value="Beginner">Beginner (Intuitive)</option>
                  <option value="Intermediate">Intermediate (Circuit Math)</option>
                  <option value="Advanced">Advanced (Hamiltonian & ISA)</option>
                </select>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-500 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <LuUpload size={13} />
                <span>Upload Paper (PDF)</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handlePaperUpload}
              />
            </div>
          </div>

          {/* Main Studio Dual-Panel Workspace */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
            {/* LEFT: Multi-Agent Conversation Feed (6 cols) */}
            <div className="lg:col-span-6 flex flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
              {/* History / New Chat Bar */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-surface)] relative z-20">
                <div className="relative">
                  <button
                    onClick={() => setShowHistoryPanel(v => !v)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
                  >
                    <LuHistory size={14} />
                    <span>History ({sessions.length})</span>
                    <LuChevronDown size={12} className={`transition-transform ${showHistoryPanel ? 'rotate-180' : ''}`} />
                  </button>

                  {showHistoryPanel && (
                    <div className="absolute left-0 top-full mt-2 w-72 max-h-80 overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl p-2 space-y-1">
                      {sessions.length === 0 && (
                        <p className="text-xs text-[var(--color-muted)] p-3 text-center">No past chats yet.</p>
                      )}
                      {sessions.map(s => (
                        <div
                          key={s.id}
                          onClick={() => switchToSession(s.id)}
                          role="button"
                          tabIndex={0}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                            s.id === currentSessionId
                              ? 'bg-cyan-500/15 text-cyan-500 font-semibold'
                              : 'text-[var(--color-text)] hover:bg-[var(--color-background)]'
                          }`}
                        >
                          <span className="truncate flex-1">{s.title}</span>
                          <button
                            onClick={(e) => deleteSession(s.id, e)}
                            className="text-[var(--color-muted)] hover:text-rose-500 flex-shrink-0"
                            title="Delete chat"
                            aria-label="Delete chat"
                          >
                            <LuTrash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={startNewChat}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-500 text-xs font-semibold transition-all"
                >
                  <LuPlus size={13} />
                  <span>New Chat</span>
                </button>
              </div>

              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(msg => (
                  <MessageCard
                    key={msg.id}
                    msg={msg}
                    onGenerateVideoForTopic={topic => {
                      setVideoTopic(topic);
                      generateVideo(topic);
                    }}
                    onSelectTopic={t => sendMessage(t)}
                  />
                ))}
                {loading && <ThinkingIndicator agent={activeAgent} />}
                <div ref={bottomRef} />
              </div>

              {/* Suggestions Pill Bar */}
              <div className="px-4 py-2 border-t border-[var(--color-border)] bg-[var(--color-surface)] overflow-x-auto flex gap-2 no-scrollbar">
                {SUGGESTIONS.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(s.query)}
                    className="whitespace-nowrap px-3 py-1 rounded-full bg-[var(--color-background)] hover:bg-cyan-500/15 border border-[var(--color-border)] hover:border-cyan-500/40 text-[11px] text-[var(--color-muted)] hover:text-cyan-500 transition-all flex items-center gap-1"
                  >
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-3 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    sendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask a quantum question, request circuit execution, or quiz a topic..."
                    className="flex-1 bg-[var(--color-background)] border border-[var(--color-border)] focus:border-cyan-400 rounded-xl px-4 py-2.5 text-sm text-[var(--color-text)] placeholder-[var(--color-muted)] focus:outline-none transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all"
                  >
                    <LuSend size={15} />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            </div>

            {/* RIGHT: Quantum Workspace & Artifacts Studio (6 cols) */}
            <div className="lg:col-span-6 flex flex-col bg-[var(--color-background)] overflow-hidden">
              {/* Studio Tabs */}
              <div className="flex items-center border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 pt-2 gap-1 overflow-x-auto">
                <WorkspaceTabButton
                  active={workspaceTab === 'viz'}
                  onClick={() => setWorkspaceTab('viz')}
                  icon={<LuActivity size={14} />}
                  label="Visualization"
                  badge={activePlots.length > 0 ? activePlots.length : null}
                />
                <WorkspaceTabButton
                  active={workspaceTab === 'code'}
                  onClick={() => setWorkspaceTab('code')}
                  icon={<LuCode size={14} />}
                  label="Code & Debug"
                  badge={executionHistory.length > 0 ? `${executionHistory.length} it.` : null}
                />
                <WorkspaceTabButton
                  active={workspaceTab === 'quiz'}
                  onClick={() => setWorkspaceTab('quiz')}
                  icon={<LuTarget size={14} />}
                  label="Assessment"
                  badge={activeAssessment ? 'Active' : null}
                />
                <WorkspaceTabButton
                  active={workspaceTab === 'paper'}
                  onClick={() => setWorkspaceTab('paper')}
                  icon={<LuFileText size={14} />}
                  label="Paper RAG"
                  badge={uploadStatus?.chunks ? `${uploadStatus.chunks}` : null}
                />
                <WorkspaceTabButton
                  active={workspaceTab === 'video'}
                  onClick={() => setWorkspaceTab('video')}
                  icon={<LuVideo size={14} />}
                  label="Video Studio"
                />
              </div>

              {/* Workspace Content Area */}
              <div className="flex-1 overflow-y-auto p-4">
                {workspaceTab === 'viz' && (
                  <VisualizationPanel plots={activePlots} onExploreSim={() => sendMessage("Generate a 2-qubit Bell state circuit in Qiskit with measurement plots")} />
                )}

                {workspaceTab === 'code' && (
                  <CodeDebugPanel
                    code={activeCode}
                    framework={codeFramework}
                    history={executionHistory}
                    selectedIdx={selectedAttemptIdx}
                    onSelectIdx={setSelectedAttemptIdx}
                  />
                )}

                {workspaceTab === 'quiz' && (
                  <QuizAssessmentPanel
                    assessment={activeAssessment}
                    selectedOption={selectedQuizOption}
                    onSelectOption={setSelectedQuizOption}
                    onSubmit={submitQuizAnswer}
                    loading={submittingQuiz}
                    onNewQuiz={() => sendMessage("Quiz me on quantum computing gates and superposition")}
                  />
                )}

                {workspaceTab === 'paper' && (
                  <PaperRAGPanel
                    file={paperFile}
                    uploading={uploadingPaper}
                    status={uploadStatus}
                    onUploadClick={() => fileInputRef.current?.click()}
                    onAskPaper={q => sendMessage(q)}
                  />
                )}

                {workspaceTab === 'video' && (
                  <div className="space-y-4">
                    {currentVideo ? (
                      <QuantumVideoPlayer videoData={currentVideo} onClose={() => setCurrentVideo(null)} />
                    ) : (
                      <div className="p-8 text-center border border-[var(--color-border)] rounded-2xl bg-[var(--color-surface)]">
                        <LuVideo className="mx-auto text-cyan-500 mb-3" size={36} />
                        <h3 className="font-bold text-[var(--color-text)]">Interactive Quantum Storyboard Generator</h3>
                        <p className="text-xs text-[var(--color-muted)] mt-1 max-w-md mx-auto">
                          Transform any quantum algorithm or concept into an animated visual presentation with slides, narration, and quizzes.
                        </p>
                        <div className="mt-4 flex justify-center gap-2 flex-wrap">
                          {VIDEO_PRESETS.map((p, i) => (
                            <button
                              key={i}
                              onClick={() => generateVideo(p.topic)}
                              className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-500 text-xs font-medium"
                            >
                              {p.topic}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scoped styles for rendered markdown content (headings/lists/code inside chat bubbles) */}
      <style jsx global>{`
        .qm-heading {
          font-weight: 700;
          margin: 0.35rem 0 0.25rem;
          color: var(--color-text);
        }
        .qm-paragraph {
          margin: 0.15rem 0;
        }
        .qm-list {
          margin: 0.25rem 0 0.25rem 1rem;
          list-style-type: disc;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }
        .qm-list-ol {
          list-style-type: decimal;
        }
        .qm-inline-code {
          background: color-mix(in srgb, var(--color-primary) 12%, transparent);
          color: var(--color-secondary);
          padding: 0.1rem 0.35rem;
          border-radius: 0.35rem;
          font-family: var(--font-mono);
          font-size: 0.7rem;
        }
        .qm-codeblock {
          background: var(--color-background);
          border: 1px solid var(--color-border);
          border-radius: 0.75rem;
          margin: 0.4rem 0;
          overflow: hidden;
        }
        .qm-codeblock-lang {
          font-size: 0.6rem;
          font-family: var(--font-mono);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0.3rem 0.6rem;
          color: var(--color-muted);
          border-bottom: 1px solid var(--color-border);
        }
        .qm-codeblock pre {
          margin: 0;
          padding: 0.75rem;
          font-family: var(--font-mono);
          font-size: 0.68rem;
          color: var(--color-secondary);
          overflow-x: auto;
          white-space: pre;
        }
      `}</style>
    </ProtectedRoute>
  );
}

/* ==========================================================================
   AGENT BADGE COMPONENT
   ========================================================================== */
function AgentBadge({ agent }) {
  const configs = {
    supervisor: { name: 'Supervisor Agent', icon: <LuCompass size={13} />, color: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-500' },
    teacher: { name: 'Teaching Agent', icon: <LuBookOpen size={13} />, color: 'bg-blue-500/15 border-blue-500/30 text-blue-500' },
    coder: { name: 'Coding Agent', icon: <LuCode size={13} />, color: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-500' },
    assessor: { name: 'Assessment Agent', icon: <LuTarget size={13} />, color: 'bg-amber-500/15 border-amber-500/30 text-amber-500' },
    researcher: { name: 'Research/Paper Agent', icon: <LuFileText size={13} />, color: 'bg-rose-500/15 border-rose-500/30 text-rose-500' },
  };
  const current = configs[agent] || configs.supervisor;

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${current.color}`}>
      {current.icon}
      <span>{current.name}</span>
    </div>
  );
}

/* ==========================================================================
   TAB BUTTON COMPONENT
   ========================================================================== */
function WorkspaceTabButton({ active, onClick, icon, label, badge }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 ${
        active
          ? 'bg-[var(--color-background)] text-cyan-500 border-cyan-400'
          : 'text-[var(--color-muted)] hover:text-[var(--color-text)] border-transparent hover:bg-[var(--color-background)]/60'
      }`}
    >
      {icon}
      <span>{label}</span>
      {badge && (
        <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-500 text-[10px] font-mono">
          {badge}
        </span>
      )}
    </button>
  );
}

/* ==========================================================================
   MESSAGE CARD & THOUGHT EXPANDER
   ========================================================================== */
function MessageCard({ msg, onGenerateVideoForTopic, onSelectTopic }) {
  const isAI = msg.role === 'ai';
  const [copied, setCopied] = useState(false);
  const [showThoughts, setShowThoughts] = useState(false);

  function copyText() {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const formatted = renderMarkdown(msg.content || '');

  return (
    <div className={`flex gap-3 ${isAI ? '' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-md ${
        isAI
          ? msg.guardrail_blocked
            ? 'bg-rose-600'
            : 'bg-gradient-to-br from-cyan-500 to-blue-600'
          : 'bg-gradient-to-br from-violet-600 to-indigo-600'
      }`}>
        {isAI ? (msg.guardrail_blocked ? <LuShieldAlert size={15} /> : <LuBot size={15} />) : <LuUser size={15} />}
      </div>

      <div className={`max-w-[88%] space-y-2 ${isAI ? '' : 'items-end flex flex-col'}`}>
        {/* Guardrail Rejection Notice Box */}
        {msg.guardrail_blocked && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-500 text-xs flex items-start gap-2.5">
            <LuShieldAlert className="text-rose-500 flex-shrink-0 mt-0.5" size={16} />
            <div>
              <p className="font-bold text-rose-500">Quantum Domain Guardrail Triggered</p>
              <p className="mt-1 text-[11px] leading-relaxed text-rose-500/90">
                This inquiry was identified as outside the scope of quantum computing and physics.
                Our agents are specialized in quantum algorithms, Qiskit/Cirq simulation, and quantum hardware.
              </p>
            </div>
          </div>
        )}

        {/* Message Bubble (rendered as real HTML from markdown, not raw text) */}
        <div className={`px-4 py-3 rounded-2xl text-xs leading-relaxed ${
          isAI
            ? 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-tl-sm'
            : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-sm font-medium'
        }`}
          dangerouslySetInnerHTML={{ __html: formatted }}
        />

        {/* Agent Thought Trace Accordion (AI only) */}
        {isAI && msg.thought_log && msg.thought_log.length > 0 && (
          <div className="w-full">
            <button
              onClick={() => setShowThoughts(!showThoughts)}
              className="flex items-center gap-1.5 text-[10px] text-cyan-500/80 hover:text-cyan-500 font-mono transition-colors"
            >
              {showThoughts ? <LuChevronDown size={11} /> : <LuChevronRight size={11} />}
              <span>Agent Workflow Trace ({msg.thought_log.length} steps)</span>
            </button>
            {showThoughts && (
              <div className="mt-1.5 p-2.5 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-[10px] space-y-1.5 font-mono">
                {msg.thought_log.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[var(--color-text)]">
                    <span className="text-cyan-500 font-bold">[{step.agent}]</span>
                    <span className="text-[var(--color-muted)]">{step.action}:</span>
                    <span className="text-[var(--color-text)]">{step.detail}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Citations & Sources */}
        {isAI && msg.rag_sources && msg.rag_sources.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-mono text-[var(--color-muted)]">Sources:</span>
            {msg.rag_sources.map((src, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 text-[9px] font-mono">
                📖 {src.title} (p.{src.page})
              </span>
            ))}
          </div>
        )}

        {/* Bottom AI Actions */}
        {isAI && (
          <div className="flex items-center gap-2 text-[var(--color-muted)] text-xs">
            <button onClick={copyText} className="hover:text-cyan-500 transition-colors flex items-center gap-1 text-[10px]">
              {copied ? <LuCheck size={11} className="text-emerald-500" /> : <LuCopy size={11} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            {onGenerateVideoForTopic && (
              <button
                onClick={() => onGenerateVideoForTopic(msg.content.slice(0, 50))}
                className="hover:text-cyan-500 transition-colors flex items-center gap-1 text-[10px] font-semibold text-cyan-500"
              >
                <LuVideo size={11} />
                <span>Create Video</span>
              </button>
            )}
            <span className="text-[9px] font-mono text-[var(--color-muted)] ml-auto">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   THINKING / PROGRESS INDICATOR
   ========================================================================== */
function ThinkingIndicator({ agent }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--color-surface)] border border-cyan-500/20 max-w-sm animate-pulse">
      <div className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-500">
        <LuCpu size={14} className="animate-spin" />
      </div>
      <div className="text-xs">
        <p className="font-semibold text-cyan-500">Coordinating Multi-Agent Workflow...</p>
        <p className="text-[10px] text-[var(--color-muted)] font-mono">Guardrails verified • Running agent state graph</p>
      </div>
    </div>
  );
}

/* ==========================================================================
   WORKSPACE: VISUALIZATION PANEL
   ========================================================================== */
function VisualizationPanel({ plots, onExploreSim }) {
  if (!plots || plots.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-[var(--color-muted)] border border-dashed border-[var(--color-border)] rounded-2xl">
        <LuActivity size={40} className="text-cyan-500/40 mb-3" />
        <h4 className="font-bold text-[var(--color-text)]">No Quantum Visualizations Generated Yet</h4>
        <p className="text-xs text-[var(--color-muted)] mt-1 max-w-xs">
          When the Coding Agent executes quantum circuits, measurement histograms, Bloch spheres, and state distributions render here automatically.
        </p>
        <button
          onClick={onExploreSim}
          className="mt-4 px-4 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-500 text-xs font-semibold transition-all"
        >
          Simulate Bell State & Plot
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-[var(--color-text)] text-sm flex items-center gap-2">
          <LuActivity className="text-cyan-500" size={16} />
          <span>Simulation Visualizations ({plots.length})</span>
        </h4>
        <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
          Matplotlib Agg Engine • 130 DPI
        </span>
      </div>

      <div className="space-y-4">
        {plots.map((plotUri, idx) => (
          <div key={idx} className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-xl overflow-hidden">
            <img
              src={plotUri}
              alt={`Quantum Simulation Plot ${idx + 1}`}
              className="w-full h-auto rounded-xl object-contain border border-[var(--color-border)] bg-white"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-[var(--color-muted)]">
              <span className="text-[11px] font-mono">Plot {idx + 1}: Quantum Probability Distribution</span>
              <a
                href={plotUri}
                download={`quantum_plot_${idx + 1}.png`}
                className="text-cyan-500 hover:text-cyan-400 text-[11px] font-mono underline"
              >
                Download PNG
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==========================================================================
   WORKSPACE: CODE & SELF-HEALING DEBUG PANEL
   ========================================================================== */
function CodeDebugPanel({ code, framework, history, selectedIdx, onSelectIdx }) {
  if (!code && (!history || history.length === 0)) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-[var(--color-muted)] border border-dashed border-[var(--color-border)] rounded-2xl">
        <LuCode size={40} className="text-emerald-500/40 mb-3" />
        <h4 className="font-bold text-[var(--color-text)]">No Circuit Code Executed Yet</h4>
        <p className="text-xs text-[var(--color-muted)] mt-1 max-w-xs">
          Ask for a Qiskit or Cirq circuit to observe the Coding Agent generate code, execute it in the sandbox, and auto-fix errors.
        </p>
      </div>
    );
  }

  const currentAttempt = history && history[selectedIdx] ? history[selectedIdx] : null;

  return (
    <div className="space-y-4">
      {/* Header & Framework Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider font-mono">
            {framework} Sandbox Execution
          </span>
          {currentAttempt && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              currentAttempt.success
                ? 'bg-emerald-500/10 border border-emerald-500/40 text-emerald-500'
                : 'bg-rose-500/10 border border-rose-500/40 text-rose-500'
            }`}>
              {currentAttempt.success ? '✓ Succeeded' : '✗ Failed (Diagnosed)'}
            </span>
          )}
        </div>
        {currentAttempt && (
          <span className="text-[10px] font-mono text-[var(--color-muted)]">
            Runtime: {currentAttempt.execution_time_ms}ms
          </span>
        )}
      </div>

      {/* Iteration Attempts Tabs (Self-Healing Visualization) */}
      {history && history.length > 1 && (
        <div className="flex items-center gap-1.5 p-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-x-auto">
          <span className="text-[10px] text-[var(--color-muted)] font-mono px-2">Debugging Loop:</span>
          {history.map((att, idx) => (
            <button
              key={idx}
              onClick={() => onSelectIdx(idx)}
              className={`px-3 py-1 rounded-lg text-[10px] font-mono font-semibold transition-all flex items-center gap-1.5 ${
                selectedIdx === idx
                  ? 'bg-cyan-500/20 text-cyan-500 border border-cyan-500/40'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              <span>Attempt {att.iteration}</span>
              {att.success ? <LuCircleCheck className="text-emerald-500" size={11} /> : <LuTriangleAlert className="text-rose-500" size={11} />}
            </button>
          ))}
        </div>
      )}

      {/* Code Display */}
      <div className="relative rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-[var(--color-background)] border-b border-[var(--color-border)] text-[10px] font-mono text-[var(--color-muted)]">
          <span>{framework}.py</span>
          <button
            onClick={() => navigator.clipboard.writeText(currentAttempt ? currentAttempt.code : code)}
            className="hover:text-cyan-500 flex items-center gap-1"
          >
            <LuCopy size={11} />
            <span>Copy</span>
          </button>
        </div>
        <pre className="p-4 text-xs font-mono text-cyan-500 overflow-x-auto leading-relaxed">
          <code>{currentAttempt ? currentAttempt.code : code}</code>
        </pre>
      </div>

      {/* Terminal Output */}
      {currentAttempt && (
        <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden">
          <div className="px-3 py-2 bg-[var(--color-background)] border-b border-[var(--color-border)] text-[10px] font-mono text-[var(--color-muted)]">
            <span>Terminal Output (stdout / stderr)</span>
          </div>
          <div className="p-3 text-xs font-mono">
            {currentAttempt.stdout && (
              <div className="text-emerald-500 whitespace-pre-wrap">
                {currentAttempt.stdout}
              </div>
            )}
            {currentAttempt.stderr && (
              <div className="text-rose-500 whitespace-pre-wrap mt-2">
                {currentAttempt.stderr}
              </div>
            )}
            {currentAttempt.diagnostics && (
              <div className="mt-2 p-2 rounded bg-rose-500/10 border border-rose-500/30 text-rose-500 text-[11px]">
                <strong>Diagnosis:</strong> {currentAttempt.diagnostics}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   WORKSPACE: QUIZ ASSESSMENT PANEL
   ========================================================================== */
function QuizAssessmentPanel({ assessment, selectedOption, onSelectOption, onSubmit, loading, onNewQuiz }) {
  if (!assessment) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-[var(--color-muted)] border border-dashed border-[var(--color-border)] rounded-2xl">
        <LuTarget size={40} className="text-amber-500/40 mb-3" />
        <h4 className="font-bold text-[var(--color-text)]">No Assessment Active</h4>
        <p className="text-xs text-[var(--color-muted)] mt-1 max-w-xs">
          Ask the Assessment Agent to quiz you on any quantum topic to evaluate your conceptual mastery.
        </p>
        <button
          onClick={onNewQuiz}
          className="mt-4 px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-500 text-xs font-semibold transition-all"
        >
          Start Concept Quiz
        </button>
      </div>
    );
  }

  const isEvaluated = assessment.student_selected !== null && assessment.student_selected !== undefined;

  return (
    <div className="space-y-4">
      {/* Quiz Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase text-amber-500 font-bold">Topic Assessment</span>
          <h4 className="font-bold text-[var(--color-text)] text-sm">{assessment.topic}</h4>
        </div>
        {isEvaluated && (
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-500 text-xs font-mono font-bold">
            <LuAward size={13} />
            <span>Mastery: {Math.round(assessment.mastery_score * 100)}%</span>
          </div>
        )}
      </div>

      {/* Question Card */}
      <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text)] leading-relaxed font-medium">
        {assessment.question}
      </div>

      {/* Multiple Choice Options */}
      <div className="space-y-2">
        {assessment.options.map((opt, idx) => {
          const isSelected = selectedOption === idx || assessment.student_selected === idx;
          const isCorrectOption = assessment.correct_option === idx;

          let optionStyle = 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text)] hover:border-cyan-500/40';
          if (isEvaluated) {
            if (isCorrectOption) {
              optionStyle = 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500 font-bold';
            } else if (isSelected && !isCorrectOption) {
              optionStyle = 'bg-rose-500/10 border-rose-500/50 text-rose-500';
            }
          } else if (isSelected) {
            optionStyle = 'bg-cyan-500/20 border-cyan-400 text-cyan-500 font-semibold';
          }

          return (
            <button
              key={idx}
              disabled={isEvaluated}
              onClick={() => onSelectOption(idx)}
              className={`w-full p-3 rounded-xl border text-xs text-left transition-all flex items-center justify-between ${optionStyle}`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] bg-[var(--color-background)] font-bold">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>{opt}</span>
              </div>
              {isEvaluated && isCorrectOption && <LuCircleCheck className="text-emerald-500" size={16} />}
              {isEvaluated && isSelected && !isCorrectOption && <LuTriangleAlert className="text-rose-500" size={16} />}
            </button>
          );
        })}
      </div>

      {/* Submit / Action Button */}
      {!isEvaluated ? (
        <button
          onClick={onSubmit}
          disabled={selectedOption === null || loading}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5"
        >
          {loading ? <LuRefreshCw className="animate-spin" size={14} /> : <LuCheck size={14} />}
          <span>{loading ? 'Evaluating...' : 'Submit Answer'}</span>
        </button>
      ) : (
        <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold font-mono ${assessment.is_correct ? 'text-emerald-500' : 'text-rose-500'}`}>
              {assessment.is_correct ? '✓ Correct Understanding' : '✗ Misconception Diagnosed'}
            </span>
          </div>
          <p className="text-xs text-[var(--color-text)] leading-relaxed">
            {assessment.misconception_analysis}
          </p>
          <button
            onClick={onNewQuiz}
            className="w-full py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-500 text-xs font-semibold transition-all"
          >
            Try Another Quantum Quiz
          </button>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   WORKSPACE: RESEARCH PAPER RAG PANEL
   ========================================================================== */
function PaperRAGPanel({ file, uploading, status, onUploadClick, onAskPaper }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase text-rose-500 font-bold">Document RAG Engine</span>
          <h4 className="font-bold text-[var(--color-text)] text-sm">Research Paper & Textbook Ingestion</h4>
        </div>
      </div>

      {/* Upload Dropzone */}
      <div
        onClick={onUploadClick}
        className="p-6 border-2 border-dashed border-[var(--color-border)] hover:border-rose-500/50 rounded-2xl text-center bg-[var(--color-surface)] cursor-pointer transition-all"
      >
        <LuUpload size={32} className="mx-auto text-rose-500/60 mb-2" />
        <p className="text-xs font-bold text-[var(--color-text)]">
          {uploading ? 'Parsing & Indexing PDF Chunks...' : 'Click to Upload Quantum Research Paper (PDF)'}
        </p>
        <p className="text-[11px] text-[var(--color-muted)] mt-1">
          Supports arXiv preprints, IBM/Google quantum whitepapers, and textbooks.
        </p>
      </div>

      {/* Status Card */}
      {status && (
        <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
          status.success ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500' : 'bg-rose-500/10 border-rose-500/40 text-rose-500'
        }`}>
          <div className="flex items-center gap-2 font-bold font-mono">
            {status.success ? <LuCircleCheck size={14} className="text-emerald-500" /> : <LuTriangleAlert size={14} className="text-rose-500" />}
            <span>{status.title || 'Status'}</span>
          </div>
          <p className="mt-1 text-[11px]">{status.message}</p>
        </div>
      )}

      {/* Suggested Inquiries */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-mono uppercase text-[var(--color-muted)]">Quick Paper Inquiries:</p>
        {[
          "Explain the problem statement and motivation of this paper",
          "Break down the quantum algorithm proposed in the paper",
          "What are the experimental limitations and noise challenges?",
          "Implement the circuit from this paper in Qiskit"
        ].map((prompt, i) => (
          <button
            key={i}
            onClick={() => onAskPaper(prompt)}
            className="w-full text-left px-3 py-2 rounded-lg bg-[var(--color-surface)] hover:bg-rose-500/10 border border-[var(--color-border)] hover:border-rose-500/40 text-xs text-[var(--color-text)] hover:text-rose-500 transition-all font-mono text-[11px]"
          >
            → {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
