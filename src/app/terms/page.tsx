import React from 'react';

export default function TermsPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem' }}>
      <h1>Handelsbetingelser (Terms of Service)</h1>
      <p>Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}</p>
      
      <section style={{ marginTop: '2rem' }}>
        <h2>1. Introduzione</h2>
        <p>Benvenuti su Kitchen App. Utilizzando il nostro servizio confermi di accettare i presenti termini e condizioni.</p>
        
        <h2>2. Utilizzo del Sistema</h2>
        <p>L'app è destinata esclusivamente per la gestione interna del ristorante. Qualsiasi utilizzo improprio porterà all'immediata sospensione dell'account.</p>
        
        <h2>3. Responsabilità dell'Utente</h2>
        <p>L'utente è tenuto a mantenere al sicuro le proprie credenziali di accesso. Ogni azione eseguita tramite l'account è sotto la totale responsabilità dell'utente associato.</p>
      </section>
      
      <div style={{ marginTop: '3rem' }}>
        <a href="/" style={{ color: 'var(--primary)', textDecoration: 'none' }}>&larr; Torna alla Home</a>
      </div>
    </div>
  );
}
