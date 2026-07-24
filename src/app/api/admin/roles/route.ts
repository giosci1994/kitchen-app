import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { DEFAULT_PERMISSIONS, POSIZIONE_LABELS, POSIZIONE_TO_RUOLO, TUTTE_LE_RISORSE, TUTTE_LE_AZIONI, RISORSA_LABELS } from '@/lib/permissions';

async function checkSuperAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('kitchen_token')?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || !payload.userId) return null;
  const user = await prisma.user.findUnique({ where: { id: payload.userId as string }, select: { ruolo: true } });
  if (!user || user.ruolo !== 'SUPER_ADMIN') return null;
  return { userId: payload.userId as string, ruolo: user.ruolo };
}

// GET: Ritorna tutte le posizioni con i loro permessi attuali
export async function GET() {
  const admin = await checkSuperAdmin();
  if (!admin) return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });

  try {
    // Recupera eventuali permessi personalizzati dal DB
    const dbPermissions = await prisma.rolePermission.findMany();
    const dbMap: Record<string, any> = {};
    for (const rp of dbPermissions) {
      dbMap[rp.posizione] = JSON.parse(rp.permissions);
    }

    // Costruisci la risposta completa per ogni posizione
    const posizioni = Object.keys(POSIZIONE_LABELS).map(posizione => ({
      posizione,
      label: POSIZIONE_LABELS[posizione],
      livello: POSIZIONE_TO_RUOLO[posizione],
      permissions: dbMap[posizione] || DEFAULT_PERMISSIONS[posizione] || {},
      isCustom: !!dbMap[posizione]
    }));

    return NextResponse.json({
      posizioni,
      risorse: TUTTE_LE_RISORSE,
      azioni: TUTTE_LE_AZIONI,
      risorsaLabels: RISORSA_LABELS
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT: Aggiorna i permessi di una posizione
export async function PUT(req: Request) {
  const admin = await checkSuperAdmin();
  if (!admin) return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });

  try {
    const { posizione, permissions } = await req.json();

    if (!posizione || !permissions) {
      return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 });
    }

    // Upsert: crea o aggiorna il record
    const rolePermission = await prisma.rolePermission.upsert({
      where: { posizione },
      update: { permissions: JSON.stringify(permissions) },
      create: { posizione, permissions: JSON.stringify(permissions) }
    });

    // Log dell'operazione
    await prisma.auditLog.create({
      data: {
        userId: admin.userId as string,
        action: 'Modifica Permessi Ruolo',
        entity: 'System',
        details: `Permessi aggiornati per ${POSIZIONE_LABELS[posizione] || posizione}`
      }
    });

    return NextResponse.json({ success: true, rolePermission });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
