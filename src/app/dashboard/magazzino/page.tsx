"use client";

import { useEffect, useState } from 'react';
import { Package, Plus, Minus, RefreshCw, AlertTriangle, ShoppingCart, X, Save, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';

const ING_CATEGORIES = [
  { value: 'ALL', label: 'Tutte' },
  { value: 'VERDURE', label: '🥬 Verdure' },
  { value: 'CARNI', label: '🥩 Carni' },
  { value: 'PESCI', label: '🐟 Pesci' },
  { value: 'LATTICINI', label: '🧀 Uova e Latticini' },
  { value: 'SECCHI', label: '🌾 Secchi' },
  { value: 'SURGELATI', label: '❄️ Surgelati' },
  { value: 'BEVANDE', label: '🍷 Bevande' },
  { value: 'PULIZIA', label: '🧹 Pulizia' },
  { value: 'UTENSILI', label: '🔧 Utensili' },
  { value: 'SPEZIE', label: '🌿 Spezie' },
  { value: 'FRUTTA', label: '🍎 Frutta' },
  { value: 'FARINE', label: '🌾 Farine' },
  { value: 'ALTRO', label: '📦 Altro' },
];

const UNITS = ['g','kg','ml','l','pz','box','cartone','cassa','cassetta','bottiglia','latta','sacco'];

export default function MagazzinoPage() {
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState('USER');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newIng, setNewIng] = useState({ name: '', unit: 'pz', category: 'ALTRO', stockQuantity: '0' });
  const [addLoading, setAddLoading] = useState(false);

  const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

  const fetchStock = () => {
    setLoading(true);
    fetch('/api/warehouse').then(r => r.json()).then(data => { setIngredients(data); setLoading(false); });
  };

  useEffect(() => {
    fetchStock();
    fetch('/api/auth/me').then(r => r.json()).then(d => { if (d.ruolo) setUserRole(d.ruolo); });
  }, []);

  const handleUpdate = async (ingredientId: string, quantityChange: number, exactQuantity?: number) => {
    setIngredients(ingredients.map(ing => {
      if (ing.id === ingredientId) {
        const cur = ing.warehouseStock?.stockQuantity || 0;
        return { ...ing, warehouseStock: { stockQuantity: exactQuantity !== undefined ? exactQuantity : Math.max(0, cur + quantityChange) } };
      }
      return ing;
    }));
    await fetch('/api/warehouse', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ingredientId, quantityChange, exactQuantity }) });
  };

  const handleFieldChange = async (ingredientId: string, field: string, value: string) => {
    setIngredients(ingredients.map(i => i.id === ingredientId ? { ...i, [field]: value } : i));
    await fetch('/api/ingredients', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: ingredientId, [field]: value }) });
  };

  const handleResetTotal = async () => {
    if (!confirm("ATTENZIONE: Azzerare TUTTE le giacenze?")) return;
    const res = await fetch('/api/warehouse', { method: 'DELETE' });
    if (res.ok) fetchStock();
  };

  const handleDeleteIngredient = async (id: string, name: string) => {
    if (!confirm(`Sei sicuro di voler eliminare definitivamente l'ingrediente "${name}"?`)) return;
    const res = await fetch(`/api/ingredients?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setIngredients(ingredients.filter(i => i.id !== id));
    } else {
      const err = await res.json();
      alert("Errore durante l'eliminazione: " + err.error);
    }
  };

  const handleAddIngredient = async () => {
    if (!newIng.name.trim()) { alert("Nome ingrediente obbligatorio"); return; }
    setAddLoading(true);
    try {
      const res = await fetch('/api/warehouse/add', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIng)
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewIng({ name: '', unit: 'pz', category: 'ALTRO', stockQuantity: '0' });
        fetchStock();
      } else { const err = await res.json(); alert(err.error); }
    } catch { alert("Errore di rete"); }
    finally { setAddLoading(false); }
  };

  const filtered = ingredients.filter(i => {
    const matchesCat = activeFilter === 'ALL' || i.category === activeFilter;
    const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="animate-fade-in">
      <div className="responsive-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1>Gestione Magazzino</h1>
          <p>Tieni traccia della giacenza degli ingredienti in cucina.</p>
        </div>
        <div className="responsive-actions">
          <Link href="/dashboard/magazzino/ordini" className="btn btn-primary" style={{ width: 'auto', textDecoration: 'none' }}>
            <ShoppingCart size={18} /> Genera Ordine
          </Link>
          <Link href="/dashboard/magazzino/storico-ordini" className="btn btn-secondary" style={{ width: 'auto', textDecoration: 'none' }}>
            📋 Storico Ordini
          </Link>
          {isAdmin && (
            <button onClick={() => setShowAddModal(true)} className="btn btn-secondary" style={{ width: 'auto' }}>
              <Plus size={18} /> Nuovo Ingrediente
            </button>
          )}
          <button onClick={fetchStock} className="btn btn-secondary" style={{ width: 'auto' }} title="Sincronizza"><RefreshCw size={18} /></button>
          {isAdmin && (
            <button onClick={handleResetTotal} className="btn" style={{ width: 'auto', background: 'rgba(255,59,48,0.1)', color: 'var(--danger)', border: '1px solid rgba(255,59,48,0.3)' }}>
              <AlertTriangle size={16} /> Azzera
            </button>
          )}
        </div>
      </div>

      {/* Filtri e Ricerca */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="input-group" style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="search" 
            className="input-field" 
            placeholder="Cerca ingrediente..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', padding: '0.4rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-lg)' }}>
          {ING_CATEGORIES.map(c => (
            <button key={c.value} onClick={() => setActiveFilter(c.value)}
              style={{ padding: '0.4rem 0.7rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 500,
                background: activeFilter === c.value ? 'var(--primary)' : 'transparent',
                color: activeFilter === c.value ? 'white' : 'var(--text-muted)', transition: 'all 0.2s' }}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabella */}
      <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <th style={{ padding: '0.8rem 0.5rem' }}>Ingrediente</th>
              <th style={{ padding: '0.8rem 0.5rem' }}>Categoria</th>
              <th style={{ padding: '0.8rem 0.5rem' }}>Unità</th>
              <th style={{ padding: '0.8rem 0.5rem' }}>Giacenza</th>
              <th className="hide-on-mobile" style={{ padding: '0.8rem 0.5rem', textAlign: 'right' }}>Carico / Scarico / Azioni</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center' }}>Caricamento...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Nessun ingrediente trovato.</td></tr>
            ) : (
              filtered.map(ing => {
                const stock = ing.warehouseStock?.stockQuantity || 0;
                return (
                  <tr key={ing.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '0.7rem 0.5rem', fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Package size={15} color="var(--primary)" style={{ flexShrink: 0 }} /> 
                        {isAdmin ? (
                          <input 
                            type="text" 
                            defaultValue={ing.name} 
                            onBlur={(e) => { 
                              if (e.target.value.trim() !== '' && e.target.value !== ing.name) {
                                handleFieldChange(ing.id, 'name', e.target.value.trim()); 
                              }
                            }}
                            style={{ 
                              background: 'rgba(0,0,0,0.3)', color: 'var(--text-main)', border: '1px solid var(--border)', 
                              padding: '0.35rem 0.5rem', borderRadius: '6px', fontSize: '0.9rem', width: '100%',
                              outline: 'none', fontWeight: 500
                            }}
                          />
                        ) : (
                          <span>{ing.name}</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '0.7rem 0.5rem' }}>
                      {isAdmin ? (
                        <select value={ing.category || 'ALTRO'} onChange={(e) => handleFieldChange(ing.id, 'category', e.target.value)}
                          style={{ background: 'rgba(0,0,0,0.3)', color: 'var(--text-main)', border: '1px solid var(--border)', padding: '0.35rem', borderRadius: '6px', fontSize: '0.78rem', cursor: 'pointer' }}>
                          {ING_CATEGORIES.filter(c => c.value !== 'ALL').map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                      ) : (
                        <span style={{ fontSize: '0.85rem' }}>{ING_CATEGORIES.find(c => c.value === ing.category)?.label || ing.category}</span>
                      )}
                    </td>
                    <td style={{ padding: '0.7rem 0.5rem' }}>
                      {isAdmin ? (
                        <select value={ing.unit} onChange={(e) => handleFieldChange(ing.id, 'unit', e.target.value)}
                          style={{ background: 'rgba(0,0,0,0.3)', color: 'var(--text-main)', border: '1px solid var(--border)', padding: '0.35rem', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                          {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>{ing.unit}</span>
                      )}
                    </td>
                    <td style={{ padding: '0.7rem 0.5rem' }}>
                      {isAdmin ? (
                        <input type="number" value={stock} onChange={(e) => handleUpdate(ing.id, 0, Number(e.target.value))}
                          style={{ width: '80px', background: 'rgba(0,0,0,0.3)', color: 'var(--primary)', fontWeight: 700, border: '1px solid var(--border)', padding: '0.45rem', borderRadius: '6px', fontSize: '1rem' }} />
                      ) : (
                        <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1rem', padding: '0.45rem' }}>{stock}</span>
                      )}
                    </td>
                    <td className="hide-on-mobile" style={{ padding: '0.7rem 0.5rem', textAlign: 'right' }}>
                      {isAdmin && (
                        <div className="stock-actions" style={{ display: 'flex', gap: '0.3rem', justifyContent: 'flex-end' }}>
                          <button onClick={() => handleUpdate(ing.id, -10)} className="btn btn-secondary" style={{ padding: '0.35rem 0.5rem', width: 'auto', color: 'var(--danger)', border: 'none', background: 'rgba(255,59,48,0.08)', fontSize: '0.8rem' }}>-10</button>
                          <button onClick={() => handleUpdate(ing.id, -1)} className="btn btn-secondary" style={{ padding: '0.35rem 0.5rem', width: 'auto', color: 'var(--danger)', border: 'none', background: 'rgba(255,59,48,0.05)', fontSize: '0.8rem' }}>-1</button>
                          <div style={{ width: '1px', height: '18px', background: 'var(--border)', margin: '0 0.2rem', alignSelf: 'center' }} />
                          <button onClick={() => handleUpdate(ing.id, +1)} className="btn btn-secondary" style={{ padding: '0.35rem 0.5rem', width: 'auto', color: 'var(--success)', border: 'none', background: 'rgba(52,199,89,0.08)', fontSize: '0.8rem' }}>+1</button>
                          <button onClick={() => handleUpdate(ing.id, +10)} className="btn btn-secondary" style={{ padding: '0.35rem 0.5rem', width: 'auto', color: 'var(--success)', border: 'none', background: 'rgba(52,199,89,0.05)', fontSize: '0.8rem' }}>+10</button>
                          <div style={{ width: '1px', height: '18px', background: 'var(--border)', margin: '0 0.2rem', alignSelf: 'center' }} />
                          <button onClick={() => handleDeleteIngredient(ing.id, ing.name)} className="btn btn-secondary" style={{ padding: '0.35rem', width: 'auto', color: 'var(--danger)', border: 'none', background: 'rgba(255,59,48,0.1)' }} title="Elimina Ingrediente">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Aggiungi Ingrediente */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}>
          <div className="glass-panel animate-fade-in" style={{ padding: '2rem', width: '100%', maxWidth: '450px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Nuovo Ingrediente</h2>
              <button onClick={() => setShowAddModal(false)} className="btn btn-secondary" style={{ padding: '0.4rem', width: 'auto' }}><X size={18} /></button>
            </div>
            <div className="input-group">
              <label className="input-label">Nome</label>
              <input type="text" className="input-field" style={{ paddingLeft: '1rem' }} placeholder="Es. Olio Extravergine"
                value={newIng.name} onChange={(e) => setNewIng({...newIng, name: e.target.value})} />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Unità</label>
                <select className="input-field" style={{ paddingLeft: '1rem' }} value={newIng.unit} onChange={(e) => setNewIng({...newIng, unit: e.target.value})}>
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Categoria</label>
                <select className="input-field" style={{ paddingLeft: '1rem' }} value={newIng.category} onChange={(e) => setNewIng({...newIng, category: e.target.value})}>
                  {ING_CATEGORIES.filter(c => c.value !== 'ALL').map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Giacenza iniziale</label>
              <input type="number" className="input-field" style={{ paddingLeft: '1rem' }}
                value={newIng.stockQuantity} onChange={(e) => setNewIng({...newIng, stockQuantity: e.target.value})} />
            </div>
            <button onClick={handleAddIngredient} disabled={addLoading} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              <Save size={18} /> {addLoading ? 'Salvataggio...' : 'Aggiungi al Magazzino'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
