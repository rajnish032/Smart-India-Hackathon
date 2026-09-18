"use client";

import React, { useState } from "react";
import { 
  LuBrain, 
  LuCpu, 
  LuBlocks, 
  LuSparkles, 
  LuBot, 
  LuRefreshCw, 
  LuZap,
  LuLayers,
  LuActivity
} from "react-icons/lu";

const loopNodes = [
  {
    id: "learn",
    stepNum: "01",
    title: "Conceptual Foundations",
    subtitle: "Interactive Intuition",
    desc: "Deconstruct superposition, state vector rotations, and entanglement through interactive visual modules before approaching complex linear algebra.",
    icon: LuBrain,
    color: "from-indigo-500 to-purple-600",
    borderColor: "border-indigo-500/50",
    glowColor: "rgba(99, 102, 241, 0.25)",
    textColor: "text-indigo-400",
    badge: "Stage 01 // Theory"
  },
  {
    id: "build",
    stepNum: "02",
    title: "Visual Circuit Composition",
    subtitle: "Multi-Qubit Design",
    desc: "Assemble multi-qubit quantum circuits using drag-and-drop gate primitives (Hadamard, Pauli, CNOT) with real-time Qiskit and Cirq code generation.",
    icon: LuBlocks,
    color: "from-cyan-500 to-blue-600",
    borderColor: "border-cyan-500/50",
    glowColor: "rgba(6, 182, 212, 0.25)",
    textColor: "text-cyan-400",
    badge: "Stage 02 // Composition"
  },
  {
    id: "simulate",
    stepNum: "03",
    title: "Multi-Engine Simulation",
    subtitle: "Zero-Latency Backends",
    desc: "Execute algorithms instantly across high-performance web backends, bypassing queue latency and enabling immediate state iteration.",
    icon: LuCpu,
    color: "from-violet-500 to-indigo-600",
    borderColor: "border-violet-500/50",
    glowColor: "rgba(139, 92, 246, 0.25)",
    textColor: "text-violet-400",
    badge: "Stage 03 // Execution"
  },
  {
    id: "visualize",
    stepNum: "04",
    title: "Quantum State Inspection",
    subtitle: "3D Visual Analytics",
    desc: "Analyze 3D Bloch Spheres, statevectors, density matrices, and measurement outcome probability distributions with precision.",
    icon: LuSparkles,
    color: "from-emerald-500 to-teal-600",
    borderColor: "border-emerald-500/50",
    glowColor: "rgba(16, 185, 129, 0.25)",
    textColor: "text-emerald-400",
    badge: "Stage 04 // Analytics"
  },
  {
    id: "askai",
    stepNum: "05",
    title: "Intelligent AI Guidance",
    subtitle: "Adaptive Debugging",
    desc: "Receive real-time circuit debugging, contextual math explanations, and personalized optimization hints to continuously refine your knowledge loop.",
    icon: LuBot,
    color: "from-amber-500 to-orange-600",
    borderColor: "border-amber-500/50",
    glowColor: "rgba(245, 158, 11, 0.25)",
    textColor: "text-amber-400",
    badge: "Stage 05 // AI Feedback"
  }
];

export default function ProblemSolution() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="w-full relative">
      
      {/* SECTION 2: PROBLEM */}
      <section className="problem-section py-24 bg-[var(--color-background)] border-b border-[var(--color-border)]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl sm:text-5xl font-heading font-bold mb-6 leading-tight tracking-tight">
              Demystifying Quantum Mechanics. <br className="hidden sm:block" />
              <span className="text-[var(--color-muted)] font-normal">Accelerating Practical Mastery.</span>
            </h2>
            <p className="text-base sm:text-lg text-[var(--color-muted)] leading-relaxed">
              Traditional quantum education separates high-level theoretical physics from hands-on circuit synthesis, creating unnecessary friction for learners and researchers.
            </p>
          </div>

          <div className="grid md:grid-cols-12 gap-6 auto-rows-[minmax(240px,auto)]">
            {/* Bento Card 1 */}
            <div 
              className="problem-card bento-card md:col-span-8 p-10 flex flex-col justify-between"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
              }}
            >
              <div className="bento-glow" />
              <div className="relative z-10 flex justify-between items-start mb-12">
                <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 flex items-center justify-center shadow-inner">
                  <LuBrain size={32} />
                </div>
                <div className="text-[var(--color-primary)]/40 font-mono text-5xl font-black">01</div>
              </div>
              <div className="relative z-10">
                <span className="text-xs font-mono font-bold tracking-wider text-[var(--color-primary)] uppercase mb-2 block">
                  Conceptual Complexity
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold mb-3">Abstract State Mechanics</h3>
                <p className="text-[var(--color-muted)] text-base sm:text-lg leading-relaxed max-w-xl">
                  Superposition, phase coherence, and quantum entanglement are notoriously difficult to master through static formulas alone. We turn abstract physics into intuitive, visual models.
                </p>
              </div>
              <div className="absolute right-0 bottom-0 w-64 h-64 bg-[var(--color-primary)]/10 rounded-full blur-[80px] pointer-events-none" />
            </div>

            {/* Bento Card 2 */}
            <div 
              className="problem-card bento-card md:col-span-4 p-10 flex flex-col justify-between"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
              }}
            >
              <div className="bento-glow" />
              <div className="relative z-10 flex justify-between items-start mb-12">
                <div className="w-16 h-16 rounded-2xl bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] border border-[var(--color-secondary)]/20 flex items-center justify-center shadow-inner">
                  <LuLayers size={32} />
                </div>
                <div className="text-[var(--color-secondary)]/40 font-mono text-5xl font-black">02</div>
              </div>
              <div className="relative z-10">
                <span className="text-xs font-mono font-bold tracking-wider text-[var(--color-secondary)] uppercase mb-2 block">
                  Workflow Fragmentation
                </span>
                <h3 className="text-2xl font-bold mb-3">Disconnected Tooling</h3>
                <p className="text-[var(--color-muted)] text-sm sm:text-base leading-relaxed">
                  Switching between research papers, isolated circuit applets, and local code editors disrupts learning momentum and retards algorithmic mastery.
                </p>
              </div>
            </div>

            {/* Bento Card 3 */}
            <div 
              className="problem-card bento-card md:col-span-12 p-10 flex flex-col md:flex-row items-center gap-12"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
              }}
            >
              <div className="bento-glow" />
              <div className="relative z-10 flex-1">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center shadow-inner">
                    <LuCpu size={32} />
                  </div>
                  <div className="text-indigo-500/40 font-mono text-5xl font-black">03</div>
                </div>
                <span className="text-xs font-mono font-bold tracking-wider text-indigo-400 uppercase mb-2 block">
                  Infrastructure Bottlenecks
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold mb-3">Hardware Execution Queues</h3>
                <p className="text-[var(--color-muted)] text-base sm:text-lg leading-relaxed max-w-2xl">
                  Learners shouldn't spend hours waiting in queue pipelines on physical QPUs just to evaluate foundational gate operations. Our web-accelerated engines deliver zero-latency simulation.
                </p>
              </div>
              
              {/* Circuit Mock Visual */}
              <div className="hidden md:flex relative z-10 w-64 h-40 bg-[var(--color-background)] rounded-xl border border-[var(--color-border)] shadow-inner overflow-hidden flex-col justify-center p-4">
                 <div className="p-2 opacity-60 flex flex-col gap-4 justify-center">
                   <div className="w-full h-[2px] bg-[var(--color-border)] relative">
                     <div className="absolute top-1/2 left-4 -translate-y-1/2 w-8 h-8 bg-[var(--color-surface)] border border-[var(--color-primary)]/40 text-[var(--color-primary)] rounded shadow flex items-center justify-center text-xs font-mono font-bold">H</div>
                   </div>
                   <div className="w-full h-[2px] bg-[var(--color-border)] relative">
                     <div className="absolute top-1/2 left-16 -translate-y-1/2 w-8 h-8 bg-[var(--color-surface)] border border-cyan-500/40 text-cyan-400 rounded shadow flex items-center justify-center text-xs font-mono font-bold">X</div>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: SOLUTION - SNAKE PATHWAY GRAPH */}
      <section className="journey-section py-24 bg-gradient-to-b from-[var(--color-background)] to-[var(--color-surface)] relative overflow-hidden">
        <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl sm:text-5xl font-heading font-bold mb-6">
              One Integrated Platform. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] via-purple-500 to-[var(--color-secondary)]">
                The Quantum Learning Pipeline
              </span>
            </h2>
            <p className="text-base sm:text-lg text-[var(--color-muted)] leading-relaxed">
              A 5-stage integrated pathway designed to transition users from foundational quantum mechanics to multi-framework algorithm execution.
            </p>
          </div>

          {/* SNAKE GRAPH CANVAS & CARDS CONTAINER */}
          <div className="relative max-w-5xl mx-auto px-2 py-4">

            {/* SVG SNAKE PATHWAY LINES (Desktop Winding Curve) */}
            <div className="absolute inset-0 hidden lg:block pointer-events-none z-0">
              <svg className="w-full h-full" viewBox="0 0 1000 820" fill="none">
                <defs>
                  <linearGradient id="snakeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--color-primary)" />
                    <stop offset="35%" stopColor="#06b6d4" />
                    <stop offset="65%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>

                  <filter id="snakeGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="8" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  
                  <marker id="arrowHead" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-primary)" />
                  </marker>
                </defs>

                {/* Snake Path 1: Node 01 (Left) -> Node 02 (Right) */}
                <path
                  d="M 280 120 L 720 120"
                  stroke="url(#snakeGradient)"
                  strokeWidth="4"
                  strokeDasharray="6 6"
                  className="opacity-70"
                />

                {/* Snake Path 2: Node 02 (Right) -> Down Curve -> Node 03 (Center) */}
                <path
                  d="M 720 120 C 880 120, 880 340, 500 340"
                  stroke="url(#snakeGradient)"
                  strokeWidth="4"
                  strokeDasharray="6 6"
                  className="opacity-70"
                />

                {/* Snake Path 3: Node 03 (Center) -> Down Curve -> Node 04 (Left) */}
                <path
                  d="M 500 340 C 120 340, 120 560, 280 560"
                  stroke="url(#snakeGradient)"
                  strokeWidth="4"
                  strokeDasharray="6 6"
                  className="opacity-70"
                />

                {/* Snake Path 4: Node 04 (Left) -> Node 05 (Right) */}
                <path
                  d="M 280 560 L 720 560"
                  stroke="url(#snakeGradient)"
                  strokeWidth="4"
                  strokeDasharray="6 6"
                  className="opacity-70"
                />

                {/* Continuous Loop Connection: Node 05 (Right) -> Loop Back to Node 01 (Top-Left) */}
                <path
                  d="M 720 560 C 950 560, 950 40, 280 120"
                  stroke="var(--color-primary)"
                  strokeWidth="2.5"
                  strokeDasharray="8 8"
                  opacity="0.4"
                  markerEnd="url(#arrowHead)"
                />
              </svg>
            </div>

            {/* SNAKE NODE CARDS GRID */}
            <div className="relative z-10 space-y-12 lg:space-y-16">
              
              {/* ROW 1: Stage 01 (Left) & Stage 02 (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Stage 01 */}
                <div 
                  onClick={() => setActiveStep(0)}
                  className={`bento-card p-8 cursor-pointer transition-all duration-500 relative ${
                    activeStep === 0 ? "border-indigo-500 shadow-2xl scale-[1.02] bg-[var(--color-surface)]" : "hover:border-[var(--color-border)]/80"
                  }`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center shadow-inner">
                      <LuBrain size={28} />
                    </div>
                    <span className="font-mono text-4xl font-black text-indigo-500/40">01</span>
                  </div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full inline-block mb-3">
                    {loopNodes[0].badge}
                  </span>
                  <h3 className="text-2xl font-bold mb-3">{loopNodes[0].title}</h3>
                  <p className="text-[var(--color-muted)] leading-relaxed text-sm sm:text-base">
                    {loopNodes[0].desc}
                  </p>
                </div>

                {/* Stage 02 */}
                <div 
                  onClick={() => setActiveStep(1)}
                  className={`bento-card p-8 cursor-pointer transition-all duration-500 relative lg:translate-y-6 ${
                    activeStep === 1 ? "border-cyan-500 shadow-2xl scale-[1.02] bg-[var(--color-surface)]" : "hover:border-[var(--color-border)]/80"
                  }`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 flex items-center justify-center shadow-inner">
                      <LuBlocks size={28} />
                    </div>
                    <span className="font-mono text-4xl font-black text-cyan-500/40">02</span>
                  </div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full inline-block mb-3">
                    {loopNodes[1].badge}
                  </span>
                  <h3 className="text-2xl font-bold mb-3">{loopNodes[1].title}</h3>
                  <p className="text-[var(--color-muted)] leading-relaxed text-sm sm:text-base">
                    {loopNodes[1].desc}
                  </p>
                </div>
              </div>

              {/* ROW 2: Stage 03 (Center / Mid Snake Curve) */}
              <div className="flex justify-center my-6">
                <div 
                  onClick={() => setActiveStep(2)}
                  className={`bento-card p-8 cursor-pointer transition-all duration-500 w-full max-w-xl relative ${
                    activeStep === 2 ? "border-violet-500 shadow-2xl scale-[1.02] bg-[var(--color-surface)]" : "hover:border-[var(--color-border)]/80"
                  }`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-violet-500/10 text-violet-500 border border-violet-500/20 flex items-center justify-center shadow-inner">
                      <LuCpu size={28} />
                    </div>
                    <span className="font-mono text-4xl font-black text-violet-500/40">03</span>
                  </div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full inline-block mb-3">
                    {loopNodes[2].badge}
                  </span>
                  <h3 className="text-2xl font-bold mb-3">{loopNodes[2].title}</h3>
                  <p className="text-[var(--color-muted)] leading-relaxed text-sm sm:text-base">
                    {loopNodes[2].desc}
                  </p>
                </div>
              </div>

              {/* ROW 3: Stage 04 (Left) & Stage 05 (Right - Loop Return) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Stage 04 */}
                <div 
                  onClick={() => setActiveStep(3)}
                  className={`bento-card p-8 cursor-pointer transition-all duration-500 relative ${
                    activeStep === 3 ? "border-emerald-500 shadow-2xl scale-[1.02] bg-[var(--color-surface)]" : "hover:border-[var(--color-border)]/80"
                  }`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shadow-inner">
                      <LuSparkles size={28} />
                    </div>
                    <span className="font-mono text-4xl font-black text-emerald-500/40">04</span>
                  </div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full inline-block mb-3">
                    {loopNodes[3].badge}
                  </span>
                  <h3 className="text-2xl font-bold mb-3">{loopNodes[3].title}</h3>
                  <p className="text-[var(--color-muted)] leading-relaxed text-sm sm:text-base">
                    {loopNodes[3].desc}
                  </p>
                </div>

                {/* Stage 05 */}
                <div 
                  onClick={() => setActiveStep(4)}
                  className={`bento-card p-8 cursor-pointer transition-all duration-500 relative lg:translate-y-6 ${
                    activeStep === 4 ? "border-amber-500 shadow-2xl scale-[1.02] bg-[var(--color-surface)]" : "hover:border-[var(--color-border)]/80"
                  }`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shadow-inner">
                      <LuBot size={28} />
                    </div>
                    <span className="font-mono text-4xl font-black text-amber-500/40">05</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                      {loopNodes[4].badge}
                    </span>
                    <span className="text-[11px] font-mono text-[var(--color-primary)] flex items-center gap-1">
                      <LuRefreshCw className="w-3 h-3 animate-spin" /> Feedback Loop
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{loopNodes[4].title}</h3>
                  <p className="text-[var(--color-muted)] leading-relaxed text-sm sm:text-base">
                    {loopNodes[4].desc}
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
