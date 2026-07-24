import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

// GET - Lista messaggi chat (polling incrementale con ?after=)
export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('kitchen_token')?.value;
    if (!token) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });

    const url = new URL(req.url);
    const after = url.searchParams.get('after');

    const where = after ? { createdAt: { gt: new Date(after) } } : {};

    const messages = await prisma.chatMessage.findMany({
      where,
      take: after ? 100 : 50,
      orderBy: { createdAt: 'asc' },
      include: {
        author: { select: { id: true, nome: true, cognome: true, posizione: true } }
      }
    });

    return NextResponse.json(messages);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST - Invia messaggio chat
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('kitchen_token')?.value;
    if (!token) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });

    const { content } = await req.json();
    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Messaggio vuoto' }, { status: 400 });
    }

    const message = await prisma.chatMessage.create({
      data: {
        content: content.trim(),
        authorId: payload.userId as string,
      },
      include: {
        author: { select: { id: true, nome: true, cognome: true, posizione: true } }
      }
    });

    return NextResponse.json(message, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
