import datetime
from app.agents.state import AgentState, AgentThought
from app.core.llm import get_llm
from app.rag.vector_store import quantum_vector_store
from app.tools.tavily_search import tavily_tool


async def teaching_agent_node(state: AgentState) -> AgentState:
    """
    Teaching Agent:
    Retrieves foundational textbook chunks, searches Tavily if needed,
    and synthesizes an intuitive, mathematically grounded explanation.
    """
    state.active_agent = "teacher"
    state.thought_log.append(
        AgentThought(
            agent="Teaching Agent",
            action="Consulting Textbook RAG & Knowledge Base",
            detail=f"Searching quantum index for query: '{state.query}'",
            timestamp=datetime.datetime.now().strftime("%H:%M:%S"),
        )
    )

    # 1. Retrieve RAG chunks
    top_chunks = quantum_vector_store.search(state.query, top_k=2)
    rag_context = ""
    citations = []
    for chunk, score in top_chunks:
        rag_context += f"\n[Source: {chunk.title} - p.{chunk.page}]\n{chunk.content}\n"
        citations.append({
            "title": chunk.title,
            "page": chunk.page,
            "topic": chunk.metadata.get("topic", "Quantum Fundamentals"),
        })
    state.rag_sources = citations

    # 2. Check if query asks for current industry / hardware developments
    external_context = ""
    q_low = state.query.lower()
    if any(k in q_low for k in ["hardware", "processor", "ibm", "google", "benchmark", "fidelity", "record", "latest", "recent"]):
        state.thought_log.append(
            AgentThought(
                agent="Teaching Agent",
                action="Querying Tavily Web Retrieval",
                detail="Fetching current industry benchmarks and hardware announcements.",
                timestamp=datetime.datetime.now().strftime("%H:%M:%S"),
            )
        )
        tavily_res = await tavily_tool.search(state.query, max_results=2)
        for r in tavily_res.get("results", []):
            external_context += f"\n[Live Web: {r.get('title')}]\n{r.get('content')}\n"

    # 3. Formulate prompt for LLM
    system_prompt = (
        "You are an expert Quantum Computing Professor and Pedagogical AI Tutor. "
        "Your goal is to explain quantum concepts with clarity, mathematical rigor (using LaTeX math $...$ and $$...$$), "
        "and memorable intuition. Ground your explanation in the provided textbook references. "
        f"The student level is {state.student_level}. "
        "At the end of your response, always recommend the next related quantum concept they should learn."
    )

    user_prompt = (
        f"Student Query: {state.query}\n\n"
        f"--- Authoritative Textbook Chunks ---\n{rag_context}\n"
    )
    if external_context:
        user_prompt += f"\n--- Current Web / Hardware Developments ---\n{external_context}\n"

    user_prompt += (
        "\nProvide a comprehensive response structured as follows:\n"
        "1. **Core Concept & Intuition** (plain-English analogy)\n"
        "2. **Mathematical Formulation** (Hilbert space, Dirac notation, matrix representation)\n"
        "3. **Quantum Circuit / Physical Mechanism** (how gates or physical qubits implement it)\n"
        "4. **Citations & References** (cite the provided sources)\n"
        "5. **Recommended Next Topic** (what to study next)"
    )

    llm = get_llm()
    explanation = await llm.generate_text(user_prompt, system_prompt=system_prompt, temperature=0.3)

    state.final_response = explanation
    state.thought_log.append(
        AgentThought(
            agent="Teaching Agent",
            action="Explanation Synthesized",
            detail="Pedagogical response rendered with mathematical grounding and textbook citations.",
            timestamp=datetime.datetime.now().strftime("%H:%M:%S"),
        )
    )

    return state
