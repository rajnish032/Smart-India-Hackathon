"use client";

import React from "react";
import { LuBookOpen, LuShare2, LuActivity, LuSparkles } from "react-icons/lu";

const steps = [
  {
    num: "01",
    title: "Learn",
    icon: <LuBookOpen className="w-6 h-6 text-[var(--color-primary)]" />,
    desc: "Begin with bite-sized, interactive lessons. Concepts are broken down visually, removing the heavy math overhead initially so you can build intuition first."
  },
  {
    num: "02",
    title: "Build",
    icon: <LuShare2 className="w-6 h-6 text-[var(--color-secondary)]" />,
    desc: "Drag and drop quantum gates onto the circuit canvas. See the corresponding code (Qiskit, PennyLane) generate in real-time as you build."
  },
  {
    num: "03",
    title: "Simulate",
    icon: <LuActivity className="w-6 h-6 text-indigo-500" />,
    desc: "Execute your circuit instantly in the browser. View measurement histograms, inspect the statevector, and visualize the Bloch sphere."
  },
  {
    num: "04",
    title: "Improve",
    icon: <LuSparkles className="w-6 h-6 text-amber-500" />,
    desc: "Get stuck? Ask the AI tutor to explain what's wrong. Take recommended challenges to solidify your understanding and level up."
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-[var(--color-background)] border-y border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-heading font-bold mb-4">How It Works</h2>
          <p className="text-lg text-[var(--color-muted)]">From beginner intuition to building real quantum algorithms in 4 simple steps.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="bento-card p-8 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center shadow-sm">
                    {step.icon}
                  </div>
                  <span className="font-mono text-4xl font-bold text-[var(--color-border)]">{step.num}</span>
                </div>
                <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                <p className="text-[var(--color-muted)] leading-relaxed text-sm sm:text-base">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
