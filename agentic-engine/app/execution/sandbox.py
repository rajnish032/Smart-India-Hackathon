import asyncio
import base64
import functools
import os
import subprocess
import sys
import tempfile
import time
from typing import List, Optional
from pydantic import BaseModel
from app.core.config import settings


# LLM-generated code occasionally contains "smart" typographic punctuation (curly
# quotes, en/em/non-breaking dashes) copied from prose. Those are invalid Python
# syntax outside of string literals and crash the sandbox with a SyntaxError that
# the self-healing loop can't meaningfully "fix" (the LLM tends to reproduce the
# same character). Normalize them to plain ASCII before execution.
_UNICODE_PUNCTUATION_MAP = {
    "‐": "-", "‑": "-", "‒": "-", "–": "-", "—": "-", "―": "-",
    "‘": "'", "’": "'",
    "“": '"', "”": '"',
    " ": " ",
}


def _sanitize_code(code: str) -> str:
    for bad, good in _UNICODE_PUNCTUATION_MAP.items():
        code = code.replace(bad, good)
    return code


class ExecutionResult(BaseModel):
    success: bool
    stdout: str = ""
    stderr: str = ""
    execution_time_ms: int = 0
    plots_base64: List[str] = []
    error_type: Optional[str] = None
    diagnostics: Optional[str] = None


class QuantumSandbox:
    """Isolated Python execution environment for Qiskit and Cirq circuits."""

    def __init__(self, python_executable: Optional[str] = None):
        self.python_exe = python_executable or sys.executable

    async def execute_code(self, code: str, timeout: int = 15) -> ExecutionResult:
        """
        Executes quantum Python code asynchronously in a sandboxed subprocess.
        Automatically intercepts matplotlib plots, captures stdout/stderr, and enforces timeout.
        """
        start_time = time.time()
        code = _sanitize_code(code)

        # Create temporary working directory for script and plot artifacts
        with tempfile.TemporaryDirectory(prefix="quantum_exec_") as temp_dir:
            script_path = os.path.join(temp_dir, "circuit_runner.py")
            plot_dir = os.path.join(temp_dir, "plots")
            os.makedirs(plot_dir, exist_ok=True)

            # Instrument code to use Agg headless backend and capture any active plots
            instrumented_code = (
                "import os, sys\n"
                "import matplotlib\n"
                "matplotlib.use('Agg')\n"
                "import matplotlib.pyplot as plt\n"
                f"PLOT_DIR = r'{plot_dir}'\n"
                "\n"
                f"{code}\n"
                "\n"
                "# Auto-save any active matplotlib figure that actually has content.\n"
                "# Generated code sometimes calls plt.figure() right before a helper like\n"
                "# qc.draw(output='mpl') that creates its OWN separate figure internally -\n"
                "# the pre-created one is left registered but empty, producing a blank image.\n"
                "# Skip any figure whose axes contain no data at all.\n"
                "if plt.get_fignums():\n"
                "    saved_idx = 0\n"
                "    for fignum in plt.get_fignums():\n"
                "        fig = plt.figure(fignum)\n"
                "        axes = fig.get_axes()\n"
                "        if not axes or not any(ax.has_data() or ax.texts or ax.patches for ax in axes):\n"
                "            continue\n"
                "        fig_path = os.path.join(PLOT_DIR, f'plot_{saved_idx}.png')\n"
                "        fig.tight_layout()\n"
                "        fig.savefig(fig_path, dpi=130, bbox_inches='tight')\n"
                "        saved_idx += 1\n"
            )

            with open(script_path, "w", encoding="utf-8") as f:
                f.write(instrumented_code)

            try:
                env = os.environ.copy()
                env["PYTHONIOENCODING"] = "utf-8"
                env["PYTHONUTF8"] = "1"

                # Run the blocking subprocess call in a worker thread rather than via
                # asyncio.create_subprocess_exec. On Windows, subprocess creation is only
                # implemented for the Proactor event loop; uvicorn switches to the Selector
                # loop whenever it runs with --reload or multiple workers, which makes
                # create_subprocess_exec raise a bare NotImplementedError. run_in_executor
                # sidesteps that entirely and works under any event loop, on any platform.
                loop = asyncio.get_running_loop()
                run_fn = functools.partial(
                    subprocess.run,
                    [self.python_exe, script_path],
                    cwd=temp_dir,
                    env=env,
                    capture_output=True,
                    timeout=timeout,
                )

                try:
                    proc_result = await loop.run_in_executor(None, run_fn)
                except subprocess.TimeoutExpired:
                    return ExecutionResult(
                        success=False,
                        stderr=f"Execution timed out after {timeout} seconds.",
                        error_type="TimeoutError",
                        diagnostics="The quantum simulation took too long to compute. Check qubit count or loops.",
                        execution_time_ms=int((time.time() - start_time) * 1000),
                    )

                duration_ms = int((time.time() - start_time) * 1000)
                stdout_str = proc_result.stdout.decode("utf-8", errors="replace")
                stderr_str = proc_result.stderr.decode("utf-8", errors="replace")

                # Collect any generated plots
                plots = []
                for fname in sorted(os.listdir(plot_dir)):
                    if fname.endswith(".png"):
                        fpath = os.path.join(plot_dir, fname)
                        with open(fpath, "rb") as pf:
                            b64 = base64.b64encode(pf.read()).decode("utf-8")
                            plots.append(f"data:image/png;base64,{b64}")

                success = proc_result.returncode == 0
                error_type = None
                diagnostics = None

                if not success:
                    # Extract last exception type from stderr
                    err_lines = stderr_str.strip().split("\n")
                    for line in reversed(err_lines):
                        if "Error:" in line or "Exception:" in line:
                            error_type = line.split(":")[0].strip()
                            diagnostics = line.strip()
                            break
                    if not error_type and err_lines:
                        error_type = "ExecutionError"
                        diagnostics = err_lines[-1]

                return ExecutionResult(
                    success=success,
                    stdout=stdout_str,
                    stderr=stderr_str,
                    execution_time_ms=duration_ms,
                    plots_base64=plots,
                    error_type=error_type,
                    diagnostics=diagnostics,
                )

            except Exception as e:
                return ExecutionResult(
                    success=False,
                    stderr=repr(e),
                    error_type=type(e).__name__,
                    diagnostics=f"Failed to launch Python subprocess: {type(e).__name__}: {e}",
                    execution_time_ms=int((time.time() - start_time) * 1000),
                )


default_sandbox = QuantumSandbox()
