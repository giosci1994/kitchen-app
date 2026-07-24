import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('kitchen_token')?.value;
    if (!token) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
    }
    const currentUser = await prisma.user.findUnique({ where: { id: payload.userId as string }, select: { ruolo: true } });
    if (!currentUser || currentUser.ruolo !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
    }

    // Incrementa sessionVersion per tutti gli utenti 
    await prisma.user.updateMany({
      data: { sessionVersion: { increment: 1 } }
    });

    // Registra nel log delle operazioni
    await prisma.auditLog.create({
      data: {
        userId: payload.userId as string,
        action: 'Force Global Logout',
        entity: 'System',
        details: 'Terminated all active sessions across the platform immediately.'
      }
    });

    return NextResponse.json({ message: 'Logout globale eseguito con successo.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
