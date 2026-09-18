"use client";

import React from 'react';
import Link from 'next/link';
import { LuCpu, LuPlay, LuSparkles, LuArrowRight } from 'react-icons/lu';

export default function LearnerCircuits() {
  const circuits = [
    {
      title: 'Bell State Generator',
      qubits: 2,
      gates: ['H (q0)', 'CNOT (q0, q1)'],
      description: 'Creates maximum entanglement between two qubits in |Φ+⟩ state.',
    },
    {
      title: 'Quantum Teleportation Protocol',
      qubits: 3,
      gates: ['H', 'CNOT', 'Measure', 'X', 'Z'],
      description: 'Transfers unknown quantum state using entanglement and classical bits.',
    },
    {
      title: 'Phase Inversion (Grover Oracle)',
      qubits: 3,
      gates: ['H', 'X', 'CCZ', 'X', 'H'],
      description: 'Flips the amplitude of target marked state |111⟩.',
    },
  ];

  return (
    <div className="p-8 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <LuCpu size={22} className="text-[var(--color-primary)]" />
            Interactive Circuit Playground
          </h2>
          <p className="text-xs text-[var(--color-muted)]">Design, simulate, and observe qubit state probability vectors</p>
        </div>
        <Link
          href="/playground"
          className="text-xs font-semibold px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity inline-flex items-center gap-2"
        >
          <LuPlay size={13} />
          <span>Launch Simulator</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {circuits.map((c) => (
          <div
            key={c.title}
            className="p-5 rounded-2xl bg-[var(--color-background)] border border-[var(--color-border)] space-y-3"
          >
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-semibold">
                {c.qubits} Qubits
              </span>
              <span className="text-[10px] text-emerald-500 font-mono font-medium">Ready</span>
            </div>
            <h3 className="font-semibold text-sm text-[var(--color-text)]">{c.title}</h3>
            <p className="text-xs text-[var(--color-muted)] line-clamp-2">{c.description}</p>
            <div className="pt-2 flex flex-wrap gap-1.5 font-mono text-[11px]">
              {c.gates.map((g, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-[var(--color-border)]/40 text-[var(--color-text)]"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
