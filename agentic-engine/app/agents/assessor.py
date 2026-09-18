import datetime
from app.agents.state import AgentState, AgentThought, AssessmentData
from app.core.llm import get_llm


async def assessment_agent_node(state: AgentState) -> AgentState:
    """
    Assessment Agent:
    Generates an adaptive, topic-grounded Multiple-Choice Question (MCQ),
    evaluates conceptual misunderstandings, and computes student mastery gap.
    """
    state.active_agent = "assessor"
    llm = get_llm()

    # Determine quiz topic from query
    topic = state.topic or "Quantum Gates and Superposition"
    if "bell" in state.query.lower():
        topic = "Bell States & Quantum Entanglement"
    elif "grover" in state.query.lower():
        topic = "Grover's Search & Amplitude Amplification"
    elif "teleport" in state.query.lower():
        topic = "Quantum Teleportation Protocol"
    elif "hadamard" in state.query.lower():
        topic = "Hadamard Gate & Superposition"

    state.thought_log.append(
        AgentThought(
            agent="Assessment Agent",
            action="Generating Concept Assessment",
            detail=f"Crafting multiple-choice question for topic '{topic}' at {state.student_level} level.",
            timestamp=datetime.datetime.now().strftime("%H:%M:%S"),
        )
    )

    prompt = (
        f"Generate a challenging, high-quality multiple choice question for a quantum computing student.\n"
        f"Topic: {topic}\n"
        f"Student Level: {state.student_level}\n\n"
        "REQUIREMENTS:\n"
        "1. Exactly 4 options (A, B, C, D).\n"
        "2. Only ONE option is objectively correct.\n"
        "3. The distractors must reflect common quantum physics/computing misconceptions.\n"
        "4. Return valid JSON in this exact structure:\n"
        "{\n"
        '  "question": "What does a Hadamard gate do when applied to state |0⟩?",\n'
        '  "options": ["Transforms it to (|0⟩ + |1⟩)/√2", "Flips it to |1⟩", "Measures the qubit", "Entangles it with |1⟩"],\n'
        '  "correct_option": 0,\n'
        '  "explanations": [\n'
        '    "Correct. H|0⟩ creates equal superposition (|0⟩+|1⟩)/√2.",\n'
        '    "Incorrect. Pauli-X flips |0⟩ to |1⟩, not Hadamard.",\n'
        '    "Incorrect. Hadamard is a unitary transformation, not a measurement.",\n'
        '    "Incorrect. Hadamard operates on a single qubit; entanglement requires a 2-qubit gate like CNOT."\n'
        "  ]\n"
        "}"
    )

    json_res = await llm.generate_json(prompt)

    question = json_res.get("question", f"What is the physical significance of {topic}?")
    options = json_res.get("options", [
        "Creates equal superposition of states",
        "Destroys quantum coherence immediately",
        "Computes classical logical AND",
        "Swaps qubit frequency without phase change",
    ])
    correct_option = int(json_res.get("correct_option", 0))
    explanations = json_res.get("explanations", [
        "Correct understanding of the fundamental principle.",
        "Incorrect: Coherence is maintained by unitary evolution.",
        "Incorrect: Classical AND is irreversible and non-unitary.",
        "Incorrect: The operation alters state amplitudes.",
    ])

    state.assessment = AssessmentData(
        topic=topic,
        question=question,
        options=options,
        correct_option=correct_option,
        explanations=explanations,
        student_selected=None,
        is_correct=None,
        misconception_analysis=None,
        mastery_score=0.5,
        recommendation="Pending student submission",
    )

    state.final_response = (
        f"### 🎯 Concept Assessment: {topic}\n\n"
        f"**Question:**\n{question}\n\n"
        f"Please select your answer in the **Assessment Quiz Card** on your screen to receive an instant misconception evaluation and mastery rating."
    )

    state.thought_log.append(
        AgentThought(
            agent="Assessment Agent",
            action="Assessment Published",
            detail="Interactive MCQ published to student workspace with diagnostic scoring criteria.",
            timestamp=datetime.datetime.now().strftime("%H:%M:%S"),
        )
    )

    return state


def evaluate_student_answer(assessment: AssessmentData, selected_index: int) -> AssessmentData:
    """Evaluates the student's selected answer and computes mastery level & recommendation."""
    assessment.student_selected = selected_index
    is_correct = (selected_index == assessment.correct_option)
    assessment.is_correct = is_correct

    explanation = (
        assessment.explanations[selected_index]
        if selected_index < len(assessment.explanations)
        else "No explanation recorded."
    )

    if is_correct:
        assessment.mastery_score = 0.9
        assessment.recommendation = "next_topic"
        assessment.misconception_analysis = (
            f"Excellent! {explanation} You demonstrated mastery of this core principle. "
            "You are ready to advance to the next quantum topic or explore hands-on circuit implementation."
        )
    else:
        assessment.mastery_score = 0.35
        assessment.recommendation = "revise_concept"
        correct_exp = (
            assessment.explanations[assessment.correct_option]
            if assessment.correct_option < len(assessment.explanations)
            else ""
        )
        assessment.misconception_analysis = (
            f"Misconception Detected: {explanation}\n\n"
            f"**Correct Concept:** {correct_exp}\n\n"
            "Recommendation: Ask the Teaching Agent to review this concept or run a simulation to inspect the state amplitudes."
        )

    return assessment
