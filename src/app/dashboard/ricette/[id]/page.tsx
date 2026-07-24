"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, Users, Save, X, Plus, Trash2 as Trash } from 'lucide-react';

const CATEGORIES = [
  { value: 'ANTIPASTO', label: '🥗 Antipasto' },
  { value: 'PRIMO', label: '🍝 Primo' },
  { value: 'SECONDO', label: '🥩 Secondo' },
  { value: 'DESSERT', label: '🍰 Dessert' },
  { value: 'CONTORNO', label: '🥬 Contorno' },
  { value: 'BASE', label: '🥣 Basi' },
  { value: 'ALTRO', label: '📋 Altro' },
];

const UNITS = ['g','kg','ml','l','pz','box','cartone','cassa','cassetta','bottiglia','latta','sacco','qb'];

export default function RecipeDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editData, setEditData] = useState({ title: '', category: 'ALTRO', instructions: '', imageUrl: '' });
  const [editIngredients, setEditIngredients] = useState<{ name: string; baseQuantity: string; unit: string }[]>([]);
  const [userRole, setUserRole] = useState('USER');

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => { if (d.ruolo) setUserRole(d.ruolo); });
    fetch(`/api/recipes/${resolvedParams.id}`)
      .then(r => r.json())
      .then(data => { setRecipe(data); setLoading(false); });
  }, [resolvedParams.id]);

  const startEdit = () => {
    setEditData({ title: recipe.title, category: recipe.category || 'ALTRO', instructions: recipe.instructions || '', imageUrl: recipe.imageUrl || '' });
    setEditIngredients(recipe.ingredients.map((item: any) => ({
      name: item.name,
      baseQuantity: String(item.baseQuantity),
      unit: item.unit
    })));
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/recipes/${resolvedParams.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editData, ingredients: editIngredients })
      });
      if (res.ok) { const updated = await res.json(); setRecipe(updated); setEditing(false); }
      else { const err = await res.json(); alert("Errore: " + err.error); }
    } catch { alert("Errore di rete"); }
    finally { setSaving(false); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const data = new FormData();
    data.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: data });
      const d = await res.json();
      if (res.ok) {
        setEditData(prev => ({ ...prev, imageUrl: d.imageUrl }));
      } else {
        alert("Errore upload: " + d.error);
      }
    } catch {
      alert("Impossibile caricare immagine");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Eliminare definitivamente la ricetta?')) return;
    await fetch(`/api/recipes/${resolvedParams.id}`, { method: 'DELETE' });
    router.push('/dashboard/ricette');
  };

  if (loading) return <div className="animate-fade-in" style={{ padding: '2rem' }}>Caricamento...</div>;
  if (!recipe || recipe.error) return <div className="animate-fade-in" style={{ padding: '2rem' }}>Ricetta non trovata.</div>;

  const catLabel = CATEGORIES.find(c => c.value === recipe.category)?.label || recipe.category;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', width: '100%' }}>
      <div className="responsive-header" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/dashboard/ricette" className="btn btn-secondary" style={{ padding: '0.6rem', width: 'auto' }}><ArrowLeft size={20} /></Link>
          <div>
            <h1 style={{ margin: 0, fontSize: '2.2rem' }}>{recipe.title}</h1>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{catLabel}</span>
          </div>
        </div>
        {userRole !== 'USER' && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {editing ? (
              <>
                <button onClick={handleSaveEdit} disabled={saving} className="btn btn-primary" style={{ width: 'auto', padding: '0.6rem 1.2rem' }}><Save size={18} /> {saving ? '...' : 'Salva'}</button>
                <button onClick={() => setEditing(false)} className="btn btn-secondary" style={{ width: 'auto', padding: '0.6rem' }}><X size={18} /></button>
              </>
            ) : (
              <>
                <button onClick={startEdit} className="btn btn-secondary" style={{ width: 'auto', padding: '0.6rem' }}><Edit size={18} /></button>
                <button onClick={handleDelete} className="btn btn-secondary" style={{ width: 'auto', padding: '0.6rem', color: 'var(--danger)', borderColor: 'rgba(255,59,48,0.3)' }}><Trash2 size={18} /></button>
              </>
            )}
          </div>
        )}
      </div>

      {editing ? (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <div className="input-group" style={{ flex: '2 1 250px', margin: 0 }}>
              <label className="input-label">Titolo</label>
              <input type="text" className="input-field" style={{ paddingLeft: '1rem' }} value={editData.title}
                onChange={(e) => setEditData({...editData, title: e.target.value})} />
            </div>
            <div className="input-group" style={{ flex: '1 1 180px', margin: 0 }}>
              <label className="input-label">Categoria</label>
              <select className="input-field" style={{ paddingLeft: '1rem' }} value={editData.category}
                onChange={(e) => setEditData({...editData, category: e.target.value})}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <div className="input-group" style={{ margin: '0 0 1.5rem 0' }}>
            <label className="input-label">Immagine (Upload o URL)</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input type="text" className="input-field" style={{ paddingLeft: '1rem', flex: 1 }} value={editData.imageUrl}
                placeholder="https://... oppure /uploads/..."
                onChange={(e) => setEditData({...editData, imageUrl: e.target.value})} />
              <div style={{ flex: 1, position: 'relative' }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="input-field" 
                  style={{ padding: '0.4rem 1rem', cursor: uploadingImage ? 'wait' : 'pointer', background: 'rgba(255,255,255,0.05)' }} 
                />
                {uploadingImage && <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: 'var(--primary)' }}>Caricamento...</span>}
              </div>
            </div>
            {editData.imageUrl && (
              <div style={{ marginTop: '0.5rem', width: '100px', height: '60px', background: `url(${editData.imageUrl}) center/cover`, borderRadius: '4px', border: '1px solid var(--border)' }} />
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Ingredienti</h3>
              <button type="button" onClick={() => setEditIngredients([...editIngredients, { name: '', baseQuantity: '', unit: 'g' }])}
                className="btn" style={{ background: 'rgba(255,255,255,0.1)', width: 'auto', padding: '0.5rem 1rem' }}>
                <Plus size={16} /> Aggiungi
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {editIngredients.map((ing, i) => (
                <div key={i} className="responsive-form-row" style={{ alignItems: 'center' }}>
                  <input type="text" className="input-field" style={{ paddingLeft: '1rem', flex: 2 }} placeholder="Es. uovo sodo"
                    value={ing.name} onChange={(e) => { const n = [...editIngredients]; n[i].name = e.target.value; setEditIngredients(n); }} />
                  <input type="number" className="input-field" style={{ paddingLeft: '1rem', flex: 1 }} placeholder="Qtà"
                    value={ing.baseQuantity} onChange={(e) => { const n = [...editIngredients]; n[i].baseQuantity = e.target.value; setEditIngredients(n); }} />
                  <select className="input-field" style={{ paddingLeft: '0.5rem', flex: 1 }} value={ing.unit}
                    onChange={(e) => { const n = [...editIngredients]; n[i].unit = e.target.value; setEditIngredients(n); }}>
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <button type="button" onClick={() => { const n = [...editIngredients]; n.splice(i, 1); setEditIngredients(n); }}
                    className="btn btn-secondary" style={{ width: 'auto', padding: '0.7rem', color: 'var(--danger)' }}>
                    <Trash size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="input-group" style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', margin: 0 }}>
            <label className="input-label">Procedimento</label>
            <textarea className="input-field" style={{ paddingLeft: '1rem', minHeight: '150px', resize: 'vertical' }}
              value={editData.instructions} onChange={(e) => setEditData({...editData, instructions: e.target.value})} />
          </div>
        </div>
      ) : (
        <div className="responsive-flex-col" style={{ gap: '2rem' }}>
          <div className="recipe-detail-left" style={{ flex: '1 1 350px' }}>
            {recipe.imageUrl && (
              <div style={{ width: '100%', height: '250px', background: `url(${recipe.imageUrl}) center/cover`, borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', boxShadow: 'var(--shadow-md)' }} />
            )}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0 }}>Ingredienti</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-full)' }}>
                  <Users size={16} color="var(--primary)" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>x</span>
                  <input type="number" min="0.5" step="0.5" value={multiplier} onChange={(e) => setMultiplier(Number(e.target.value) || 1)}
                    style={{ width: '50px', background: 'transparent', border: 'none', color: 'white', fontWeight: 700, fontSize: '1rem', outline: 'none', textAlign: 'center' }} />
                </div>
              </div>
              {recipe.ingredients.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Nessun ingrediente.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {recipe.ingredients.map((item: any) => (
                    <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
                      <span style={{ fontWeight: 500 }}>{item.name}</span>
                      <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>
                        {(item.baseQuantity * multiplier).toLocaleString('it-IT', { maximumFractionDigits: 2 })} {item.unit}
                      </strong>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="recipe-detail-right" style={{ flex: '2 1 400px' }}>
            <div className="glass-panel" style={{ padding: '2rem', height: '100%' }}>
              <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.5rem', margin: 0 }}>Procedimento</h3>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', fontSize: '1.05rem' }}>
                {recipe.instructions || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Nessun procedimento.</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
