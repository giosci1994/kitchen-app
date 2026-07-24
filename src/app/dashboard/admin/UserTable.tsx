"use client";

import { useState } from 'react';
import { Check, X, ShieldAlert, Trash2, PowerOff } from 'lucide-react';

export default function UserTable({ initialUsers, currentUserRole, currentUserId }: { initialUsers: any[], currentUserRole: string, currentUserId: string }) {
  const [users, setUsers] = useState(initialUsers);

  const handleUpdate = async (userId: string, action: string, value?: string) => {
    try {
      const res = await fetch(`/api/admin/users`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action, value })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUsers(users.map(u => u.id === userId ? updatedUser : u));
      } else {
        alert("Errore durante l'aggiornamento. Permessi insufficienti?");
      }
    } catch (e) {
      alert("Errore di rete");
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo utente in modo permanente?')) return;
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId));
      } else {
        alert("Errore durante l'eliminazione");
      }
    } catch (e) {
      alert("Errore di rete");
    }
  };

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
      <thead>
        <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          <th style={{ padding: '1rem 0.5rem' }}>Nome</th>
          <th style={{ padding: '1rem 0.5rem' }}>Email</th>
          <th style={{ padding: '1rem 0.5rem' }}>Posizione</th>
          <th style={{ padding: '1rem 0.5rem' }}>Stato</th>
          <th style={{ padding: '1rem 0.5rem' }}>Last Login</th>
          <th style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>Azioni</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => {
          const isOnline = u.lastLogin && (new Date().getTime() - new Date(u.lastLogin).getTime() < 1000 * 60 * 60);
          return (
          <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
            <td style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isOnline ? 'var(--success)' : 'transparent', border: isOnline ? 'none' : '1px solid var(--border)' }}></div>
                {u.nome} {u.cognome}
              </div>
            </td>
            <td style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)' }}>{u.email}</td>
            <td style={{ padding: '1rem 0.5rem' }}>
              <select 
                value={u.posizione || 'COMMIS_CUCINA'} 
                onChange={(e) => handleUpdate(u.id, 'posizione', e.target.value)}
                disabled={(u.id === currentUserId && currentUserRole !== 'SUPER_ADMIN') || (u.posizione === 'SUPER_ADMIN' && currentUserRole !== 'SUPER_ADMIN')}
                style={{ background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.4rem 0.5rem', outline: 'none', cursor: 'pointer', fontSize: '0.8rem', maxWidth: '180px' }}
              >
                <optgroup label="— Admin —">
                  {currentUserRole === 'SUPER_ADMIN' && <option value="SUPER_ADMIN">Super Admin</option>}
                  <option value="OWNER">Proprietario</option>
                  <option value="RESTAURANT_MANAGER">Direttore</option>
                  <option value="EXECUTIVE_CHEF">Executive Chef</option>
                  <option value="SOUS_CHEF">Sous Chef</option>
                  <option value="FB_MANAGER">F&B Manager</option>
                  <option value="ECONOMO">Economo</option>
                </optgroup>
                <optgroup label="— Staff —">
                  <option value="CHEF_DE_PARTIE">Chef de Partie</option>
                  <option value="PASTICCIERE">Pasticciere</option>
                  <option value="COMMIS_CUCINA">Commis di Cucina</option>
                  <option value="LAVAPIATTI">Lavapiatti</option>
                  <option value="MAITRE">Maître</option>
                  <option value="SOMMELIER">Sommelier</option>
                  <option value="CAMERIERE">Cameriere</option>
                  <option value="HOST">Host / Accoglienza</option>
                  <option value="MAGAZZINIERE">Magazziniere</option>
                  <option value="RESPONSABILE_ACQUISTI">Resp. Acquisti</option>
                  <option value="CONTABILE">Contabile</option>
                  <option value="FATTORINO">Fattorino</option>
                  <option value="MANUTENTORE">Manutentore</option>
                </optgroup>
              </select>
            </td>
            <td style={{ padding: '1rem 0.5rem' }}>
              <span style={{ 
                padding: '0.3rem 0.6rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700,
                background: u.status === 'ACTIVE' ? 'rgba(52, 199, 89, 0.15)' : u.status === 'PENDING' ? 'rgba(255, 179, 64, 0.15)' : 'rgba(255, 59, 48, 0.15)',
                color: u.status === 'ACTIVE' ? 'var(--success)' : u.status === 'PENDING' ? '#ffb340' : 'var(--danger)'
              }}>
                {u.status}
              </span>
            </td>
            <td style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Mai'}
            </td>
            <td style={{ padding: '1rem 0.5rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
              {u.status === 'PENDING' && (
                <>
                  <button onClick={() => handleUpdate(u.id, 'status', 'ACTIVE')} style={{ background: 'linear-gradient(135deg, #34c759, #28a745)', color: 'white', border: 'none', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer', display: 'flex' }} title="Approva"><Check size={16}/></button>
                  <button onClick={() => handleUpdate(u.id, 'status', 'SUSPENDED')} style={{ background: 'linear-gradient(135deg, var(--danger), #ff3036)', color: 'white', border: 'none', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer', display: 'flex' }} title="Rifiuta"><X size={16}/></button>
                </>
              )}
              {u.status === 'ACTIVE' && u.id !== currentUserId && (
                <button onClick={() => handleUpdate(u.id, 'status', 'SUSPENDED')} style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer', display: 'flex' }} title="Sospendi Accesso"><PowerOff size={16}/></button>
              )}
              {u.status === 'SUSPENDED' && (
                <button onClick={() => handleUpdate(u.id, 'status', 'ACTIVE')} style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--success)', border: '1px solid rgba(52,199,89,0.3)', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer', display: 'flex' }} title="Riattiva Accesso"><ShieldAlert size={16}/></button>
              )}
              {u.id !== currentUserId && (
                <button onClick={() => handleDelete(u.id)} style={{ background: 'rgba(255,59,48,0.1)', color: 'var(--danger)', border: '1px solid rgba(255,59,48,0.2)', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer', marginLeft: '0.5rem', display: 'flex' }} title="Elimina Utente"><Trash2 size={16}/></button>
              )}
            </td>
          </tr>
          );
        })}
        {users.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Nessun utente trovato</td></tr>}
      </tbody>
    </table>
  );
}
