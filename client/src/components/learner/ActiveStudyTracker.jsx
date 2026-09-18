"use client";

import { useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { apiFetch } from '../../services/api';

/**
 * ActiveStudyTracker: Continuous client-side engagement tracker for learners.
 *
 * Automatically records genuine study time spent on the platform:
 * - Listens for real user interactions (mouse, keyboard, scroll, touch).
 * - Automatically pauses when the user is idle (>2 minutes) or switches tabs (document.hidden).
 * - Batches active seconds and sends a lightweight heartbeat to /api/learner/study-heartbeat every 60s.
 * - Flushes any unsaved study seconds when the user navigates away or closes the tab (keepalive).
 * - Broadcasts `learner:activity-updated` and writes to localStorage so the Profile, Dashboard,
 *   and Progress pages immediately reflect updated learning hours in real time.
 */
export default function ActiveStudyTracker() {
  const { user } = useAuthStore();
  const accumulatedSecondsRef = useRef(0);
  const lastInteractionRef = useRef(Date.now());
  const isSyncingRef = useRef(false);

  useEffect(() => {
    // Only track if user is authenticated
    if (!user) return;

    // Reset interaction timestamp
    lastInteractionRef.current = Date.now();

    // Throttled user activity listener (debounced to avoid performance cost)
    let lastThrottled = 0;
    const handleUserInteraction = () => {
      const now = Date.now();
      if (now - lastThrottled > 3000) {
        lastThrottled = now;
        lastInteractionRef.current = now;
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((evt) => {
      window.addEventListener(evt, handleUserInteraction, { passive: true });
    });

    /**
     * Send accumulated study seconds to the server
     */
    async function flushStudyTime(isBeacon = false) {
      const secondsToLog = accumulatedSecondsRef.current;
      if (secondsToLog < 15 || isSyncingRef.current) return;

      isSyncingRef.current = true;
      accumulatedSecondsRef.current = 0;

      const clientTz = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC';

      const payload = {
        seconds: secondsToLog,
        context: typeof window !== 'undefined' ? window.location.pathname : '',
        title: typeof document !== 'undefined' ? document.title : 'Quantum Study',
        tz: clientTz,
      };

      if (isBeacon && typeof window !== 'undefined') {
        try {
          const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
          fetch(`${API_BASE}/learner/study-heartbeat?tz=${encodeURIComponent(clientTz)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            keepalive: true,
            body: JSON.stringify(payload),
          }).catch(() => {});
        } catch (e) {}
        isSyncingRef.current = false;
        return;
      }

      try {
        const res = await apiFetch('/learner/study-heartbeat', {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        if (res?.success) {
          // Broadcast update event across the application
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('learner:activity-updated', { detail: res.data })
            );
            try {
              localStorage.setItem('learner_activity_sync', String(Date.now()));
            } catch (e) {}
          }
        }
      } catch (err) {
        // If failed, restore un-logged seconds so they aren't lost next tick
        accumulatedSecondsRef.current += secondsToLog;
        console.warn('Study heartbeat notice:', err?.message);
      } finally {
        isSyncingRef.current = false;
      }
    }

    // 1-second active ticker
    const timerInterval = setInterval(() => {
      const now = Date.now();
      const isTabVisible = typeof document !== 'undefined' && !document.hidden;
      const isRecentlyActive = now - lastInteractionRef.current <= 120000; // 2 minutes max idle

      if (isTabVisible && isRecentlyActive) {
        accumulatedSecondsRef.current += 1;

        // Automatically sync every 60 active seconds
        if (accumulatedSecondsRef.current >= 60) {
          flushStudyTime();
        }
      }
    }, 1000);

    // Handle tab visibility change (flush when tab goes hidden)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        flushStudyTime();
      } else {
        lastInteractionRef.current = Date.now();
      }
    };

    // Handle window beforeunload to ensure remaining active seconds are saved
    const handleBeforeUnload = () => {
      flushStudyTime(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(timerInterval);
      events.forEach((evt) => {
        window.removeEventListener(evt, handleUserInteraction);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Flush on unmount
      flushStudyTime();
    };
  }, [user]);

  return null;
}
