# Quantum Agentic Learning Engine ⚛️🤖

The **Quantum Agentic Learning Engine** is an autonomous, multi-agent quantum computing education and research service. Coordinated by a central **Supervisor Agent** (built with LangGraph/LangChain), it implements a complete closed-loop learning paradigm:

$$\text{LEARN} \longrightarrow \text{CODE} \longrightarrow \text{EXECUTE} \longrightarrow \text{ANALYZE / VISUALIZE} \longrightarrow \text{ASSESS} \longrightarrow \text{PERSONALIZE}$$

---

## 1. Core Architectural Components

### 🛡️ Input Guardrail Classifier (`app/core/guardrails.py`)
- Automatically validates all incoming user queries before launching LLM chains or tools.
- Rejects off-topic inquiries (e.g. weather forecasts, sports, politics, general small talk) with a polite, educational quantum notice, saving token costs and enforcing educational focus.

### 🧭 1. Supervisor Agent (`app/agents/supervisor.py`)
- Analyzes user intent and assigns requests dynamically to specialized agents.
- Orchestrates multi-step workflows (e.g. *Research Paper Analysis $\to$ Circuit Extraction $\to$ Qiskit Simulation*).

### 📚 2. Teaching Agent (`app/agents/teacher.py`)
- Provides pedagogical, mathematically rigorous explanations with LaTeX math notation.
- Grounds answers in authoritative quantum textbooks (Nielsen & Chuang, Qiskit Textbook) using an internal vector database.
- Retrieves live hardware metrics and announcements via the **Tavily Search API**.
- Adapts depth to the student's mastery level (`Beginner`, `Intermediate`, `Advanced`).

### 💻 3. Coding Agent & Self-Healing Loop (`app/agents/coder.py`)
- Generates executable Python circuits in **Qiskit** and **Cirq**.
- Executes circuits in a secure local sandboxed runner with a 15-second timeout.
- **Autonomous Self-Healing Loop**:
  ```
  Generate Code ──> Execute Code ──> Inspect stdout / stderr
                                              │
                         ┌────────────────────┴────────────────────┐
                         ▼                                         ▼
                     [Success]                                  [Error]
                         │                                         │
              Extract Metrics & Plots                      Analyze Traceback
                         │                                         │
                 Return to Student                        Refactor & Fix Code
                                                                   │
                                                          Re-Execute (Max 5x)
  ```
- Generates publication-grade **Matplotlib** visualizations (circuit schematics, measurement histograms, Bloch spheres) as base64 images.

### 🎯 4. Assessment Agent (`app/agents/assessor.py`)
- Generates topic-specific **Multiple-Choice Questions (MCQs)** with realistic quantum distractors.
- Evaluates student answers, identifies conceptual misunderstandings, calculates topic mastery, and recommends actionable next steps (*Revise Concept*, *Practice More*, or *Advance to Next Topic*).

### 📄 5. Research / Paper Agent (`app/agents/researcher.py`)
- Ingests and semantically chunks quantum research papers (PDF format).
- Synthesizes problem statements, methodologies, algorithms, benchmarks, and limitations.
- Extracts proposed quantum circuits and seamlessly passes them to the Coding Agent for experimental reproduction.

### 🔌 6. Qiskit MCP Server Integration (`app/mcp/client.py`)
- Leverages the Model Context Protocol (MCP) using `langchain-mcp-adapters`.
- Connects to local `qiskit-mcp-server` and `qiskit-docs-mcp-server` via Stdio.

---

## 2. Prerequisites

- **Python 3.11+** (or Python 3.13)
- **Node.js v18+** (for the Next.js client)
- **`uv`** package manager (installed inside `.venv/Scripts/uv.exe` or globally)

---

## 3. Setup & Environment Configuration

### Step 1: Navigate to the `agentic-engine` Directory
```bash
cd agentic-engine
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
# Windows PowerShell:
Copy-Item .env.example .env

# macOS / Linux:
cp .env.example .env
```

Edit `.env` to configure your keys:
```env
HOST=0.0.0.0
PORT=8001
ENVIRONMENT=development

# LLM Provider Chain: Gemini (primary) -> Groq (free fallback) -> Mock (offline safety net)
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.6-flash

# Groq free-tier fallback - activates automatically whenever Gemini's quota/rate
# limit is hit (Gemini's free tier is small - as few as 5-20 requests/day on
# some models) so the agents keep working without any code changes.
# Get a free key at https://console.groq.com/keys
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b

# Tavily Web Search API Key (optional for live web search)
TAVILY_API_KEY=your_tavily_api_key_here

# Quantum Execution Limits
MAX_DEBUG_ITERATIONS=5
EXECUTION_TIMEOUT_SECONDS=15
LOCAL_SIMULATION_ONLY=true
ENABLE_MCP_TOOLS=true

# Shared PostgreSQL Database (Neon DB) - only needed if you wire up chat
# persistence; the agentic engine itself runs fine without a database.
DATABASE_URL=postgresql://<user>:<password>@<endpoint>-pooler.<region>.aws.neon.tech/neondb?sslmode=require
```

> **No real secrets are committed to this repo.** `.env` is gitignored; only
> `.env.example` (with placeholder values) is tracked. Copy it to `.env` and
> fill in your own keys - never commit your actual `.env` file.

> **Note on qiskit-aer**: on some Windows machines, `qiskit-aer`'s native
> extension fails to load with `DLL load failed` unless the Microsoft Visual
> C++ Redistributable (x64) is installed. The Coding Agent avoids this
> entirely by generating code with `qiskit.quantum_info.Statevector` /
> `qiskit.primitives.StatevectorSampler` instead of `AerSimulator`, so the
> engine works out of the box even without that redistributable installed.

### Step 3: Install Python Dependencies
```bash
# Using virtual environment pip:
..\.venv\Scripts\python.exe -m pip install -r requirements.txt

# Or with uv:
uv pip install -r requirements.txt
```

---

## 4. Running the Local Qiskit MCP Servers

The engine includes official Qiskit Model Context Protocol servers in `mcp-servers/`.

### Testing Local MCP Tools
To verify that the MCP servers launch and list their registered quantum tools, run:
```bash
..\.venv\Scripts\python.exe app/mcp/testing_tools.py
```
This tests persistent sessions with:
- `qiskit` MCP Server: Circuit creation, gate decomposition, quantum volume optimization.
- `qiskit_doc` MCP Server: Semantic Qiskit documentation lookups.

---

## 5. Starting the Agentic Engine Service

Start the FastAPI development server on port **`8001`**:

```bash
# From the agentic-engine directory:
..\.venv\Scripts\uvicorn.exe app.main:app --reload --host 0.0.0.0 --port 8001
```

Once started, verify the service in your browser or terminal:
- **Interactive OpenAPI Documentation**: [http://localhost:8001/docs](http://localhost:8001/docs)
- **Service Health Check**: [http://localhost:8001/api/v1/agentic/health](http://localhost:8001/api/v1/agentic/health)

---

## 6. API Endpoints & Usage Examples

### 1. Multi-Agent Chat Workflow (`POST /api/v1/agentic/chat`)

#### Example A: Off-Topic Guardrail Rejection
```bash
curl -X POST http://localhost:8001/api/v1/agentic/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "What is the weather forecast for tomorrow?"}'
```
**Response**:
```json
{
  "success": true,
  "guardrail_blocked": true,
  "active_agent": "supervisor",
  "final_response": "⚛️ **Quantum Domain Notice**\n\nI am an AI-powered Quantum Learning Agent specialized exclusively in Quantum Computing...",
  "execution_history": []
}
```

#### Example B: Quantum Circuit Simulation & Visualization
```bash
curl -X POST http://localhost:8001/api/v1/agentic/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "Create a 3-qubit GHZ state in Qiskit and simulate measurement counts"}'
```
**Response**:
- `active_agent`: `"coder"`
- `execution_success`: `true`
- `execution_history`: Contains attempt 1 with `stdout` (e.g. `{'000': 500, '111': 500}`) and execution time in ms.
- `plots_base64`: Array containing base64 data URI of the generated Matplotlib measurement histogram.

#### Example C: Concept Assessment Quiz
```bash
curl -X POST http://localhost:8001/api/v1/agentic/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "Quiz me on quantum teleportation", "student_level": "Intermediate"}'
```
**Response**:
- `active_agent`: `"assessor"`
- `assessment`: Structured object with question, 4 multiple-choice options, and pedagogical explanations.

---

### 2. Submit Assessment Answer (`POST /api/v1/agentic/assess/submit`)
```bash
curl -X POST http://localhost:8001/api/v1/agentic/assess/submit \
  -H "Content-Type: application/json" \
  -d '{
    "assessment": {
      "topic": "Hadamard Gate",
      "question": "What state does H|0> produce?",
      "options": ["(|0>+|1>)/sqrt(2)", "|1>", "|0>", "-|1>"],
      "correct_option": 0,
      "explanations": ["Correct superposition", "Incorrect", "Incorrect", "Incorrect"],
      "mastery_score": 0.5,
      "recommendation": ""
    },
    "selected_option": 0
  }'
```
**Response**: Returns updated mastery score (`0.9`), correctness (`true`), and pedagogical recommendations.

---

### 3. Upload Research Paper / PDF (`POST /api/v1/agentic/upload-paper`)
```bash
curl -X POST http://localhost:8001/api/v1/agentic/upload-paper \
  -F "file=@sample_paper.pdf"
```
**Response**:
```json
{
  "success": true,
  "title": "sample_paper.pdf",
  "chunks_count": 14,
  "message": "Successfully parsed and indexed 14 sections from 'sample_paper.pdf'."
}
```

---

## 7. Next.js Client Integration

The frontend client in `client/` connects to the Agentic Engine at `http://localhost:8001/api/v1/agentic`. Ensure your `client/.env` includes:
```env
NEXT_PUBLIC_AGENTIC_ENGINE_URL=http://localhost:8001
```

Visit the updated **Quantum Agent Studio** at:
[http://localhost:3000/ai-tutor](http://localhost:3000/ai-tutor)
