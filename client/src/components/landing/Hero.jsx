"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { LuArrowRight, LuCirclePlay, LuX } from "react-icons/lu";

export default function Hero() {
  const heroRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo(".wire-pulse", 
        { width: "0%" },
        { width: "100%", duration: 1.5, ease: "power2.inOut", repeat: -1, yoyo: true }
      );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} id="hero" className="relative min-h-[95vh] flex items-center justify-center overflow-hidden bg-[var(--color-background)] pt-20">
      
      {/* Advanced Animated Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-[var(--color-primary)]/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] bg-[var(--color-secondary)]/15 rounded-full blur-[100px] mix-blend-screen" />
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[40%] bg-indigo-500/15 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute inset-0 bg-noise opacity-30 mix-blend-overlay" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col lg:flex-row items-center gap-16 relative z-10">
        
        {/* Left: Text Content */}
        <div className="hero-content flex-1 text-center lg:text-left z-10 flex flex-col items-center lg:items-start max-w-3xl">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-bold tracking-tight leading-[1.15] mb-6">
            Learn Quantum Computing <br className="hidden sm:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] via-purple-500 to-[var(--color-secondary)]">
              by Building and Simulating.
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-[var(--color-muted)] mb-10 max-w-2xl leading-relaxed font-normal">
            Drag and drop quantum gates, see 3D quantum states in real-time, and get instant AI guidance—right in your browser.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center lg:justify-start">
            <button className="group flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[var(--color-text)] text-[var(--color-background)] font-semibold text-lg hover:shadow-lg transition-all duration-300">
              Start Building <LuArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[var(--color-surface)] backdrop-blur-md border border-[var(--color-border)] text-[var(--color-text)] font-semibold text-lg hover:border-[var(--color-primary)]/50 transition-all duration-300">
              <LuCirclePlay size={20} className="text-[var(--color-primary)]" /> Try Demo
            </button>
          </div>
          
          <div className="mt-12 flex flex-wrap justify-center lg:justify-start gap-4 items-center opacity-80">
            <span className="text-xs font-mono text-[var(--color-muted)] font-semibold uppercase tracking-wider mr-2">Works With</span>
            <span className="font-mono text-xs font-bold text-[var(--color-text)] bg-[var(--color-surface)] border border-[var(--color-border)] px-3 py-1.5 rounded-lg shadow-sm">Qiskit</span>
            <span className="font-mono text-xs font-bold text-[var(--color-text)] bg-[var(--color-surface)] border border-[var(--color-border)] px-3 py-1.5 rounded-lg shadow-sm">PennyLane</span>
            <span className="font-mono text-xs font-bold text-[var(--color-text)] bg-[var(--color-surface)] border border-[var(--color-border)] px-3 py-1.5 rounded-lg shadow-sm">Cirq</span>
          </div>
        </div>

        {/* Right: Quantum Lab Visual */}
        <div className="hero-content flex-1 w-full max-w-lg lg:max-w-xl z-10">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
            
            {/* Window header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-border)]/10">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="mx-auto text-xs font-mono text-[var(--color-muted)] font-semibold uppercase tracking-wider">
                Quantum Lab Simulator
              </div>
            </div>
            
            {/* Circuit Area */}
            <div className="p-6 sm:p-8 font-mono relative bg-noise">
              <div className="flex flex-col gap-8 relative">
                
                {/* Wires */}
                <div className="absolute top-[28px] left-10 right-10 h-[2px] bg-gradient-to-r from-[var(--color-border)] via-[var(--color-secondary)]/30 to-[var(--color-border)]">
                   <div className="wire-pulse h-full w-1/3 bg-gradient-to-r from-transparent via-[var(--color-secondary)] to-transparent" />
                </div>
                <div className="absolute top-[92px] left-10 right-10 h-[2px] bg-gradient-to-r from-[var(--color-border)] via-[var(--color-primary)]/30 to-[var(--color-border)]">
                   <div className="wire-pulse h-full w-1/3 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent delay-500" />
                </div>

                {/* q0 */}
                <div className="flex items-center gap-4 relative z-10">
                  <div className="text-[var(--color-muted)] font-bold">q0</div>
                  <div className="w-8 h-[2px]" />
                  <div className="gate w-12 h-12 rounded-xl border border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 flex items-center justify-center text-[var(--color-secondary)] font-bold shadow-[0_0_15px_rgba(236,72,153,0.3)] backdrop-blur-sm hover:scale-110 transition-transform cursor-pointer">H</div>
                  <div className="w-8 h-[2px]" />
                  <div className="gate w-4 h-4 rounded-full bg-[var(--color-primary)] mx-3 shadow-[0_0_10px_rgba(99,102,241,0.5)] relative">
                    {/* CNOT Line */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-[2px] h-[52px] bg-[var(--color-primary)]" />
                  </div>
                  <div className="flex-1" />
                  <div className="gate w-12 h-12 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text)] shadow-inner">M</div>
                </div>

                {/* q1 */}
                <div className="flex items-center gap-4 relative z-10">
                  <div className="text-[var(--color-muted)] font-bold">q1</div>
                  <div className="w-24 h-[2px]" />
                  <div className="gate w-12 h-12 rounded-full border-2 border-[var(--color-primary)] bg-[var(--color-background)] flex items-center justify-center text-[var(--color-primary)] shadow-[0_0_15px_rgba(99,102,241,0.3)] backdrop-blur-sm relative hover:scale-110 transition-transform cursor-pointer">
                    <div className="absolute w-6 h-[2px] bg-[var(--color-primary)] rotate-45" />
                    <div className="absolute w-6 h-[2px] bg-[var(--color-primary)] -rotate-45" />
                  </div>
                  <div className="flex-1" />
                  <div className="gate w-12 h-12 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text)] shadow-inner">M</div>
                </div>

              </div>
              
              {/* Results Area */}
              <div className="mt-10 pt-6 border-t border-[var(--color-border)]/50">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-xs text-[var(--color-muted)] mb-3 uppercase tracking-wide font-bold">Measurement</div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold text-[var(--color-primary)]">|00⟩</span>
                        <div className="flex-1 mx-3 h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
                           <div className="h-full bg-[var(--color-primary)] w-[48%]" />
                        </div>
                        <span className="text-[var(--color-muted)]">48%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold text-[var(--color-secondary)]">|11⟩</span>
                        <div className="flex-1 mx-3 h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
                           <div className="h-full bg-[var(--color-secondary)] w-[52%]" />
                        </div>
                        <span className="text-[var(--color-muted)]">52%</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3 shadow-inner">
                    <div className="text-xs text-[var(--color-muted)] mb-2 uppercase tracking-wide">State / Backend</div>
                    <div className="text-sm font-bold text-[var(--color-text)] mb-2">
                      |ψ⟩ = <span className="text-[var(--color-muted)]">1/√2</span> (|00⟩ + |11⟩)
                    </div>
                    <div className="text-[10px] text-[var(--color-primary)] flex items-center gap-1 mt-auto bg-[var(--color-primary)]/10 w-fit px-2 py-1 rounded border border-[var(--color-primary)]/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                      Qiskit Aer Ready
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
