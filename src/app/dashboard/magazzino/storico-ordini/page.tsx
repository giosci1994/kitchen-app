"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Send, CheckCircle, Trash2 } from 'lucide-react';

const STATUS_FILTERS = [
  { value: 'ALL', label: 'Tutti' },
  { value: 'INVIATO', label: '📩 Inviati' },
  { value: 'COMPLETATO', label: '✅ Completati' },
  { value: 'BOZZA', label: '📝 Bozze' },
];

export default function StoricoOrdini() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState('USER');

  useEffect(() => {
    fetch('/api/orders').then(r => r.json()).then(d => { setOrders(Array.isArray(d) ? d : []); setLoading(false); });
    fetch('/api/auth/me').then(r => r.json()).then(d => { if (d.ruolo) setUserRole(d.ruolo); });
  }, []);

  const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

  const updateStatus = async (orderId: string, status: string) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Eliminare questo ordine?')) return;
    const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
    if (res.ok) setOrders(orders.filter(o => o.id !== orderId));
  };

  const filtered = activeFilter === 'ALL' ? orders : orders.filter(o => o.status === activeFilter);

  const statusIcon = (s: string) => s === 'BOZZA' ? <Clock size={16} /> : s === 'INVIATO' ? <Send size={16} /> : <CheckCircle size={16} />;
  const statusColor = (s: string) => s === 'BOZZA' ? 'var(--text-muted)' : s === 'INVIATO' ? '#ff9f0a' : 'var(--success)';
  const statusLabel = (s: string) => s === 'BOZZA' ? 'Bozza' : s === 'INVIATO' ? 'Inviato' : 'Completato';

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link href="/dashboard/magazzino" className="btn btn-secondary" style={{ padding: '0.6rem', width: 'auto' }}><ArrowLeft size={20} /></Link>
        <div>
          <h1 style={{ margin: 0 }}>Storico Ordini</h1>
          <p>Visualizza e gestisci tutti gli ordini di spesa.</p>
        </div>
      </div>

      {/* Filtri stato */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', padding: '0.4rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-lg)' }}>
        {STATUS_FILTERS.map(f => (
          <button key={f.value} onClick={() => setActiveFilter(f.value)}
            style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 500,
              background: activeFilter === f.value ? 'var(--primary)' : 'transparent',
              color: activeFilter === f.value ? 'white' : 'var(--text-muted)', transition: 'all 0.2s' }}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Caricamento...</div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p>Nessun ordine trovato.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map(order => (
            <div key={order.id} className="glass-panel" style={{ padding: '1.2rem', cursor: 'pointer' }}
              onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}>
              <div className="responsive-card-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <div style={{ color: statusColor(order.status) }}>{statusIcon(order.status)}</div>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '1.05rem' }}>{order.title || 'Ordine'}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '1rem' }}>
                      {new Date(order.date).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'long' })}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{order.items?.length || 0} articoli</span>
                  <span style={{ fontSize: '0.8rem', padding: '0.25rem 0.7rem', borderRadius: '6px',
                    background: `${statusColor(order.status)}22`, color: statusColor(order.status) }}>
                    {statusLabel(order.status)}
                  </span>
                </div>
              </div>

              {expandedId === order.id && (
                <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }} onClick={(e) => e.stopPropagation()}>
                  {order.notes && <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '1rem', fontSize: '0.9rem' }}>📝 {order.notes}</p>}
                  
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        <th style={{ padding: '0.4rem 0', textAlign: 'left' }}>Articolo</th>
                        <th style={{ padding: '0.4rem 0', textAlign: 'right' }}>Quantità</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items?.map((item: any) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '0.5rem 0', fontWeight: 500 }}>{item.name}</td>
                          <td style={{ padding: '0.5rem 0', textAlign: 'right', color: 'var(--primary)', fontWeight: 600 }}>
                            {item.quantity} {item.unit}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {isAdmin && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                      {order.status === 'INVIATO' && (
                        <button onClick={() => updateStatus(order.id, 'COMPLETATO')} className="btn btn-primary" style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                          <CheckCircle size={15} /> Segna Ricevuto
                        </button>
                      )}
                      {order.status === 'COMPLETATO' && (
                        <button onClick={() => updateStatus(order.id, 'INVIATO')} className="btn btn-secondary" style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                          Riapri
                        </button>
                      )}
                      <button onClick={() => deleteOrder(order.id)} className="btn" style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.85rem', background: 'rgba(255,59,48,0.1)', color: 'var(--danger)' }}>
                        <Trash2 size={15} /> Elimina
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
