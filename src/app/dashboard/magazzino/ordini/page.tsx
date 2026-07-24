"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, Plus, Minus, Trash2, Send, Search, CalendarDays } from 'lucide-react';

const ING_CATEGORIES = [
  { value: 'VERDURE', label: '🥬 Verdure', color: 'rgba(52, 199, 89, 0.15)' },
  { value: 'CARNI', label: '🥩 Carni', color: 'rgba(255, 69, 58, 0.15)' },
  { value: 'PESCI', label: '🐟 Pesci', color: 'rgba(50, 173, 230, 0.15)' },
  { value: 'LATTICINI', label: '🥚 Uova e Latticini', color: 'rgba(255, 214, 10, 0.12)' },
  { value: 'SECCHI', label: '🌾 Secchi / Dispensa', color: 'rgba(210, 180, 140, 0.15)' },
  { value: 'SURGELATI', label: '❄️ Surgelati', color: 'rgba(100, 210, 255, 0.12)' },
  { value: 'BEVANDE', label: '🍷 Bevande', color: 'rgba(175, 82, 222, 0.15)' },
  { value: 'PULIZIA', label: '🧹 Pulizia', color: 'rgba(90, 200, 250, 0.12)' },
  { value: 'UTENSILI', label: '🔧 Utensili', color: 'rgba(162, 132, 94, 0.15)' },
  { value: 'ALTRO', label: '📦 Altro', color: 'rgba(255, 255, 255, 0.05)' },
];

export default function GenerazioneOrdini() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [stock, setStock] = useState<any[]>([]);
  const [selectedRecipes, setSelectedRecipes] = useState<{ recipeId: string; multiplier: number }[]>([]);
  const [extraItems, setExtraItems] = useState<{ name: string; unit: string; category: string; quantity: number }[]>([]);
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [orderNotes, setOrderNotes] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/recipes').then(r => r.json()),
      fetch('/api/warehouse').then(r => r.json())
    ]).then(([rData, sData]) => {
      setRecipes(Array.isArray(rData) ? rData : []);
      setStock(Array.isArray(sData) ? sData : []);
    });
  }, []);

  const addRecipe = (recipeId: string) => {
    if (!selectedRecipes.find(r => r.recipeId === recipeId)) setSelectedRecipes([...selectedRecipes, { recipeId, multiplier: 1 }]);
  };
  const updateMultiplier = (recipeId: string, delta: number) => {
    setSelectedRecipes(selectedRecipes.map(r => r.recipeId === recipeId ? { ...r, multiplier: Math.max(0.5, r.multiplier + delta) } : r));
  };
  const removeRecipe = (recipeId: string) => setSelectedRecipes(selectedRecipes.filter(r => r.recipeId !== recipeId));

  const addExtraItem = (item: any) => {
    if (!extraItems.find(e => e.name === item.name)) {
      setExtraItems([...extraItems, { name: item.name, unit: item.unit, category: item.category || 'ALTRO', quantity: 1 }]);
    }
    setSearchTerm(''); setShowSuggestions(false);
  };
  const addCustomItem = () => {
    if (!searchTerm.trim()) return;
    if (!extraItems.find(e => e.name.toLowerCase() === searchTerm.toLowerCase())) {
      setExtraItems([...extraItems, { name: searchTerm.trim(), unit: 'pz', category: 'ALTRO', quantity: 1 }]);
    }
    setSearchTerm(''); setShowSuggestions(false);
  };
  const updateExtraQty = (i: number, d: number) => setExtraItems(extraItems.map((e, idx) => idx === i ? { ...e, quantity: Math.max(0.5, e.quantity + d) } : e));
  const removeExtra = (i: number) => { const n = [...extraItems]; n.splice(i, 1); setExtraItems(n); };

  // Compila ordine: ricette + extra
  const orderItems: { name: string; unit: string; category: string; quantity: number }[] = [];

  selectedRecipes.forEach(sr => {
    const recipe = recipes.find(r => r.id === sr.recipeId);
    if (!recipe) return;
    recipe.ingredients.forEach((ing: any) => {
      const existing = orderItems.find(o => o.name === ing.name);
      if (existing) existing.quantity += ing.baseQuantity * sr.multiplier;
      else orderItems.push({ name: ing.name, unit: ing.unit, category: 'ALTRO', quantity: ing.baseQuantity * sr.multiplier });
    });
  });

  extraItems.forEach(extra => {
    const existing = orderItems.find(o => o.name === extra.name);
    if (existing) existing.quantity += extra.quantity;
    else orderItems.push({ ...extra });
  });

  // Sottrai stock
  const finalList = orderItems.map(item => {
    const stockItem = stock.find(s => s.name.toLowerCase() === item.name.toLowerCase());
    const inStock = stockItem?.warehouseStock?.stockQuantity || 0;
    return { ...item, category: stockItem?.category || item.category, needed: item.quantity, stock: inStock, toOrder: Math.max(0, item.quantity - inStock) };
  }).filter(i => i.toOrder > 0).sort((a, b) => a.name.localeCompare(b.name));

  const grouped: Record<string, typeof finalList> = {};
  finalList.forEach(item => { if (!grouped[item.category]) grouped[item.category] = []; grouped[item.category].push(item); });

  const filteredSuggestions = searchTerm.length >= 1 ? stock.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) && !extraItems.find(e => e.name === s.name)).slice(0, 6) : [];

  const handleSendOrder = async () => {
    if (finalList.length === 0) { alert("Nessun articolo da ordinare"); return; }
    setSending(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Ordine del ${new Date(orderDate).toLocaleDateString('it-IT')}`,
          date: orderDate, notes: orderNotes,
          items: finalList.map(i => ({ name: i.name, unit: i.unit, category: i.category, quantity: i.toOrder }))
        })
      });
      if (res.ok) setSent(true);
      else { const err = await res.json(); alert(err.error); }
    } catch { alert("Errore di rete"); }
    finally { setSending(false); }
  };

  if (sent) return (
    <div className="animate-fade-in" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>✅</div>
      <h2>Ordine Inviato!</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Ordine del {new Date(orderDate).toLocaleDateString('it-IT')} con {finalList.length} articoli.</p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link href="/dashboard/magazzino/storico-ordini" className="btn btn-primary" style={{ width: 'auto', textDecoration: 'none' }}>Vai allo Storico</Link>
        <button onClick={() => { setSent(false); setSelectedRecipes([]); setExtraItems([]); }} className="btn btn-secondary" style={{ width: 'auto' }}>Nuovo Ordine</button>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link href="/dashboard/magazzino" className="btn btn-secondary" style={{ padding: '0.6rem', width: 'auto' }}><ArrowLeft size={20} /></Link>
        <div>
          <h1 style={{ margin: 0 }}>Genera Ordine Spesa</h1>
          <p>Aggiungi ricette e/o singoli elementi, poi invia l'ordine.</p>
        </div>
      </div>

      <div className="responsive-flex-col" style={{ gap: '2rem' }}>
        <div className="ordini-left" style={{ flex: '1 1 380px' }}>
          {/* Ricette */}
          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.8rem', marginBottom: '1rem' }}>📖 Da Ricette</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              {selectedRecipes.map(sr => {
                const r = recipes.find(x => x.id === sr.recipeId);
                if (!r) return null;
                return (
                  <div key={sr.recipeId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '0.6rem 0.8rem', borderRadius: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.title}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <button onClick={() => updateMultiplier(sr.recipeId, -0.5)} className="btn btn-secondary" style={{ padding: '0.2rem', width: 'auto' }}><Minus size={12} /></button>
                      <span style={{ width: '35px', textAlign: 'center', fontWeight: 700, fontSize: '0.85rem' }}>x{sr.multiplier}</span>
                      <button onClick={() => updateMultiplier(sr.recipeId, 0.5)} className="btn btn-secondary" style={{ padding: '0.2rem', width: 'auto' }}><Plus size={12} /></button>
                      <button onClick={() => removeRecipe(sr.recipeId)} className="btn" style={{ padding: '0.25rem', width: 'auto', background: 'rgba(255,59,48,0.1)', color: 'var(--danger)', marginLeft: '0.2rem' }}><Trash2 size={13} /></button>
                    </div>
                  </div>
                );
              })}
              {selectedRecipes.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nessuna ricetta.</p>}
            </div>
            <select className="input-field" style={{ padding: '0.7rem', fontSize: '0.9rem' }}
              onChange={(e) => { if (e.target.value) addRecipe(e.target.value); e.target.value = ""; }} defaultValue="">
              <option value="" disabled>+ Aggiungi ricetta</option>
              {recipes.filter(r => !selectedRecipes.find(sr => sr.recipeId === r.id)).map(r => (<option key={r.id} value={r.id}>{r.title}</option>))}
            </select>
          </div>

          {/* Singoli elementi */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.8rem', marginBottom: '1rem' }}>📦 Singoli Elementi</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              {extraItems.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '0.6rem 0.8rem', borderRadius: '8px' }}>
                  <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{item.name} <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({item.unit})</span></span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <button onClick={() => updateExtraQty(idx, -1)} className="btn btn-secondary" style={{ padding: '0.2rem', width: 'auto' }}><Minus size={12} /></button>
                    <span style={{ width: '35px', textAlign: 'center', fontWeight: 700, fontSize: '0.85rem' }}>{item.quantity}</span>
                    <button onClick={() => updateExtraQty(idx, 1)} className="btn btn-secondary" style={{ padding: '0.2rem', width: 'auto' }}><Plus size={12} /></button>
                    <button onClick={() => removeExtra(idx)} className="btn" style={{ padding: '0.25rem', width: 'auto', background: 'rgba(255,59,48,0.1)', color: 'var(--danger)', marginLeft: '0.2rem' }}><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
              {extraItems.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nessun elemento aggiunto.</p>}
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '0.8rem', top: '0.85rem', opacity: 0.4 }} />
                <input type="text" className="input-field" style={{ paddingLeft: '2.2rem', fontSize: '0.9rem' }}
                  placeholder="Cerca o aggiungi elemento..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  onKeyDown={(e) => { if (e.key === 'Enter') addCustomItem(); }} />
              </div>
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'rgba(20,20,30,0.98)', border: '1px solid var(--border)', borderRadius: '8px', zIndex: 50, marginTop: '2px' }}>
                  {filteredSuggestions.map(s => (
                    <div key={s.id} onClick={() => addExtraItem(s)}
                      style={{ padding: '0.6rem 1rem', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' }}
                      onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                      onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}>
                      <span>{s.name}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{s.unit}</span>
                    </div>
                  ))}
                </div>
              )}
              {searchTerm.trim() && filteredSuggestions.length === 0 && showSuggestions && (
                <button onClick={addCustomItem} className="btn btn-secondary" style={{ width: '100%', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                  <Plus size={14} /> Aggiungi "{searchTerm}"
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Destra: Riepilogo ordine */}
        <div className="ordini-right" style={{ flex: '1 1 420px' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.8rem', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShoppingCart size={20} color="var(--primary)" /> Da Ordinare</h3>
              {finalList.length > 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{finalList.length} articoli</span>}
            </div>

            {(selectedRecipes.length === 0 && extraItems.length === 0) ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>Aggiungi ricette o ingredienti.</p>
            ) : finalList.length === 0 ? (
              <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--success)' }}>
                <div style={{ fontSize: '3rem' }}>🎉</div><h3 style={{ margin: '0.5rem 0' }}>Tutto coperto!</h3>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  {ING_CATEGORIES.map(cat => {
                    const items = grouped[cat.value]; if (!items?.length) return null;
                    return (
                      <div key={cat.value}>
                        <div style={{ padding: '0.35rem 0.7rem', borderRadius: '6px', marginBottom: '0.3rem', background: cat.color, fontWeight: 600, fontSize: '0.82rem' }}>{cat.label}</div>
                        {items.map(item => (
                          <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0.7rem', borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.92rem' }}>
                            <span style={{ fontWeight: 500 }}>{item.name}</span>
                            <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{item.toOrder.toLocaleString('it-IT', { maximumFractionDigits: 2 })} {item.unit}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.2rem' }}>
                  <h4 style={{ margin: '0 0 0.8rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}><CalendarDays size={16} /> Invia Ordine</h4>
                  <div style={{ display: 'flex', gap: '0.7rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 140px' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Data consegna</label>
                      <input type="date" className="input-field" style={{ paddingLeft: '1rem' }} value={orderDate} onChange={(e) => setOrderDate(e.target.value)} />
                    </div>
                    <div style={{ flex: '2 1 180px' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Note</label>
                      <input type="text" className="input-field" style={{ paddingLeft: '1rem' }} placeholder="Es. consegna mattina" value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} />
                    </div>
                  </div>
                  <button onClick={handleSendOrder} disabled={sending} className="btn btn-primary" style={{ width: '100%' }}>
                    <Send size={18} /> {sending ? 'Invio...' : `Invia Ordine (${finalList.length} articoli)`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
