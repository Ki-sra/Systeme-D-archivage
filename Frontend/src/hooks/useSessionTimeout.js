import { useEffect, useRef, useCallback } from 'react';

// ── Session timeout hook ───────────────────────────────────────────
export function useSessionTimeout(user, onLogout, timeoutMinutes = 15) {
  const timeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  // ── Reset timeout on user activity ───────────────────────────────
  const resetTimeout = useCallback(() => {
    if (!user) return; // Only reset if user is logged in

    lastActivityRef.current = Date.now();

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout (15 minutes = 15 * 60 * 1000 ms)
    const timeoutMs = timeoutMinutes * 60 * 1000;
    timeoutRef.current = setTimeout(() => {
      // Session expired - logout user
      console.log('Session expired due to inactivity');

      // Show message (you can replace this with a toast notification)
      alert('Session expirée en raison d\'inactivité');

      // Logout
      onLogout();
    }, timeoutMs);
  }, [user, onLogout, timeoutMinutes]);

  // ── Activity event handler ───────────────────────────────────────
  const handleActivity = useCallback(() => {
    resetTimeout();
  }, [resetTimeout]);

  // ── Setup event listeners ────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      // User not logged in - clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    // User is logged in - setup activity listeners and start timeout
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Start initial timeout
    resetTimeout();

    // Cleanup function
    return () => {
      // Remove event listeners
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });

      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [user, handleActivity, resetTimeout]);

  // ── Return current timeout status (optional for debugging) ──────
  return {
    lastActivity: lastActivityRef.current,
    isActive: !!timeoutRef.current
  };
}