import { useEffect, useRef, useCallback } from 'react';

// ── Non-blocking session-expired toast ────────────────────────────
// Injects a temporary floating notification into the DOM without
// using alert() (which blocks the JS thread and freezes the UI).
function showSessionExpiredToast() {
  if (document.getElementById('session-toast')) return; // avoid duplicates

  const toast = document.createElement('div');
  toast.id = 'session-toast';
  Object.assign(toast.style, {
    position:        'fixed',
    top:             '24px',
    left:            '50%',
    transform:       'translateX(-50%)',
    zIndex:          '99999',
    background:      '#1e293b',
    color:           '#f8fafc',
    padding:         '14px 24px',
    borderRadius:    '12px',
    fontSize:        '13px',
    fontWeight:      '700',
    letterSpacing:   '0.05em',
    boxShadow:       '0 8px 32px rgba(0,0,0,0.25)',
    display:         'flex',
    alignItems:      'center',
    gap:             '10px',
    pointerEvents:   'none',
    opacity:         '0',
    transition:      'opacity 0.3s ease',
    whiteSpace:      'nowrap',
  });

  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
         stroke="#facc15" stroke-width="2.5" stroke-linecap="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <circle cx="12" cy="16" r="0.5" fill="#facc15"/>
    </svg>
    Session expirée — déconnexion automatique…
  `;

  document.body.appendChild(toast);

  // Fade in
  requestAnimationFrame(() => { toast.style.opacity = '1'; });

  // Fade out and remove after 3 s
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// ── Session timeout hook ──────────────────────────────────────────
export function useSessionTimeout(user, onLogout, timeoutMinutes = 15) {
  const timeoutRef       = useRef(null);
  const lastActivityRef  = useRef(Date.now());

  // Reset (or start) the inactivity countdown
  const resetTimeout = useCallback(() => {
    if (!user) return;

    lastActivityRef.current = Date.now();

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const timeoutMs = timeoutMinutes * 60 * 1000;
    timeoutRef.current = setTimeout(() => {
      // Show non-blocking toast, then logout after it is visible
      showSessionExpiredToast();
      setTimeout(onLogout, 3200);
    }, timeoutMs);
  }, [user, onLogout, timeoutMinutes]);

  // Throttle wrapper — reset at most once every 30 s to avoid perf issues
  const handleActivity = useCallback(() => {
    resetTimeout();
  }, [resetTimeout]);

  useEffect(() => {
    if (!user) {
      // Logged out — clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    events.forEach((event) => document.addEventListener(event, handleActivity, true));
    resetTimeout(); // start the initial countdown

    return () => {
      events.forEach((event) => document.removeEventListener(event, handleActivity, true));
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [user, handleActivity, resetTimeout]);

  return {
    lastActivity: lastActivityRef.current,
    isActive:     !!timeoutRef.current,
  };
}