"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ShoppingCart, ClipboardList, ChefHat, Package, Clock, Send, CheckCircle, Repeat, UserCircle, Calendar, ChevronDown, ChevronUp, Pin, Megaphone, Plus, Trash2, Edit, X, AlertTriangle } from 'lucide-react';
import './rich-text-editor.css';

const RichTextEditor = dynamic(() => import('./RichTextEditor'), { ssr: false });

const DAYS = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
const COLORS = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe', '#fd79a8', '#00b894', '#e17055', '#0984e3'];
const getUserColor = (id: string) => COLORS[id.charCodeAt(0) % COLORS.length];

export default function DashboardHome() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [prepLists, setPrepLists] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [stats, setStats] = useState({ recipes: 0, ingredients: 0 });
  const [now, setNow] = useState(new Date());

  // Stati per collassare/espandere
  const [showEvents, setShowEvents] = useState(true);
  const [showPreps, setShowPreps] = useState(true);

  // Bacheca avvisi
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  const [annForm, setAnnForm] = useState({ title: '', content: '', priority: 'NORMAL', isPinned: false });
  const [annLoading, setAnnLoading] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setUser(d));
    fetch('/api/orders').then(r => r.json()).then(d => setOrders(Array.isArray(d) ? d : []));
    fetch('/api/preplist').then(r => r.json()).then(d => setPrepLists(Array.isArray(d) ? d : []));
    fetch('/api/events').then(r => r.json()).then(d => setEvents(Array.isArray(d) ? d : []));
    fetch('/api/recipes').then(r => r.json()).then(d => { if (Array.isArray(d)) setStats(s => ({ ...s, recipes: d.length })); });
    fetch('/api/warehouse').then(r => r.json()).then(d => { if (Array.isArray(d)) setStats(s => ({ ...s, ingredients: d.length })); });
    fetch('/api/announcements').then(r => r.json()).then(d => { if (Array.isArray(d)) setAnnouncements(d); });
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayDay = now.getDay();
  const todayStr = now.toISOString().split('T')[0];
  const currentUserId = user?.id;

  const isSameDayLocal = (dateString: string) => {
    const d = new Date(dateString);
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };

  const todayPrepLists = prepLists.filter(pl => {
    if (pl.isRecurring && pl.recurringDay === todayDay) return true;
    if (!pl.isRecurring && pl.date) return new Date(pl.date).toISOString().split('T')[0] === todayStr;
    return false;
  });

  const todayEvents = events.filter(e => e.date && isSameDayLocal(e.date));

  const pendingOrders = orders.filter(o => o.status === 'INVIATO');
  const recentOrders = orders.slice(0, 5);
  const statusColor = (s: string) => s === 'BOZZA' ? 'var(--text-muted)' : s === 'INVIATO' ? '#ff9f0a' : 'var(--success)';
  const statusLabel = (s: string) => s === 'BOZZA' ? 'Bozza' : s === 'INVIATO' ? 'Inviato' : 'Completato';

  // Conta i task assegnati all'utente
  const myTasksCount = todayPrepLists.reduce((acc, pl) => {
    const tasks = pl.tasks || [];
    tasks.forEach((t: any) => {
      if (t.assignedToId === currentUserId && !t.isCompleted) acc++;
      t.subTasks?.forEach((st: any) => { if (st.assignedToId === currentUserId && !st.isCompleted) acc++; });
    });
    return acc;
  }, 0);

  const isAdmin = user?.ruolo === 'ADMIN' || user?.ruolo === 'SUPER_ADMIN';

  const priorityStyles: Record<string, { border: string; bg: string; badge: string; label: string }> = {
    URGENT: { border: '#ef4444', bg: 'rgba(239,68,68,0.08)', badge: '#ef4444', label: 'URGENTE' },
    NORMAL: { border: '#f58220', bg: 'rgba(245,130,32,0.06)', badge: '#f58220', label: 'NORMALE' },
    LOW: { border: '#94a3b8', bg: 'rgba(148,163,184,0.06)', badge: '#94a3b8', label: 'BASSO' },
  };

  const handleSaveAnnouncement = async () => {
    if (!annForm.title.trim() || !annForm.content.trim()) return;
    setAnnLoading(true);
    try {
      if (editingAnnouncement) {
        const res = await fetch(`/api/announcements/${editingAnnouncement.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(annForm)
        });
        if (res.ok) {
          const updated = await res.json();
          setAnnouncements(prev => prev.map(a => a.id === updated.id ? updated : a));
        }
      } else {
        const res = await fetch('/api/announcements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(annForm)
        });
        if (res.ok) {
          const created = await res.json();
          setAnnouncements(prev => [created, ...prev]);
        }
      }
      setShowAnnouncementForm(false);
      setEditingAnnouncement(null);
      setAnnForm({ title: '', content: '', priority: 'NORMAL', isPinned: false });
    } finally { setAnnLoading(false); }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Eliminare questo avviso?')) return;
    const res = await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
    if (res.ok) setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  const handleEditAnnouncement = (ann: any) => {
    setEditingAnnouncement(ann);
    setAnnForm({ title: ann.title, content: ann.content, priority: ann.priority, isPinned: ann.isPinned });
    setShowAnnouncementForm(true);
  };

  return (
    <div className="animate-fade-in">
      <div className="dashboard-header responsive-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>Benvenuto, {user?.nome || '...'}!</h1>
          <p>Ecco il riepilogo della tua cucina.</p>
        </div>
        <div className="dashboard-clock glass-panel" style={{ padding: '1rem 1.5rem', textAlign: 'center', minWidth: '200px' }}>
          <div style={{ fontSize: '2.4rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
            {now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {now.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Widget - Nascosti su mobile tramite la classe hide-on-mobile definita in globals.css */}
      <div className="hide-on-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <Link href="/dashboard/ricette" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="glass-panel" style={{ padding: '1.1rem', cursor: 'pointer', transition: 'var(--transition)' }}><div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}><ChefHat size={16} color="var(--primary)" /><h3 style={{ margin: 0, fontSize: '0.9rem' }}>Ricette</h3></div><h2 style={{ fontSize: '2.3rem', color: 'var(--primary)', margin: '0.1rem 0' }}>{stats.recipes}</h2></div>
        </Link>
        <Link href="/dashboard/magazzino" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="glass-panel" style={{ padding: '1.1rem', cursor: 'pointer', transition: 'var(--transition)' }}><div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}><Package size={16} color="var(--secondary)" /><h3 style={{ margin: 0, fontSize: '0.9rem' }}>Magazzino</h3></div><h2 style={{ fontSize: '2.3rem', color: 'var(--secondary)', margin: '0.1rem 0' }}>{stats.ingredients}</h2></div>
        </Link>
        <Link href="/dashboard/magazzino/storico-ordini" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="glass-panel" style={{ padding: '1.1rem', cursor: 'pointer', transition: 'var(--transition)' }}><div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}><ShoppingCart size={16} color="#ff9f0a" /><h3 style={{ margin: 0, fontSize: '0.9rem' }}>Ordini</h3></div><h2 style={{ fontSize: '2.3rem', color: '#ff9f0a', margin: '0.1rem 0' }}>{pendingOrders.length}</h2></div>
        </Link>
        <Link href="/dashboard/preplist" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="glass-panel" style={{ padding: '1.1rem', cursor: 'pointer', transition: 'var(--transition)' }}><div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}><ClipboardList size={16} color="var(--success)" /><h3 style={{ margin: 0, fontSize: '0.9rem' }}>Prep Oggi</h3></div><h2 style={{ fontSize: '2.3rem', color: 'var(--success)', margin: '0.1rem 0' }}>{todayPrepLists.length}</h2></div>
        </Link>
        {myTasksCount > 0 && (
          <Link href="/dashboard/preplist" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="glass-panel" style={{ padding: '1.1rem', cursor: 'pointer', border: '1px solid rgba(108,92,231,0.3)', transition: 'var(--transition)' }}><div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}><UserCircle size={16} color="#6c5ce7" /><h3 style={{ margin: 0, fontSize: '0.9rem' }}>I Miei Task</h3></div><h2 style={{ fontSize: '2.3rem', color: '#6c5ce7', margin: '0.1rem 0' }}>{myTasksCount}</h2></div>
          </Link>
        )}
      </div>

      {/* Bacheca Avvisi */}
      {(announcements.length > 0 || isAdmin) && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
              <Megaphone size={20} color="#f58220" /> Bacheca Avvisi
            </h3>
            {isAdmin && (
              <button
                onClick={() => { setShowAnnouncementForm(true); setEditingAnnouncement(null); setAnnForm({ title: '', content: '', priority: 'NORMAL', isPinned: false }); }}
                style={{
                  background: 'linear-gradient(135deg, var(--primary), #ff3036)',
                  border: 'none', color: 'white', padding: '0.4rem 0.8rem',
                  borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '0.3rem'
                }}
              >
                <Plus size={14} /> Nuovo Avviso
              </button>
            )}
          </div>

          {/* Modal form avviso */}
          {showAnnouncementForm && (
            <div style={{
              background: 'rgba(0,0,0,0.3)', padding: '1.2rem', borderRadius: '12px',
              marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <strong style={{ fontSize: '0.95rem' }}>{editingAnnouncement ? 'Modifica Avviso' : 'Nuovo Avviso'}</strong>
                <button onClick={() => { setShowAnnouncementForm(false); setEditingAnnouncement(null); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
              </div>
              <input
                value={annForm.title}
                onChange={e => setAnnForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Titolo avviso..."
                style={{
                  width: '100%', padding: '0.7rem', marginBottom: '0.5rem',
                  background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)',
                  borderRadius: '8px', color: 'var(--text-main)', fontSize: '0.9rem',
                  fontFamily: 'Outfit, sans-serif', outline: 'none'
                }}
              />
              <RichTextEditor
                content={annForm.content}
                onChange={(html: string) => setAnnForm(f => ({ ...f, content: html }))}
                placeholder="Contenuto dell'avviso..."
              />
              <div className="responsive-form-row" style={{ alignItems: 'center' }}>
                <select
                  value={annForm.priority}
                  onChange={e => setAnnForm(f => ({ ...f, priority: e.target.value }))}
                  style={{
                    padding: '0.5rem', background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border)', borderRadius: '8px',
                    color: 'var(--text-main)', fontSize: '0.85rem', fontFamily: 'Outfit, sans-serif'
                  }}
                >
                  <option value="LOW">Bassa Priorità</option>
                  <option value="NORMAL">Priorità Normale</option>
                  <option value="URGENT">Urgente</option>
                </select>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={annForm.isPinned}
                    onChange={e => setAnnForm(f => ({ ...f, isPinned: e.target.checked }))}
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <Pin size={14} /> Fissa in Cima
                </label>
                <button
                  onClick={handleSaveAnnouncement}
                  disabled={annLoading || !annForm.title.trim() || !annForm.content.trim()}
                  style={{
                    marginLeft: 'auto', background: 'linear-gradient(135deg, var(--primary), #ff3036)',
                    border: 'none', color: 'white', padding: '0.5rem 1.2rem',
                    borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                    opacity: annLoading ? 0.5 : 1
                  }}
                >
                  {annLoading ? 'Salvataggio...' : editingAnnouncement ? 'Aggiorna' : 'Pubblica'}
                </button>
              </div>
            </div>
          )}

          {/* Lista avvisi */}
          {announcements.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem 0' }}>Nessun avviso pubblicato.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {announcements.map(ann => {
                const ps = priorityStyles[ann.priority] || priorityStyles.NORMAL;
                return (
                  <div key={ann.id} style={{
                    background: ps.bg, borderLeft: `4px solid ${ps.border}`,
                    padding: '1rem 1.2rem', borderRadius: '8px',
                    transition: 'all 0.2s'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                          {ann.isPinned && <Pin size={13} color="#f58220" />}
                          <span style={{ fontWeight: 700, fontSize: '1rem' }}>{ann.title}</span>
                          <span style={{
                            background: `${ps.badge}20`, color: ps.badge,
                            padding: '0.1rem 0.4rem', borderRadius: '4px',
                            fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.5px'
                          }}>
                            {ps.label}
                          </span>
                        </div>
                        <div className="announcement-content" style={{ margin: '0.3rem 0 0.5rem' }} dangerouslySetInnerHTML={{ __html: ann.content }} />
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <span>{ann.author?.nome} {ann.author?.cognome}</span>
                          <span>•</span>
                          <span>{new Date(ann.createdAt).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })} {new Date(ann.createdAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                      {isAdmin && (
                        <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
                          <button onClick={() => handleEditAnnouncement(ann)} style={{ background: 'rgba(251,191,36,0.15)', border: 'none', color: '#fbbf24', cursor: 'pointer', padding: '0.3rem', borderRadius: '6px' }}><Edit size={14} /></button>
                          <button onClick={() => handleDeleteAnnouncement(ann.id)} style={{ background: 'rgba(239,68,68,0.15)', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.3rem', borderRadius: '6px' }}><Trash2 size={14} /></button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="dashboard-grid responsive-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', alignItems: 'start' }}>
        
        {/* Eventi di Oggi */}
        {todayEvents.length > 0 && (
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div 
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
              onClick={() => setShowEvents(!showEvents)}
            >
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={20} color="#ffb340" /> Eventi in Programma Oggi
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {showEvents && <Link href="/dashboard/eventi" style={{ color: 'var(--primary)', fontSize: '0.9rem', position: 'relative', zIndex: 10 }} onClick={e => e.stopPropagation()}>Vedi Calendario →</Link>}
                {showEvents ? <ChevronUp size={20} color="var(--text-muted)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
              </div>
            </div>
            
            {showEvents && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                {todayEvents.map(ev => {
                  const isMenu = ev.type === 'MENU_DEGUSTAZIONE';
                  const isCarta = ev.type === 'CARTA';
                  const colorParams = isMenu ? {bg: 'rgba(52,199,89,0.1)', color: 'var(--success)'} : isCarta ? {bg: 'rgba(255,179,64,0.1)', color: '#ffb340'} : {bg: 'rgba(255,59,48,0.1)', color: 'var(--primary)'};
                  
                  return (
                    <div key={ev.id} style={{ display: 'flex', flexDirection: 'column', padding: '1rem', background: 'rgba(255,179,64,0.05)', border: '1px solid rgba(255,179,64,0.2)', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <span style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, background: colorParams.bg, color: colorParams.color, marginBottom: '0.4rem', display: 'inline-block' }}>
                            {ev.type.replace('_', ' ')}
                          </span>
                          <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{ev.title}</h4>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-main)', fontWeight: 600, fontSize: '0.95rem' }}>
                          <Clock size={15} color="var(--primary)" /> 
                          {new Date(ev.date).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      {ev.description && (
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{ev.description}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Prep list del Giorno */}
        {todayPrepLists.length > 0 && (
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div 
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
              onClick={() => setShowPreps(!showPreps)}
            >
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ClipboardList size={20} color="var(--success)" /> Preparazioni di Oggi
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {showPreps && <Link href="/dashboard/preplist" style={{ color: 'var(--primary)', fontSize: '0.9rem', position: 'relative', zIndex: 10 }} onClick={e => e.stopPropagation()}>Gestisci →</Link>}
                {showPreps ? <ChevronUp size={20} color="var(--text-muted)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
              </div>
            </div>
            
            {showPreps && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                {todayPrepLists.map(pl => {
                  const allTasks = [...(pl.tasks || [])];
                  const totalTasks = allTasks.length;
                  const doneTasks = allTasks.filter((t: any) => t.isCompleted).length;
                  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
                  return (
                    <div key={pl.id} style={{ background: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600, fontSize: '1rem' }}>{pl.title}</span>
                          {pl.isRecurring && <span style={{ fontSize: '0.68rem', color: '#ff9f0a', background: 'rgba(255,159,10,0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}><Repeat size={9} /> {DAYS[pl.recurringDay]}</span>}
                          {pl.members?.length > 0 && pl.members.map((m: any) => (
                            <span key={m.user.id} style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: getUserColor(m.user.id) + '20', color: getUserColor(m.user.id), fontWeight: 600 }}>
                              {m.user.nome}
                            </span>
                          ))}
                        </div>
                        <span style={{ fontSize: '0.82rem', color: progress === 100 ? 'var(--success)' : 'var(--text-muted)' }}>{doneTasks}/{totalTasks}</span>
                      </div>
                      <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden', marginBottom: '0.7rem' }}>
                        <div style={{ height: '100%', width: `${progress}%`, background: progress === 100 ? 'var(--success)' : 'var(--primary)', borderRadius: '2px', transition: 'width 0.3s' }} />
                      </div>
                      {totalTasks > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {allTasks.slice(0, 8).map((task: any) => {
                            const isMine = task.assignedToId === currentUserId;
                            return (
                              <div key={task.id} style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem',
                                padding: isMine ? '0.3rem 0.5rem' : '0.15rem 0',
                                background: isMine ? 'rgba(108,92,231,0.12)' : 'transparent',
                                borderRadius: isMine ? '6px' : '0',
                                border: isMine ? '1px solid rgba(108,92,231,0.25)' : 'none'
                              }}>
                                {task.isCompleted ? <CheckCircle size={13} style={{ color: 'var(--success)', minWidth: 13 }} /> : <Clock size={13} style={{ color: 'var(--text-muted)', minWidth: 13 }} />}
                                <span style={{ flex: 1, textDecoration: task.isCompleted ? 'line-through' : 'none', color: task.isCompleted ? 'var(--text-muted)' : isMine ? 'white' : 'var(--text-main)', fontWeight: isMine ? 600 : 400 }}>{task.title}</span>
                                {task.assignedTo && (
                                  <span style={{ fontSize: '0.7rem', padding: '0.05rem 0.35rem', borderRadius: '4px', background: getUserColor(task.assignedToId) + '25', color: getUserColor(task.assignedToId), fontWeight: 600 }}>
                                    {task.assignedTo.nome}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                          {totalTasks > 8 && <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>...e altri {totalTasks - 8}</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Ordini Recenti */}
        {recentOrders.length > 0 && (
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.8rem' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShoppingCart size={20} color="var(--primary)" /> Ordini Recenti</h3>
              <Link href="/dashboard/magazzino/storico-ordini" style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>Vedi tutti →</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {recentOrders.map(order => (
                <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem', background: 'rgba(0,0,0,0.12)', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Send size={12} style={{ color: statusColor(order.status) }} />
                    <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{order.title || 'Ordine'}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{new Date(order.date).toLocaleDateString('it-IT')}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '5px', background: `${statusColor(order.status)}22`, color: statusColor(order.status) }}>{statusLabel(order.status)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
