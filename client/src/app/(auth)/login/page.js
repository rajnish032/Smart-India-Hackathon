"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '../../../store/useAuthStore';
import { LuCpu, LuMail, LuLock, LuArrowRight, LuCircleAlert, LuLoaderCircle } from 'react-icons/lu';
import toast from 'react-hot-toast';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verifiedNotice = searchParams.get('verified');
  const resetNotice = searchParams.get('reset');

  const { user, isAuthenticated, isLoading: authLoading, checkAuth, login, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [localError, setLocalError] = useState('');

  // Auto-redirect to respective role dashboard if user is already authenticated
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.role) {
      const role = (user.role || '').toUpperCase();
      if (role === 'ADMIN') router.replace('/admin');
      else if (role === 'INSTRUCTOR') router.replace('/instructor');
      else router.replace('/dashboard');
    }
  }, [authLoading, isAuthenticated, user, router]);

  const handleChange = (e) => {
    if (error) clearError();
    if (localError) setLocalError('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      const msg = 'Please enter both your email address and password.';
      setLocalError(msg);
      toast.error(msg);
      return;
    }

    const result = await login(formData.email, formData.password);

    if (result.requiresVerification) {
      toast.error('Please verify your email to access your account.');
      router.push(`/verify-email?email=${encodeURIComponent(result.email)}&unverified=true`);
      return;
    }

    if (result.success) {
      toast.success(`Welcome back, ${result.user?.name || 'Explorer'}!`);
      // Direct redirect to each role-specific dashboard
      const role = (result.user?.role || '').toUpperCase();
      if (role === 'ADMIN') {
        router.replace('/admin');
      } else if (role === 'INSTRUCTOR') {
        router.replace('/instructor');
      } else {
        router.replace('/dashboard');
      }
    } else {
      toast.error(result.error || 'Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[var(--color-background)]">
      <div className="w-full max-w-md space-y-8">
        {/* Header / Logo */}
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
            Welcome back
          </h2>
          <p className="text-sm text-[var(--color-muted)]">
            Log in to access your quantum workspace and circuits
          </p>
        </div>

        {/* Notices */}
        {verifiedNotice && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Email verified successfully! Please log in with your credentials.</span>
          </div>
        )}

        {resetNotice && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Password reset successfully. All previous sessions terminated.</span>
          </div>
        )}

        {/* Error Alert */}
        {(error || localError) && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm flex items-center gap-3 animate-shake">
            <LuCircleAlert size={18} className="flex-shrink-0" />
            <span>{error || localError}</span>
          </div>
        )}

        {/* Login Form Card */}
        <div className="p-8 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="name@institution.edu"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-muted)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-[var(--color-primary)] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <LuLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" size={18} />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
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
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <LuArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-[var(--color-border)]/50 text-center">
            <p className="text-sm text-[var(--color-muted)]">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="font-semibold text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors"
              >
                Sign up as Learner
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Credentials Quick-Fill helper */}
        <div className="p-4 rounded-2xl bg-[var(--color-surface)]/50 border border-[var(--color-border)]/60 text-xs text-[var(--color-muted)] space-y-2">
          <div className="font-semibold text-[var(--color-text)]">Quick Demo Credentials:</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => setFormData({ email: 'learner@quantum.platform', password: 'Learner@2025!' })}
              className="text-left p-2 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)]/50 hover:border-[var(--color-primary)]"
            >
              <div className="font-medium text-[var(--color-text)]">Learner</div>
              <div className="truncate">learner@quantum.platform</div>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ email: 'instructor@quantum.platform', password: 'Instructor@2025!' })}
              className="text-left p-2 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)]/50 hover:border-[var(--color-primary)]"
            >
              <div className="font-medium text-[var(--color-text)]">Instructor</div>
              <div className="truncate">instructor@quantum.platform</div>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ email: 'admin@quantum.platform', password: 'AdminQuantum@2025!' })}
              className="text-left p-2 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)]/50 hover:border-[var(--color-primary)]"
            >
              <div className="font-medium text-[var(--color-text)]">Admin</div>
              <div className="truncate">admin@quantum.platform</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LuLoaderCircle className="animate-spin text-[var(--color-primary)]" size={32} /></div>}>
      <LoginForm />
    </Suspense>
  );
}
