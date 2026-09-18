"use client";

import React from "react";
import { LuCpu, LuArrowRight } from "react-icons/lu";

export default function Footer() {
  return (
    <footer className="bg-[var(--color-background)] border-t border-[var(--color-border)]">
      
      {/* FINAL CTA SECTION */}
      <div className="py-24 border-b border-[var(--color-border)] relative overflow-hidden">
        
        {/* Subtle animated quantum particles background */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--color-primary)_0%,_transparent_70%)] blur-[100px]" />
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl sm:text-6xl font-heading font-extrabold mb-6 tracking-tight">
            Your Quantum Journey <br /> Starts With One Qubit.
          </h2>
          <p className="text-xl text-[var(--color-muted)] mb-10 max-w-2xl mx-auto">
            Learn the fundamentals. Build circuits. Run simulations. Ask AI. Master quantum computing.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[var(--color-text)] text-[var(--color-background)] font-medium text-lg hover:scale-105 transition-transform">
              Start Learning <LuArrowRight size={20} />
            </button>
            <button className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-transparent border border-[var(--color-border)] text-[var(--color-text)] font-medium text-lg hover:bg-[var(--color-border)]/30 transition-colors">
              Explore Quantum Lab
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER LINKS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
          
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white">
                <LuCpu size={20} />
              </div>
              <span className="font-heading font-bold text-xl text-[var(--color-text)]">
                QubitMind
              </span>
            </div>
            <p className="text-sm text-[var(--color-muted)]">
              Built for the next generation of quantum learners.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-[var(--color-text)]">Product</h4>
            <ul className="space-y-3 text-sm text-[var(--color-muted)]">
              <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors">Learn</a></li>
              <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors">Playground</a></li>
              <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors">Challenges</a></li>
              <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors">AI Tutor</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-[var(--color-text)]">Resources</h4>
            <ul className="space-y-3 text-sm text-[var(--color-muted)]">
              <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors">Learning Paths</a></li>
              <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors">About</a></li>
              <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors">How It Works</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-[var(--color-text)]">Platform</h4>
            <ul className="space-y-3 text-sm text-[var(--color-muted)]">
              <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors">Qiskit Integration</a></li>
              <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors">PennyLane</a></li>
              <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors">Cirq</a></li>
              <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors">qBraid</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-[var(--color-text)]">Account</h4>
            <ul className="space-y-3 text-sm text-[var(--color-muted)]">
              <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors">Login</a></li>
              <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors">Register</a></li>
            </ul>
          </div>

        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-[var(--color-border)] text-sm text-[var(--color-muted)]">
          <p>© 2026 QubitMind. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-[var(--color-text)] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[var(--color-text)] transition-colors">Terms</a>
          </div>
        </div>
      </div>

    </footer>
  );
}
