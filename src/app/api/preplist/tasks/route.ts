import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId, logAudit } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    const { title, prepListId, parentTaskId, assignedToId } = await req.json();
    const task = await prisma.prepTask.create({
      data: { title, prepListId, parentTaskId: parentTaskId || null, assignedToId: assignedToId || null },
      include: { assignedTo: { select: { id: true, nome: true, cognome: true } } }
    });

    const userId = await getCurrentUserId();
    await logAudit(userId, `Creato Task: ${title}`, 'PrepList');

    return NextResponse.json(task, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { taskId, isCompleted, assignedToId } = await req.json();
    const data: any = {};
    if (isCompleted !== undefined) data.isCompleted = isCompleted;
    if (assignedToId !== undefined) data.assignedToId = assignedToId || null;

    const updated = await prisma.prepTask.update({
      where: { id: taskId },
      data,
      include: { assignedTo: { select: { id: true, nome: true, cognome: true } } }
    });

    const userId = await getCurrentUserId();
    const action = isCompleted !== undefined
      ? `Task ${isCompleted ? 'Completato' : 'Riaperto'}: ${updated.title}`
      : `Aggiornato Task: ${updated.title}`;
    await logAudit(userId, action, 'PrepList', `ID: ${taskId}`);

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const taskId = url.searchParams.get('taskId');
    if (!taskId) return NextResponse.json({ error: 'Manca taskId' }, { status: 400 });

    const task = await prisma.prepTask.findUnique({ where: { id: taskId }, select: { title: true } });
    await prisma.prepTask.delete({ where: { id: taskId } });

    const userId = await getCurrentUserId();
    await logAudit(userId, `Eliminato Task: ${task?.title || taskId}`, 'PrepList');

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
