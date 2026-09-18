import datetime
import re
from app.agents.state import AgentState, AgentThought, ExecutionAttempt
from app.core.config import settings
from app.core.llm import get_llm
from app.execution.sandbox import default_sandbox
from app.execution.visualizer import plot_measurement_histogram


async def coding_agent_node(state: AgentState) -> AgentState:
    """
    Autonomous Coding Agent:
    Generates Qiskit or Cirq code, executes it in a sandboxed runner,
    inspects stdout/stderr, and performs iterative self-healing debugging
    until execution succeeds or MAX_ITERATIONS is reached.
    """
    state.active_agent = "coder"
    llm = get_llm()

    # Detect framework preference
    if "cirq" in state.query.lower():
        state.code_framework = "cirq"
    else:
        state.code_framework = "qiskit"

    state.thought_log.append(
        AgentThought(
            agent="Coding Agent",
            action="Initializing Quantum Code Generator",
            detail=f"Target Framework: {state.code_framework.upper()} | Max Debug Iterations: {state.max_iterations}",
            timestamp=datetime.datetime.now().strftime("%H:%M:%S"),
        )
    )

    # Initial Code Generation Prompt
    system_prompt = (
        f"You are an elite Quantum Software Engineer specializing in {state.code_framework.upper()}. "
        "Write clean, modern, standalone, executable Python quantum code that satisfies the user's request. "
        "Rules:\n"
        "1. Return ONLY pure executable Python code inside a ```python ``` block.\n"
        "2. Include print statements displaying the statevector or measurement counts dictionary.\n"
        "3. If using Qiskit, simulate with qiskit.quantum_info.Statevector (for statevector/probabilities) "
        "or qiskit.primitives.StatevectorSampler (for shot-based measurement counts).\n"
        "4. Do NOT import qiskit_aer, AerSimulator, Aer, or BasicAer under any circumstances - "
        "the qiskit-aer package is unavailable in this execution environment and any code using it will "
        "fail immediately. Statevector/StatevectorSampler are locally available and fully sufficient.\n"
        "5. Create a matplotlib plot of the circuit or measurement counts if appropriate (using plt.figure(), plt.bar(), etc.).\n"
        "6. When using StatevectorSampler for measurement counts, follow this EXACT, verified-working pattern "
        "(the classical register on QuantumCircuit(n, n) defaults to name 'c'; PrimitiveResult has NO "
        "'.quasi_dists' attribute - that is the deprecated V1 primitives API and will crash with "
        "AttributeError. Always read counts via `result[0].data.<register_name>.get_counts()`):\n"
        "```python\n"
        "from qiskit import QuantumCircuit\n"
        "from qiskit.primitives import StatevectorSampler\n"
        "qc = QuantumCircuit(2, 2)\n"
        "qc.h(0)\n"
        "qc.cx(0, 1)\n"
        "qc.measure([0, 1], [0, 1])\n"
        "sampler = StatevectorSampler()\n"
        "job = sampler.run([qc], shots=1000)\n"
        "result = job.result()\n"
        "counts = result[0].data.c.get_counts()\n"
        "print('Measurement Counts:', counts)\n"
        "```"
    )

    user_prompt = f"User Request: {state.query}\nGenerate the complete quantum circuit implementation in {state.code_framework.upper()}."

    raw_response = await llm.generate_text(user_prompt, system_prompt=system_prompt, temperature=0.1)
    current_code = _extract_python_code(raw_response)
    if not current_code:
        current_code = _get_default_circuit(state.code_framework)

    state.code_snippet = current_code
    state.execution_success = False
    state.current_iteration = 0

    # ==========================================
    # AGENTIC SELF-HEALING DEBUGGING LOOP
    # ==========================================
    for iteration in range(1, state.max_iterations + 1):
        state.current_iteration = iteration

        state.thought_log.append(
            AgentThought(
                agent="Coding Agent",
                action=f"Executing Attempt {iteration}/{state.max_iterations}",
                detail=f"Running {state.code_framework.upper()} simulation in isolated sandbox...",
                timestamp=datetime.datetime.now().strftime("%H:%M:%S"),
            )
        )

        exec_res = await default_sandbox.execute_code(current_code, timeout=settings.EXECUTION_TIMEOUT_SECONDS)

        attempt = ExecutionAttempt(
            iteration=iteration,
            code=current_code,
            success=exec_res.success,
            stdout=exec_res.stdout,
            stderr=exec_res.stderr,
            diagnostics=exec_res.diagnostics,
            execution_time_ms=exec_res.execution_time_ms,
        )
        state.execution_history.append(attempt)

        if exec_res.success:
            state.execution_success = True
            state.plots_base64.extend(exec_res.plots_base64)

            # If no plot was created by the script, auto-extract counts and generate visualization
            if not state.plots_base64 and "{" in exec_res.stdout and "}" in exec_res.stdout:
                parsed_counts = _parse_counts_from_stdout(exec_res.stdout)
                if parsed_counts:
                    auto_plot = plot_measurement_histogram(parsed_counts, title=f"{state.code_framework.upper()} Measurement Results")
                    if auto_plot:
                        state.plots_base64.append(auto_plot)

            state.thought_log.append(
                AgentThought(
                    agent="Coding Agent",
                    action=f"Simulation Succeeded on Attempt {iteration}!",
                    detail=f"Execution completed cleanly in {exec_res.execution_time_ms}ms with {len(state.plots_base64)} visual artifacts.",
                    timestamp=datetime.datetime.now().strftime("%H:%M:%S"),
                )
            )
            break

        # If execution failed and we have iterations left, trigger LLM Refactor/Fix
        state.thought_log.append(
            AgentThought(
                agent="Coding Agent",
                action=f"Error Encountered on Attempt {iteration}",
                detail=f"Error: {exec_res.diagnostics or 'Runtime failure'}. Analyzing traceback to generate code fix...",
                timestamp=datetime.datetime.now().strftime("%H:%M:%S"),
            )
        )

        if iteration < state.max_iterations:
            aer_related_failure = any(
                token in exec_res.stderr
                for token in ("qiskit_aer", "AerSimulator", "BasicAer", "cannot import name 'Aer'")
            )
            sampler_api_failure = "quasi_dists" in exec_res.stderr
            fix_prompt = (
                f"The following {state.code_framework.upper()} code threw an error during local execution:\n\n"
                f"```python\n{current_code}\n```\n\n"
                f"Execution Error Traceback:\n{exec_res.stderr}\n\n"
                "TASK:\n"
                "1. Identify the exact root cause of the error (e.g. deprecated API, dimension mismatch, gate syntax).\n"
                "2. Provide the corrected, fully working standalone Python script.\n"
                "3. Enclose the fixed code in ```python ... ```."
            )
            if aer_related_failure:
                fix_prompt += (
                    "\n\nIMPORTANT: This error is because qiskit_aer/AerSimulator/Aer/BasicAer are NOT installed "
                    "in this environment - do not try any of them, including alternate names or import paths. "
                    "Rewrite the simulation to use qiskit.quantum_info.Statevector (for probabilities/statevector) "
                    "or qiskit.primitives.StatevectorSampler (for shot-based measurement counts) instead - "
                    "both are locally available and require no external simulator backend."
                )
            if sampler_api_failure:
                fix_prompt += (
                    "\n\nIMPORTANT: '.quasi_dists' is the deprecated V1 primitives API and does not exist on "
                    "StatevectorSampler's PrimitiveResult. Use this EXACT working pattern instead: "
                    "`result = job.result(); counts = result[0].data.<register_name>.get_counts()` "
                    "where <register_name> is your classical register's name (defaults to 'c' for "
                    "QuantumCircuit(n, n))."
                )
            fix_response = await llm.generate_text(fix_prompt, system_prompt=system_prompt, temperature=0.1)
            fixed_code = _extract_python_code(fix_response)
            if fixed_code and fixed_code != current_code:
                current_code = fixed_code
                state.code_snippet = current_code

    # Synthesize explanation of results
    if state.execution_success:
        state.final_response = (
            f"### Quantum Simulation Successful (Attempt {state.current_iteration}/{state.max_iterations})\n\n"
            f"The **{state.code_framework.upper()}** circuit was executed and verified locally in **{state.execution_history[-1].execution_time_ms}ms**.\n\n"
            f"```python\n{state.code_snippet}\n```\n\n"
            f"#### Simulation Output (`stdout`):\n```text\n{state.execution_history[-1].stdout.strip() or 'Execution completed with 0 errors.'}\n```\n\n"
            "Review the generated circuit diagram and state probability plot in the **Visualization Panel**."
        )
    else:
        state.final_response = (
            f"### Simulation Failed after {state.max_iterations} Self-Healing Attempts\n\n"
            f"The code encountered an execution error that could not be automatically resolved:\n\n"
            f"```text\n{state.execution_history[-1].stderr.strip()}\n```\n\n"
            f"Last attempted code:\n```python\n{state.code_snippet}\n```"
        )

    return state


def _looks_like_python_code(candidate: str) -> bool:
    """
    Distinguishes an actual code block from a fenced quote of a traceback/error
    message (which the LLM sometimes echoes back inside ``` when diagnosing a
    failure, before presenting the real fix). A real fix should have Python
    structure (imports/def/assignment); a traceback echo reads as prose/error text.
    """
    stripped = candidate.strip()
    if not stripped:
        return False
    if re.search(r"\b(Error|Exception)\b\s*:", stripped) and "import" not in stripped.lower():
        return False
    return bool(re.search(r"^\s*(import|from|def|class)\b", stripped, re.MULTILINE)) or "=" in stripped


def _extract_python_code(text: str) -> str:
    """
    Extracts Python code enclosed in markdown code blocks. When the LLM's
    response contains multiple fenced blocks (e.g. it quotes the error traceback
    in one block before giving the corrected code in another), picks the LAST
    block that actually looks like Python rather than blindly taking the first
    match - the first block is often the traceback being echoed back, not the fix.
    """
    blocks = re.findall(r"```(?:python)?\s*([\s\S]*?)```", text)
    for block in reversed(blocks):
        candidate = block.strip()
        if _looks_like_python_code(candidate):
            return candidate

    # No fenced block looked like real code - check if the raw text itself does
    # (LLM sometimes replies with unfenced code).
    if _looks_like_python_code(text) and ("QuantumCircuit" in text or "cirq" in text):
        return text.strip()
    return ""


def _get_default_circuit(framework: str) -> str:
    if framework == "cirq":
        return (
            "import cirq\n"
            "q0, q1 = cirq.LineQubit.range(2)\n"
            "circuit = cirq.Circuit(\n"
            "    cirq.H(q0),\n"
            "    cirq.CNOT(q0, q1),\n"
            "    cirq.measure(q0, q1, key='result')\n"
            ")\n"
            "simulator = cirq.Simulator()\n"
            "result = simulator.run(circuit, repetitions=1000)\n"
            "print(circuit)\n"
            "print(result.histogram(key='result'))\n"
        )
    return (
        "import matplotlib.pyplot as plt\n"
        "from qiskit import QuantumCircuit\n"
        "from qiskit.primitives import StatevectorSampler\n"
        "from qiskit.visualization import plot_histogram\n"
        "# 2-Qubit Bell State |Phi+>\n"
        "qc = QuantumCircuit(2, 2)\n"
        "qc.h(0)\n"
        "qc.cx(0, 1)\n"
        "qc.measure([0, 1], [0, 1])\n"
        "sampler = StatevectorSampler()\n"
        "job = sampler.run([qc], shots=1000)\n"
        "result = job.result()\n"
        "counts = result[0].data.c.get_counts()\n"
        "print('Measurement Counts:', counts)\n"
        "plot_histogram(counts)\n"
    )


def _parse_counts_from_stdout(stdout: str) -> dict:
    """
    Heuristic parser to extract a bitstring -> count/probability dict from stdout.
    Tolerates both plain dict reprs (e.g. {'00': 0.5}) and numpy scalar reprs
    (e.g. {np.str_('00'): np.float64(0.5)}) that appear when printing
    Statevector.probabilities_dict() or Counts objects under recent numpy/qiskit versions.
    """
    pair_pattern = re.compile(
        r"(?:np\.str_\(\s*)?['\"]([01]+)['\"]\)?\s*:\s*"
        r"(?:np\.float64\(\s*)?([\d.eE+-]+)\)?"
    )
    pairs = pair_pattern.findall(stdout)
    if not pairs:
        return {}
    try:
        return {bitstring: float(value) for bitstring, value in pairs}
    except ValueError:
        return {}
