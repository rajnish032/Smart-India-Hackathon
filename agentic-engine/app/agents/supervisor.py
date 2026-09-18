import datetime
from typing import Literal
from app.agents.assessor import assessment_agent_node
from app.agents.coder import coding_agent_node
from app.agents.researcher import research_paper_agent_node
from app.agents.state import AgentState, AgentThought
from app.agents.teacher import teaching_agent_node
from app.core.guardrails import classify_input_guardrail

# Attempt LangGraph StateGraph, or provide a reliable fallback runner
try:
    from langgraph.graph import StateGraph, END
    HAS_LANGGRAPH = True
except ImportError:
    HAS_LANGGRAPH = False


def supervisor_node(state: AgentState) -> AgentState:
    """
    Supervisor Agent:
    Evaluates student query intent, maintains session context,
    and determines the optimal agent delegation route.
    """
    state.active_agent = "supervisor"
    q_low = state.query.lower()

    # Intent Classification Logic
    if any(k in q_low for k in ["quiz", "test me", "assess", "evaluation", "mcq", "question me", "exam"]):
        route = "assessor"
        action_detail = "Assessment intent detected. Routing to Assessment Agent for MCQ generation."
    elif any(k in q_low for k in ["paper", "arxiv", "methodology", "preprint", "section", "abstract", "literature"]):
        route = "researcher"
        action_detail = "Academic research intent detected. Routing to Research/Paper Agent for RAG deep-dive."
    elif any(k in q_low for k in ["code", "circuit", "qiskit", "cirq", "simulate", "execute", "run", "bell state", "ghz", "teleportation circuit"]):
        route = "coder"
        action_detail = "Quantum circuit & code execution intent detected. Routing to Coding Agent."
    else:
        route = "teacher"
        action_detail = "Conceptual explanation intent detected. Routing to Teaching Agent."

    state.route = route
    state.thought_log.append(
        AgentThought(
            agent="Supervisor Agent",
            action="Intent Triage & Route Assigned",
            detail=f"{action_detail} (Route -> '{route}')",
            timestamp=datetime.datetime.now().strftime("%H:%M:%S"),
        )
    )

    return state


async def execute_agentic_workflow(
    query: str,
    student_level: str = "Beginner",
    topic: str = "Quantum Computing",
) -> AgentState:
    """
    Top-level execution pipeline with:
    1. Input Guardrail Classifier (rejection of non-quantum queries)
    2. Supervisor Intent Routing
    3. Specialized Agent Execution (Teacher / Coder / Assessor / Researcher)
    4. Multi-step chaining (e.g. Researcher -> Coder)
    """
    state = AgentState(
        query=query,
        student_level=student_level,
        topic=topic,
    )

    # 1. Input Guardrail Check (Prevents wasteful execution on off-topic requests)
    guardrail_result = classify_input_guardrail(query)
    if not guardrail_result.is_allowed:
        state.guardrail_blocked = True
        state.final_response = guardrail_result.rejection_message
        state.thought_log.append(
            AgentThought(
                agent="Quantum Guardrail",
                action="Query Filtered",
                detail=f"Query rejected as non-quantum domain: {guardrail_result.reason}",
                timestamp=datetime.datetime.now().strftime("%H:%M:%S"),
            )
        )
        return state

    # 2. Supervisor Triage
    state = supervisor_node(state)

    # 3. Route to target agent
    if state.route == "teacher":
        state = await teaching_agent_node(state)

    elif state.route == "coder":
        state = await coding_agent_node(state)

    elif state.route == "assessor":
        state = await assessment_agent_node(state)

    elif state.route == "researcher":
        state = await research_paper_agent_node(state)
        # If researcher requested circuit implementation, chain into Coder!
        if state.route == "coder":
            state = await coding_agent_node(state)

    return state
