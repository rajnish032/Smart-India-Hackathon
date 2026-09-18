"use client";

import React, { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '../../../store/useAuthStore';
import { LuCpu, LuMail, LuCircleCheck, LuCircleAlert, LuLoaderCircle, LuRefreshCw, LuArrowRight } from 'react-icons/lu';
import toast from 'react-hot-toast';

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';
  const isUnverifiedAttempt = searchParams.get('unverified');

  const {
    verifyEmail,
    resendOtp,
    isLoading,
    error,
    clearError,
    cooldownRemaining,
    tickCooldown,
  } = useAuthStore();

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [localError, setLocalError] = useState('');
  const [resendSuccess, setResendSuccess] = useState('');
  const inputRefs = useRef([]);

  // Cooldown countdown timer
  useEffect(() => {
    let interval = null;
    if (cooldownRemaining > 0) {
      interval = setInterval(() => {
        tickCooldown();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldownRemaining, tickCooldown]);

  // Handle single digit input
  const handleDigitChange = (index, value) => {
    if (error) clearError();
    if (localError) setLocalError('');
    if (resendSuccess) setResendSuccess('');

    // Handle single digit
    const cleaned = value.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = cleaned ? cleaned.slice(-1) : '';
    setOtp(newOtp);

    // Auto-advance to next input
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace key
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste of full 6-digit code
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '');
    if (pasteData.length > 0) {
      const digits = pasteData.slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((d, idx) => {
        if (idx < 6) newOtp[idx] = d;
      });
      setOtp(newOtp);
      const nextFocus = Math.min(digits.length, 5);
      inputRefs.current[nextFocus]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');

    if (!email) {
      const msg = 'Please provide your registered email address.';
      setLocalError(msg);
      toast.error(msg);
      return;
    }

    if (fullOtp.length !== 6) {
      const msg = 'Please enter all 6 digits of the verification code.';
      setLocalError(msg);
      toast.error(msg);
      return;
    }

    const result = await verifyEmail(email, fullOtp);

    if (result.success) {
      toast.success('Email verified successfully! Welcome to QubitMind.');
      const role = (result.user?.role || '').toUpperCase();
      if (role === 'ADMIN') router.replace('/admin');
      else if (role === 'INSTRUCTOR') router.replace('/instructor');
      else router.replace('/dashboard');
    } else {
      toast.error(result.error || 'Verification failed. Please check the code.');
    }
  };

  const handleResend = async () => {
    if (cooldownRemaining > 0 || isLoading) return;
    setLocalError('');
    clearError();

    const result = await resendOtp(email, 'EMAIL_VERIFICATION');
    if (result.success) {
      toast.success('A new 6-digit verification code has been dispatched.');
      setResendSuccess('A new 6-digit code has been dispatched to your email.');
    } else {
      toast.error(result.error || 'Failed to resend code. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[var(--color-background)]">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
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
            Verify your email
          </h2>
          <p className="text-sm text-[var(--color-muted)]">
            We sent a 6-digit verification code to activate your account
          </p>
        </div>

        {/* Notices */}
        {isUnverifiedAttempt && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm flex items-center gap-3">
            <LuCircleAlert size={18} className="flex-shrink-0" />
            <span>Your email is not verified yet. Please enter the code sent to your inbox to activate your session.</span>
          </div>
        )}

        {resendSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm flex items-center gap-3">
            <LuCircleCheck size={18} className="flex-shrink-0" />
            <span>{resendSuccess}</span>
          </div>
        )}

        {(error || localError) && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm flex items-center gap-3 animate-shake">
            <LuCircleAlert size={18} className="flex-shrink-0" />
            <span>{error || localError}</span>
          </div>
        )}

        {/* OTP Input Card */}
        <div className="p-8 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl space-y-6">
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-2">
                Target Email Address
              </label>
              <div className="relative">
                <LuMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-3 text-center">
                6-Digit Security Code
              </label>
              <div className="flex justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-mono font-bold rounded-2xl bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all shadow-inner"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.join('').length !== 6}
              className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white shadow-lg shadow-[var(--color-primary)]/25 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <LuLoaderCircle className="animate-spin" size={18} />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>Verify Email & Access Hub</span>
                  <LuArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Resend Action */}
          <div className="pt-4 border-t border-[var(--color-border)]/50 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--color-muted)] gap-2">
            <span>Didn&apos;t receive the code?</span>
            <button
              type="button"
              disabled={cooldownRemaining > 0 || isLoading}
              onClick={handleResend}
              className="inline-flex items-center gap-1.5 font-semibold text-[var(--color-primary)] hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer disabled:cursor-not-allowed"
            >
              <LuRefreshCw size={14} className={cooldownRemaining > 0 ? '' : 'group-hover:rotate-180 transition-transform'} />
              {cooldownRemaining > 0 ? `Resend in ${cooldownRemaining}s` : 'Resend Code'}
            </button>
          </div>
        </div>

        {/* Console / Development Notice */}
        <div className="text-center text-xs text-[var(--color-muted)]">
          Testing in development? Check your server console for simulated OTP previews if Resend key is unconfigured.
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LuLoaderCircle className="animate-spin text-[var(--color-primary)]" size={32} /></div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
