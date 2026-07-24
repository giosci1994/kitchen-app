"use client";

import { useEffect, useState } from 'react';
import { Save, Plus, Trash2, Edit, X, ChefHat, Info } from 'lucide-react';

const CARTA_SECTIONS = [
  { value: 'ANTIPASTO', label: '🥗 Antipasti' },
  { value: 'PRIMO', label: '🍝 Primi' },
  { value: 'SECONDO', label: '🥩 Secondi' },
  { value: 'CONTORNO', label: '🥬 Contorni' },
  { value: 'DESSERT', label: '🍰 Dessert' },
];

const DEGUSTAZIONE_SECTIONS = [
  { value: '1', label: 'Prima Corsa' },
  { value: '2', label: 'Seconda Corsa' },
  { value: '3', label: 'Terza Corsa' },
  { value: '4', label: 'Quarta Corsa' },
  { value: '5', label: 'Quinta Corsa' },
  { value: '6', label: 'Sesta Corsa' },
  { value: 'DESSERT', label: 'Dessert' },
];

type MenuItem = { dishId: string; section: string; price: string };

export default function MenuPage() {
  const [activeTab, setActiveTab] = useState<'PIATTI' | 'CARTA' | 'DEGUSTAZIONE'>('PIATTI');
  
  const [menus, setMenus] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [dishes, setDishes] = useState<any[]>([]);
  
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Menu Editing State
  const [editTitle, setEditTitle] = useState('');
  const [editItems, setEditItems] = useState<MenuItem[]>([]);
  
  // Dish Editing State
  const [showDishForm, setShowDishForm] = useState(false);
  const [editDish, setEditDish] = useState({
    id: '', name: '', category: 'ANTIPASTO', price: '',
    recipes: [] as string[],
    ingredients: [] as { name: string, quantity: string }[]
  });

  const fetchData = () => {
    Promise.all([
      fetch('/api/menu').then(r => r.json()),
      fetch('/api/recipes').then(r => r.json()),
      fetch('/api/dishes').then(r => r.json())
    ]).then(([mData, rData, dData]) => {
      setMenus(Array.isArray(mData) ? mData : []);
      setRecipes(Array.isArray(rData) ? rData : []);
      setDishes(Array.isArray(dData) ? dData : []);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeCarta = menus.find(m => m.type === 'CARTA' && m.isActive);
  const activeDegustazione = menus.find(m => m.type === 'DEGUSTAZIONE' && m.isActive);
  const activeMenu = activeTab === 'CARTA' ? activeCarta : activeDegustazione;
  const sections = activeTab === 'CARTA' ? CARTA_SECTIONS : DEGUSTAZIONE_SECTIONS;

  const sortedRecipes = [...recipes].sort((a, b) => a.title.localeCompare(b.title));
  const sortedDishes = [...dishes].sort((a, b) => a.name.localeCompare(b.name));

  // --- DISH LOGIC ---
  const handleSaveDish = async () => {
    if (!editDish.name) { alert("Nome piatto obbligatorio"); return; }
    setSaving(true);
    const method = editDish.id ? 'PUT' : 'POST';
    const url = editDish.id ? `/api/dishes/${editDish.id}` : '/api/dishes';
    
    try {
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editDish)
      });
      if (res.ok) {
        fetchData();
        setShowDishForm(false);
      } else { const err = await res.json(); alert(err.error); }
    } catch { alert("Errore di rete"); }
    finally { setSaving(false); }
  };

  const handleDeleteDish = async (id: string) => {
    if (!confirm("Eliminare definitivamente questo piatto? Se è usato in un menu, potrebbe essere rimosso.")) return;
    const res = await fetch(`/api/dishes/${id}`, { method: 'DELETE' });
    if (res.ok) fetchData();
  };

  const openNewDish = () => {
    setEditDish({ id: '', name: '', category: 'ANTIPASTO', price: '', recipes: [], ingredients: [] });
    setShowDishForm(true);
  };

  const openEditDish = (d: any) => {
    setEditDish({
      id: d.id, name: d.name, category: d.category, price: d.price || '',
      recipes: d.recipes.map((dr: any) => dr.recipe.id),
      ingredients: d.ingredients.map((i: any) => ({ name: i.name, quantity: i.quantity || '' }))
    });
    setShowDishForm(true);
  };

  // --- MENU LOGIC ---
  const startEditMenu = () => {
    if (activeMenu) {
      setEditTitle(activeMenu.title);
      setEditItems(activeMenu.items.map((i: any) => ({
        dishId: i.dishId || '', section: i.section, price: i.price || ''
      })));
    } else {
      setEditTitle(activeTab === 'CARTA' ? 'La Carta' : 'Menu Degustazione');
      setEditItems([]);
    }
    setEditing(true);
  };

  const addMenuItem = () => setEditItems([...editItems, { dishId: '', section: sections[0].value, price: '' }]);

  const selectDishForMenu = (index: number, dishId: string) => {
    const dish = dishes.find(d => d.id === dishId);
    if (!dish) return;
    const n = [...editItems];
    n[index].dishId = dishId;
    if (!n[index].price) n[index].price = dish.price || ''; 
    if (activeTab === 'CARTA' && CARTA_SECTIONS.find(s => s.value === dish.category)) {
      n[index].section = dish.category;
    }
    setEditItems(n);
  };

  const handleSaveMenu = async () => {
    if (editItems.length === 0) { alert("Aggiungi almeno un piatto"); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/menu', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: activeTab, title: editTitle, items: editItems })
      });
      if (res.ok) {
        fetchData();
        setEditing(false);
      } else { const err = await res.json(); alert(err.error); }
    } catch { alert("Errore di rete"); }
    finally { setSaving(false); }
  };

  const handleDeleteMenu = async () => {
    if (!activeMenu) return;
    const label = activeTab === 'CARTA' ? 'la Carta' : 'il Menu Degustazione';
    if (!confirm(`Eliminare definitivamente ${label}?`)) return;
    const res = await fetch(`/api/menu/${activeMenu.id}`, { method: 'DELETE' });
    if (res.ok) fetchData();
  };

  const groupedItems: Record<string, any[]> = {};
  if (activeMenu) {
    activeMenu.items.forEach((item: any) => {
      if (!groupedItems[item.section]) groupedItems[item.section] = [];
      groupedItems[item.section].push(item);
    });
  }

  return (
    <div className="animate-fade-in">
      <div className="responsive-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>Offerta Ristorante</h1>
          <p>Crea prima i Piatti assemblando ricette e ingredienti, poi componi i tuoi Menu.</p>
        </div>
        {!editing && activeTab !== 'PIATTI' && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={startEditMenu} className="btn btn-primary" style={{ width: 'auto' }}>
              <Edit size={18} /> {activeMenu ? 'Modifica' : 'Crea'} {activeTab === 'CARTA' ? 'Carta' : 'Degustazione'}
            </button>
            {activeMenu && (
              <button onClick={handleDeleteMenu} className="btn" style={{ width: 'auto', background: 'rgba(255,59,48,0.1)', color: 'var(--danger)', border: '1px solid rgba(255,59,48,0.3)' }}>
                <Trash2 size={18} /> Elimina
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="responsive-tabs" style={{ marginBottom: '2rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-lg)' }}>
        {(['PIATTI', 'CARTA', 'DEGUSTAZIONE'] as const).map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setEditing(false); setShowDishForm(false); }}
            style={{
              flex: 1, padding: '1rem', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '1rem', fontWeight: 600,
              background: activeTab === tab ? 'var(--primary)' : 'transparent',
              color: activeTab === tab ? 'white' : 'var(--text-muted)', transition: 'all 0.3s'
            }}>
            {tab === 'PIATTI' ? '🍲 Gestione Piatti' : tab === 'CARTA' ? '📋 La Carta' : '🍽️ Menu Degustazione'}
          </button>
        ))}
      </div>

      {/* TAB PIATTI */}
      {activeTab === 'PIATTI' && (
        <div>
          {showDishForm ? (
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0 }}>{editDish.id ? 'Modifica Piatto' : 'Nuovo Piatto'}</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={handleSaveDish} disabled={saving} className="btn btn-primary" style={{ width: 'auto' }}>
                    <Save size={18} /> {saving ? '...' : 'Salva'}
                  </button>
                  <button onClick={() => setShowDishForm(false)} className="btn btn-secondary" style={{ width: 'auto', padding: '0.6rem' }}><X size={18} /></button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                <div className="input-group" style={{ flex: '2 1 250px' }}>
                  <label className="input-label">Nome Piatto (es. Focaccia e fegatino)</label>
                  <input type="text" className="input-field" style={{ paddingLeft: '1rem' }} value={editDish.name} onChange={e => setEditDish({...editDish, name: e.target.value})} />
                </div>
                <div className="input-group" style={{ flex: '1 1 150px' }}>
                  <label className="input-label">Categoria Base</label>
                  <select className="input-field" style={{ paddingLeft: '1rem' }} value={editDish.category} onChange={e => setEditDish({...editDish, category: e.target.value})}>
                    {CARTA_SECTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    <option value="ALTRO">📦 Altro</option>
                  </select>
                </div>
                <div className="input-group" style={{ flex: '1 1 120px' }}>
                  <label className="input-label">Prezzo DKK/€</label>
                  <input type="text" className="input-field" style={{ paddingLeft: '1rem' }} placeholder="Es. 150 DKK" value={editDish.price} onChange={e => setEditDish({...editDish, price: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                {/* Assegna Ricette */}
                <div style={{ flex: '1 1 300px', background: 'rgba(0,0,0,0.15)', padding: '1.5rem', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 1rem 0' }}>Ricette Incluse</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {editDish.recipes.map((rId, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '0.5rem' }}>
                        <select className="input-field" style={{ paddingLeft: '0.5rem', fontSize: '0.9rem' }} value={rId}
                          onChange={e => { const n = [...editDish.recipes]; n[idx] = e.target.value; setEditDish({...editDish, recipes: n}); }}>
                          <option value="">Seleziona...</option>
                          {sortedRecipes.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                        </select>
                        <button onClick={() => { const n = [...editDish.recipes]; n.splice(idx, 1); setEditDish({...editDish, recipes: n}); }}
                          className="btn btn-secondary" style={{ width: 'auto', padding: '0.5rem', color: 'var(--danger)' }}><Trash2 size={16} /></button>
                      </div>
                    ))}
                    <button onClick={() => setEditDish({...editDish, recipes: [...editDish.recipes, '']})} className="btn" style={{ background: 'rgba(255,255,255,0.05)', marginTop: '0.5rem' }}>
                      <Plus size={16} /> Aggiungi Ricetta Costitutiva
                    </button>
                  </div>
                </div>

                {/* Assegna Ingredienti Extra */}
                <div style={{ flex: '1 1 300px', background: 'rgba(0,0,0,0.15)', padding: '1.5rem', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 1rem 0' }}>Ingredienti / Guarnizioni Extra</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {editDish.ingredients.map((ing, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '0.5rem' }}>
                        <input type="text" className="input-field" placeholder="Es. Olio EVO" style={{ flex: 2, paddingLeft: '0.5rem', fontSize: '0.9rem' }}
                          value={ing.name} onChange={e => { const n = [...editDish.ingredients]; n[idx].name = e.target.value; setEditDish({...editDish, ingredients: n}); }} />
                        <input type="text" className="input-field" placeholder="Qtà (qb)" style={{ flex: 1, paddingLeft: '0.5rem', fontSize: '0.9rem' }}
                          value={ing.quantity} onChange={e => { const n = [...editDish.ingredients]; n[idx].quantity = e.target.value; setEditDish({...editDish, ingredients: n}); }} />
                        <button onClick={() => { const n = [...editDish.ingredients]; n.splice(idx, 1); setEditDish({...editDish, ingredients: n}); }}
                          className="btn btn-secondary" style={{ width: 'auto', padding: '0.5rem', color: 'var(--danger)' }}><Trash2 size={16} /></button>
                      </div>
                    ))}
                    <button onClick={() => setEditDish({...editDish, ingredients: [...editDish.ingredients, { name: '', quantity: '' }]})} className="btn" style={{ background: 'rgba(255,255,255,0.05)', marginTop: '0.5rem' }}>
                      <Plus size={16} /> Aggiungi Extra
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <button onClick={openNewDish} className="btn btn-primary" style={{ marginBottom: '1.5rem', width: 'auto' }}>
                <Plus size={18} /> Aggiungi Nuovo Piatto
              </button>
              {dishes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <Info size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                  <p>In questa sezione puoi creare i piatti finiti che andranno nei Menu.</p>
                </div>
              ) : (
                <div className="responsive-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                  {dishes.map(d => (
                    <div key={d.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ margin: '0 0 0.3rem 0' }}>{d.name}</h3>
                          <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                            {CARTA_SECTIONS.find(c => c.value === d.category)?.label || d.category}
                          </span>
                        </div>
                        <strong style={{ color: 'var(--primary)' }}>{d.price || '-'}</strong>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem', fontWeight: 600 }}>Composto da:</div>
                        <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                          {d.recipes.map((r: any, i: number) => <li key={`r-${i}`}>📖 {r.recipe.title}</li>)}
                          {d.ingredients.map((ing: any, i: number) => <li key={`i-${i}`}>🌿 {ing.name} {ing.quantity && `(${ing.quantity})`}</li>)}
                        </ul>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        <button onClick={() => openEditDish(d)} className="btn btn-secondary" style={{ flex: 1, padding: '0.5rem' }}><Edit size={16} /> Modifica</button>
                        <button onClick={() => handleDeleteDish(d.id)} className="btn btn-secondary" style={{ width: 'auto', padding: '0.5rem', color: 'var(--danger)' }}><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* TAB MENU CARTA E DEGUSTAZIONE (solo se NON in PIATTI) */}
      {(activeTab === 'CARTA' || activeTab === 'DEGUSTAZIONE') && (
        editing ? (
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div className="input-group" style={{ margin: 0, flex: '1 1 300px' }}>
                <label className="input-label">Titolo</label>
                <input type="text" className="input-field" style={{ paddingLeft: '1rem' }} value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                <button onClick={handleSaveMenu} disabled={saving} className="btn btn-primary" style={{ width: 'auto', padding: '0.7rem 1.5rem' }}>
                  <Save size={18} /> {saving ? '...' : 'Salva'}
                </button>
                <button onClick={() => setEditing(false)} className="btn btn-secondary" style={{ width: 'auto', padding: '0.7rem' }}><X size={18} /></button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
              {editItems.map((item, idx) => (
                <div key={idx} className="responsive-menu-row" style={{ background: 'rgba(0,0,0,0.15)', padding: '0.7rem', borderRadius: '8px' }}>
                  <select className="input-field" style={{ flex: 2, paddingLeft: '0.5rem', fontSize: '0.9rem' }}
                    value={item.dishId}
                    onChange={(e) => selectDishForMenu(idx, e.target.value)}>
                    <option value="">Seleziona piatto finale...</option>
                    {(activeTab === 'CARTA' ? sortedDishes.filter(d => d.category === item.section) : sortedDishes).map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  <select className="input-field" style={{ flex: 1, paddingLeft: '0.5rem', fontSize: '0.85rem' }}
                    value={item.section} onChange={(e) => { const n = [...editItems]; n[idx].section = e.target.value; setEditItems(n); }}>
                    {sections.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <input type="text" className="input-field" style={{ width: '120px', paddingLeft: '0.5rem', fontSize: '0.9rem' }}
                    placeholder="Prezzo (DKK/€)" value={item.price} onChange={(e) => { const n = [...editItems]; n[idx].price = e.target.value; setEditItems(n); }} />
                  <button onClick={() => { const n = [...editItems]; n.splice(idx, 1); setEditItems(n); }}
                    className="btn btn-secondary" style={{ width: 'auto', padding: '0.5rem', color: 'var(--danger)' }}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>

            <button onClick={addMenuItem} className="btn btn-secondary" style={{ width: '100%' }}>
              <Plus size={18} /> Aggiungi Rigo
            </button>
          </div>
        ) : activeMenu ? (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <h2 className="text-gradient" style={{ fontSize: '2.2rem', margin: 0 }}>{activeMenu.title}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Ultimo aggiornamento: {new Date(activeMenu.updatedAt).toLocaleDateString('it-IT')}</p>
            </div>

            {activeTab === 'CARTA' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '700px', margin: '0 auto' }}>
                {CARTA_SECTIONS.map(section => {
                  const items = groupedItems[section.value];
                  if (!items?.length) return null;
                  return (
                    <div key={section.value}>
                      <h3 style={{ textAlign: 'center', fontSize: '1.3rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.8rem' }}>
                        {section.label}
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {items.map((item: any) => (
                          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 0' }}>
                            <span style={{ fontWeight: 500, fontSize: '1.05rem' }}>{item.dish?.name || 'Piatto non trovato'}</span>
                            {item.price && (
                              <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.1rem' }}>{item.price}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '700px', margin: '0 auto' }}>
                {DEGUSTAZIONE_SECTIONS.map(section => {
                  const items = groupedItems[section.value];
                  if (!items?.length) return null;
                  return (
                    <div key={section.value} className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        {section.label}
                      </div>
                      {items.map((item: any) => (
                        <div key={item.id} style={{ fontSize: '1.2rem', fontWeight: 500 }}>
                          {item.dish?.name || 'Piatto non trovato'}
                        </div>
                      ))}
                    </div>
                  );
                })}
                {activeMenu.items.length > 0 && (
                  <div style={{ textAlign: 'center', marginTop: '1rem', padding: '1rem', borderTop: '1px solid var(--border)' }}>
                    {activeMenu.items[0]?.price && (
                      <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.4rem' }}>
                        {activeMenu.items[0].price} a persona
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <ChefHat size={56} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <h3 style={{ color: 'var(--text-main)' }}>
              {activeTab === 'CARTA' ? 'Nessuna Carta creata' : 'Nessun Menu Degustazione'}
            </h3>
            <p>Clicca il pulsante "Crea" per comporre il tuo menu pescando dai Piatti disponibili.</p>
          </div>
        )
      )}
    </div>
  );
}
