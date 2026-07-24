"use client";

import { useState } from 'react';
import { Mail, Lock, User, LogIn, UserPlus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

const LEGAL_CONTENT: Record<string, { title: string; body: React.ReactNode }> = {
  terms: {
    title: 'Handelsbetingelser (Terms of Service)',
    body: (
      <>
        <h3>1. Introduzione</h3>
        <p>Benvenuti su Kitchen App. Utilizzando il nostro servizio confermi di accettare i presenti termini e condizioni.</p>
        <h3>2. Utilizzo del Sistema</h3>
        <p>L&apos;app è destinata esclusivamente per la gestione interna del ristorante. Qualsiasi utilizzo improprio porterà all&apos;immediata sospensione dell&apos;account.</p>
        <h3>3. Responsabilità dell&apos;Utente</h3>
        <p>L&apos;utente è tenuto a mantenere al sicuro le proprie credenziali di accesso. Ogni azione eseguita tramite l&apos;account è sotto la totale responsabilità dell&apos;utente associato.</p>
      </>
    )
  },
  privacy: {
    title: 'Privatlivspolitik (Privacy Policy)',
    body: (
      <>
        <h3>1. Raccolta Dati</h3>
        <p>Raccogliamo le informazioni necessarie per fornire e migliorare il nostro servizio, nello specifico nome, cognome e indirizzo email del personale del ristorante.</p>
        <h3>2. Trattamento dei Dati</h3>
        <p>I dati forniti sono trattati in conformità con le disposizioni del GDPR europeo. La piattaforma traccia timestamp precisi della tua accettazione di queste policy e dei successivi log di ingresso ai fini di sicurezza interna (Audit Logs).</p>
        <h3>3. Diritti dell&apos;Utente</h3>
        <p>Hai il diritto di richiedere l&apos;accesso, la modifica o la cancellazione permanente dei tuoi dati personali in qualsiasi momento contattando i Super Admin del sistema.</p>
      </>
    )
  },
  cookie: {
    title: 'Cookie Policy',
    body: (
      <>
        <h3>1. Uso dei Cookie</h3>
        <p>Kitchen App utilizza cookie e tecnologie simili esclusivamente per scopi tecnici strettamente necessari al funzionamento del portale.</p>
        <h3>2. Cookie Tecnici (Essenziali)</h3>
        <p>Utilizziamo cookie tecnici per mantenere la tua sessione utente attiva e sicura, verificare il tuo token di autenticazione e salvare preferenze locali per l&apos;interfaccia.</p>
        <h3>3. Cookie di Terze Parti</h3>
        <p>Non utilizziamo cookie a scopo di profilazione pubblicitaria né concediamo l&apos;accesso a terze parti.</p>
      </>
    )
  }
};

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    password: '',
    acceptedTerms: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [legalModal, setLegalModal] = useState<string | null>(null);
  const router = useRouter();

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        if (!formData.email || !formData.password) {
          setError('Inserisci email e password validi');
          setLoading(false);
          return;
        }
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });
        const data = await res.json();
        if (!res.ok) { throw new Error(data.error || 'Errore durante il login'); }
        window.location.href = '/dashboard';
        return;
      } else {
        if (!formData.nome || !formData.cognome || formData.password.length < 6) {
          setError('Compila tutti i campi. La password deve essere di almeno 6 caratteri.');
          setLoading(false);
          return;
        }
        if (!formData.acceptedTerms) {
          setError('Devi accettare i Termini di Servizio e la Privacy Policy per registrarti.');
          setLoading(false);
          return;
        }
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (!res.ok) { throw new Error(data.error || 'Errore durante la registrazione'); }
        setError('Registrazione inviata con successo. Attendi che un Admin accetti la tua richiesta per accedere.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openLegal = (key: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setLegalModal(key);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div className="page-center" style={{ flex: 1, minHeight: 'auto' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="text-gradient" style={{ fontSize: '2.8rem', margin: '0 0 0.5rem 0' }}>Kitchen.</h1>
          <p>Il centro di controllo della tua cucina.</p>
        </div>

        {error && (
          <div style={{ background: error.includes('successo') ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 59, 48, 0.1)', border: `1px solid ${error.includes('successo') ? 'var(--success)' : 'var(--danger)'}`, padding: '0.8rem', borderRadius: 'var(--radius-md)', color: error.includes('successo') ? 'var(--success)' : 'var(--danger)', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ display: 'flex', gap: '1rem' }} className="animate-fade-in animate-delay-1">
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Nome</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} className="input-icon" style={{ top: '1.1rem' }} />
                  <input type="text" name="nome" value={formData.nome} onChange={handleChange} className="input-field" placeholder="Mario" />
                </div>
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Cognome</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} className="input-icon" style={{ top: '1.1rem' }} />
                  <input type="text" name="cognome" value={formData.cognome} onChange={handleChange} className="input-field" placeholder="Rossi" />
                </div>
              </div>
            </div>
          )}

          <div className="input-group animate-fade-in animate-delay-2">
            <label className="input-label">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} className="input-icon" style={{ top: '1.1rem' }} />
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field" placeholder="cuoco@ristorante.it" required />
            </div>
          </div>

          <div className="input-group animate-fade-in animate-delay-3">
            <label className="input-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} className="input-icon" style={{ top: '1.1rem' }} />
              <input type="password" name="password" value={formData.password} onChange={handleChange} className="input-field" placeholder="••••••••" required minLength={6} />
            </div>
          </div>

          {!isLogin && (
            <div className="input-group animate-fade-in animate-delay-3" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', marginTop: '1.5rem', background: 'rgba(0,0,0,0.1)', padding: '1rem', borderRadius: '8px' }}>
              <input type="checkbox" name="acceptedTerms" id="acceptedTerms" checked={formData.acceptedTerms} onChange={handleChange} style={{ marginTop: '0.2rem', width: '18px', height: '18px', cursor: 'pointer' }} />
              <label htmlFor="acceptedTerms" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer', lineHeight: 1.4 }}>
                Ho letto e accetto i <a href="#" onClick={openLegal('terms')} style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Termini di Servizio</a> e la <a href="#" onClick={openLegal('privacy')} style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Privacy Policy</a>.
              </label>
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1.5rem' }}>
            {loading ? 'Attendere...' : isLogin ? <><LogIn size={20} /> Accedi</> : <><UserPlus size={20} /> Registrati</>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.95rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>
            {isLogin ? 'Non hai un account?' : 'Hai già un account?'}
          </span>
          {' '}
          <button type="button" onClick={handleToggle} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.95rem' }}>
            {isLogin ? 'Registrati' : 'Accedi'}
          </button>
        </div>
      </div>
      </div>

      <footer style={{ padding: '1.5rem 1rem', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} Kitchen App. Tutti i diritti riservati.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.85rem' }}>
          <a href="#" onClick={openLegal('terms')} style={{ color: 'var(--primary)', textDecoration: 'underline', fontWeight: 500 }}>Handelsbetingelser</a>
          <span style={{ color: 'var(--border)' }}>|</span>
          <a href="#" onClick={openLegal('privacy')} style={{ color: 'var(--primary)', textDecoration: 'underline', fontWeight: 500 }}>Privatlivspolitik</a>
          <span style={{ color: 'var(--border)' }}>|</span>
          <a href="#" onClick={openLegal('cookie')} style={{ color: 'var(--primary)', textDecoration: 'underline', fontWeight: 500 }}>Cookie Policy</a>
        </div>
      </footer>

      {/* Modale Documenti Legali */}
      {legalModal && LEGAL_CONTENT[legalModal] && (
        <div
          onClick={() => setLegalModal(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-panel"
            style={{
              width: '100%', maxWidth: '650px', maxHeight: '80vh',
              padding: '2rem', overflowY: 'auto', position: 'relative',
            }}
          >
            <button
              onClick={() => setLegalModal(null)}
              style={{
                position: 'absolute', top: '1rem', right: '1rem',
                background: 'none', border: 'none', color: 'var(--text-muted)',
                cursor: 'pointer', padding: '0.3rem',
              }}
            >
              <X size={22} />
            </button>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', paddingRight: '2rem' }}>
              {LEGAL_CONTENT[legalModal].title}
            </h2>
            <div style={{ lineHeight: 1.7 }}>
              {LEGAL_CONTENT[legalModal].body}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
