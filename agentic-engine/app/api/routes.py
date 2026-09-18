import datetime
import uuid
from fastapi import APIRouter, File, HTTPException, UploadFile
from app.agents.assessor import evaluate_student_answer
from app.agents.supervisor import execute_agentic_workflow
from app.rag.document_parser import pdf_parser
from app.rag.vector_store import quantum_vector_store
from app.schemas.agentic import (
    AgentChatRequest,
    AgentChatResponse,
    AssessSubmitRequest,
    AssessSubmitResponse,
    UploadPaperResponse,
)

router = APIRouter()


@router.post("/chat", response_model=AgentChatResponse)
async def chat_agentic_endpoint(req: AgentChatRequest):
    """
    Main Multi-Agent Workflow endpoint:
    Runs Input Guardrail -> Supervisor -> Teacher / Coder / Assessor / Researcher.
    """
    try:
        state = await execute_agentic_workflow(
            query=req.query,
            student_level=req.student_level or "Beginner",
            topic=req.topic or "General Quantum Computing",
        )

        return AgentChatResponse(
            success=True,
            active_agent=state.active_agent,
            route=state.route,
            final_response=state.final_response,
            guardrail_blocked=state.guardrail_blocked,
            thought_log=state.thought_log,
            code_snippet=state.code_snippet,
            code_framework=state.code_framework,
            execution_success=state.execution_success,
            execution_history=state.execution_history,
            plots_base64=state.plots_base64,
            rag_sources=state.rag_sources,
            assessment=state.assessment,
            timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat(),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agentic Engine Error: {str(e)}")


@router.post("/assess/submit", response_model=AssessSubmitResponse)
async def submit_assessment(req: AssessSubmitRequest):
    """Evaluates the student's selected MCQ option and diagnoses misconceptions."""
    try:
        evaluated = evaluate_student_answer(req.assessment, req.selected_option)
        return AssessSubmitResponse(success=True, assessment=evaluated)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Assessment Evaluation Error: {str(e)}")


@router.post("/upload-paper", response_model=UploadPaperResponse)
async def upload_research_paper(file: UploadFile = File(...)):
    """Uploads and indexes a quantum research paper PDF into the RAG vector store."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF documents are supported.")

    try:
        content = await file.read()
        doc_id = f"paper_{uuid.uuid4().hex[:8]}"
        chunks = pdf_parser.parse_pdf_bytes(content, doc_id=doc_id, title=file.filename)

        if not chunks:
            raise HTTPException(status_code=400, detail="Could not extract readable text from PDF.")

        quantum_vector_store.add_chunks(chunks)

        return UploadPaperResponse(
            success=True,
            title=file.filename,
            chunks_count=len(chunks),
            message=f"Successfully parsed and indexed {len(chunks)} sections from '{file.filename}'.",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process research paper: {str(e)}")


@router.get("/health")
async def agentic_health():
    """Returns operational status of the Agentic Quantum Engine."""
    return {
        "status": "ok",
        "service": "quantum-agentic-engine",
        "guardrails_active": True,
        "supported_frameworks": ["qiskit", "cirq"],
        "max_debug_iterations": 5,
        "indexed_chunks": len(quantum_vector_store.chunks),
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    }
