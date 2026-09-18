"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { LuPlay, LuBug, LuSparkles, LuMessageSquare } from "react-icons/lu";

const GATES = ["H", "X", "Y", "Z", "S", "T", "CNOT"];

export default function InteractiveBuilder() {
  const containerRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Wire pulse animation
      gsap.fromTo(".builder-wire-pulse", 
        { x: "-100%" },
        { x: "100%", duration: 2, ease: "none", repeat: -1 }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} id="playground" className="py-24 bg-[var(--color-background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-heading font-bold mb-6">
            Build Quantum Circuits <br />
            <span className="text-[var(--color-muted)]">Without the Complexity.</span>
          </h2>
        </div>

        {/* The Mock Playground */}
        <div className="builder-element bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row h-auto lg:h-[600px] relative">
          
          {/* MacOS style window header (absolute top, only visible on md+) */}
          <div className="hidden lg:flex absolute top-0 left-0 right-0 h-10 bg-[var(--color-background)] border-b border-[var(--color-border)] items-center px-4 gap-2 z-20">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            <div className="absolute left-1/2 -translate-x-1/2 text-xs font-mono text-[var(--color-muted)] font-semibold">circuit.py - QubitMind Lab</div>
          </div>

          {/* LEFT: Gate Library */}
          <div className="w-full lg:w-24 border-b lg:border-b-0 lg:border-r border-[var(--color-border)] bg-[var(--color-background)] flex flex-row lg:flex-col p-4 pt-4 lg:pt-14 gap-4 overflow-x-auto lg:overflow-x-hidden z-10 relative">
            <div className="text-[10px] uppercase font-bold text-[var(--color-muted)] tracking-wider text-center w-full mb-2 hidden lg:block">Gates</div>
            {GATES.map(gate => (
              <div key={gate} className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-background)] border border-[var(--color-border)] flex items-center justify-center font-mono font-bold text-[var(--color-text)] cursor-grab hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative group">
                {gate}
                <div className="absolute inset-0 bg-[var(--color-primary)]/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            ))}
          </div>

          {/* CENTER: Circuit Canvas */}
          <div className="flex-1 bg-[var(--color-background)] relative flex flex-col font-mono text-sm pt-4 lg:pt-14 bg-noise">
            <div className="px-8 mb-8 flex justify-between items-center relative z-10">
              <div className="text-xs uppercase font-bold text-[var(--color-muted)] tracking-wider">Circuit Editor</div>
              <div className="flex gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-[var(--color-muted)] uppercase">Backend Ready</span>
              </div>
            </div>
            
            <div className="flex-1 relative px-8">
              {/* Wire 1 */}
              <div className="absolute top-[20px] left-8 right-8 h-[2px] bg-gradient-to-r from-[var(--color-border)] via-[var(--color-primary)]/30 to-[var(--color-border)] overflow-hidden">
                 <div className="builder-wire-pulse h-full w-1/4 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent" />
              </div>
              {/* Wire 2 */}
              <div className="absolute top-[80px] left-8 right-8 h-[2px] bg-gradient-to-r from-[var(--color-border)] via-[var(--color-secondary)]/30 to-[var(--color-border)] overflow-hidden">
                 <div className="builder-wire-pulse h-full w-1/4 bg-gradient-to-r from-transparent via-[var(--color-secondary)] to-transparent" delay={1} />
              </div>

              <div className="flex flex-col gap-10">
                {/* Qubit 0 */}
                <div className="flex items-center gap-6 relative z-10">
                  <div className="font-bold text-[var(--color-muted)] w-6">q0</div>
                  <div className="w-12 h-12 rounded-xl border border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 flex items-center justify-center font-bold text-[var(--color-secondary)] shadow-[0_0_15px_rgba(236,72,153,0.15)] backdrop-blur-sm">H</div>
                  <div className="w-8" />
                  <div className="w-4 h-4 rounded-full bg-[var(--color-primary)] shadow-[0_0_10px_rgba(99,102,241,0.5)] relative mx-4">
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-[2px] h-[52px] bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-primary)]/50" />
                  </div>
                  <div className="flex-1" />
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-muted)] shadow-inner">M</div>
                </div>

                {/* Qubit 1 */}
                <div className="flex items-center gap-6 relative z-10">
                  <div className="font-bold text-[var(--color-muted)] w-6">q1</div>
                  <div className="w-[112px]" />
                  <div className="w-12 h-12 rounded-full border border-[var(--color-primary)] bg-[var(--color-background)] flex items-center justify-center text-[var(--color-primary)] shadow-[0_0_15px_rgba(99,102,241,0.15)] relative backdrop-blur-sm">
                    <div className="absolute w-6 h-[2px] bg-[var(--color-primary)] rotate-45" />
                    <div className="absolute w-6 h-[2px] bg-[var(--color-primary)] -rotate-45" />
                  </div>
                  <div className="flex-1" />
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-muted)] shadow-inner">M</div>
                </div>
              </div>
            </div>

            {/* Bottom Code Editor */}
            <div className="mt-auto p-4 bg-[var(--color-surface)]/80 backdrop-blur border-t border-[var(--color-border)]">
              <div className="bg-[#0D1117] rounded-xl border border-[var(--color-border)] p-5 relative font-mono text-sm leading-relaxed overflow-hidden shadow-inner">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-secondary)]" />
                
                {/* Line numbers and code */}
                <div className="flex gap-4 text-[13px]">
                  <div className="flex flex-col text-right text-gray-600 select-none">
                    <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                  </div>
                  <div className="flex flex-col text-gray-300">
                    <div><span className="text-pink-500">from</span> qiskit <span className="text-pink-500">import</span> <span className="text-yellow-300">QuantumCircuit</span></div>
                    <br/>
                    <div><span className="text-blue-400">qc</span> <span className="text-pink-500">=</span> <span className="text-yellow-300">QuantumCircuit</span>(<span className="text-purple-400">2</span>)</div>
                    <div><span className="text-blue-400">qc</span>.<span className="text-green-300">h</span>(<span className="text-purple-400">0</span>)</div>
                    <div><span className="text-blue-400">qc</span>.<span className="text-green-300">cx</span>(<span className="text-purple-400">0</span>, <span className="text-purple-400">1</span>)</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white rounded-lg font-sans text-sm font-semibold hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:scale-105 transition-all duration-300">
                  <LuPlay size={16} fill="currentColor" /> Run Circuit
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: AI Assistant */}
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col pt-0 lg:pt-10 relative z-10">
            <div className="p-5 border-b border-[var(--color-border)] flex items-center gap-2 text-sm font-bold bg-[var(--color-background)]/50">
              <LuSparkles size={16} className="text-[var(--color-primary)]" /> AI Assistant
            </div>
            
            <div className="p-5 flex-1 flex flex-col gap-4">
              <div className="bg-gradient-to-br from-[var(--color-primary)]/10 to-transparent border border-[var(--color-primary)]/20 rounded-xl p-4 text-sm shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[var(--color-primary)]/10 rounded-full blur-xl pointer-events-none" />
                <p className="text-[var(--color-text)] leading-relaxed relative z-10">
                  Your circuit creates a <strong className="text-[var(--color-primary)]">Bell state</strong> (maximally entangled qubits). Measuring them will yield perfectly correlated results.
                </p>
              </div>
              
              <div className="mt-auto space-y-3">
                <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-sm text-[var(--color-text)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all duration-300 group">
                  <span className="flex items-center gap-2"><LuMessageSquare size={16} className="text-[var(--color-muted)] group-hover:text-[var(--color-primary)] transition-colors" /> Explain Code</span>
                  <span className="text-[10px] font-mono text-[var(--color-muted)] border border-[var(--color-border)] px-1.5 rounded">⌘ E</span>
                </button>
                <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-sm text-[var(--color-text)] hover:border-yellow-500 hover:bg-yellow-500/5 transition-all duration-300 group">
                  <span className="flex items-center gap-2"><LuBug size={16} className="text-[var(--color-muted)] group-hover:text-yellow-500 transition-colors" /> Debug Circuit</span>
                  <span className="text-[10px] font-mono text-[var(--color-muted)] border border-[var(--color-border)] px-1.5 rounded">⌘ D</span>
                </button>
                <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-sm text-[var(--color-text)] hover:border-green-500 hover:bg-green-500/5 transition-all duration-300 group">
                  <span className="flex items-center gap-2"><LuSparkles size={16} className="text-[var(--color-muted)] group-hover:text-green-500 transition-colors" /> Optimize</span>
                  <span className="text-[10px] font-mono text-[var(--color-muted)] border border-[var(--color-border)] px-1.5 rounded">⌘ O</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
