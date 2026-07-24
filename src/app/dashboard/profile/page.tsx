"use client";

import { useState, useEffect } from 'react';
import { User, Phone, MapPin, Lock, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    telefono: '',
    indirizzo: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setUser(data);
          setFormData({
            nome: data.nome || '',
            cognome: data.cognome || '',
            telefono: data.telefono || '',
            indirizzo: data.indirizzo || ''
          });
        }
        setLoading(false);
      });
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setAlert(null);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Errore durante il salvataggio');
      
      setUser(data);
      setAlert({ type: 'success', message: 'Profilo aggiornato con successo.' });
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setSaveLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.password !== passwordData.confirmPassword) {
      setAlert({ type: 'error', message: 'Le password non coincidono.' });
      return;
    }
    setSaveLoading(true);
    setAlert(null);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordData.password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Errore aggiornamento password');
      
      setPasswordData({ password: '', confirmPassword: '' });
      setAlert({ type: 'success', message: 'Password aggiornata con successo.' });
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) return <div className="p-8">Caricamento profilo...</div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="text-gradient">Il tuo Profilo</h1>
        <p>Gestisci le tue informazioni personali e di accesso.</p>
      </header>

      {alert && (
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '0.8rem',
          padding: '1rem', marginBottom: '2rem', borderRadius: 'var(--radius-md)',
          background: alert.type === 'success' ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 59, 48, 0.1)',
          color: alert.type === 'success' ? 'var(--success)' : 'var(--danger)',
          border: `1px solid ${alert.type === 'success' ? 'var(--success)' : 'var(--danger)'}`
        }}>
          {alert.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{alert.message}</span>
        </div>
      )}

      <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>Dati Anagrafici</h2>
          
          <form onSubmit={handleProfileSubmit}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Nome</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} className="input-icon" style={{ top: '1.1rem' }} />
                  <input type="text" className="input-field" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} required />
                </div>
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Cognome</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} className="input-icon" style={{ top: '1.1rem' }} />
                  <input type="text" className="input-field" value={formData.cognome} onChange={e => setFormData({...formData, cognome: e.target.value})} required />
                </div>
              </div>
            </div>

            <div className="input-group mt-4">
              <label className="input-label">Telefono</label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} className="input-icon" style={{ top: '1.1rem' }} />
                <input type="tel" className="input-field" placeholder="+39 333 1234567" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
              </div>
            </div>

            <div className="input-group mt-4">
              <label className="input-label">Indirizzo Completo</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} className="input-icon" style={{ top: '1.1rem' }} />
                <input type="text" className="input-field" placeholder="Via Roma 1, Milano" value={formData.indirizzo} onChange={e => setFormData({...formData, indirizzo: e.target.value})} />
              </div>
            </div>

            <div className="input-group mt-4">
              <label className="input-label">Email (non modificabile)</label>
              <div style={{ position: 'relative' }}>
                <input type="email" className="input-field" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
              </div>
            </div>

            <button type="submit" disabled={saveLoading} className="btn btn-primary" style={{ marginTop: '1.5rem', width: 'auto' }}>
              <Save size={18} /> Salva Modifiche
            </button>
          </form>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', height: 'fit-content' }}>
          <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>Sicurezza</h2>
          
          <form onSubmit={handlePasswordSubmit}>
            <div className="input-group">
              <label className="input-label">Nuova Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} className="input-icon" style={{ top: '1.1rem' }} />
                <input type="password" minLength={6} className="input-field" placeholder="••••••••" value={passwordData.password} onChange={e => setPasswordData({...passwordData, password: e.target.value})} required />
              </div>
            </div>

            <div className="input-group mt-4">
              <label className="input-label">Conferma Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} className="input-icon" style={{ top: '1.1rem' }} />
                <input type="password" minLength={6} className="input-field" placeholder="••••••••" value={passwordData.confirmPassword} onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} required />
              </div>
            </div>

            <button type="submit" disabled={saveLoading} className="btn btn-secondary" style={{ marginTop: '1.5rem', width: '100%' }}>
              <Lock size={18} /> Aggiorna Password
            </button>
          </form>
        </div>
      </div>

      <div style={{ marginTop: '3rem', padding: '2rem 1rem 1rem', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} Kitchen App. Tutti i diritti riservati.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.8rem' }}>
          <a href="/terms" target="_blank" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Handelsbetingelser</a>
          <span style={{ color: 'var(--border)' }}>|</span>
          <a href="/privacy" target="_blank" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Privatlivspolitik</a>
          <span style={{ color: 'var(--border)' }}>|</span>
          <a href="/cookie" target="_blank" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Cookie Policy</a>
        </div>
      </div>
    </div>
  );
}
