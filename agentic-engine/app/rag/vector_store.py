import math
import re
from typing import Dict, List, Optional, Tuple
from app.rag.document_parser import DocumentChunk


# Built-in foundational quantum textbook corpus chunks
DEFAULT_QUANTUM_CORPUS = [
    DocumentChunk(
        chunk_id="kb_superposition",
        doc_id="nielsen_chuang",
        title="Principles of Quantum Computation (Nielsen & Chuang)",
        page=13,
        content=(
            "Quantum Superposition: A classical bit can only exist in the state 0 or 1. "
            "A qubit, by contrast, is a two-state quantum-mechanical system mathematically described as a unit vector "
            "in a two-dimensional Hilbert space. Its state is a linear combination |ψ⟩ = α|0⟩ + β|1⟩, where α and β "
            "are complex probability amplitudes satisfying |α|² + |β|² = 1. The Hadamard gate H maps |0⟩ to (|0⟩ + |1⟩)/√2 "
            "and |1⟩ to (|0⟩ - |1⟩)/√2, establishing equal probability of measurement in the computational basis."
        ),
        metadata={"topic": "superposition", "section": "1.2 Qubits and Quantum States"},
    ),
    DocumentChunk(
        chunk_id="kb_entanglement",
        doc_id="nielsen_chuang",
        title="Principles of Quantum Computation (Nielsen & Chuang)",
        page=19,
        content=(
            "Quantum Entanglement & Bell States: When two or more qubits interact, they can enter non-separable composite states "
            "that cannot be factored into product states of individual qubits: |ψ⟩ ≠ |ψ_A⟩ ⊗ |ψ_B⟩. "
            "The four canonical Bell states (EPR pairs) are: "
            "|Φ⁺⟩ = (|00⟩ + |11⟩)/√2, |Φ⁻⟩ = (|00⟩ - |11⟩)/√2, "
            "|Ψ⁺⟩ = (|01⟩ + |10⟩)/√2, |Ψ⁻⟩ = (|01⟩ - |10⟩)/√2. "
            "In a Bell state, measuring one qubit instantaneously determines the state of the entangled partner regardless of spatial distance."
        ),
        metadata={"topic": "entanglement", "section": "1.3 Multi-Qubit Systems"},
    ),
    DocumentChunk(
        chunk_id="kb_quantum_gates",
        doc_id="qiskit_textbook",
        title="Qiskit Global Textbook: Fundamentals of Quantum Gates",
        page=45,
        content=(
            "Single-Qubit and Multi-Qubit Unitary Operators: All quantum logic gates must be represented by unitary matrices (U†U = I) "
            "to preserve the norm of quantum state vectors. Fundamental single-qubit gates include: "
            "Pauli-X (NOT gate, bit flip): [[0, 1], [1, 0]]; "
            "Pauli-Z (Phase flip): [[1, 0], [0, -1]]; "
            "Pauli-Y: [[0, -i], [i, 0]]; "
            "Hadamard H: (1/√2)[[1, 1], [1, -1]]; "
            "Phase gate S (Z^(1/2)) and T gate (Z^(1/4)). "
            "The standard entangling two-qubit gate is Controlled-NOT (CNOT / CX), which flips the target qubit if the control is |1⟩."
        ),
        metadata={"topic": "quantum_gates", "section": "2.1 Quantum Circuits and Logic"},
    ),
    DocumentChunk(
        chunk_id="kb_grover",
        doc_id="nielsen_chuang",
        title="Principles of Quantum Computation (Nielsen & Chuang)",
        page=248,
        content=(
            "Grover's Search Algorithm: Solves the unstructured search problem for an item in a database of size N = 2^n in O(√N) iterations, "
            "representing a quadratic speedup over classical O(N) searches. "
            "Algorithm components: (1) Initialize all n qubits in uniform superposition using H^⊗n; "
            "(2) Apply the Oracle operator U_w that inverts the phase of the marked target state |w⟩; "
            "(3) Apply the Grover Diffusion operator (inversion about the mean) 2|s⟩⟨s| - I; "
            "(4) Repeat the oracle + diffusion subroutine approximately (π/4)√N times; "
            "(5) Measure in the computational basis with near certainty of obtaining |w⟩."
        ),
        metadata={"topic": "grover", "section": "6.1 Quantum Search Algorithms"},
    ),
    DocumentChunk(
        chunk_id="kb_teleportation",
        doc_id="qiskit_textbook",
        title="Qiskit Global Textbook: Quantum Protocols",
        page=92,
        content=(
            "Quantum Teleportation Protocol: Allows transmitting an unknown quantum state |ψ⟩ from Alice to Bob using a pre-shared "
            "entangled Bell pair (|Φ⁺⟩ = (|00⟩ + |11⟩)/√2) and two classical bits of communication. "
            "Steps: (1) Alice entangles her unknown state |ψ⟩ with her half of the Bell pair using CNOT and H gates; "
            "(2) Alice measures her two qubits, yielding classical bit pair (m₁, m₂); "
            "(3) Alice sends the 2 classical bits to Bob; "
            "(4) Bob applies corrective Pauli gates X^m₂ and Z^m₁ to his qubit to perfectly recover state |ψ⟩. "
            "The no-cloning theorem is preserved because Alice's original state is destroyed during measurement."
        ),
        metadata={"topic": "teleportation", "section": "3.4 Teleportation and Superdense Coding"},
    ),
]


class LocalQuantumVectorStore:
    """
    Lightweight, deterministic vector store and semantic search engine.
    Works offline without cloud database dependencies.
    """

    def __init__(self):
        self.chunks: List[DocumentChunk] = list(DEFAULT_QUANTUM_CORPUS)

    def add_chunks(self, new_chunks: List[DocumentChunk]):
        """Adds newly parsed document chunks (e.g. from uploaded papers)."""
        self.chunks.extend(new_chunks)

    def search(self, query: str, top_k: int = 3) -> List[Tuple[DocumentChunk, float]]:
        """Searches documents using term frequency and keyword matching scores."""
        query_words = set(re.findall(r"\w+", query.lower()))
        if not query_words:
            return [(c, 1.0) for c in self.chunks[:top_k]]

        scored = []
        for chunk in self.chunks:
            chunk_words = re.findall(r"\w+", chunk.content.lower())
            total_words = len(chunk_words) or 1

            # Simple TF match + metadata boosting
            matches = sum(1 for w in chunk_words if w in query_words)
            score = (matches / math.sqrt(total_words))

            # Boost if query words match the title or topic metadata
            meta_str = " ".join(chunk.metadata.values()).lower() + " " + chunk.title.lower()
            if any(w in meta_str for w in query_words):
                score += 1.5

            if score > 0.05:
                scored.append((chunk, score))

        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:top_k]


quantum_vector_store = LocalQuantumVectorStore()
