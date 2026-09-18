"use client";

import React from "react";
import { LuTarget, LuArrowRight, LuUserCheck, LuCode, LuGraduationCap } from "react-icons/lu";

export default function ChallengesAndEcosystem() {
  return (
    <div className="w-full">
      
      {/* SECTION 10: CHALLENGES */}
      <section className="challenges-section py-24 bg-[var(--color-surface)] border-b border-[var(--color-border)]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div className="max-w-2xl">
              <h2 className="text-4xl sm:text-5xl font-heading font-bold mb-4">
                Don't Just Learn. <span className="text-[var(--color-primary)]">Build.</span>
              </h2>
              <p className="text-[var(--color-muted)] text-lg">Test your knowledge with hands-on coding and circuit challenges.</p>
            </div>
            <button className="hidden md:flex items-center gap-2 text-[var(--color-primary)] font-medium hover:opacity-80 transition-opacity">
              Explore Challenges <LuArrowRight size={20} />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Create a Bell State", diff: "Beginner", time: "15 min", color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
              { title: "Quantum Teleportation Circuit", diff: "Intermediate", time: "45 min", color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
              { title: "Implement Grover's Algorithm", diff: "Advanced", time: "2 hrs", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
            ].map((c, i) => (
              <div key={i} className="challenge-card bg-[var(--color-background)] border border-[var(--color-border)] rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer group">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold mb-4 ${c.bg} ${c.color} ${c.border} border`}>
                  <LuTarget size={12} /> {c.diff}
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-[var(--color-primary)] transition-colors">{c.title}</h3>
                <div className="text-sm text-[var(--color-muted)] mb-6 flex justify-between">
                  <span>Est. Time: {c.time}</span>
                  <span>+100 Score</span>
                </div>
                <div className="w-full h-[1px] bg-[var(--color-border)] mb-4" />
                <div className="text-sm font-medium text-[var(--color-primary)] flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                  Start Challenge <LuArrowRight size={16} />
                </div>
              </div>
            ))}
          </div>
          
          <button className="mt-8 flex md:hidden items-center justify-center w-full gap-2 text-[var(--color-primary)] font-medium py-3 border border-[var(--color-border)] rounded-xl">
            Explore Challenges <LuArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* SECTION 11 & 12 Combined slightly for flow: Ecosystem & Personalized */}
      <section className="py-24 bg-[var(--color-background)] border-b border-[var(--color-border)]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Dashboard Preview */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 shadow-xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <LuUserCheck size={20} className="text-[var(--color-primary)]" /> Your Progress
            </h3>
            
            <div className="space-y-5">
              {[
                { n: "Quantum Fundamentals", p: 92 },
                { n: "Quantum Gates", p: 86 },
                { n: "Entanglement", p: 48 },
                { n: "Algorithms", p: 21 },
              ].map(item => (
                <div key={item.n}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">{item.n}</span>
                    <span className="text-[var(--color-muted)]">{item.p}%</span>
                  </div>
                  <div className="w-full h-2 bg-[var(--color-background)] rounded-full overflow-hidden border border-[var(--color-border)]/50">
                    <div className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]" style={{width: `${item.p}%`}} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-xl">
              <div className="text-sm text-[var(--color-text)] font-medium mb-3 leading-relaxed">
                "You're strong in single-qubit operations. We recommend practicing Bell States before moving to Grover's Algorithm."
              </div>
              <button className="w-full py-2 bg-[var(--color-primary)] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity">
                Continue Recommended Path
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-4xl sm:text-5xl font-heading font-bold mb-6">
              Your Learning Path <br /> Adapts to You.
            </h2>
            <p className="text-lg text-[var(--color-muted)] mb-12">
              Our platform analyzes your performance, identifies knowledge gaps, and dynamically adjusts your curriculum to ensure true comprehension.
            </p>

            <h3 className="text-xl font-bold mb-4 border-t border-[var(--color-border)] pt-8">Learn Across the Ecosystem</h3>
            <p className="text-[var(--color-muted)] mb-6">Build once. Explore across multiple quantum frameworks natively.</p>
            
            <div className="flex flex-wrap gap-3">
              {['Qiskit', 'PennyLane', 'Cirq', 'qBraid'].map(fw => (
                <div key={fw} className="px-4 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-medium shadow-sm hover:border-[var(--color-primary)] transition-colors cursor-pointer">
                  {fw}
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 13: FOR EVERYONE */}
      <section className="audience-section py-24 bg-[var(--color-surface)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            
            <div className="audience-card p-8 rounded-2xl bg-[var(--color-background)] border border-[var(--color-border)] flex flex-col items-center text-center hover:border-[var(--color-primary)]/50 transition-colors">
              <div className="w-14 h-14 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center mb-6">
                <LuGraduationCap size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Students</h3>
              <p className="text-[var(--color-muted)]">Build strong quantum fundamentals through guided learning and AI assistance.</p>
            </div>
            
            <div className="audience-card p-8 rounded-2xl bg-[var(--color-background)] border border-[var(--color-border)] flex flex-col items-center text-center hover:border-[var(--color-secondary)]/50 transition-colors">
              <div className="w-14 h-14 rounded-full bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] flex items-center justify-center mb-6">
                <LuCode size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Advanced Learners</h3>
              <p className="text-[var(--color-muted)]">Design experiments, compare backends, simulate circuits, and export to industry frameworks.</p>
            </div>
            
            <div className="audience-card p-8 rounded-2xl bg-[var(--color-background)] border border-[var(--color-border)] flex flex-col items-center text-center hover:border-indigo-500/50 transition-colors">
              <div className="w-14 h-14 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-6">
                <LuUserCheck size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Instructors</h3>
              <p className="text-[var(--color-muted)]">Create courses, assign challenges, and monitor learner progress through analytics.</p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
