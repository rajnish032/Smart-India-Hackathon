"use client";

import React from "react";
import { LuActivity, LuChartColumn, LuSettings2, LuCircle } from "react-icons/lu";

export default function SimulationVisuals() {
  return (
    <div className="w-full relative">
      
      {/* SECTION 6: SIMULATION */}
      <section className="py-24 bg-[var(--color-surface)] border-b border-[var(--color-border)]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl sm:text-5xl font-heading font-bold mb-6">
              From Circuit to <br className="hidden sm:block" />
              <span className="text-[var(--color-secondary)]">Quantum State.</span>
            </h2>
          </div>

          {/* The Visualizer Dashboard */}
        <div className="relative visualizer-container bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl overflow-hidden shadow-2xl">
          
          <div className="hidden lg:flex absolute top-0 left-0 right-0 h-12 bg-[#0D1117] border-b border-[var(--color-border)] items-center justify-between px-6 z-20">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="flex gap-4 text-xs font-mono font-medium text-[var(--color-muted)]">
              <div className="flex items-center gap-2 px-3 py-1 bg-[var(--color-background)] rounded-full border border-[var(--color-border)]">
                <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]"></span>
                Qiskit Aer (1024 shots)
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 min-h-[600px] pt-0 lg:pt-12 bg-noise">
            {/* LEFT: Renderers */}
            <div className="lg:col-span-8 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-[var(--color-border)]">
              
              {/* Bloch Sphere */}
              <div className="flex-1 p-8 bg-gradient-to-br from-[var(--color-background)] to-[var(--color-surface)] flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute top-6 left-6 text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider flex items-center gap-2">
                  <LuCircle size={16} className="text-[var(--color-primary)]" /> Bloch Sphere
                </div>
                
                <div className="relative w-64 h-64 mt-8 flex items-center justify-center">
                  {/* Detailed SVG Bloch Sphere */}
                  <svg className="absolute inset-0 w-full h-full drop-shadow-[0_0_20px_rgba(99,102,241,0.2)]" viewBox="0 0 200 200">
                    <defs>
                      <radialGradient id="sphereGrad" cx="30%" cy="30%" r="70%">
                        <stop offset="0%" stopColor="var(--color-surface)" stopOpacity="0.1"/>
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.2"/>
                      </radialGradient>
                      <linearGradient id="equator" x1="0%" y1="50%" x2="100%" y2="50%">
                        <stop offset="0%" stopColor="var(--color-border)" stopOpacity="1"/>
                        <stop offset="50%" stopColor="var(--color-primary)" stopOpacity="0.5"/>
                        <stop offset="100%" stopColor="var(--color-border)" stopOpacity="1"/>
                      </linearGradient>
                      <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                        <path d="M0,0 L0,6 L9,3 z" fill="var(--color-primary)" />
                      </marker>
                    </defs>
                    <circle cx="100" cy="100" r="80" fill="url(#sphereGrad)" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="4 4" className="group-hover:stroke-[var(--color-primary)]/50 transition-colors duration-700"/>
                    <ellipse cx="100" cy="100" rx="80" ry="25" fill="none" stroke="url(#equator)" strokeWidth="1"/>
                    <ellipse cx="100" cy="100" rx="25" ry="80" fill="none" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="4 4"/>
                    
                    {/* Axes */}
                    <line x1="100" y1="20" x2="100" y2="180" stroke="var(--color-muted)" strokeWidth="1" opacity="0.5" />
                    <line x1="20" y1="100" x2="180" y2="100" stroke="var(--color-muted)" strokeWidth="1" opacity="0.5" />
                    
                    {/* State Vector Arrow */}
                    <line x1="100" y1="100" x2="150" y2="50" stroke="var(--color-primary)" strokeWidth="3" markerEnd="url(#arrow)" className="drop-shadow-[0_0_5px_var(--color-primary)]" />
                    <circle cx="100" cy="100" r="3" fill="var(--color-primary)" />
                    <text x="155" y="45" fill="var(--color-text)" fontSize="12" fontWeight="bold" className="font-mono">|ψ⟩</text>
                    <text x="95" y="15" fill="var(--color-text)" fontSize="12" className="font-mono">|0⟩</text>
                    <text x="95" y="195" fill="var(--color-text)" fontSize="12" className="font-mono">|1⟩</text>
                  </svg>
                </div>
                
                <div className="absolute bottom-6 w-[80%] text-center p-3 rounded-xl bg-[var(--color-surface)]/80 backdrop-blur border border-[var(--color-border)] text-xs font-mono flex justify-between shadow-lg">
                  <span className="text-[var(--color-muted)]">θ: <span className="text-[var(--color-text)]">1.57</span></span>
                  <span className="text-[var(--color-muted)]">φ: <span className="text-[var(--color-text)]">0.00</span></span>
                  <span className="text-[var(--color-muted)]">State: <span className="text-[var(--color-primary)]">|+⟩</span></span>
                </div>
              </div>

              {/* Q-Sphere */}
              <div className="flex-1 p-8 bg-[var(--color-background)] flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute top-6 left-6 text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider flex items-center gap-2">
                  <LuCircle size={16} className="text-[var(--color-secondary)]" /> Q-Sphere
                </div>
                
                <div className="relative w-64 h-64 mt-8 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full drop-shadow-[0_0_20px_rgba(236,72,153,0.1)]" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="75" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1"/>
                    
                    {/* Latitudes & Longitudes */}
                    <circle cx="100" cy="100" r="50" fill="none" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="2 4"/>
                    <circle cx="100" cy="100" r="25" fill="none" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="2 4"/>
                    <line x1="25" y1="100" x2="175" y2="100" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="2 4"/>
                    <line x1="100" y1="25" x2="100" y2="175" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="2 4"/>
                    
                    {/* State Nodes */}
                    <circle cx="100" cy="25" r="8" fill="var(--color-primary)" opacity="0.2"/>
                    <circle cx="153" cy="153" r="12" fill="var(--color-secondary)" className="shadow-[0_0_10px_var(--color-secondary)]"/>
                    <circle cx="47" cy="153" r="12" fill="var(--color-primary)" className="shadow-[0_0_10px_var(--color-primary)]"/>
                    
                    {/* Connecting lines */}
                    <line x1="100" y1="100" x2="153" y2="153" stroke="var(--color-secondary)" strokeWidth="2" opacity="0.5"/>
                    <line x1="100" y1="100" x2="47" y2="153" stroke="var(--color-primary)" strokeWidth="2" opacity="0.5"/>
                    <circle cx="100" cy="100" r="4" fill="var(--color-muted)"/>
                  </svg>
                </div>

                <div className="absolute bottom-6 flex gap-2">
                  <div className="px-3 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-mono flex items-center gap-2 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" /> |00⟩
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-mono flex items-center gap-2 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-[var(--color-secondary)]" /> |11⟩
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Stats & Data */}
            <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-[var(--color-border)] flex flex-col bg-[#0D1117] relative z-10 shadow-inner">
              
              {/* Histogram */}
              <div className="p-8 border-b border-[var(--color-border)]/50">
                <div className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-8 flex items-center gap-2">
                  <LuChartColumn size={16} /> Measurement Probabilities
                </div>
                
                <div className="flex items-end justify-around h-32 mb-4 border-b border-gray-800 pb-2 relative">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                    <div className="w-full h-px bg-gray-600"></div>
                    <div className="w-full h-px bg-gray-600"></div>
                    <div className="w-full h-px bg-gray-600"></div>
                    <div className="w-full h-px bg-gray-600"></div>
                  </div>
                  
                  {/* Bars */}
                  <div className="w-12 bg-gray-800 rounded-t h-[5%]" />
                  <div className="w-12 bg-gradient-to-t from-[var(--color-primary)]/50 to-[var(--color-primary)] rounded-t shadow-[0_0_15px_rgba(99,102,241,0.3)] relative group cursor-pointer" style={{height: "48%"}}>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--color-surface)] px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border border-[var(--color-border)]">0.482</div>
                  </div>
                  <div className="w-12 bg-gradient-to-t from-[var(--color-secondary)]/50 to-[var(--color-secondary)] rounded-t shadow-[0_0_15px_rgba(236,72,153,0.3)] relative group cursor-pointer" style={{height: "52%"}}>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--color-surface)] px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border border-[var(--color-border)]">0.518</div>
                  </div>
                  <div className="w-12 bg-gray-800 rounded-t h-[2%]" />
                </div>
                
                <div className="flex justify-around font-mono text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                  <span>|00⟩</span>
                  <span className="text-gray-300">|01⟩</span>
                  <span className="text-gray-300">|10⟩</span>
                  <span>|11⟩</span>
                </div>
              </div>

              {/* Statevector */}
              <div className="p-8 flex-1 flex flex-col justify-center bg-[var(--color-surface)]/5 backdrop-blur">
                <div className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-6 flex items-center gap-2">
                  <LuActivity size={16} /> Amplitude Matrix
                </div>
                <div className="space-y-3 font-mono text-sm">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/50 transition-colors shadow-sm">
                    <span className="text-[var(--color-muted)]">|00⟩</span>
                    <span className="text-[var(--color-text)]">0.707 + 0.000j</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] opacity-50">
                    <span className="text-[var(--color-muted)]">|01⟩</span>
                    <span className="text-[var(--color-text)]">0.000 + 0.000j</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] opacity-50">
                    <span className="text-[var(--color-muted)]">|10⟩</span>
                    <span className="text-[var(--color-text)]">0.000 + 0.000j</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-secondary)]/50 transition-colors shadow-sm">
                    <span className="text-[var(--color-muted)]">|11⟩</span>
                    <span className="text-[var(--color-text)]">0.707 + 0.000j</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
        </div>
      </section>

      {/* SECTION 7: VISUALIZATION */}
      <section className="py-24 bg-[var(--color-background)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl sm:text-5xl font-heading font-bold mb-6">
              See What the Qubit <br className="hidden sm:block" />
              <span className="text-[var(--color-muted)]">Is Doing.</span>
            </h2>
          </div>

          <div className="viz-grid grid md:grid-cols-3 gap-6">
            {/* Bloch Sphere Mock */}
            <div className="viz-card p-6 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] flex flex-col items-center">
              <div className="text-sm font-bold text-[var(--color-muted)] uppercase tracking-wider mb-8 w-full">Bloch Sphere</div>
              <div className="relative w-40 h-40 rounded-full border-2 border-[var(--color-border)] flex items-center justify-center">
                {/* Axes */}
                <div className="absolute w-full h-[1px] bg-[var(--color-border)]" />
                <div className="absolute h-full w-[1px] bg-[var(--color-border)]" />
                {/* Vector */}
                <div className="absolute w-1/2 h-[2px] bg-[var(--color-primary)] origin-left rotate-45 top-1/2 left-1/2 shadow-[0_0_10px_rgba(99,102,241,0.8)]">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-sm" />
                </div>
                {/* Equator */}
                <div className="absolute w-full h-8 rounded-full border border-[var(--color-border)]/50" />
              </div>
            </div>

            {/* Statevector Mock */}
            <div className="viz-card p-6 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] flex flex-col items-center">
              <div className="text-sm font-bold text-[var(--color-muted)] uppercase tracking-wider mb-8 w-full">Q-Sphere</div>
              <div className="relative w-40 h-40 flex flex-wrap gap-2 items-center justify-center">
                 <div className="w-12 h-12 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-xs font-mono font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]">|00⟩</div>
                 <div className="w-12 h-12 rounded-full bg-[var(--color-background)] border-2 border-[var(--color-border)]" />
                 <div className="w-12 h-12 rounded-full bg-[var(--color-background)] border-2 border-[var(--color-border)]" />
                 <div className="w-12 h-12 rounded-full bg-[var(--color-secondary)] flex items-center justify-center text-xs font-mono font-bold text-[var(--color-background)] shadow-[0_0_15px_rgba(34,211,238,0.5)]">|11⟩</div>
              </div>
            </div>

            {/* Density Matrix Mock */}
            <div className="viz-card p-6 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] flex flex-col items-center">
              <div className="text-sm font-bold text-[var(--color-muted)] uppercase tracking-wider mb-8 w-full">Density Matrix</div>
              <div className="grid grid-cols-2 gap-1 w-32 h-32 rotate-x-45 rotate-z-45 transform-gpu perspective-1000">
                <div className="bg-[var(--color-primary)]/80 rounded-[2px]" />
                <div className="bg-[var(--color-primary)]/20 rounded-[2px]" />
                <div className="bg-[var(--color-primary)]/20 rounded-[2px]" />
                <div className="bg-[var(--color-secondary)]/80 rounded-[2px]" />
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
