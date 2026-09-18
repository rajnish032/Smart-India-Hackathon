# Quantum Learning Platform — Memory & Project Guide

This document serves as the persistent memory and operational guide for the **Quantum Learning Platform** (Smart India Hackathon project). It defines the architecture, design principles, database models, API conventions, and operational workflows.

---

## 1. Project Overview

The **Quantum Learning Platform** is an end-to-end interactive educational platform for learning quantum computing and quantum algorithms. It features:
- Interactive drag-and-drop & code-based quantum circuit playground.
- Quantum simulation execution and multi-backend comparisons (Qiskit Aer, PennyLane, Cirq, qBraid).
- AI-powered Quantum Tutor and automated video storyboard generation.
- Full LMS (Learning Management System): courses, modules, interactive lessons, quizzes, and coding challenges.
- Learner gamification: XP, levels, daily goals, learning streaks, badges, and leaderboards.
- Multi-tier Role-Based Access Control (RBAC): `LEARNER`, `INSTRUCTOR`, and `ADMIN`.
- Agentic Quantum Execution using the Model Context Protocol (MCP) for autonomous quantum workflows.

---

## 2. Multi-Tier Architecture & Directory Structure

```
Smart-India-Hackathon/
├── client/           # Frontend Web Application (Next.js 14 App Router)
├── server/           # Backend API Gateway & Business Logic (Express + Prisma)
├── ai-engine/        # AI Assistant & Storyboard Service (FastAPI + Python + Gemini)
├── agentic-engine/   # Autonomous Quantum Agent & MCP Tooling (Qiskit MCP Servers)
├── README.md         # Main project documentation
├── GEMINI.md         # Antigravity Workspace Rules & Memory (this file)
└── MEMORY.md         # Quick reference memory bank
```

### Services Summary

| Service | Technology Stack | Port | Primary Responsibilities |
| :--- | :--- | :--- | :--- |
| **`client/`** | Next.js 14, React, Tailwind CSS, Zustand | `3000` | User interface, circuit canvas, auth state, portals (Learner, Instructor, Admin) |
| **`server/`** | Node.js (ESM), Express, Prisma ORM, Argon2, JWT | `5001` | Authentication, RBAC, LMS management, experiment persistence, audit logging |
| **`ai-engine/`** | FastAPI, Uvicorn, Python 3.11+, Google GenAI SDK | `8000` | Quantum tutor chat, video storyboard generation, Neon DB chat persistence |
| **`agentic-engine/`** | FastAPI, LangGraph, Qiskit, Cirq, Tavily, RAG, MCP | `8001` | Autonomous 5-agent team: Supervisor, Teaching, Coding (self-healing loop), Assessment, Research/Paper |

---

## 3. Database Schema & Core Entities (`server/prisma/schema.prisma`)

Database: **PostgreSQL** (hosted on Neon DB with connection pooling and SSL).

### Primary Models
- **`User`**: Core user entity (`id`, `name`, `email`, `passwordHash`, `role`, `isEmailVerified`, `isSuspended`).
  - Roles: `LEARNER` (default), `INSTRUCTOR`, `ADMIN`.
- **`RefreshToken`**: Refresh token rotation with `familyId` tracking for token reuse detection.
- **`Otp`**: One-time passwords for `EMAIL_VERIFICATION` and `PASSWORD_RESET` (Argon2 hashed, 5-minute expiry).
- **`LearnerProfile`**: Gamification stats (`xp`, `level`, `rank`, `streak`, `longestStreak`, `learningHours`, `certificates`).
- **`DailyGoal`**: Daily actionable goals with XP rewards.
- **`Badge` & `UserBadge`**: Unlockable achievements and badges.
- **`Course`, `Module`, `Lesson`**: Hierarchical LMS course structure.
- **`Quiz` & `Challenge`**: Assessment engine with starter code, test cases, hints, and auto-evaluation (`statevector`, fidelity threshold).
- **`Enrollment` & `Submission`**: Student course progress, quiz/challenge submission grades and feedback.
- **`Experiment`, `SimulationRun`, `SavedCircuit`, `BackendComparison`**:
  - Store quantum circuit JSON / code, shot counts, noise configs, and simulation results across backends (`qiskit_aer`, `pennylane`, `cirq`, `qbraid`).
- **`AiChatHistory` & `AiGeneratedVideo`**: Persisted AI interactions and generated multimedia explanations.
- **`AuditLog` & `PlatformSetting`**: Admin governance, role changes, content moderation, and platform configurations.

---

## 4. Authentication, Security & RBAC Standards

- **Password Hashing**: Argon2id via `argon2` npm package.
- **Token Strategy**:
  - Access Token: Short-lived JWT (15m), stored in HttpOnly cookie (`accessToken`).
  - Refresh Token: Long-lived JWT (7d) stored in HttpOnly cookie (`refreshToken`), with database tracking and family rotation to detect replay attacks.
- **Transparent Refresh Flow**:
  - `client/src/services/api.js` automatically catches `401` / `TOKEN_EXPIRED` errors and issues a silent `POST /api/auth/refresh` request, then retries the original request seamlessly.
- **Role-Based Guards**:
  - Server middleware: `authenticateUser`, `authorizeRoles('LEARNER', 'INSTRUCTOR', 'ADMIN')`.
  - Client guards: `ProtectedRoute` checks user role and redirects unauthorized access to `/dashboard` or `/login`.

---

## 5. Subsystem Details

### A. Frontend (`client/`)
- **Framework**: Next.js 14 with App Router (`src/app/`).
- **Routing**:
  - Public: `/` (Landing page), `/(auth)/login`, `/(auth)/signup`, `/(auth)/verify-email`, `/(auth)/forgot-password`, `/(auth)/reset-password`.
  - Learner: `/dashboard`, `/learn`, `/playground`, `/challenges`, `/achievement`, `/progress`, `/profile`, `/ai-tutor`.
  - Instructor: `/instructor` (Course creator, module/lesson editor, quiz/challenge builder, grading queue, student analytics).
  - Admin: `/admin` (User manager, content governance, AI config, quantum backends, system health, audit logs).
- **State**: Zustand (`src/store/useAuthStore.js`) for authentication and profile caching.
- **Icons & Styling**: `react-icons/lu` (Lucide), Tailwind CSS with custom dark mode and quantum glow effects.

### B. Backend API Gateway (`server/`)
- **Module System**: Pure ES Modules (`"type": "module"`).
- **Endpoints**:
  - `/api/auth`: Signup, login, logout, refresh, OTP verification, password reset, `/me`.
  - `/api/learner`: Dashboard stats, courses, lesson completion, goals, achievements, experiments, simulations, saved circuits.
  - `/api/instructor`: Course CRUD, module/lesson management, quiz/challenge creation, submission grading, analytics.
  - `/api/admin`: User roles & suspension, content moderation, backend testing, AI config, audit log queries.
  - `/api/health`: Health check endpoint.

### C. AI Engine (`ai-engine/`)
- **Framework**: FastAPI + Uvicorn + Pydantic v2.
- **AI Core**: Google GenAI (`google-genai` and `google-generativeai`) using `gemini-2.5-flash` / `gemini-1.5-flash`.
- **Endpoints**:
  - `POST /api/v1/ai/tutor/chat`: Conversational quantum tutor with context grounding (general, playground, debugging, algorithm).
  - `POST /api/v1/ai/tutor/generate-video`: Generates structured video explanation storyboard JSON with slide scenes, script narration, visual prompts, and interactive quizzes.
  - `GET /api/v1/ai/tutor/key-status`: Checks if server-side Gemini API key is configured.
  - `GET /health`: Engine status and environment.
- **Persistence**: Directly connects to the shared PostgreSQL database via SQLAlchemy to record chat history and video data.

### D. Agentic Engine (`agentic-engine/`) — Implemented
- **Purpose**: Autonomous multi-agent quantum learning platform orchestrating the closed loop:
  `Guardrail → LEARN → CODE → EXECUTE → ANALYZE/VISUALIZE → ASSESS → PERSONALIZE`.
- **Port**: `8001` (FastAPI), separate from `ai-engine` on `8000` — the two coexist; `ai-engine` remains the simple tutor chat/video service while `agentic-engine` handles autonomous tool-using workflows.
- **Core Agents** (`app/agents/`):
  - **Input Guardrail** (`core/guardrails.py`): Rejects off-topic queries (weather, entertainment, politics) with a fixed educational rejection message *before* invoking the LLM or any agent/tool — this is a hard short-circuit, not a soft prompt hint.
  - **Supervisor Agent** (`supervisor.py`) + **`state.py`**: LangGraph intent triage and routing coordinator; shared `AgentState` carries messages, active agent, debug iteration count, error tracebacks, execution outputs, plots, and assessment state.
  - **Teaching Agent** (`teacher.py`): Concept explanations with textbook RAG (`app/rag/`) and live Tavily web retrieval (`app/tools/tavily_search.py`).
  - **Coding Agent** (`coder.py`): Qiskit & Cirq circuit generator with autonomous **self-healing debugging loop**, capped at `MAX_DEBUG_ITERATIONS=5` (config).
  - **Assessment Agent** (`assessor.py`): Topic-specific adaptive MCQs, misconception analysis, and student mastery scoring.
  - **Research / Paper Agent** (`researcher.py`): PDF paper ingestion (`pypdf`), section-level RAG, and hand-off of extracted circuits to the Coding Agent.
- **Execution Sandbox** (`app/execution/sandbox.py`, `visualizer.py`): Sandboxed subprocess runner, `EXECUTION_TIMEOUT_SECONDS=15`, capturing `stdout`/`stderr`/exit code and converting Matplotlib figures to base64 PNG.
- **LLM abstraction** (`app/core/llm.py`): `LLM_PROVIDER=gemini`, model `gemini-2.5-flash` with fallback `gemini-1.5-flash`.
- **MCP Servers** (vendored under `agentic-engine/mcp-servers/`, a nested git checkout):
  - `qiskit-mcp-server`: Core Qiskit circuit manipulation, quantum volume, algorithms.
  - `qiskit-docs-mcp-server`: Semantic documentation search across Qiskit API references.
  - `qiskit-ibm-runtime-mcp-server`, `qiskit-ibm-transpiler-mcp-server`, `qiskit-gym-mcp-server`: also vendored but not yet wired into the agent flow (kept for future live-hardware/transpiler expansion).
  - Client integration via `langchain_mcp_adapters.client.MultiServerMCPClient` (`app/mcp/client.py`), stdio transport, with fallback to local tools if MCP is unavailable.
- **API** (`app/main.py`, `app/api/routes.py`): `/api/v1/agentic/chat`, `/execute`, `/upload-paper`, `/assess`, `/health`.
- **Frontend upgrade**: [client/src/app/ai-tutor/page.js](client/src/app/ai-tutor/page.js) rebuilt as a "Quantum Agent Studio" — active-agent status header, guardrail rejection cards, self-healing code/terminal view with per-iteration diffs, base64 Matplotlib canvas, interactive MCQ cards with mastery progress bar, and PDF/paper drag-and-drop upload.
- **Not yet verified**: end-to-end runs of the plan's test cases (guardrail rejection, self-healing loop recovering from an injected bug, histogram visualization round-trip, MCQ + mastery scoring, PDF ingestion) — see Verification Plan in the original implementation plan.

---

## 6. Development Workflow & Running the Platform

### Prerequisites
- Node.js `v18+` (or `v20+`)
- Python `3.11+`
- PostgreSQL instance (Neon DB recommended)
- `uv` package manager (optional, recommended for Python/MCP)

### Terminal Commands

#### 1. Backend Server (`server/`)
```bash
cd server
npm install
npm run prisma:generate
npm run dev        # Runs on http://localhost:5001 with node --watch
```

#### 2. AI Engine (`ai-engine/`)
```bash
cd ai-engine
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 3. Frontend Client (`client/`)
```bash
cd client
npm install
npm run dev        # Runs on http://localhost:3000
```

#### 4. Agentic Engine (`agentic-engine/`)
```bash
cd agentic-engine
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```
Copy `.env.example` to `.env` and set `GEMINI_API_KEY` / `TAVILY_API_KEY`. `LOCAL_SIMULATION_ONLY=true` by default — no IBM Quantum credentials required. MCP servers under `mcp-servers/` are launched automatically by `app/mcp/client.py` via stdio; no separate process needed.

---

## 7. Key Conventions & Best Practices for Future Code Edits

1. **Keep Architecture Decoupled**: The client never connects directly to the database; it always queries `server` or `ai-engine`.
2. **Preserve ESM in Server**: The `server/` codebase uses ES Modules (`import`/`export`). Always use `.js` extension in import paths (e.g. `import app from './app.js'`).
3. **Cookie-Based Auth**: Ensure `credentials: 'include'` is preserved in all client fetch calls. Do not store tokens in `localStorage`.
4. **Prisma Synchrony**: If schema changes are made in `server/prisma/schema.prisma`, always run `npx prisma generate` (and `npx prisma db push` or migrations) to update the client.
5. **FastAPI Schemas**: All AI engine request and response payloads must adhere to Pydantic models in `ai-engine/app/schemas/ai.py`.
