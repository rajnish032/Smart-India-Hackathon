"use client";

import React from "react";
import { LuBookOpen, LuShare2, LuActivity, LuChartPie, LuSparkles, LuTarget } from "react-icons/lu";

const features = [
  {
    icon: <LuBookOpen size={24} />,
    title: "Interactive Learning",
    desc: "Structured lessons with visual explanations and experiments."
  },
  {
    icon: <LuShare2 size={24} />,
    title: "Visual Circuit Builder",
    desc: "Drag-and-drop quantum gates and circuit construction."
  },
  {
    icon: <LuActivity size={24} />,
    title: "Multi-Framework Simulation",
    desc: "Run circuits using multiple quantum frameworks.",
    badges: ["Qiskit", "PennyLane", "Cirq", "qBraid"]
  },
  {
    icon: <LuChartPie size={24} />,
    title: "Quantum Visualization",
    desc: "Visualize Bloch spheres, Statevectors, and Measurement probabilities."
  },
  {
    icon: <LuSparkles size={24} />,
    title: "AI Quantum Tutor",
    desc: "Explain concepts, generate code, debug circuits and provide hints."
  },
  {
    icon: <LuTarget size={24} />,
    title: "Personalized Learning",
    desc: "Adaptive recommendations based on progress and performance."
  }
];

export default function Features() {
  return (
    <section id="features" className="py-32 bg-[var(--color-surface)] relative overflow-hidden">
      <div className="absolute inset-0 bg-noise pointer-events-none opacity-40 mix-blend-overlay" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-5xl sm:text-6xl font-heading font-extrabold mb-6 tracking-tight">
            Everything You Need to <br /> Become <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">Quantum-Ready.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(280px,auto)]">
          {features.map((feat, idx) => {
            // Make the first and fourth items span 2 columns for a bento box look
            const isWide = idx === 0 || idx === 3;
            
            return (
              <div key={idx} className={`feature-card group bento-card p-8 flex flex-col ${isWide ? 'md:col-span-2' : 'md:col-span-1'}`}
                   onMouseMove={(e) => {
                     const rect = e.currentTarget.getBoundingClientRect();
                     e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                     e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
                   }}>
                
                <div className="bento-glow" />
                
                <div className="relative z-10 flex-1 flex flex-col">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)] flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform duration-500">
                    {feat.icon}
                  </div>
                  
                  <div className="mt-auto">
                    <h3 className="text-2xl font-bold mb-3">{feat.title}</h3>
                    <p className="text-[var(--color-muted)] text-base leading-relaxed max-w-md">
                      {feat.desc}
                    </p>

                    {feat.badges && (
                      <div className="flex flex-wrap gap-2 mt-6">
                        {feat.badges.map(badge => (
                          <span key={badge} className="px-3 py-1 text-xs font-mono font-medium rounded-full bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)] shadow-sm">
                            {badge}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Decorative background element based on index to make it feel less empty */}
                {isWide && (
                  <div className="absolute right-[-10%] top-[-10%] w-64 h-64 bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 rounded-full blur-[60px] pointer-events-none group-hover:opacity-100 opacity-50 transition-opacity duration-500" />
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
