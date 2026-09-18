from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class AgentThought(BaseModel):
    agent: str
    action: str
    detail: str = ""
    timestamp: str = ""


class ExecutionAttempt(BaseModel):
    iteration: int
    code: str
    success: bool
    stdout: str = ""
    stderr: str = ""
    diagnostics: Optional[str] = None
    execution_time_ms: int = 0


class AssessmentData(BaseModel):
    topic: str
    question: str
    options: List[str]
    correct_option: int  # 0 to 3
    explanations: List[str]  # Explanation per option
    student_selected: Optional[int] = None
    is_correct: Optional[bool] = None
    misconception_analysis: Optional[str] = None
    mastery_score: float = 0.0  # 0.0 to 1.0
    recommendation: str = ""  # "revise_concept" | "practice_more" | "next_topic"


class AgentState(BaseModel):
    """Global state container for the LangGraph multi-agent quantum workflow."""

    query: str
    student_level: str = "Beginner"  # "Beginner" | "Intermediate" | "Advanced"
    active_agent: str = "supervisor"
    route: str = ""
    topic: str = "General Quantum Computing"

    # Activity & thought stream
    thought_log: List[AgentThought] = Field(default_factory=list)

    # Coding & Self-healing loop
    code_framework: str = "qiskit"  # "qiskit" | "cirq"
    code_snippet: str = ""
    execution_history: List[ExecutionAttempt] = Field(default_factory=list)
    current_iteration: int = 0
    max_iterations: int = 5
    execution_success: bool = False
    plots_base64: List[str] = Field(default_factory=list)

    # RAG & Citations
    rag_sources: List[Dict[str, Any]] = Field(default_factory=list)

    # Assessment
    assessment: Optional[AssessmentData] = None

    # Final synthesized answer
    final_response: str = ""
    guardrail_blocked: bool = False
