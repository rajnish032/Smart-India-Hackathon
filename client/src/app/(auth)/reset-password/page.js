"use client";

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '../../../store/useAuthStore';
import { LuCpu, LuMail, LuLock, LuShieldCheck, LuCircleAlert, LuLoaderCircle, LuArrowRight, LuArrowLeft } from 'react-icons/lu';
import toast from 'react-hot-toast';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  const { resetPassword, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: initialEmail,
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [localError, setLocalError] = useState('');

  const handleChange = (e) => {
    if (error) clearError();
    if (localError) setLocalError('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getPasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^a-zA-Z0-9]/.test(pass)) score++;
    return score;
  };

  const passScore = getPasswordStrength(formData.newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.otp || !formData.newPassword) {
      const msg = 'All fields are required.';
      setLocalError(msg);
      toast.error(msg);
      return;
    }

    if (formData.otp.trim().length !== 6) {
      const msg = 'Please enter the 6-digit verification code.';
      setLocalError(msg);
      toast.error(msg);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      const msg = 'Passwords do not match.';
      setLocalError(msg);
      toast.error(msg);
      return;
    }

    if (formData.newPassword.length < 8) {
      const msg = 'Password must be at least 8 characters long.';
      setLocalError(msg);
      toast.error(msg);
      return;
    }

    const result = await resetPassword(formData.email, formData.otp.trim(), formData.newPassword);

    if (result.success) {
      toast.success('Password updated successfully! Please sign in.');
      router.push('/login?reset=true');
    } else {
      toast.error(result.error || 'Password reset failed. Please check the code.');
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
          <h2 className="text-3xl font-heading font-bold text-[var(--color-text)]">
            Create new password
          </h2>
          <p className="text-sm text-[var(--color-muted)]">
            Enter the 6-digit code received via email and choose a strong password
          </p>
        </div>

        {/* Security Alert regarding Session Invalidation */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs flex items-start gap-3">
          <LuShieldCheck size={18} className="flex-shrink-0 mt-0.5" />
          <span>
            <strong>Security Invalidation:</strong> For your protection, resetting your password will automatically terminate and invalidate all other active sessions and refresh tokens across all devices.
          </span>
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
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@institution.edu"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-muted)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-2">
                6-Digit Reset Code
              </label>
              <input
                type="text"
                name="otp"
                maxLength={6}
                required
                value={formData.otp}
                onChange={handleChange}
                placeholder="123456"
                className="w-full px-4 py-3 font-mono tracking-widest text-center text-lg rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-2">
                New Password
              </label>
              <div className="relative">
                <LuLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" size={18} />
                <input
                  type="password"
                  name="newPassword"
                  required
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-muted)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50"
                />
              </div>

              {formData.newPassword && (
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

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <LuLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" size={18} />
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat new password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-muted)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50"
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
                  <span>Resetting & Terminating Sessions...</span>
                </>
              ) : (
                <>
                  <span>Update Password</span>
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
              Cancel and Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LuLoaderCircle className="animate-spin text-[var(--color-primary)]" size={32} /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
