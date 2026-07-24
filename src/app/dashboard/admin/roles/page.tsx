"use client";

import { useState, useEffect } from 'react';
import { Shield, Save, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';

type PermissionMap = Record<string, string[]>;

interface PosizioneData {
  posizione: string;
  label: string;
  livello: string;
  permissions: PermissionMap;
  isCustom: boolean;
}

export default function RolesPage() {
  const [posizioni, setPosizioni] = useState<PosizioneData[]>([]);
  const [risorse, setRisorse] = useState<string[]>([]);
  const [azioni, setAzioni] = useState<string[]>([]);
  const [risorsaLabels, setRisorsaLabels] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [editedPermissions, setEditedPermissions] = useState<Record<string, PermissionMap>>({});
  const [activeTab, setActiveTab] = useState<'ADMIN' | 'USER'>('ADMIN');

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await fetch('/api/admin/roles');
      const data = await res.json();
      if (data.posizioni) {
        setPosizioni(data.posizioni);
        setRisorse(data.risorse);
        setAzioni(data.azioni);
        setRisorsaLabels(data.risorsaLabels);

        // Inizializza le permissions editate
        const edited: Record<string, PermissionMap> = {};
        data.posizioni.forEach((p: PosizioneData) => {
          edited[p.posizione] = { ...p.permissions };
        });
        setEditedPermissions(edited);
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Errore nel caricamento dei ruoli' });
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (posizione: string, risorsa: string, azione: string) => {
    if (posizione === 'SUPER_ADMIN') return; // Non modificabile
    setEditedPermissions(prev => {
      const current = prev[posizione]?.[risorsa] || [];
      const newPerms = current.includes(azione)
        ? current.filter(a => a !== azione)
        : [...current, azione];
      return {
        ...prev,
        [posizione]: {
          ...prev[posizione],
          [risorsa]: newPerms
        }
      };
    });
  };

  const savePermissions = async (posizione: string) => {
    setSaving(posizione);
    setAlert(null);
    try {
      const res = await fetch('/api/admin/roles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ posizione, permissions: editedPermissions[posizione] })
      });
      if (res.ok) {
        setAlert({ type: 'success', message: `Permessi salvati per ${posizioni.find(p => p.posizione === posizione)?.label}` });
        // Aggiorna lo stato di isCustom
        setPosizioni(prev => prev.map(p => p.posizione === posizione ? { ...p, isCustom: true, permissions: editedPermissions[posizione] } : p));
      } else {
        throw new Error('Errore salvataggio');
      }
    } catch {
      setAlert({ type: 'error', message: 'Errore durante il salvataggio dei permessi' });
    } finally {
      setSaving(null);
    }
  };

  const filteredPosizioni = posizioni.filter(p => {
    if (p.posizione === 'SUPER_ADMIN') return false;
    return activeTab === 'ADMIN' ? p.livello === 'ADMIN' : p.livello === 'USER';
  });

  if (loading) return <div style={{ padding: '2rem' }}>Caricamento ruoli...</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>Access Control</span>
        <h1 style={{ fontSize: '2rem', margin: '0.3rem 0 0' }}>Gestione Ruoli e Permessi</h1>
        <p>Configura cosa ogni posizione lavorativa può visualizzare, modificare o eliminare.</p>
      </div>

      {/* Alert */}
      {alert && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.8rem',
          padding: '1rem', borderRadius: 'var(--radius-md)',
          background: alert.type === 'success' ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 59, 48, 0.1)',
          color: alert.type === 'success' ? 'var(--success)' : 'var(--danger)',
          border: `1px solid ${alert.type === 'success' ? 'var(--success)' : 'var(--danger)'}`
        }}>
          {alert.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{alert.message}</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {(['ADMIN', 'USER'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.6rem 1.5rem', borderRadius: 'var(--radius-full)', border: 'none',
              background: activeTab === tab ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
              color: activeTab === tab ? 'white' : 'var(--text-muted)',
              fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem',
              transition: 'var(--transition)'
            }}
          >
            <Shield size={14} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
            {tab === 'ADMIN' ? 'Ruoli Admin' : 'Ruoli Operativi'}
          </button>
        ))}
      </div>

      {/* Matrix */}
      {filteredPosizioni.map(pos => (
        <div key={pos.posizione} className="glass-panel" style={{ padding: '1.5rem', overflow: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{pos.label}</h3>
              <span style={{
                fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700,
                background: pos.livello === 'ADMIN' ? 'rgba(245, 130, 32, 0.15)' : 'rgba(0, 166, 153, 0.15)',
                color: pos.livello === 'ADMIN' ? '#f58220' : 'var(--secondary)'
              }}>
                {pos.livello}
              </span>
              {pos.isCustom && (
                <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(255, 90, 95, 0.15)', color: 'var(--primary)', fontWeight: 600 }}>
                  PERSONALIZZATO
                </span>
              )}
            </div>
            <button
              onClick={() => savePermissions(pos.posizione)}
              disabled={saving !== null}
              className="btn btn-primary"
              style={{ width: 'auto', padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}
            >
              {saving === pos.posizione ? 'Salvataggio...' : <><Save size={16} /> Salva</>}
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '0.6rem', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Risorsa</th>
                {azioni.map(azione => (
                  <th key={azione} style={{ padding: '0.6rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {azione === 'view' ? '👁 Visualizza' : azione === 'edit' ? '✏️ Modifica' : '🗑 Elimina'}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {risorse.map(risorsa => (
                <tr key={risorsa} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '0.8rem 0.6rem', fontWeight: 500, fontSize: '0.95rem' }}>
                    {risorsaLabels[risorsa] || risorsa}
                  </td>
                  {azioni.map(azione => {
                    const isActive = editedPermissions[pos.posizione]?.[risorsa]?.includes(azione) || false;
                    return (
                      <td key={azione} style={{ padding: '0.8rem 0.6rem', textAlign: 'center' }}>
                        <button
                          onClick={() => togglePermission(pos.posizione, risorsa, azione)}
                          style={{
                            width: '36px', height: '36px', borderRadius: '8px', border: 'none',
                            background: isActive
                              ? azione === 'delete' ? 'rgba(255, 59, 48, 0.2)' : 'rgba(52, 199, 89, 0.2)'
                              : 'rgba(255,255,255,0.03)',
                            color: isActive
                              ? azione === 'delete' ? 'var(--danger)' : 'var(--success)'
                              : 'rgba(255,255,255,0.15)',
                            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'var(--transition)', fontSize: '1.1rem', fontWeight: 'bold'
                          }}
                        >
                          {isActive ? '✓' : '—'}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
