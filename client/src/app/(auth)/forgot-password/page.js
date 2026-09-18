"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../store/useAuthStore';
import { LuCpu, LuMail, LuArrowRight, LuCircleAlert, LuLoaderCircle, LuArrowLeft, LuKeyRound } from 'react-icons/lu';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { forgotPassword, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      const msg = 'Please provide your email address.';
      setLocalError(msg);
      toast.error(msg);
      return;
    }

    const result = await forgotPassword(email);
    if (result.success) {
      toast.success('Password reset code sent to your email.');
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } else {
      toast.error(result.error || 'Failed to send reset code. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[var(--color-background)]">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white shadow-lg shadow-[var(--color-primary)]/20 transition-transform group-hover:scale-105">
              <LuCpu size={24} />
            </div>
            <span className="font-heading font-bold text-2xl tracking-tight text-[var(--color-text)]">
              QubitMind
            </span>
          </Link>
          <div className="w-12 h-12 mx-auto mt-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <LuKeyRound size={24} />
          </div>
          <h2 className="text-3xl font-heading font-bold text-[var(--color-text)]">
            Reset your password
          </h2>
          <p className="text-sm text-[var(--color-muted)]">
            Enter your account email and we will send you a 6-digit security code
          </p>
        </div>

        {(error || localError) && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm flex items-center gap-3 animate-shake">
            <LuCircleAlert size={18} className="flex-shrink-0" />
            <span>{error || localError}</span>
          </div>
        )}

        <div className="p-8 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-2">
                Account Email
              </label>
              <div className="relative">
                <LuMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    if (error) clearError();
                    if (localError) setLocalError('');
                    setEmail(e.target.value);
                  }}
                  placeholder="name@institution.edu"
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
                  <span>Sending Code...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Code</span>
                  <LuArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-[var(--color-border)]/50 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              <LuArrowLeft size={16} />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
