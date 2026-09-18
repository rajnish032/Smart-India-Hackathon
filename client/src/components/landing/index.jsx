"use client";

import React from "react";

import Navbar from "./Navbar";
import Hero from "./Hero";
import ProblemSolution from "./ProblemSolution";
import Features from "./Features";
import InteractiveBuilder from "./InteractiveBuilder";
import SimulationVisuals from "./SimulationVisuals";
import AITutor from "./AITutor";
import LearningPath from "./LearningPath";
import ChallengesAndEcosystem from "./ChallengesAndEcosystem";
import HowItWorks from "./HowItWorks";
import Footer from "./Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] transition-colors duration-300 overflow-hidden font-sans">
      <Navbar />
      <main>
        <Hero />
        <ProblemSolution />
        <Features />
        <HowItWorks />
        <InteractiveBuilder />
        <SimulationVisuals />
        <AITutor />
        <LearningPath />
        <ChallengesAndEcosystem />
      </main>
      <Footer />
    </div>
  );
}
