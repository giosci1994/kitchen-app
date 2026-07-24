import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId, logAudit } from '@/lib/audit';

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id } = params;
    const { title, date, description, type } = await req.json();
    
    if (!title || !date) return NextResponse.json({ error: 'Titolo e data obbligatori' }, { status: 400 });

    const updated = await prisma.event.update({
      where: { id },
      data: {
        title,
        date: new Date(date),
        description: description || null,
        type: type || 'EVENT'
      }
    });

    const userId = await getCurrentUserId();
    await logAudit(userId, `Modificato Evento: ${title}`, 'Evento', `ID: ${id}`);

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id } = params;
    const event = await prisma.event.findUnique({ where: { id }, select: { title: true } });
    await prisma.event.delete({ where: { id } });

    const userId = await getCurrentUserId();
    await logAudit(userId, `Eliminato Evento: ${event?.title || id}`, 'Evento');

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
