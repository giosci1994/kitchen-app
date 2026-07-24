import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId, logAudit } from '@/lib/audit';

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const body = await req.json();
    const { status } = body;

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: { status },
      include: { items: true }
    });

    const userId = await getCurrentUserId();
    await logAudit(userId, `Aggiornato Stato Ordine: ${status}`, 'Ordine', `ID: ${params.id}`);

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const order = await prisma.order.findUnique({ where: { id: params.id }, select: { title: true } });
    await prisma.order.delete({ where: { id: params.id } });

    const userId = await getCurrentUserId();
    await logAudit(userId, `Eliminato Ordine: ${order?.title || params.id}`, 'Ordine');

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
