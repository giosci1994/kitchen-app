"use client";

import { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Plus, Trash2, Clock, AlignLeft, Edit } from 'lucide-react';

// Helper per convertire ISO date (UTC) a formato locale per l'input datetime-local "YYYY-MM-DDThh:mm"
const toLocalDatetimeLocal = (isoString?: string) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function EventiPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState('USER');
  
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    description: '',
    type: 'EVENT'
  });

  const fetchEvents = () => {
    setLoading(true);
    fetch('/api/events').then(r => r.json()).then(data => {
      const sorted = (Array.isArray(data) ? data : []).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setEvents(sorted);
      setLoading(false);
    });
  };

  useEffect(() => { 
    fetch('/api/auth/me').then(r => r.json()).then(d => { if (d.ruolo) setUserRole(d.ruolo); });
    fetchEvents(); 
  }, []);

  const handleOpenModal = (ev?: any) => {
    if (ev) {
      setEditId(ev.id);
      setFormData({
        title: ev.title,
        date: toLocalDatetimeLocal(ev.date),
        description: ev.description || '',
        type: ev.type
      });
    } else {
      setEditId(null);
      setFormData({ title: '', date: '', description: '', type: 'EVENT' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date) return alert("Completa i campi obbligatori");
    
    // Per risolvere il timezone convertiamo la data locale selezionata in ISO formato per il backend
    const payload = {
      ...formData,
      date: new Date(formData.date).toISOString()
    };

    const url = editId ? `/api/events/${editId}` : '/api/events';
    const method = editId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ title: '', date: '', description: '', type: 'EVENT' });
        fetchEvents();
      } else {
        const d = await res.json();
        alert(d.error);
      }
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo evento o menu?")) return;
    try {
      await fetch(`/api/events/${id}`, { method: 'DELETE' });
      fetchEvents();
    } catch {}
  };

  return (
    <div className="animate-fade-in relative" style={{ height: '100%', paddingBottom: '3rem' }}>
      <div className="responsive-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>Eventi</h1>
          <p>Organizza il calendario della cucina, i menu degustazione e l'impostazione de La Carta.</p>
        </div>
        {userRole !== 'USER' && (
          <button onClick={() => handleOpenModal()} className="btn btn-primary" style={{ width: 'auto' }}>
            <Plus size={20} /> Nuova Data
          </button>
        )}
      </div>

      <div className="responsive-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
        {loading ? (
          <div>Caricamento calendario...</div>
        ) : events.length === 0 ? (
          <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CalendarIcon size={56} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>Nessun evento programmato</h3>
            <p>Il calendario è vuoto. Aggiungi il primo menu o evento.</p>
          </div>
        ) : (
          events.map(ev => {
            const isMenu = ev.type === 'MENU_DEGUSTAZIONE';
            const isCarta = ev.type === 'CARTA';
            const colorParams = isMenu ? {bg: 'rgba(52,199,89,0.1)', color: 'var(--success)'} : isCarta ? {bg: 'rgba(255,179,64,0.1)', color: '#ffb340'} : {bg: 'rgba(255,59,48,0.1)', color: 'var(--primary)'};
            
            return (
            <div key={ev.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'transform 0.2s', cursor: 'default' }}
                 onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                 onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ padding: '0.3rem 0.6rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600, background: colorParams.bg, color: colorParams.color }}>
                  {ev.type.replace('_', ' ')}
                </span>
                {userRole !== 'USER' && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleOpenModal(ev)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-main)', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px', display: 'flex', transition: 'var(--transition)' }} title="Modifica Evento">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(ev.id)} style={{ background: 'rgba(255,59,48,0.1)', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px', display: 'flex', transition: 'var(--transition)' }} title="Elimina Evento">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
              <div>
                <h3 style={{ margin: '0.2rem 0', fontSize: '1.3rem' }}>{ev.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  <Clock size={14} color="var(--primary)" /> 
                  {new Date(ev.date).toLocaleString('it-IT', { dateStyle: 'long', timeStyle: 'short' })}
                </div>
              </div>
              {ev.description && (
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.8rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginTop: 'auto' }}>
                  <AlignLeft size={16} style={{ opacity: 0.5, flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ margin: 0, lineHeight: 1.4 }}>{ev.description}</p>
                </div>
              )}
            </div>
          );
        })
      )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }} className="animate-fade-in">
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem' }}>
            <h2 style={{ marginBottom: '1.5rem', marginTop: 0 }}>{editId ? 'Modifica Evento' : 'Pianifica Giornata'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label" style={{ marginBottom: '0.4rem', display: 'block' }}>Tipologia</label>
                <select className="input-field" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} style={{ paddingLeft: '1rem', cursor: 'pointer' }}>
                  <option value="EVENT">Evento Speciale (Catering, Matrimonio)</option>
                  <option value="MENU_DEGUSTAZIONE">Menu Degustazione Fissa</option>
                  <option value="CARTA">Impostazione La Carta</option>
                </select>
              </div>

              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label" style={{ marginBottom: '0.4rem', display: 'block' }}>Titolo / Nome Evento *</label>
                <input type="text" className="input-field" style={{ paddingLeft: '1rem' }} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required placeholder="Es. Menu Autunno" />
              </div>

              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label" style={{ marginBottom: '0.4rem', display: 'block' }}>Data e Ora prevista *</label>
                <input type="datetime-local" className="input-field" style={{ paddingLeft: '1rem' }} value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
              </div>

              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label" style={{ marginBottom: '0.4rem', display: 'block' }}>Note e Dettagli</label>
                <textarea className="input-field" style={{ paddingLeft: '1rem', minHeight: '80px', resize: 'vertical' }} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Es. 40 persone, intolleranza lattosio tavolo 3" />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Annulla</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editId ? 'Salva Modifiche' : 'Salva Data'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
