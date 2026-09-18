# Platform Memory Bank: Quantum Learning Platform

**Project**: Quantum Learning Platform (Smart India Hackathon)  
**Last Updated**: September 2026  
**Status**: Active Development  

---

## 1. Quick Snapshot

- **Goal**: A full-featured interactive learning, simulation, and research platform for quantum computing.
- **Key Capabilities**:
  - Drag-and-drop & code-based Quantum Circuit Playground with statevector & probability visualizers.
  - Multi-backend simulation support (`qiskit_aer`, `pennylane`, `cirq`, `qbraid`) and backend comparisons.
  - AI Quantum Tutor & Storyboard/Video generator using Google Gemini.
  - LMS System: Courses, modules, lessons, quizzes, and automated code-grading challenges.
  - Gamified Learner Experience: XP, levels, learning streaks, daily goals, achievements, and badges.
  - 3 User Roles: `LEARNER`, `INSTRUCTOR`, `ADMIN` with comprehensive role-specific dashboards.
  - Agentic Quantum workflows via Model Context Protocol (MCP) servers for Qiskit and IBM Quantum.

---

## 2. Service Architecture & Ports

| Service | Path | Tech Stack | Port / Protocol | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend Client** | `client/` | Next.js 14, React, Tailwind CSS, Zustand | `http://localhost:3000` | Complete UI with dashboards for all roles |
| **Backend API Gateway** | `server/` | Node.js (ESM), Express, Prisma ORM, Argon2, JWT | `http://localhost:5001` | Full RBAC, LMS, simulation history, auth APIs |
| **AI Engine** | `ai-engine/` | FastAPI, Python 3.11+, Google GenAI SDK | `http://localhost:8000` | AI tutor chat, video generator, Neon DB sync |
| **Agentic Engine** | `agentic-engine/` | FastAPI, LangGraph, Qiskit/Cirq, Tavily, RAG, MCP | `http://localhost:8001` | 5-agent autonomous quantum learning system (implemented) |

---

## 2a. Agentic Engine — Implementation Detail (`agentic-engine/`)

**Status**: Implemented (backend + frontend). Runs standalone on port `8001`, alongside `ai-engine` (`8000`) — the two are separate services with distinct purposes (ai-engine = simple tutor chat/video; agentic-engine = autonomous multi-agent quantum workflows with tool execution).

**Flow**: `Guardrail → Supervisor (LangGraph) → {Teacher | Coder | Assessor | Researcher} → (self-healing exec loop / RAG / viz) → response`

- **`app/core/guardrails.py`**: Input relevance classifier. Off-topic prompts (weather, politics, chit-chat) are short-circuited with a fixed "I am a Quantum Learning Agent..." rejection message before any LLM/tool call.
- **`app/core/llm.py`**: Pluggable LLM abstraction, primary provider Gemini (`gemini-2.5-flash`, fallback `gemini-1.5-flash`) via `LLM_PROVIDER` env var.
- **`app/mcp/client.py`**: `MultiServerMCPClient` (langchain-mcp-adapters) launching `qiskit-mcp-server` / `qiskit-docs-mcp-server` from `agentic-engine/mcp-servers/` (vendored as a nested git repo) over stdio; falls back to local tools if MCP stdio is unavailable.
- **`app/execution/sandbox.py`**: Sandboxed subprocess runner for Qiskit/Cirq scripts — 15s timeout (`EXECUTION_TIMEOUT_SECONDS`), captures stdout/stderr/exit code, converts generated Matplotlib figures to base64 PNG.
- **`app/execution/visualizer.py`**: Auto-injects circuit/histogram/statevector plotting code and exports base64 images for the client.
- **`app/agents/coder.py`**: Qiskit/Cirq generator with a self-healing loop — up to `MAX_DEBUG_ITERATIONS=5` diagnose-and-retry cycles on sandbox failure.
- **`app/agents/teacher.py`**: Explainer grounded via textbook RAG (`app/rag/`) + Tavily live search (`app/tools/tavily_search.py`).
- **`app/agents/assessor.py`**: Adaptive MCQ generation, misconception diagnosis, mastery scoring.
- **`app/agents/researcher.py`**: PDF paper ingestion (`pypdf`) → section RAG → can hand extracted circuits to the coder agent.
- **`app/agents/supervisor.py`** + **`app/agents/state.py`**: LangGraph routing coordinator and shared `AgentState` (messages, active agent, iteration count, error tracebacks, exec outputs, plots, assessment state).
- **`app/main.py`** / **`app/api/routes.py`**: FastAPI app — `/api/v1/agentic/chat`, `/execute`, `/upload-paper`, `/assess`, `/health`.
- **Config** (`app/core/config.py`): `PORT=8001`, `LOCAL_SIMULATION_ONLY=True` (no IBM Quantum credentials needed for normal learning), `ENABLE_MCP_TOOLS=True`.
- **Frontend**: [client/src/app/ai-tutor/page.js](client/src/app/ai-tutor/page.js) rewritten into a "Quantum Agent Studio" — agent status header, guardrail rejection cards, self-healing code/terminal view, Matplotlib image canvas, interactive MCQ cards with mastery progress, PDF/paper drag-and-drop upload.

---

## 3. Database Architecture (PostgreSQL on Neon DB)

Prisma Schema Location: `server/prisma/schema.prisma`

### Key Model Groups:
1. **Authentication & Identity**:
   - `User`: Email, Argon2 password hash, role (`LEARNER`, `INSTRUCTOR`, `ADMIN`), email verification status, account suspension flag.
   - `RefreshToken`: Cryptographic token hash with `familyId` rotation for theft detection.
   - `Otp`: One-time codes for email confirmation and password reset.
2. **LMS & Educational Content**:
   - `Course` -> `Module` -> `Lesson` hierarchy.
   - `Quiz`: Multi-question quizzes with time limits and pass scores.
   - `Challenge`: Coding assignments with starter code, test cases, hints, and auto-evaluation (`fidelityThreshold`, `statevector`).
   - `Enrollment` & `Submission`: Student tracking, completion rates, and instructor grading queue.
3. **Quantum Experiments & Playground**:
   - `Experiment`: Objective, hypothesis, circuit JSON/code, parameters, noise configuration, observations.
   - `SimulationRun`: Execution metrics, shot counts, results (counts, statevector, probabilities, bloch sphere), fidelity, gate counts.
   - `BackendComparison`: Multi-backend performance benchmarking.
   - `SavedCircuit`: User's saved circuit library (private/public).
4. **Gamification & Profile**:
   - `LearnerProfile`: XP, levels, rank, streak counters, study hours.
   - `DailyGoal`: Daily quest checklist rewarding XP.
   - `Badge` & `UserBadge`: Earned achievements and awards.
5. **AI Interactions & Governance**:
   - `AiChatHistory`: Conversational history with context tags.
   - `AiGeneratedVideo`: Structured video storyboard data.
   - `AuditLog`: Immutable action logs for administrative tracking.
   - `PlatformSetting`: System configurations and backend toggles.

---

## 4. Security & Authentication Patterns

- **Password Security**: Argon2id hashing.
- **Cookies**: Tokens transmitted solely via HttpOnly, Secure (in production), SameSite cookies:
  - `accessToken` (15 min)
  - `refreshToken` (7 days)
- **Token Refresh**: Client's `apiFetch` (`client/src/services/api.js`) automatically intercepts 401s, calls `/api/auth/refresh`, updates cookies, and retries the request without user interruption.
- **Route Protection**:
  - Backend: `authenticateUser` + `authorizeRoles(...)` middleware.
  - Frontend: `ProtectedRoute` wrapper checking `useAuthStore`.

---

## 5. Environment Variables Map

### `server/.env`
```env
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:3000
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
RESEND_API_KEY=...
AI_ENGINE_URL=http://localhost:8000
```

### `client/.env`
```env
PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_AI_ENGINE_URL=http://localhost:8000
```

### `ai-engine/.env`
```env
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=development
CORS_ORIGINS=["http://localhost:3000","http://localhost:5001"]
GEMINI_API_KEY=...
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=...
```

---

## 6. Current Development Status & Next Steps

- **Completed**:
  - Full Authentication & Session Management (Signup, Login, OTP, Reset, Refresh).
  - Learner Dashboard, Progress tracking, Gamification, and Daily Goals.
  - Instructor Portal with Course Builder, Quiz Builder, Challenge Builder, and Grading.
  - Admin Panel with User Management, Content Governance, Platform Analytics, and System Health.
  - Quantum Playground UI with preset circuits and gate visualizer.
  - AI Engine with Gemini Tutor chat and video storyboard generation.
  - Agentic Engine (`agentic-engine/`, port `8001`): LangGraph Supervisor + 5 agents (Teaching, Coding, Assessment, Research, Guardrail), Qiskit/Cirq self-healing execution sandbox, RAG + Tavily search, Matplotlib visualizer, MCP tool integration (`qiskit-mcp-server`, `qiskit-docs-mcp-server`). See section 2a for detail.
  - `ai-tutor` frontend page rewritten into the "Quantum Agent Studio" UI (agent status header, self-healing terminal, MCQ assessment cards, PDF upload).
- **In Progress / Ready for Expansion**:
  - Live hardware execution via IBM Quantum Runtime MCP server (`qiskit-ibm-runtime-mcp-server`, vendored but not yet wired into the agentic-engine flow — currently `LOCAL_SIMULATION_ONLY=True`).
  - End-to-end verification of the guardrail, self-healing loop, visualization, assessment, and paper-ingestion flows against the plan's test cases.
