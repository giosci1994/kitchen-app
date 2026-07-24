import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId, logAudit } from '@/lib/audit';

export async function DELETE(req: Request, props: { params: Promise<{ listId: string }> }) {
  try {
    const params = await props.params;
    const { listId } = params;
    const list = await prisma.prepList.findUnique({ where: { id: listId }, select: { title: true } });
    await prisma.prepList.delete({ where: { id: listId } });

    const userId = await getCurrentUserId();
    await logAudit(userId, `Eliminata PrepList: ${list?.title || listId}`, 'PrepList');

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
