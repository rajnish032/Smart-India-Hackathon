import base64
import io
from typing import Dict, Optional
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np


def plot_measurement_histogram(counts: Dict[str, int], title: str = "Quantum Measurement Probabilities") -> str:
    """
    Generates a high-quality matplotlib bar chart for quantum measurement counts,
    returning a base64 data URI string.
    """
    if not counts:
        return ""

    total = sum(counts.values()) or 1
    labels = sorted(counts.keys())
    values = [counts[k] / total for k in labels]
    raw_counts = [counts[k] for k in labels]

    fig, ax = plt.subplots(figsize=(7, 4), dpi=130)
    fig.patch.set_facecolor("#0b0f19")
    ax.set_facecolor("#111827")

    colors = plt.cm.viridis(np.linspace(0.4, 0.85, len(labels)))
    bars = ax.bar(labels, values, color=colors, edgecolor="#38bdf8", linewidth=1.2, width=0.55)

    for bar, count, val in zip(bars, raw_counts, values):
        height = bar.get_height()
        ax.annotate(
            f"{val:.1%}\n({count})",
            xy=(bar.get_x() + bar.get_width() / 2, height),
            xytext=(0, 4),
            textcoords="offset points",
            ha="center",
            va="bottom",
            fontsize=9,
            color="#e0e7ff",
            fontweight="bold",
        )

    ax.set_ylim(0, max(values) * 1.25 if values else 1.0)
    ax.set_title(title, fontsize=12, color="#38bdf8", fontweight="bold", pad=12)
    ax.set_xlabel("Computational Basis State |x⟩", fontsize=10, color="#94a3b8", labelpad=8)
    ax.set_ylabel("Probability P(x)", fontsize=10, color="#94a3b8", labelpad=8)

    ax.tick_params(colors="#94a3b8")
    ax.grid(axis="y", linestyle="--", alpha=0.25, color="#64748b")
    for spine in ax.spines.values():
        spine.set_color("#334155")

    buf = io.BytesIO()
    fig.tight_layout()
    fig.savefig(buf, format="png", bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close(fig)
    buf.seek(0)

    b64 = base64.b64encode(buf.read()).decode("utf-8")
    return f"data:image/png;base64,{b64}"


def plot_statevector_amplitudes(statevector_data: list, title: str = "Statevector Complex Amplitudes") -> str:
    """Plots real & imaginary statevector amplitudes."""
    if not statevector_data:
        return ""

    labels = [f"|{bin(i)[2:].zfill(int(np.ceil(np.log2(len(statevector_data)))))}⟩" for i in range(len(statevector_data))]
    reals = [c.real if isinstance(c, complex) else float(c) for c in statevector_data]
    imags = [c.imag if isinstance(c, complex) else 0.0 for c in statevector_data]

    x = np.arange(len(labels))
    width = 0.35

    fig, ax = plt.subplots(figsize=(8, 4), dpi=130)
    fig.patch.set_facecolor("#0b0f19")
    ax.set_facecolor("#111827")

    ax.bar(x - width/2, reals, width, label="Real Part Re(α)", color="#38bdf8", edgecolor="#0284c7")
    ax.bar(x + width/2, imags, width, label="Imag Part Im(α)", color="#c084fc", edgecolor="#9333ea")

    ax.set_xticks(x)
    ax.set_xticklabels(labels, color="#e0e7ff", fontsize=9)
    ax.set_title(title, fontsize=12, color="#38bdf8", fontweight="bold", pad=12)
    ax.set_ylabel("Amplitude", fontsize=10, color="#94a3b8")
    ax.tick_params(colors="#94a3b8")
    ax.legend(facecolor="#1e293b", edgecolor="#475569", labelcolor="#e2e8f0")
    ax.grid(axis="y", linestyle="--", alpha=0.25, color="#64748b")
    for spine in ax.spines.values():
        spine.set_color("#334155")

    buf = io.BytesIO()
    fig.tight_layout()
    fig.savefig(buf, format="png", bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close(fig)
    buf.seek(0)

    b64 = base64.b64encode(buf.read()).decode("utf-8")
    return f"data:image/png;base64,{b64}"
