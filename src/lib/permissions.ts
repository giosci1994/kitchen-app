import { prisma } from './prisma';

// =============================================
// COSTANTI
// =============================================

export const TUTTE_LE_RISORSE = [
  'ricette', 'menu', 'magazzino', 'ordini', 'eventi', 'preplist', 'utenti', 'admin_console'
] as const;

export const TUTTE_LE_AZIONI = ['view', 'edit', 'delete'] as const;

export type Risorsa = typeof TUTTE_LE_RISORSE[number];
export type Azione = typeof TUTTE_LE_AZIONI[number];
export type PermissionMap = Record<string, string[]>;

// =============================================
// MAPPA POSIZIONE → LIVELLO DI ACCESSO (Role)
// =============================================

export const POSIZIONE_TO_RUOLO: Record<string, 'SUPER_ADMIN' | 'ADMIN' | 'USER'> = {
  SUPER_ADMIN:          'SUPER_ADMIN',
  OWNER:                'ADMIN',
  RESTAURANT_MANAGER:   'ADMIN',
  EXECUTIVE_CHEF:       'ADMIN',
  SOUS_CHEF:            'ADMIN',
  FB_MANAGER:           'ADMIN',
  ECONOMO:              'ADMIN',
  CHEF_DE_PARTIE:       'USER',
  PASTICCIERE:          'USER',
  COMMIS_CUCINA:        'USER',
  LAVAPIATTI:           'USER',
  MAITRE:               'USER',
  SOMMELIER:            'USER',
  CAMERIERE:            'USER',
  HOST:                 'USER',
  MAGAZZINIERE:         'USER',
  RESPONSABILE_ACQUISTI:'USER',
  CONTABILE:            'USER',
  FATTORINO:            'USER',
  MANUTENTORE:          'USER',
};

// =============================================
// NOMI ITALIANI LEGGIBILI
// =============================================

export const POSIZIONE_LABELS: Record<string, string> = {
  SUPER_ADMIN:          'Super Admin',
  OWNER:                'Proprietario',
  RESTAURANT_MANAGER:   'Direttore / Restaurant Manager',
  EXECUTIVE_CHEF:       'Executive Chef (Capo Cuoco)',
  SOUS_CHEF:            'Sous Chef (Vice Capo Cuoco)',
  FB_MANAGER:           'F&B Manager',
  ECONOMO:              'Economo / F&B Controller',
  CHEF_DE_PARTIE:       'Chef de Partie (Capo Partita)',
  PASTICCIERE:          'Pasticciere',
  COMMIS_CUCINA:        'Commis di Cucina (Aiuto Cuoco)',
  LAVAPIATTI:           'Lavapiatti / Plongeur',
  MAITRE:               'Maître (Capo Sala)',
  SOMMELIER:            'Sommelier',
  CAMERIERE:            'Cameriere (Chef de Rang)',
  HOST:                 'Host / Accoglienza',
  MAGAZZINIERE:         'Magazziniere',
  RESPONSABILE_ACQUISTI:'Responsabile Acquisti',
  CONTABILE:            'Contabile / Amministrazione',
  FATTORINO:            'Fattorino / Rider',
  MANUTENTORE:          'Manutentore / Tecnico',
};

export const RISORSA_LABELS: Record<string, string> = {
  ricette:        'Ricettario',
  menu:           'Menu',
  magazzino:      'Magazzino',
  ordini:         'Ordini',
  eventi:         'Eventi',
  preplist:       'Prep List',
  utenti:         'Utenti',
  admin_console:  'Console Admin',
};

// =============================================
// PERMESSI DI DEFAULT PER POSIZIONE
// =============================================

const FULL = ['view', 'edit', 'delete'];
const VE   = ['view', 'edit'];
const V    = ['view'];
const NONE: string[] = [];

export const DEFAULT_PERMISSIONS: Record<string, PermissionMap> = {
  SUPER_ADMIN: {
    ricette: FULL, menu: FULL, magazzino: FULL, ordini: FULL,
    eventi: FULL, preplist: FULL, utenti: FULL, admin_console: FULL
  },
  OWNER: {
    ricette: FULL, menu: FULL, magazzino: FULL, ordini: FULL,
    eventi: FULL, preplist: FULL, utenti: FULL, admin_console: FULL
  },
  RESTAURANT_MANAGER: {
    ricette: FULL, menu: FULL, magazzino: V, ordini: FULL,
    eventi: FULL, preplist: V, utenti: VE, admin_console: V
  },
  EXECUTIVE_CHEF: {
    ricette: FULL, menu: FULL, magazzino: FULL, ordini: FULL,
    eventi: FULL, preplist: FULL, utenti: V, admin_console: NONE
  },
  SOUS_CHEF: {
    ricette: FULL, menu: VE, magazzino: VE, ordini: V,
    eventi: VE, preplist: FULL, utenti: NONE, admin_console: NONE
  },
  FB_MANAGER: {
    ricette: VE, menu: FULL, magazzino: FULL, ordini: FULL,
    eventi: V, preplist: V, utenti: NONE, admin_console: NONE
  },
  ECONOMO: {
    ricette: V, menu: V, magazzino: FULL, ordini: FULL,
    eventi: NONE, preplist: NONE, utenti: NONE, admin_console: NONE
  },
  CHEF_DE_PARTIE: {
    ricette: VE, menu: V, magazzino: V, ordini: NONE,
    eventi: V, preplist: VE, utenti: NONE, admin_console: NONE
  },
  PASTICCIERE: {
    ricette: VE, menu: V, magazzino: V, ordini: NONE,
    eventi: V, preplist: VE, utenti: NONE, admin_console: NONE
  },
  COMMIS_CUCINA: {
    ricette: V, menu: V, magazzino: V, ordini: NONE,
    eventi: V, preplist: V, utenti: NONE, admin_console: NONE
  },
  LAVAPIATTI: {
    ricette: NONE, menu: NONE, magazzino: NONE, ordini: NONE,
    eventi: NONE, preplist: V, utenti: NONE, admin_console: NONE
  },
  MAITRE: {
    ricette: V, menu: V, magazzino: NONE, ordini: NONE,
    eventi: VE, preplist: NONE, utenti: NONE, admin_console: NONE
  },
  SOMMELIER: {
    ricette: V, menu: V, magazzino: V, ordini: V,
    eventi: NONE, preplist: NONE, utenti: NONE, admin_console: NONE
  },
  CAMERIERE: {
    ricette: V, menu: V, magazzino: NONE, ordini: NONE,
    eventi: VE, preplist: NONE, utenti: NONE, admin_console: NONE
  },
  HOST: {
    ricette: NONE, menu: NONE, magazzino: NONE, ordini: NONE,
    eventi: V, preplist: NONE, utenti: NONE, admin_console: NONE
  },
  MAGAZZINIERE: {
    ricette: NONE, menu: NONE, magazzino: FULL, ordini: VE,
    eventi: NONE, preplist: NONE, utenti: NONE, admin_console: NONE
  },
  RESPONSABILE_ACQUISTI: {
    ricette: NONE, menu: NONE, magazzino: VE, ordini: FULL,
    eventi: NONE, preplist: NONE, utenti: NONE, admin_console: NONE
  },
  CONTABILE: {
    ricette: NONE, menu: NONE, magazzino: V, ordini: V,
    eventi: NONE, preplist: NONE, utenti: NONE, admin_console: NONE
  },
  FATTORINO: {
    ricette: NONE, menu: NONE, magazzino: V, ordini: V,
    eventi: NONE, preplist: NONE, utenti: NONE, admin_console: NONE
  },
  MANUTENTORE: {
    ricette: NONE, menu: NONE, magazzino: V, ordini: NONE,
    eventi: NONE, preplist: NONE, utenti: NONE, admin_console: NONE
  },
};

// =============================================
// FUNZIONI DI ACCESSO AI PERMESSI
// =============================================

/**
 * Recupera i permessi effettivi per una posizione.
 * Prima controlla RolePermission dal DB, poi fallback ai default.
 */
export async function getUserPermissions(posizione: string): Promise<PermissionMap> {
  try {
    const rolePermission = await prisma.rolePermission.findUnique({
      where: { posizione: posizione as any }
    });

    if (rolePermission) {
      return JSON.parse(rolePermission.permissions);
    }
  } catch {
    // fallback ai default
  }

  return DEFAULT_PERMISSIONS[posizione] || DEFAULT_PERMISSIONS['COMMIS_CUCINA'];
}

/**
 * Controlla se una posizione ha un permesso specifico su una risorsa.
 */
export async function hasPermission(posizione: string, risorsa: Risorsa, azione: Azione): Promise<boolean> {
  if (posizione === 'SUPER_ADMIN') return true;
  
  const permissions = await getUserPermissions(posizione);
  const risorsaPermissions = permissions[risorsa];
  
  if (!risorsaPermissions) return false;
  return risorsaPermissions.includes(azione);
}

/**
 * Recupera il livello di accesso (ruolo) dalla posizione.
 */
export function getRuoloFromPosizione(posizione: string): 'SUPER_ADMIN' | 'ADMIN' | 'USER' {
  return POSIZIONE_TO_RUOLO[posizione] || 'USER';
}
