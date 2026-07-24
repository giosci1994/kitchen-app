import React from 'react';

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem' }}>
      <h1>Privatlivspolitik (Privacy Policy)</h1>
      <p>Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}</p>
      
      <section style={{ marginTop: '2rem' }}>
        <h2>1. Raccolta Dati</h2>
        <p>Raccogliamo le informazioni necessarie per fornire e migliorare il nostro servizio, nello specifico nome, cognome e indirizzo email del personale del ristorante.</p>
        
        <h2>2. Trattamento dei Dati</h2>
        <p>I dati forniti sono trattati in conformità con le asportazioni del GDPR europeo. La piattaforma traccia timestamp precisi della tua accettazione di queste policy e dei successivi log di ingresso ai fini di sicurezza interna (Audit Logs).</p>
        
        <h2>3. Diritti dell'Utente</h2>
        <p>Hai il diritto di richiedere l'accesso, la modifica o la cancellazione permanente dei tuoi dati personali in qualsiasi momento contattando i Super Admin del sistema (Owner del circolo).</p>
      </section>
      
      <div style={{ marginTop: '3rem' }}>
        <a href="/" style={{ color: 'var(--primary)', textDecoration: 'none' }}>&larr; Torna alla Home</a>
      </div>
    </div>
  );
}
