import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

async function checkAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('kitchen_token')?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || !payload.userId) return null;
  const user = await prisma.user.findUnique({ where: { id: payload.userId as string }, select: { ruolo: true } });
  if (!user || (user.ruolo !== 'ADMIN' && user.ruolo !== 'SUPER_ADMIN')) return null;
  return payload.userId as string;
}

// PUT - Modifica avviso
export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const adminId = await checkAdmin();
    if (!adminId) return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });

    const params = await props.params;
    const { title, content, priority, isPinned } = await req.json();

    const updated = await prisma.announcement.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(priority !== undefined && { priority }),
        ...(isPinned !== undefined && { isPinned }),
      },
      include: {
        author: { select: { nome: true, cognome: true, posizione: true } }
      }
    });

    await logAudit(adminId, `Modificato Avviso: ${updated.title}`, 'Bacheca');

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE - Elimina avviso
export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const adminId = await checkAdmin();
    if (!adminId) return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });

    const params = await props.params;
    const announcement = await prisma.announcement.findUnique({ where: { id: params.id }, select: { title: true } });
    await prisma.announcement.delete({ where: { id: params.id } });

    await logAudit(adminId, `Eliminato Avviso: ${announcement?.title || params.id}`, 'Bacheca');

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
