from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from app.agents.state import AgentThought, AssessmentData, ExecutionAttempt


class AgentChatRequest(BaseModel):
    query: str
    student_level: Optional[str] = "Beginner"
    topic: Optional[str] = None
    apiKey: Optional[str] = None


class AgentChatResponse(BaseModel):
    success: bool
    active_agent: str
    route: str
    final_response: str
    guardrail_blocked: bool = False
    thought_log: List[AgentThought] = Field(default_factory=list)
    code_snippet: Optional[str] = None
    code_framework: Optional[str] = None
    execution_success: bool = False
    execution_history: List[ExecutionAttempt] = Field(default_factory=list)
    plots_base64: List[str] = Field(default_factory=list)
    rag_sources: List[Dict[str, Any]] = Field(default_factory=list)
    assessment: Optional[AssessmentData] = None
    timestamp: str = ""


class AssessSubmitRequest(BaseModel):
    assessment: AssessmentData
    selected_option: int


class AssessSubmitResponse(BaseModel):
    success: bool
    assessment: AssessmentData


class UploadPaperResponse(BaseModel):
    success: bool
    title: str
    chunks_count: int
    message: str
