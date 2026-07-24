import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId, logAudit } from '@/lib/audit';

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const menu = await prisma.menu.findUnique({ where: { id: params.id }, select: { title: true, type: true } });
    await prisma.menu.delete({ where: { id: params.id } });

    const userId = await getCurrentUserId();
    await logAudit(userId, `Eliminato Menu: ${menu?.title || params.id}`, 'Menu', `Tipo: ${menu?.type || 'N/A'}`);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
