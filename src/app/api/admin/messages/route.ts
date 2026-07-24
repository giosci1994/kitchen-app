import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('kitchen_token')?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload || !payload.userId) return null;

  const currentUser = await prisma.user.findUnique({ where: { id: payload.userId as string }, select: { ruolo: true } });
  if (!currentUser || (currentUser.ruolo !== 'SUPER_ADMIN' && currentUser.ruolo !== 'ADMIN')) return null;

  return payload.userId as string;
}

export async function GET() {
  try {
    const userId = await checkAdminAuth();
    if (!userId) return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });

    const messages = await prisma.systemMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return NextResponse.json(messages);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH - Segna un messaggio come letto
export async function PATCH(req: Request) {
  try {
    const userId = await checkAdminAuth();
    if (!userId) return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });

    const { messageId, markAllRead } = await req.json();

    if (markAllRead) {
      // Segna tutti come letti
      await prisma.systemMessage.updateMany({
        where: { isRead: false },
        data: { isRead: true }
      });
      return NextResponse.json({ success: true, message: 'Tutti i messaggi segnati come letti' });
    }

    if (!messageId) {
      return NextResponse.json({ error: 'messageId mancante' }, { status: 400 });
    }

    const updated = await prisma.systemMessage.update({
      where: { id: messageId },
      data: { isRead: true }
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
