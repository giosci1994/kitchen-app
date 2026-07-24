import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { getUserPermissions } from '@/lib/permissions';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('kitchen_token')?.value;
    if (!token) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) return NextResponse.json({ error: 'Token non valido' }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: { id: true, nome: true, cognome: true, email: true, ruolo: true, posizione: true, sessionVersion: true }
    });

    if (!user) return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 });
    if (payload.sessionVersion !== undefined && user.sessionVersion !== payload.sessionVersion) {
      return NextResponse.json({ error: 'Sessione scaduta o invalidata. Effettua nuovamente il login.' }, { status: 401 });
    }

    // Carica i permessi effettivi per la posizione
    const permissions = await getUserPermissions(user.posizione);

    return NextResponse.json({ ...user, permissions });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
