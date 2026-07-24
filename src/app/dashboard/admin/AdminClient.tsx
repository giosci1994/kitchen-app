"use client";

import Link from 'next/link';
import { useState } from 'react';
import UserTable from './UserTable';
import { LogOut, Archive, Bell, Clock, Download, Shield, Check, CheckCheck, Plus, Edit, Trash2, User, ChefHat, UtensilsCrossed, Calendar, ShoppingCart, Package, ClipboardList, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Mappa entità → icona e colore
function getEntityStyle(entity: string) {
  const map: Record<string, { icon: any; color: string; bg: string }> = {
    'Ricetta': { icon: ChefHat, color: '#a78bfa', bg: 'rgba(167,139,250,0.15)' },
    'Piatto': { icon: UtensilsCrossed, color: '#f472b6', bg: 'rgba(244,114,182,0.15)' },
    'Menu': { icon: ClipboardList, color: '#34d399', bg: 'rgba(52,211,153,0.15)' },
    'Evento': { icon: Calendar, color: '#60a5fa', bg: 'rgba(96,165,250,0.15)' },
    'Ordine': { icon: ShoppingCart, color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' },
    'Ingrediente': { icon: Package, color: '#fb923c', bg: 'rgba(251,146,60,0.15)' },
    'Magazzino': { icon: Archive, color: '#38bdf8', bg: 'rgba(56,189,248,0.15)' },
    'PrepList': { icon: ClipboardList, color: '#a3e635', bg: 'rgba(163,230,53,0.15)' },
    'Utente': { icon: User, color: '#c084fc', bg: 'rgba(192,132,252,0.15)' },
    'Sistema': { icon: Settings, color: '#94a3b8', bg: 'rgba(148,163,184,0.15)' },
  };
  return map[entity] || map['Sistema'];
}

// Determina il tipo di azione e relativo colore
function getActionStyle(action: string) {
  const lowerAction = action.toLowerCase();
  if (lowerAction.includes('creat') || lowerAction.includes('login')) {
    return { color: '#34d399', icon: Plus, label: 'CREA' };
  }
  if (lowerAction.includes('modificat') || lowerAction.includes('aggiornat') || lowerAction.includes('cambio') || lowerAction.includes('cambiat')) {
    return { color: '#fbbf24', icon: Edit, label: 'MODIFICA' };
  }
  if (lowerAction.includes('eliminat') || lowerAction.includes('azzerat')) {
    return { color: '#ef4444', icon: Trash2, label: 'ELIMINA' };
  }
  if (lowerAction.includes('approvato') || lowerAction.includes('completato')) {
    return { color: '#34d399', icon: Check, label: 'APPROVA' };
  }
  if (lowerAction.includes('sospeso')) {
    return { color: '#ef4444', icon: Trash2, label: 'SOSPENDI' };
  }
  return { color: '#94a3b8', icon: Settings, label: 'ALTRO' };
}

export default function AdminClient({ 
  initialUsers, 
  initialLogs, 
  initialMessages, 
  currentUserRole, 
  currentUserId 
}: any) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [messages, setMessages] = useState(initialMessages);
  const [markingRead, setMarkingRead] = useState<string | null>(null);

  const handleGlobalLogout = async () => {
    if (!window.confirm("Sei sicuro di voler forzare il logout di TUTTI gli utenti inclusi gli admin?")) return;
    setLoadingAction('logout');
    try {
      const res = await fetch('/api/admin/logout-all', { method: 'POST' });
      if (res.ok) {
        alert("Forced Global Logout eseguito.");
        router.refresh();
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const handleFlushCache = async () => {
    if (!window.confirm("Verranno azzerate tutte le giacenze per forzare un ricalcolo. Procedere?")) return;
    setLoadingAction('flush');
    try {
      const res = await fetch('/api/admin/flush-cache', { method: 'POST' });
      if (res.ok) {
        alert("Cache magazzino azzerata.");
        router.refresh();
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const handleMarkRead = async (messageId: string) => {
    setMarkingRead(messageId);
    try {
      const res = await fetch('/api/admin/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId })
      });
      if (res.ok) {
        setMessages((prev: any[]) => prev.map((m: any) => m.id === messageId ? { ...m, isRead: true } : m));
      }
    } finally {
      setMarkingRead(null);
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingRead('all');
    try {
      const res = await fetch('/api/admin/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true })
      });
      if (res.ok) {
        setMessages((prev: any[]) => prev.map((m: any) => ({ ...m, isRead: true })));
      }
    } finally {
      setMarkingRead(null);
    }
  };

  const unreadCount = messages.filter((m: any) => !m.isRead).length;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div className="responsive-header">
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>Control Center</span>
          <h1 style={{ fontSize: '2.5rem', margin: 0 }}>Admin Console</h1>
        </div>
        <div className="responsive-actions">
          {currentUserRole === 'SUPER_ADMIN' && (
            <Link href="/dashboard/admin/roles">
              <button className="btn btn-secondary" style={{ width: 'auto' }}>
                <Shield size={18} /> Gestione Ruoli
              </button>
            </Link>
          )}
          <button className="btn btn-secondary">
            <Download size={18} /> Download Audit Logs
          </button>
        </div>
      </div>

      {/* Top 3 Panels Area */}
      <div className="admin-top-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Panel 1: Message Center */}
        <div className="glass-panel" style={{ padding: '1.5rem', height: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={18} style={{ color: '#f58220' }} />
              <h3 style={{ margin: 0, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Message Center</h3>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllRead}
                  disabled={markingRead === 'all'}
                  style={{ 
                    background: 'none', border: 'none', color: '#34d399', 
                    cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                    opacity: markingRead === 'all' ? 0.5 : 1
                  }}
                  title="Segna tutti come letti"
                >
                  <CheckCheck size={14} /> LEGGI TUTTI
                </button>
              )}
              <span style={{ 
                background: unreadCount > 0 ? 'rgba(245, 130, 32, 0.2)' : 'rgba(52, 211, 153, 0.2)', 
                color: unreadCount > 0 ? '#f58220' : '#34d399', 
                padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' 
              }}>
                {unreadCount} {unreadCount === 1 ? 'NUOVO' : 'NUOVI'}
              </span>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '400px', overflowY: 'auto' }}>
            {messages.length === 0 ? <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Nessun messaggio.</p> : null}
            {messages.map((msg: any) => (
              <div 
                key={msg.id} 
                style={{ 
                  background: msg.isRead ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.2)', 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  borderLeft: `3px solid ${msg.type === 'ALERT' ? '#f58220' : '#60a5fa'}`,
                  opacity: msg.isRead ? 0.6 : 1,
                  transition: 'opacity 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ 
                      background: msg.type === 'ALERT' ? 'rgba(245,130,32,0.2)' : 'rgba(96,165,250,0.2)',
                      color: msg.type === 'ALERT' ? '#f58220' : '#60a5fa',
                      padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.65rem', 
                      fontWeight: 700, letterSpacing: '0.5px'
                    }}>
                      {msg.type}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{msg.title}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(msg.createdAt).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })} {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    {!msg.isRead && (
                      <button
                        onClick={() => handleMarkRead(msg.id)}
                        disabled={markingRead === msg.id}
                        style={{ 
                          background: 'rgba(52,211,153,0.15)', border: 'none', 
                          color: '#34d399', cursor: 'pointer', padding: '0.2rem',
                          borderRadius: '4px', display: 'flex', alignItems: 'center',
                          opacity: markingRead === msg.id ? 0.5 : 1
                        }}
                        title="Segna come letto"
                      >
                        <Check size={14} />
                      </button>
                    )}
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{msg.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 2: Global Authority Panel */}
        <div className="glass-panel" style={{ padding: '1.5rem', height: '100%' }}>
          <h3 style={{ margin: 0, marginBottom: '1.5rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Global Authority Panel</h3>
          
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '8px', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ background: 'rgba(255,59,48,0.1)', color: 'var(--danger)', padding: '0.5rem', borderRadius: '8px' }}>
                <LogOut size={20} />
              </div>
              <div>
                <strong style={{ display: 'block', marginBottom: '0.2rem' }}>Force Global Logout</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Terminate all active sessions across the platform immediately.</span>
              </div>
            </div>
            
            <div style={{ background: '#000', padding: '1rem', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              [ALERT PREVIEW]: &quot;Your session has been terminated by an administrator for maintenance. Please relogin in 5 minutes.&quot;
            </div>
            
            <button 
              onClick={handleGlobalLogout} 
              disabled={loadingAction !== null}
              className="btn btn-primary" 
              style={{ width: '100%', background: 'var(--danger)' }}
            >
              {loadingAction === 'logout' ? 'Executing...' : 'EXECUTE LOGOUT'}
            </button>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '8px' }}>
             <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(245, 130, 32, 0.1)', color: '#f58220', padding: '0.5rem', borderRadius: '8px' }}>
                <Archive size={20} />
              </div>
              <div>
                <strong style={{ display: 'block', marginBottom: '0.2rem' }}>Flush Inventory Cache</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Clear all real-time stock counts to force manual recount sync.</span>
              </div>
            </div>
            <button 
              onClick={handleFlushCache} 
              disabled={loadingAction !== null}
              className="btn btn-primary" 
              style={{ width: '100%', background: '#f58220' }}
            >
              {loadingAction === 'flush' ? 'Clearing...' : 'CLEAR STOCK DATA'}
            </button>
          </div>
        </div>

        {/* Panel 3: Operations Log */}
        <div className="glass-panel" style={{ padding: '1.5rem', height: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} style={{ color: '#f58220' }} />
              <h3 style={{ margin: 0, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Operations Log</h3>
            </div>
            <span style={{ 
              background: 'rgba(245, 130, 32, 0.2)', 
              color: '#f58220', 
              padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' 
            }}>
              {initialLogs.length} RECENTI
            </span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
            {initialLogs.length === 0 ? <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Nessun log operativo registrato.</p> : null}
            {initialLogs.map((log: any, index: number) => {
              const entityStyle = getEntityStyle(log.entity);
              const actionStyle = getActionStyle(log.action);
              const EntityIcon = entityStyle.icon;
              const ActionIcon = actionStyle.icon;

              return (
                <div key={log.id} style={{ 
                  display: 'flex', gap: '0.75rem', 
                  background: 'rgba(0,0,0,0.15)', 
                  padding: '0.8rem', borderRadius: '8px',
                  borderLeft: `3px solid ${actionStyle.color}`,
                  transition: 'background 0.2s ease'
                }}>
                  {/* Icona entità */}
                  <div style={{ 
                    background: entityStyle.bg, 
                    color: entityStyle.color,
                    padding: '0.4rem', borderRadius: '6px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    minWidth: '32px', height: '32px'
                  }}>
                    <EntityIcon size={16} />
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Azione + Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                      <span style={{ 
                        background: `${actionStyle.color}20`, color: actionStyle.color,
                        padding: '0.1rem 0.4rem', borderRadius: '3px', 
                        fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.5px',
                        display: 'flex', alignItems: 'center', gap: '0.2rem'
                      }}>
                        <ActionIcon size={10} />
                        {actionStyle.label}
                      </span>
                      <span style={{ 
                        background: entityStyle.bg, color: entityStyle.color,
                        padding: '0.1rem 0.4rem', borderRadius: '3px', 
                        fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.5px'
                      }}>
                        {log.entity.toUpperCase()}
                      </span>
                    </div>

                    {/* Azione descrittiva */}
                    <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.2rem' }}>{log.action}</strong>
                    
                    {/* Meta: ora + utente */}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span>{new Date(log.createdAt).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })} {new Date(log.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      <span>•</span>
                      <span style={{ 
                        textTransform: 'uppercase', fontWeight: 600,
                        color: entityStyle.color
                      }}>
                        {log.user ? `${log.user.nome} ${log.user.cognome}` : 'SYSTEM'}
                      </span>
                    </div>

                    {/* Dettagli */}
                    {log.details && (
                      <span style={{ 
                        fontSize: '0.75rem', color: 'var(--text-muted)', 
                        marginTop: '0.3rem', display: 'block',
                        fontStyle: 'italic'
                      }}>
                        {log.details}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '1.5rem', textAlign: 'left' }}>
            <button style={{ background: 'none', border: 'none', color: '#f58220', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}>
              VIEW FULL TIMELINE →
            </button>
          </div>
        </div>

      </div>

      {/* Roster / User Table Panel */}
      <div style={{ marginTop: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Staff Roster</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Manage permissions, roles and account states for all culinary and service staff.</p>
        
        <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <UserTable initialUsers={initialUsers} currentUserRole={currentUserRole} currentUserId={currentUserId} />
        </div>
      </div>
    </div>
  );
}
