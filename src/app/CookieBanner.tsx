"use client";

import { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Piccolo ritardo per non apparire bruscamente
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      width: '94%',
      maxWidth: '480px',
      animation: 'cookieSlideUp 0.4s ease-out',
    }}>
      <style>{`
        @keyframes cookieSlideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(30px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
      <div style={{
        background: 'rgba(26, 29, 36, 0.95)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <Cookie size={28} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
              🍪 Questo sito utilizza cookie
            </p>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Utilizziamo solo cookie tecnici essenziali per il funzionamento del sistema. Nessun cookie di profilazione o pubblicitario.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.2rem' }}>
          <button
            onClick={handleAccept}
            style={{
              flex: 1,
              padding: '0.65rem 1rem',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, var(--primary), #ff3036)',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'transform 0.15s',
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            Accetta
          </button>
          <button
            onClick={handleDecline}
            style={{
              flex: 1,
              padding: '0.65rem 1rem',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'transparent',
              color: 'var(--text-muted)',
              fontWeight: 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'transform 0.15s',
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            Rifiuta
          </button>
        </div>
      </div>
    </div>
  );
}
