import React, { useState, useEffect } from 'react';
import axios from 'axios';

// ── Status Badge ────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const styles = {
    idle: { background: '#1e293b', color: '#64748b', label: '⏳ Idle' },
    loading: { background: '#1e3a5f', color: '#60a5fa', label: '🔄 Connecting…' },
    connected: { background: '#052e16', color: '#34d399', label: '✅ Connected' },
    error: { background: '#450a0a', color: '#fca5a5', label: '❌ Error' },
  };
  const s = styles[status] ?? styles.idle;

  return (
    <span
      style={{
        background: s.background,
        color: s.color,
        borderRadius: '999px',
        padding: '4px 14px',
        fontSize: '0.78rem',
        fontWeight: 600,
        border: `1px solid ${s.color}33`,
      }}
    >
      {s.label}
    </span>
  );
}

// ── ApiTest Component ────────────────────────────────────────────────────────
export default function ApiTest() {
  const [apiStatus, setApiStatus] = useState('idle');
  const [apiData, setApiData] = useState(null);
  const [error, setError] = useState(null);

  const retry = () => {
    setApiStatus('loading');
    setApiData(null);
    setError(null);

    axios
      .get('http://localhost:8000/api/ping')
      .then((res) => {
        setApiData(res.data);
        setApiStatus('connected');
      })
      .catch((err) => {
        setError(err.message);
        setApiStatus('error');
      });
  };

  // Auto-connect on mount
  useEffect(() => {
    retry();
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', sans-serif",
        color: '#e2e8f0',
      }}
    >
      <div
        style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '24px',
          padding: '48px',
          maxWidth: '540px',
          width: '90%',
          textAlign: 'center',
          boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
        }}
      >
        {/* Logo */}
        <div style={{ fontSize: '3.5rem', marginBottom: '8px' }}>📁</div>

        {/* Title */}
        <h1
          style={{
            fontSize: '1.6rem',
            fontWeight: 700,
            margin: '0 0 6px',
            background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          PV Archiving System
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: '32px', fontSize: '0.95rem' }}>
          Phase 0 — Connection Test
        </p>

        {/* Status Card */}
        <div
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <span style={{ fontWeight: 600, color: '#cbd5e1' }}>Laravel API</span>
            <StatusBadge status={apiStatus} />
          </div>

          <div style={{ textAlign: 'left', fontSize: '0.85rem', color: '#64748b' }}>
            <div>
              🔗 <code style={{ color: '#93c5fd' }}>GET /api/ping</code>
            </div>

            {apiStatus === 'connected' && apiData && (
              <pre
                style={{
                  background: '#0f172a',
                  border: '1px solid #1e3a5f',
                  borderRadius: '10px',
                  padding: '14px',
                  marginTop: '14px',
                  color: '#34d399',
                  fontSize: '0.82rem',
                  textAlign: 'left',
                  overflow: 'auto',
                }}
              >
                {JSON.stringify(apiData, null, 2)}
              </pre>
            )}

            {apiStatus === 'error' && (
              <div
                style={{
                  background: '#450a0a',
                  border: '1px solid #7f1d1d',
                  borderRadius: '10px',
                  padding: '14px',
                  marginTop: '14px',
                  color: '#fca5a5',
                }}
              >
                ⚠️ {error}
                <br />
                <small>
                  Make sure Laravel is running: <code>php artisan serve</code>
                </small>
              </div>
            )}
          </div>
        </div>

        {/* Stack Info */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          {[
            { icon: '⚛️', label: 'React 19', sub: 'Vite 8' },
            { icon: '🐘', label: 'Laravel 12', sub: 'Sanctum' },
            { icon: '🗄️', label: 'MySQL 8', sub: 'pv_archiving' },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px',
                padding: '14px 8px',
              }}
            >
              <div style={{ fontSize: '1.5rem' }}>{item.icon}</div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  color: '#e2e8f0',
                  marginTop: '4px',
                }}
              >
                {item.label}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{item.sub}</div>
            </div>
          ))}
        </div>

        {/* Retry Button */}
        <button
          id="retry-connection-btn"
          onClick={retry}
          style={{
            background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 32px',
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'opacity 0.2s',
          }}
          onMouseOver={(e) => (e.target.style.opacity = '0.85')}
          onMouseOut={(e) => (e.target.style.opacity = '1')}
        >
          🔄 Retry Connection
        </button>
      </div>
    </div>
  );
}
