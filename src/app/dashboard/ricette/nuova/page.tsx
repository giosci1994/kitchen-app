"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ArrowLeft, Save, Search } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
  { value: 'ANTIPASTO', label: '🥗 Antipasto' },
  { value: 'PRIMO', label: '🍝 Primo' },
  { value: 'SECONDO', label: '🥩 Secondo' },
  { value: 'DESSERT', label: '🍰 Dessert' },
  { value: 'CONTORNO', label: '🥬 Contorno' },
  { value: 'BASE', label: '🥣 Basi' },
  { value: 'ALTRO', label: '📋 Altro' },
];

export default function NuovaRicetta() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'ALTRO',
    instructions: '',
    imageUrl: '',
  });
  const [ingredients, setIngredients] = useState<{ name: string; baseQuantity: string; unit: string }[]>([]);
  const [allIngredients, setAllIngredients] = useState<{ id: string; name: string; unit: string }[]>([]);
  const [suggestions, setSuggestions] = useState<{ [key: number]: string[] }>({});

  useEffect(() => {
    fetch('/api/ingredients').then(r => r.json()).then(data => {
      setAllIngredients(Array.isArray(data) ? data : []);
    });
  }, []);

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', baseQuantity: '', unit: 'g' }]);
  };

  const handleRemoveIngredient = (index: number) => {
    const n = [...ingredients]; n.splice(index, 1); setIngredients(n);
    const s = { ...suggestions }; delete s[index]; setSuggestions(s);
  };

  const handleIngredientChange = (index: number, field: string, value: string) => {
    const n = [...ingredients];
    (n[index] as any)[field] = value;
    
    if (field === 'name') {
      const match = allIngredients.find(i => i.name.toLowerCase() === value.toLowerCase());
      if (match) {
        n[index].unit = match.unit;
        setSuggestions({ ...suggestions, [index]: [] });
      } else if (value.length >= 1) {
        const filtered = allIngredients.filter(i => i.name.toLowerCase().includes(value.toLowerCase())).map(i => i.name).slice(0, 5);
        setSuggestions({ ...suggestions, [index]: filtered });
      } else {
        setSuggestions({ ...suggestions, [index]: [] });
      }
    }
    setIngredients(n);
  };

  const selectSuggestion = (index: number, name: string) => {
    const n = [...ingredients];
    n[index].name = name;
    const match = allIngredients.find(i => i.name === name);
    if (match) n[index].unit = match.unit;
    setIngredients(n);
    setSuggestions({ ...suggestions, [index]: [] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) { alert("Il titolo è obbligatorio"); return; }
    for (const ing of ingredients) {
      if (!ing.name || !ing.baseQuantity) { alert("Completa tutti i campi degli ingredienti"); return; }
    }
    setLoading(true);
    try {
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, ingredients })
      });
      if (res.ok) { router.push('/dashboard/ricette'); }
      else { const error = await res.json(); alert("Errore: " + error.error); }
    } catch { alert("Errore di rete"); }
    finally { setLoading(false); }
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
        setFormData(prev => ({ ...prev, imageUrl: d.imageUrl }));
      } else {
        alert("Errore upload: " + d.error);
      }
    } catch {
      alert("Impossibile caricare immagine");
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link href="/dashboard/ricette" className="btn btn-secondary" style={{ padding: '0.6rem', width: 'auto' }}>
          <ArrowLeft size={20} />
        </Link>
        <h1 style={{ margin: 0 }}>Nuova Ricetta</h1>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="input-group" style={{ flex: '2 1 250px' }}>
            <label className="input-label">Nome della Ricetta</label>
            <input type="text" className="input-field" style={{ paddingLeft: '1rem' }}
              placeholder="Es. Spaghetti alla Carbonara"
              value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
          </div>
          <div className="input-group" style={{ flex: '1 1 180px' }}>
            <label className="input-label">Categoria</label>
            <select className="input-field" style={{ paddingLeft: '1rem', cursor: 'pointer' }}
              value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Immagine (Upload o URL)</label>
          <div className="responsive-flex-col" style={{ alignItems: 'center' }}>
            <input type="text" className="input-field" style={{ paddingLeft: '1rem', flex: 1 }}
              placeholder="https://... oppure /uploads/foto.jpg"
              value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} />
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
          {formData.imageUrl && (
            <div style={{ marginTop: '0.5rem', width: '100px', height: '60px', background: `url(${formData.imageUrl}) center/cover`, borderRadius: '4px', border: '1px solid var(--border)' }} />
          )}
        </div>

        <div style={{ margin: '2rem 0', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>Ingredienti (Dose base x1)</h3>
            <button type="button" onClick={handleAddIngredient} className="btn" style={{ background: 'rgba(255,255,255,0.1)', width: 'auto', padding: '0.5rem 1rem' }}>
              <Plus size={16} /> Aggiungi
            </button>
          </div>

          {ingredients.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>Nessun ingrediente aggiunto</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {ingredients.map((ing, index) => (
                <div key={index} className="responsive-form-row" style={{ position: 'relative' }}>
                  <div style={{ flex: 2, position: 'relative' }}>
                    <div style={{ position: 'relative' }}>
                      <Search size={14} style={{ position: 'absolute', left: '0.8rem', top: '1rem', opacity: 0.4 }} />
                      <input type="text" className="input-field" style={{ paddingLeft: '2.2rem' }}
                        placeholder="Cerca o scrivi ingrediente"
                        value={ing.name}
                        onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                        onBlur={() => setTimeout(() => setSuggestions({ ...suggestions, [index]: [] }), 200)}
                      />
                    </div>
                    {suggestions[index]?.length > 0 && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'rgba(20,20,30,0.98)', border: '1px solid var(--border)', borderRadius: '8px', zIndex: 50, overflow: 'hidden', marginTop: '2px' }}>
                        {suggestions[index].map(s => (
                          <div key={s} onClick={() => selectSuggestion(index, s)}
                            style={{ padding: '0.7rem 1rem', cursor: 'pointer', fontSize: '0.95rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                            onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}>
                            {s}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <input type="number" className="input-field" style={{ paddingLeft: '1rem', flex: 1 }}
                    placeholder="Qtà" value={ing.baseQuantity}
                    onChange={(e) => handleIngredientChange(index, 'baseQuantity', e.target.value)} />
                  <select className="input-field" style={{ paddingLeft: '0.5rem', flex: 1 }}
                    value={ing.unit} onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}>
                    <option value="g">grammi (g)</option>
                    <option value="kg">kg</option>
                    <option value="ml">ml</option>
                    <option value="l">litri (l)</option>
                    <option value="pz">pezzi</option>
                    <option value="box">box</option>
                    <option value="cartone">cartone</option>
                    <option value="cassa">cassa</option>
                    <option value="cassetta">cassetta</option>
                    <option value="bottiglia">bottiglia</option>
                    <option value="latta">latta</option>
                    <option value="sacco">sacco</option>
                    <option value="qb">q.b.</option>
                  </select>
                  <button type="button" onClick={() => handleRemoveIngredient(index)} className="btn btn-secondary" style={{ width: 'auto', padding: '0.8rem', color: 'var(--danger)', borderColor: 'rgba(255, 59, 48, 0.3)' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="input-group" style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          <label className="input-label">Procedimento</label>
          <textarea className="input-field" style={{ paddingLeft: '1rem', minHeight: '150px', resize: 'vertical' }}
            placeholder="Descrivi i passaggi della preparazione..."
            value={formData.instructions} onChange={(e) => setFormData({...formData, instructions: e.target.value})} />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
          <Save size={20} /> {loading ? 'Salvataggio...' : 'Salva Ricetta'}
        </button>
      </form>
    </div>
  );
}
