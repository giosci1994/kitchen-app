"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Plus, ChefHat } from 'lucide-react';

const CATEGORIES = [
  { value: 'ALL', label: 'Tutte' },
  { value: 'ANTIPASTO', label: '🥗 Antipasti' },
  { value: 'PRIMO', label: '🍝 Primi' },
  { value: 'SECONDO', label: '🥩 Secondi' },
  { value: 'DESSERT', label: '🍰 Dessert' },
  { value: 'CONTORNO', label: '🥬 Contorni' },
  { value: 'BASE', label: '🥣 Basi' },
  { value: 'ALTRO', label: '📋 Altro' },
];

export default function RicettePage() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState('USER');

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => { if (d.ruolo) setUserRole(d.ruolo); });
    fetch('/api/recipes')
      .then(r => r.json())
      .then(data => { setRecipes(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  const filtered = recipes.filter(r => {
    const matchesCat = activeFilter === 'ALL' || r.category === activeFilter;
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="animate-fade-in">
      <div className="responsive-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1>Ricettario</h1>
          <p>Gestisci le tue ricette, calcola le proporzioni e organizza le preparazioni.</p>
        </div>
        {userRole !== 'USER' && (
          <Link href="/dashboard/ricette/nuova" className="btn btn-primary" style={{ textDecoration: 'none', width: 'auto' }}>
            <Plus size={20} /> Nuova Ricetta
          </Link>
        )}
      </div>

      {/* Filtri Categoria e Ricerca */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        <div className="input-group" style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="search" 
            className="input-field" 
            placeholder="Cerca ricetta per titolo..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-lg)' }}>
          {CATEGORIES.map(c => (
            <button key={c.value} onClick={() => setActiveFilter(c.value)}
              style={{
                padding: '0.5rem 1rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 500,
                background: activeFilter === c.value ? 'var(--primary)' : 'transparent',
                color: activeFilter === c.value ? 'white' : 'var(--text-muted)',
                transition: 'all 0.2s'
              }}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Caricamento ricette...</div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <ChefHat size={56} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            {activeFilter === 'ALL' ? 'Il ricettario è vuoto' : 'Nessuna ricetta in questa categoria'}
          </h3>
          <p>Aggiungi la tua prima ricetta per iniziare a catalogare i tuoi piatti.</p>
        </div>
      ) : (
        <div className="responsive-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
          {filtered.map(r => {
            const cat = CATEGORIES.find(c => c.value === r.category);
            return (
              <Link href={`/dashboard/ricette/${r.id}`} key={r.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="glass-panel" style={{
                  overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer',
                  height: '100%', display: 'flex', flexDirection: 'column'
                }}>
                  <div style={{
                    background: r.imageUrl ? `url(${r.imageUrl}) center/cover` : 'var(--border)',
                    height: '180px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
                  }}>
                    {!r.imageUrl && <ChefHat size={48} style={{ opacity: 0.2 }} />}
                    {cat && cat.value !== 'ALL' && (
                      <span style={{
                        position: 'absolute', top: '0.8rem', right: '0.8rem',
                        padding: '0.3rem 0.7rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600,
                        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', color: 'white'
                      }}>
                        {cat.label}
                      </span>
                    )}
                  </div>
                  <div style={{ padding: '1.2rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h3 style={{ marginBottom: '0.4rem', fontSize: '1.2rem' }}>{r.title}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {r.ingredients?.length || 0} ingredienti · {new Date(r.createdAt).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
