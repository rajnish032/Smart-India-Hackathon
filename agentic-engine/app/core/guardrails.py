import re
from typing import Tuple
from pydantic import BaseModel


class GuardrailResult(BaseModel):
    is_allowed: bool
    rejection_message: str = ""
    detected_topic: str = "quantum"
    reason: str = ""


# Default friendly fixed message for off-topic requests
FIXED_GUARDRAIL_MESSAGE = (
    "⚛️ **Quantum Domain Notice**\n\n"
    "I am an AI-powered Quantum Learning Agent specialized exclusively in **Quantum Computing**, "
    "quantum algorithms, quantum circuits (**Qiskit / Cirq**), simulation experiments, and quantum research.\n\n"
    "I cannot answer questions on unrelated topics (such as weather, entertainment, general chit-chat, or politics). "
    "Please ask a question about quantum mechanics, qubits, quantum gates, or request a circuit simulation to get started!"
)

# High-confidence quantum terminology for instant pass-through
QUANTUM_KEYWORDS = [
    r"\bqubit(s)?\b",
    r"\bquantum\b",
    r"\bsuperposition\b",
    r"\bentangle(d|ment)?\b",
    r"\bbloch\b",
    r"\bhadamard\b",
    r"\bcnot\b",
    r"\btoffoli\b",
    r"\bpauli\b",
    r"\bqiskit\b",
    r"\bcirq\b",
    r"\baer\b",
    r"\bvqe\b",
    r"\bgrover\b",
    r"\bshor\b",
    r"\bdeutsch\b",
    r"\bteleport(ation)?\b",
    r"\bstatevector\b",
    r"\bfidelity\b",
    r"\bunitary\b",
    r"\bhamiltonian\b",
    r"\bdecoherence\b",
    r"\bghz\b",
    r"\bbell state\b",
    r"\bquantum gate(s)?\b",
    r"\bphase\s*flip\b",
    r"\bbit\s*flip\b",
    r"\bmeasurement\b",
    r"\bwave\s*function\b",
    r"\bdirac\b",
    r"\bbra\b",
    r"\bket\b",
    r"\b\|\d+⟩",
    r"\|[01]\>",
    r"\bschrod(inger)?\b",
    r"\btransmon\b",
    r"\bionq\b",
    r"\bqbraid\b",
    r"\bcircuit\b",
    r"\bquantum volume\b",
    r"\berror correction\b",
    r"\bsurface code\b",
    r"\bqaoa\b",
    r"\bqasm\b",
]

# Obvious off-topic keywords for instant rejection
OBVIOUS_OFF_TOPIC_KEYWORDS = [
    r"\bweather\b",
    r"\bforecast\b",
    r"\brain(ing)?\b",
    r"\bsnow(ing)?\b",
    r"\btemperature\b",
    r"\bcricket score\b",
    r"\bfootball score\b",
    r"\bpremier league\b",
    r"\bhoroscope\b",
    r"\bzodiac\b",
    r"\brecipe\b",
    r"\bcook(ing)?\b",
    r"\bmovie recommendation\b",
    r"\bstock market advice\b",
    r"\bcrypto price\b",
    r"\belection results\b",
    r"\bpolitics\b",
    r"\bcelebrity gossip\b",
    r"\bbooking flight\b",
]

_QUANTUM_REGEX = re.compile("|".join(QUANTUM_KEYWORDS), re.IGNORECASE)
_OFF_TOPIC_REGEX = re.compile("|".join(OBVIOUS_OFF_TOPIC_KEYWORDS), re.IGNORECASE)


def classify_input_guardrail(text: str) -> GuardrailResult:
    """
    Fast, reliable input classification guardrail for quantum education.
    Rejects off-topic queries immediately to prevent unneeded agent workflows.
    """
    cleaned = text.strip()
    if not cleaned:
        return GuardrailResult(
            is_allowed=False,
            rejection_message="Please enter a quantum computing question or circuit request.",
            reason="empty_query",
        )

    # 1. Obvious off-topic check
    if _OFF_TOPIC_REGEX.search(cleaned) and not _QUANTUM_REGEX.search(cleaned):
        return GuardrailResult(
            is_allowed=False,
            rejection_message=FIXED_GUARDRAIL_MESSAGE,
            detected_topic="off_topic",
            reason="Detected explicitly off-topic query (e.g., weather/lifestyle).",
        )

    # 2. Obvious quantum keywords check
    if _QUANTUM_REGEX.search(cleaned):
        return GuardrailResult(
            is_allowed=True,
            detected_topic="quantum",
            reason="Passed quantum keyword gate.",
        )

    # 3. Short greetings / meta inquiries (allow so user can start dialogue)
    greetings = ["hello", "hi", "hey", "help", "who are you", "what can you do", "start"]
    if cleaned.lower() in greetings or any(cleaned.lower().startswith(g) for g in ["hello", "hi "]):
        return GuardrailResult(
            is_allowed=True,
            detected_topic="greeting",
            reason="Permitted conversational entry point.",
        )

    # 4. For short phrases that mention circuits, algorithms, code, physics, or gates
    meta_terms = ["code", "circuit", "gate", "matrix", "simulate", "matrix", "qubit", "algorithm", "paper", "quiz"]
    if any(term in cleaned.lower() for term in meta_terms):
        return GuardrailResult(
            is_allowed=True,
            detected_topic="quantum_adjacent",
            reason="Contains quantum/computational terminology.",
        )

    # 5. Default boundary enforcement: If entirely ungrounded and no quantum terms, guardrail rejects
    words = cleaned.split()
    if len(words) > 3 and not _QUANTUM_REGEX.search(cleaned):
        return GuardrailResult(
            is_allowed=False,
            rejection_message=FIXED_GUARDRAIL_MESSAGE,
            detected_topic="non_quantum",
            reason="Query does not relate to quantum computing concepts or tools.",
        )

    return GuardrailResult(
        is_allowed=True,
        detected_topic="general_quantum",
        reason="Defaulting to permissive for short query.",
    )
