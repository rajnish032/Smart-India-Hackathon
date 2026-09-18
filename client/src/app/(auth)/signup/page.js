"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../store/useAuthStore';
import {
  LuCpu,
  LuUser,
  LuMail,
  LuLock,
  LuArrowRight,
  LuCircleAlert,
  LuLoaderCircle,
  LuBookOpen,
  LuShieldAlert,
} from 'react-icons/lu';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const router = useRouter();
  const { signup, isLoading, error, clearError } = useAuthStore();

  const role = 'LEARNER'; // Only LEARNER accounts can be created publicly
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [localError, setLocalError] = useState('');

  const handleChange = (e) => {
    if (error) clearError();
    if (localError) setLocalError('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Password strength checker
  const getPasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^a-zA-Z0-9]/.test(pass)) score++;
    return score;
  };

  const passScore = getPasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      const msg = 'All fields are required.';
      setLocalError(msg);
      toast.error(msg);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      const msg = 'Passwords do not match.';
      setLocalError(msg);
      toast.error(msg);
      return;
    }

    if (formData.password.length < 8) {
      const msg = 'Password must be at least 8 characters long.';
      setLocalError(msg);
      toast.error(msg);
      return;
    }

    const result = await signup({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role,
    });

    if (result.success) {
      toast.success(result.message || 'Verification code sent to your email!');
      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } else {
      toast.error(result.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[var(--color-background)]">
      <div className="w-full max-w-lg space-y-8">
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white shadow-lg shadow-[var(--color-primary)]/20 transition-transform group-hover:scale-105">
              <LuCpu size={24} />
            </div>
            <span className="font-heading font-bold text-2xl tracking-tight text-[var(--color-text)]">
              QubitMind
            </span>
          </Link>
          <h2 className="text-3xl font-heading font-bold text-[var(--color-text)]">
            Create your account
          </h2>
          <p className="text-sm text-[var(--color-muted)]">
            Begin your quantum computing and quantum algorithms journey
          </p>
        </div>

        {/* Error Alert */}
        {(error || localError) && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm flex items-center gap-3 animate-shake">
            <LuCircleAlert size={18} className="flex-shrink-0" />
            <span>{error || localError}</span>
          </div>
        )}

        <div className="p-8 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Account Type Info */}
            <div>
              <div className="p-4 rounded-2xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/20 flex items-center justify-center flex-shrink-0">
                  <LuBookOpen size={20} className="text-[var(--color-primary)]" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-[var(--color-text)]">Learner Account</div>
                  <div className="text-xs text-[var(--color-muted)] mt-0.5">Interactive courses, quantum circuit design, AI tutor, experiments & simulations</div>
                </div>
                <span className="ml-auto w-2.5 h-2.5 rounded-full bg-[var(--color-primary)] flex-shrink-0" />
              </div>
              <div className="mt-3 p-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)]/70 flex items-start gap-2.5 text-xs text-[var(--color-muted)]">
                <LuShieldAlert size={16} className="text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Notice:</strong> Instructor accounts are provisioned by Institution Administrators. Contact your institution to get faculty access.
                </span>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <LuUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" size={18} />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ada Lovelace"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-muted)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <LuMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" size={18} />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ada@research.edu"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-muted)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <LuLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" size={18} />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-muted)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all"
                />
              </div>

              {/* Password Strength Meter */}
              {formData.password && (
                <div className="mt-2 space-y-1">
                  <div className="grid grid-cols-4 gap-1.5 h-1.5">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`rounded-full transition-all ${
                          passScore >= step
                            ? passScore <= 2
                              ? 'bg-rose-500'
                              : passScore === 3
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                            : 'bg-[var(--color-border)]'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-[11px] text-[var(--color-muted)]">
                    <span>Password Strength</span>
                    <span className="font-medium">
                      {passScore <= 1 && 'Weak'}
                      {passScore === 2 && 'Fair'}
                      {passScore === 3 && 'Good'}
                      {passScore === 4 && 'Strong (Argon2id)'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <LuLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" size={18} />
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-muted)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white shadow-lg shadow-[var(--color-primary)]/25 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <LuLoaderCircle className="animate-spin" size={18} />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Sign Up & Send Code</span>
                  <LuArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-[var(--color-border)]/50 text-center">
            <p className="text-sm text-[var(--color-muted)]">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-semibold text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
