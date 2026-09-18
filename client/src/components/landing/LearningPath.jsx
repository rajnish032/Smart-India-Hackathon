"use client";

import React, { useState } from "react";
import { 
  LuBrain, 
  LuBlocks, 
  LuLayers, 
  LuSparkles, 
  LuClock, 
  LuGraduationCap, 
  LuBookOpen, 
  LuArrowRight,
  LuCpu
} from "react-icons/lu";

const levels = [
  {
    num: "01",
    levelTag: "LEVEL 01 // FOUNDATIONS",
    title: "Quantum Mechanics & Qubit Principles",
    desc: "Master superposition, state vector rotations, and entanglement through visual Bloch sphere intuition before tackling matrix algebra.",
    icon: LuBrain,
    color: "from-indigo-500 to-purple-600",
    borderColor: "border-indigo-500/40",
    textColor: "text-indigo-400",
    bgColor: "bg-indigo-500/10",
    time: "2 Hours",
    topics: ["Qubit Superposition", "Statevectors", "Entanglement", "Bloch Spheres"]
  },
  {
    num: "02",
    levelTag: "LEVEL 02 // GATES & OPERATIONS",
    title: "Quantum Gate Primitives",
    desc: "Construct single and multi-qubit transformations using Hadamard, Pauli X/Y/Z, Phase (S/T), and CNOT entangling gates.",
    icon: LuBlocks,
    color: "from-cyan-500 to-blue-600",
    borderColor: "border-cyan-500/40",
    textColor: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    time: "3.5 Hours",
    topics: ["Hadamard Gate", "Pauli Matrices", "CNOT & SWAP", "Phase Interference"]
  },
  {
    num: "03",
    levelTag: "LEVEL 03 // CIRCUIT SYNTHESIS",
    title: "Multi-Qubit Circuit Engineering",
    desc: "Build complex quantum circuits, generate Bell states, implement quantum teleportation, and observe phase kickback in action.",
    icon: LuLayers,
    color: "from-violet-500 to-indigo-600",
    borderColor: "border-violet-500/40",
    textColor: "text-violet-400",
    bgColor: "bg-violet-500/10",
    time: "4.5 Hours",
    topics: ["Bell States", "Teleportation", "Phase Kickback", "Quantum Fourier Transform"]
  },
  {
    num: "04",
    levelTag: "LEVEL 04 // ALGORITHMS & MASTERY",
    title: "Quantum Algorithms & Hardware Execution",
    desc: "Implement Grover's search, Deutsch-Jozsa, QAOA, and VQE algorithms, and transpile circuits to Qiskit and Cirq backends.",
    icon: LuSparkles,
    color: "from-emerald-500 to-teal-600",
    borderColor: "border-emerald-500/40",
    textColor: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    time: "6 Hours",
    topics: ["Grover's Algorithm", "Deutsch-Jozsa", "QAOA & VQE", "Qiskit / Cirq Transpilation"]
  }
];

export default function LearningPath() {
  const [activeLevel, setActiveLevel] = useState(0);

  return (
    <section id="learn" className="py-28 bg-[var(--color-background)] relative overflow-hidden">
      <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl sm:text-5xl font-heading font-bold mb-6 tracking-tight leading-tight">
            A Structured Pathway. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] via-purple-500 to-[var(--color-secondary)]">
              From Qubit Zero to Quantum Engineer.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-[var(--color-muted)] leading-relaxed">
            Follow our step-by-step curriculum engineered to build deep intuition, hands-on circuit synthesis, and algorithmic proficiency.
          </p>
        </div>

        {/* Learning Pathway Container */}
        <div className="relative max-w-5xl mx-auto">
          
          {/* Vertical Central Timeline Conduit Line (Desktop) */}
          <div className="absolute left-4 md:left-1/2 top-8 bottom-8 w-[2px] bg-[var(--color-border)] -translate-x-1/2 rounded-full overflow-hidden hidden md:block">
            <div className="w-full h-full bg-gradient-to-b from-[var(--color-primary)] via-cyan-500 to-[var(--color-secondary)] opacity-60" />
          </div>

          <div className="space-y-12 md:space-y-16">
            {levels.map((level, idx) => {
              const IconComp = level.icon;
              const isEven = idx % 2 === 0;
              const isActive = activeLevel === idx;

              return (
                <div 
                  key={level.num}
                  onClick={() => setActiveLevel(idx)}
                  className={`relative flex flex-col md:flex-row items-stretch md:items-center ${
                    isEven ? "md:flex-row" : "md:flex-row-reverse"
                  } gap-8 cursor-pointer group`}
                >
                  
                  {/* Timeline Badge Node (Center) */}
                  <div className="absolute left-4 md:left-1/2 top-6 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 z-20 hidden md:flex items-center justify-center">
                    <div className={`w-12 h-12 rounded-2xl bg-[var(--color-surface)] border ${
                      isActive ? `${level.borderColor} shadow-[0_0_25px_rgba(99,102,241,0.4)] scale-110` : 'border-[var(--color-border)]'
                    } flex items-center justify-center font-mono font-bold text-sm text-[var(--color-text)] transition-all duration-300 shadow-md`}>
                      <span className={isActive ? level.textColor : 'text-[var(--color-muted)]'}>{level.num}</span>
                    </div>
                  </div>

                  {/* Level Card Component */}
                  <div className={`w-full md:w-[calc(50%-2.5rem)] ${isEven ? "md:mr-auto" : "md:ml-auto"}`}>
                    <div 
                      className={`bento-card p-8 transition-all duration-500 relative ${
                        isActive 
                          ? `border-[var(--color-primary)] shadow-2xl scale-[1.02] bg-[var(--color-surface)]` 
                          : "hover:border-[var(--color-border)]/80"
                      }`}
                      onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                        e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
                      }}
                    >
                      <div className="bento-glow" />

                      <div className="relative z-10">
                        
                        {/* Top Meta Bar */}
                        <div className="flex items-center justify-between mb-4">
                          <span className={`text-xs font-mono font-bold tracking-wider px-3 py-1 rounded-full border ${level.bgColor} ${level.borderColor} ${level.textColor}`}>
                            {level.levelTag}
                          </span>

                          <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--color-muted)]">
                            <LuClock className="w-3.5 h-3.5" />
                            <span>{level.time}</span>
                          </div>
                        </div>

                        {/* Title & Icon Header */}
                        <div className="flex items-start gap-4 mb-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${level.color} text-white flex items-center justify-center shrink-0 shadow-md`}>
                            <IconComp size={24} />
                          </div>
                          <div>
                            <h3 className="text-xl sm:text-2xl font-bold text-[var(--color-text)] leading-snug">
                              {level.title}
                            </h3>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-[var(--color-muted)] leading-relaxed text-sm sm:text-base mb-6">
                          {level.desc}
                        </p>

                        {/* Topic Badges */}
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--color-border)]/40">
                          {level.topics.map((topic, tIdx) => (
                            <span 
                              key={tIdx} 
                              className="px-3 py-1 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] text-xs font-mono text-[var(--color-text)] shadow-xs"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>

                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
