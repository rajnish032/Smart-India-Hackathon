"use client";

import React from "react";
import { LuSparkles, LuTerminal, LuCode, LuCircleHelp, LuLightbulb, LuUser } from "react-icons/lu";

export default function AITutor() {
  return (
    <section className="ai-tutor-section py-24 bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-background)] border-b border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* LEFT: Conversation UI */}
          <div className="order-2 lg:order-1 relative">
            <div className="absolute inset-0 bg-[var(--color-primary)]/10 blur-[100px] -z-10 rounded-full" />
            
            <div className="bg-[var(--color-background)] rounded-2xl border border-[var(--color-border)] shadow-2xl overflow-hidden flex flex-col h-[500px]">
              {/* Header */}
              <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white">
                  <LuSparkles size={16} />
                </div>
                <div>
                  <div className="font-bold text-sm text-[var(--color-text)]">QubitMind AI</div>
                  <div className="text-xs text-[var(--color-primary)] font-medium">Always online</div>
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
                {/* User Message */}
                <div className="ai-msg flex gap-4 w-full justify-end">
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl rounded-tr-sm p-4 max-w-[85%] text-sm shadow-sm">
                    Why does the Hadamard gate create superposition?
                  </div>
                  <div className="w-8 h-8 shrink-0 rounded-full bg-[var(--color-border)] flex items-center justify-center text-[var(--color-muted)]">
                    <LuUser size={16} />
                  </div>
                </div>

                {/* AI Message */}
                <div className="ai-msg flex gap-4 w-full justify-start">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white">
                    <LuSparkles size={16} />
                  </div>
                  <div className="bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-2xl rounded-tl-sm p-4 max-w-[85%] text-sm">
                    <p className="mb-3">The Hadamard gate (H) transforms the basis state <strong className="font-mono">|0⟩</strong> into an equal superposition of <strong className="font-mono">|0⟩</strong> and <strong className="font-mono">|1⟩</strong>.</p>
                    <p>Mathematically, it creates the state <strong className="font-mono">|+⟩ = 1/√2 (|0⟩ + |1⟩)</strong>.</p>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button className="text-xs px-3 py-1.5 rounded bg-[var(--color-background)] border border-[var(--color-primary)]/30 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors">
                        Explain Visually
                      </button>
                      <button className="text-xs px-3 py-1.5 rounded bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-border)]/50 transition-colors">
                        Show Example
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Typing indicator */}
                <div className="ai-msg flex gap-4 w-full justify-start items-center">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white">
                    <LuSparkles size={16} />
                  </div>
                  <div className="flex gap-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl rounded-tl-sm p-3">
                    <div className="w-2 h-2 rounded-full bg-[var(--color-muted)] animate-bounce" style={{animationDelay: "0ms"}} />
                    <div className="w-2 h-2 rounded-full bg-[var(--color-muted)] animate-bounce" style={{animationDelay: "150ms"}} />
                    <div className="w-2 h-2 rounded-full bg-[var(--color-muted)] animate-bounce" style={{animationDelay: "300ms"}} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Text content */}
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 text-[var(--color-primary)] text-xs font-semibold tracking-wider mb-6">
              <LuSparkles size={14} /> INTELLIGENT ASSISTANT
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-heading font-bold mb-6">
              Your Quantum Tutor Is <br />
              <span className="text-[var(--color-primary)]">Always With You.</span>
            </h2>
            
            <p className="text-lg text-[var(--color-muted)] mb-10 max-w-xl">
              Our AI isn't just a generic chatbot. It's context-aware, understanding your current lesson, your circuit canvas, your code, and your simulation results.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: <LuCircleHelp size={18} />, text: "Explain Concepts" },
                { icon: <LuCode size={18} />, text: "Generate Code" },
                { icon: <LuTerminal size={18} />, text: "Debug Circuits" },
                { icon: <LuSparkles size={18} />, text: "Optimize Circuits" },
                { icon: <LuLightbulb size={18} />, text: "Give Hints" },
                { icon: <LuUser size={18} />, text: "Recommend Lessons" },
              ].map((feature, idx) => (
                <div key={idx} className="ai-feature flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
                  <div className="text-[var(--color-primary)]">{feature.icon}</div>
                  <span className="font-medium text-sm">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
