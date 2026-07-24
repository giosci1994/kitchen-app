import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('kitchen_token')?.value;
    if (!token) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
    }
    const currentUser = await prisma.user.findUnique({ where: { id: payload.userId as string }, select: { ruolo: true } });
    if (!currentUser || (currentUser.ruolo !== 'SUPER_ADMIN' && currentUser.ruolo !== 'ADMIN')) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
    }

    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: { select: { nome: true, cognome: true } }
      }
    });

    return NextResponse.json(logs);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
