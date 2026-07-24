'use client';

import React from 'react';
import Link from 'next/link';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      textAlign: 'center',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        padding: '24px',
        borderRadius: '50%',
        marginBottom: '24px',
        border: '1px solid rgba(239, 68, 68, 0.2)'
      }}>
        <WifiOff size={64} color="#ef4444" />
      </div>
      
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '12px' }}>
        Sei Offline
      </h1>
      
      <p style={{ color: '#94a3b8', maxWidth: '400px', marginBottom: '32px', lineHeight: '1.5' }}>
        Non è stato possibile caricare questa pagina perché non hai una connessione internet attiva. Verifica la tua rete e riprova.
      </p>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button 
          onClick={() => window.location.reload()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '15px'
          }}
        >
          <RefreshCw size={18} /> Riprova
        </button>

        <Link 
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '12px 24px',
            backgroundColor: '#1e293b',
            color: '#e2e8f0',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            border: '1px solid #334155',
            fontSize: '15px'
          }}
        >
          Torna alla Home
        </Link>
      </div>
    </div>
  );
}
