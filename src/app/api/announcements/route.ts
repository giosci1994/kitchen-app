import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId, logAudit } from '@/lib/audit';

// GET - Lista avvisi (tutti gli utenti autenticati)
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('kitchen_token')?.value;
    if (!token) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });

    const announcements = await prisma.announcement.findMany({
      take: 15,
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        author: { select: { nome: true, cognome: true, posizione: true } }
      }
    });

    return NextResponse.json(announcements);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST - Crea avviso (solo admin)
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('kitchen_token')?.value;
    if (!token) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });

    // Verifica ruolo admin
    const user = await prisma.user.findUnique({ where: { id: payload.userId as string }, select: { ruolo: true } });
    if (!user || (user.ruolo !== 'ADMIN' && user.ruolo !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Solo gli admin possono pubblicare avvisi' }, { status: 403 });
    }

    const { title, content, priority, isPinned } = await req.json();
    if (!title || !content) {
      return NextResponse.json({ error: 'Titolo e contenuto obbligatori' }, { status: 400 });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        priority: priority || 'NORMAL',
        isPinned: isPinned || false,
        authorId: payload.userId as string,
      },
      include: {
        author: { select: { nome: true, cognome: true, posizione: true } }
      }
    });

    await logAudit(payload.userId as string, `Pubblicato Avviso: ${title}`, 'Bacheca', `Priorità: ${priority || 'NORMAL'}`);

    return NextResponse.json(announcement, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
