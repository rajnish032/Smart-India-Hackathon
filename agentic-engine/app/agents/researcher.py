import datetime
from app.agents.state import AgentState, AgentThought
from app.core.llm import get_llm
from app.rag.vector_store import quantum_vector_store


async def research_paper_agent_node(state: AgentState) -> AgentState:
    """
    Research / Paper Agent:
    Retrieves parsed sections from uploaded quantum research papers,
    breaks down the methodology, extracts algorithm specifications,
    and hands implementation requests off to the Coding Agent.
    """
    state.active_agent = "researcher"
    llm = get_llm()

    state.thought_log.append(
        AgentThought(
            agent="Research Agent",
            action="Analyzing Research Paper Sections",
            detail=f"Querying vector index for academic paper chunks: '{state.query}'",
            timestamp=datetime.datetime.now().strftime("%H:%M:%S"),
        )
    )

    # 1. Search vector store for relevant paper chunks
    chunks = quantum_vector_store.search(state.query, top_k=3)
    paper_context = ""
    citations = []
    for c, score in chunks:
        paper_context += f"\n[Paper Section: {c.title} - p.{c.page}]\n{c.content}\n"
        citations.append({
            "title": c.title,
            "page": c.page,
            "section": c.metadata.get("section", "Research Paper"),
        })
    state.rag_sources = citations

    # 2. Check if student requests implementing the paper's algorithm
    q_low = state.query.lower()
    wants_implementation = any(w in q_low for w in ["implement", "code", "write", "circuit", "simulate", "run"])

    system_prompt = (
        "You are an academic quantum computing research analyst. "
        "Your task is to analyze quantum research papers and preprints with rigorous accuracy. "
        "CRITICAL INTEGRITY RULE: Never claim that code reproduces a paper's experimental results "
        "unless it has been executed in the simulator and explicitly verified. "
        "Structure your analysis clearly:\n"
        "1. **Problem Statement & Motivation**\n"
        "2. **Theoretical Methodology & Principles**\n"
        "3. **Proposed Quantum Algorithm / Circuit Structure**\n"
        "4. **Simulation / Hardware Benchmark Results**\n"
        "5. **Limitations & Open Challenges**"
    )

    user_prompt = (
        f"Student Request: {state.query}\n\n"
        f"--- Extracted Paper Context ---\n{paper_context or 'No uploaded paper chunks found. Using foundational research knowledge.'}\n\n"
        "Provide a comprehensive, publication-grade analysis of the paper's findings."
    )

    analysis = await llm.generate_text(user_prompt, system_prompt=system_prompt, temperature=0.2)
    state.final_response = analysis

    if wants_implementation:
        state.thought_log.append(
            AgentThought(
                agent="Research Agent",
                action="Bridging to Coding Agent",
                detail="Extracted circuit specifications from paper. Handing task to Coding Agent for execution.",
                timestamp=datetime.datetime.now().strftime("%H:%M:%S"),
            )
        )
        state.route = "coder"

    state.thought_log.append(
        AgentThought(
            agent="Research Agent",
            action="Paper Analysis Complete",
            detail=f"Analyzed {len(citations)} paper excerpts with methodology and limitations evaluated.",
            timestamp=datetime.datetime.now().strftime("%H:%M:%S"),
        )
    )

    return state
