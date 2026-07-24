import React from 'react';

export default function CookiePage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem' }}>
      <h1>Cookie Policy</h1>
      <p>Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}</p>
      
      <section style={{ marginTop: '2rem' }}>
        <h2>1. Uso dei Cookie</h2>
        <p>Kitchen App utilizza cookie e tecnologie simili esclusivamente per scopi tecnici strettamente necessari al funzionamento del portale.</p>
        
        <h2>2. Cookie Tecnici (Essenziali)</h2>
        <p>Utilizziamo cookie tecnici per mantenere la tua sessione utente attiva e sicura, verificare il tuo token di autenticazione e salvare preferenze locali per l'interfaccia (come l'ordinamento delle griglie o lo stato del menu a comparsa della sidebar).</p>
        
        <h2>3. Cookie di Terze Parti</h2>
        <p>Non utilizziamo cookie a scopo di profilazione pubblicitaria né concediamo l'accesso a terze parti.</p>
      </section>
      
      <div style={{ marginTop: '3rem' }}>
        <a href="/" style={{ color: 'var(--primary)', textDecoration: 'none' }}>&larr; Torna alla Home</a>
      </div>
    </div>
  );
}
