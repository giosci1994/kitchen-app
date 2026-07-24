"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ChefHat, Package, Calendar, CheckSquare, Settings, LogOut, UtensilsCrossed, Menu, X, User, Shield } from 'lucide-react';

const POSIZIONE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  OWNER: 'Proprietario',
  RESTAURANT_MANAGER: 'Direttore',
  EXECUTIVE_CHEF: 'Executive Chef',
  SOUS_CHEF: 'Sous Chef',
  FB_MANAGER: 'F&B Manager',
  ECONOMO: 'Economo',
  CHEF_DE_PARTIE: 'Chef de Partie',
  PASTICCIERE: 'Pasticciere',
  COMMIS_CUCINA: 'Commis di Cucina',
  LAVAPIATTI: 'Lavapiatti',
  MAITRE: 'Maître',
  SOMMELIER: 'Sommelier',
  CAMERIERE: 'Cameriere',
  HOST: 'Host',
  MAGAZZINIERE: 'Magazziniere',
  RESPONSABILE_ACQUISTI: 'Resp. Acquisti',
  CONTABILE: 'Contabile',
  FATTORINO: 'Fattorino',
  MANUTENTORE: 'Manutentore',
};

export default function Sidebar({ user }: { user: any }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [permissions, setPermissions] = useState<Record<string, string[]> | null>(null);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => { if (d.permissions) setPermissions(d.permissions); });
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const can = (risorsa: string) => {
    if (user.ruolo === 'SUPER_ADMIN') return true;
    if (!permissions) return user.ruolo === 'ADMIN'; // Fallback fino al caricamento
    return permissions[risorsa] && permissions[risorsa].length > 0;
  };

  // Voci di menu condizionate ai permessi
  const menuItems: { name: string; icon: any; path: string; exact?: boolean; risorsa?: string }[] = [
    { name: 'Dashboard', icon: Settings, path: '/dashboard', exact: true },
  ];

  if (can('ricette'))   menuItems.push({ name: 'Ricettario', icon: ChefHat, path: '/dashboard/ricette', risorsa: 'ricette' });
  if (can('menu'))      menuItems.push({ name: 'Menu', icon: UtensilsCrossed, path: '/dashboard/menu', risorsa: 'menu' });
  if (can('magazzino')) menuItems.push({ name: 'Inventario', icon: Package, path: '/dashboard/magazzino', risorsa: 'magazzino' });
  if (can('eventi'))    menuItems.push({ name: 'Eventi', icon: Calendar, path: '/dashboard/eventi', risorsa: 'eventi' });
  if (can('preplist'))  menuItems.push({ name: 'Prep List', icon: CheckSquare, path: '/dashboard/preplist', risorsa: 'preplist' });

  if (can('utenti') || can('admin_console')) {
    menuItems.push({ name: 'Amministrazione', icon: Shield, path: '/dashboard/admin' });
  }

  const posizioneLabel = POSIZIONE_LABELS[user.posizione] || user.posizione || user.ruolo;

  return (
    <>
      <button 
        className="hamburger-btn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div 
        className={`mobile-overlay ${isOpen ? 'open' : ''}`} 
        onClick={() => setIsOpen(false)}
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`} style={{ 
        width: '250px', 
        background: 'var(--surface)', 
        borderRight: '1px solid var(--border)', 
        display: 'flex', 
        flexDirection: 'column', 
        position: 'fixed', 
        height: '100dvh',
        padding: '1.5rem 0',
        zIndex: 100,
        top: 0,
        left: 0,
        overflowY: 'auto'
      }}>
        <div style={{ padding: '0 1.5rem', marginBottom: '2rem' }}>
          <h2 className="text-gradient" style={{ margin: 0 }}>Kitchen.</h2>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Ciao, {user.nome} <br/><span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{posizioneLabel}</span>
          </div>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0 1rem', overflowY: 'auto' }}>
          {menuItems.map((item) => {
            const isActive = item.exact 
              ? pathname === item.path 
              : pathname.startsWith(item.path) && item.path !== '/dashboard';
              
            return (
              <Link 
                key={item.path} 
                href={item.path}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.8rem 1rem', 
                  borderRadius: 'var(--radius-md)', textDecoration: 'none', 
                  color: isActive ? 'white' : 'var(--text-muted)',
                  background: isActive ? 'linear-gradient(135deg, var(--primary), #ff3036)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'var(--transition)'
                }}
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '0 1rem', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <Link href="/dashboard/profile" style={{ textDecoration: 'none' }}>
            <button 
              className="btn btn-secondary" 
              style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', border: 'none', background: 'transparent' }}
            >
              <User size={20} /> Profilo
            </button>
          </Link>
          <button 
            onClick={handleLogout}
            className="btn btn-secondary" 
            style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', border: 'none', background: 'transparent' }}
          >
            <LogOut size={20} /> Esci
          </button>
        </div>
      </aside>
    </>
  );
}

