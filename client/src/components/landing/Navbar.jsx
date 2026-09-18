"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  LuMenu,
  LuX,
  LuMoon,
  LuSun,
  LuCpu,
  LuUser,
  LuLogOut,
  LuLayoutDashboard,
  LuShieldAlert,
  LuGraduationCap,
  LuChevronDown,
} from "react-icons/lu";
import gsap from "gsap";
import { useAuthStore } from "../../store/useAuthStore";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { user, isAuthenticated, logout, checkAuth } = useAuthStore();

  useEffect(() => {
    setMounted(true);
    checkAuth();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    // Navbar entrance animation
    gsap.fromTo(
      ".navbar-entrance",
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
    );

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [checkAuth]);

  // Determine target dashboard based on role
  const getDashboardHref = () => {
    if (!user) return "/dashboard";
    switch (user.role) {
      case "ADMIN":
        return "/admin";
      case "INSTRUCTOR":
        return "/instructor";
      default:
        return "/dashboard";
    }
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case "ADMIN":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      case "INSTRUCTOR":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      default:
        return "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/20";
    }
  };

  return (
    <header
      className={`navbar-entrance fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[var(--color-surface)]/80 backdrop-blur-md border-b border-[var(--color-border)] shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-105">
              <LuCpu size={20} />
            </div>
            <span className="font-heading font-bold text-xl tracking-tight text-[var(--color-text)]">
              QubitMind
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            {["Learn", "Playground", "Features", "How It Works", "About"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                className="text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Right Section */}
          <div className="hidden md:flex items-center space-x-4">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-full hover:bg-[var(--color-border)]/50 transition-colors text-[var(--color-muted)] hover:text-[var(--color-text)] cursor-pointer"
                aria-label="Toggle Theme"
              >
                {theme === "dark" ? <LuSun size={20} /> : <LuMoon size={20} />}
              </button>
            )}

            {isAuthenticated && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/50 transition-all cursor-pointer shadow-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-secondary)] text-white flex items-center justify-center text-xs font-bold uppercase">
                    {user.name?.charAt(0) || "U"}
                  </div>
                  <div className="text-left leading-tight hidden lg:block">
                    <div className="text-xs font-semibold text-[var(--color-text)] max-w-[120px] truncate">
                      {user.name}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${getRoleBadgeStyle(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>
                  <LuChevronDown size={14} className="text-[var(--color-muted)]" />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl p-2 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-[var(--color-border)]/50">
                      <div className="text-xs font-bold text-[var(--color-text)] truncate">{user.name}</div>
                      <div className="text-[11px] text-[var(--color-muted)] font-mono truncate">{user.email}</div>
                    </div>

                    <Link
                      href={getDashboardHref()}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[var(--color-text)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] transition-colors"
                    >
                      <LuLayoutDashboard size={15} />
                      <span>
                        {user.role === "ADMIN"
                          ? "Admin Console"
                          : user.role === "INSTRUCTOR"
                          ? "Instructor Portal"
                          : "Learner Dashboard"}
                      </span>
                    </Link>

                    {user.role === "ADMIN" && (
                      <Link
                        href="/dashboard"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)]/30 transition-colors"
                      >
                        <LuGraduationCap size={15} />
                        <span>Learner Preview</span>
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <LuLogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-[var(--color-text)] text-[var(--color-background)] px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-3">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 text-[var(--color-muted)] cursor-pointer"
              >
                {theme === "dark" ? <LuSun size={20} /> : <LuMoon size={20} />}
              </button>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-[var(--color-text)] cursor-pointer"
            >
              {isMobileMenuOpen ? <LuX size={24} /> : <LuMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 pt-2 pb-6 space-y-3 shadow-xl">
          {["Learn", "Playground", "Features", "How It Works", "About"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/ /g, "-")}`}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)]/20"
            >
              {item}
            </a>
          ))}

          <div className="pt-4 border-t border-[var(--color-border)] flex flex-col space-y-2">
            {isAuthenticated && user ? (
              <>
                <div className="px-3 py-1 flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--color-text)]">{user.name}</span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${getRoleBadgeStyle(user.role)}`}>
                    {user.role}
                  </span>
                </div>
                <Link
                  href={getDashboardHref()}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2.5 bg-[var(--color-primary)] text-white rounded-xl text-sm font-semibold"
                >
                  My Portal
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-center px-4 py-2 text-rose-500 border border-rose-500/30 rounded-xl text-sm font-semibold"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2.5 border border-[var(--color-border)] rounded-xl font-medium text-[var(--color-text)] text-sm"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2.5 bg-[var(--color-text)] text-[var(--color-background)] rounded-xl font-medium text-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
