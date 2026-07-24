import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId, logAudit } from '@/lib/audit';

export async function GET() {
  try {
    const lists = await prisma.prepList.findMany({
      orderBy: { date: 'desc' },
      include: {
        members: { include: { user: { select: { id: true, nome: true, cognome: true } } } },
        tasks: {
          where: { parentTaskId: null },
          include: {
            subTasks: {
              orderBy: { createdAt: 'asc' },
              include: { assignedTo: { select: { id: true, nome: true, cognome: true } } }
            },
            assignedTo: { select: { id: true, nome: true, cognome: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    return NextResponse.json(lists);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { title, date, isRecurring, recurringDay, memberIds } = await req.json();
    const list = await prisma.prepList.create({
      data: {
        title,
        date: date ? new Date(date) : new Date(),
        isRecurring: isRecurring || false,
        recurringDay: recurringDay !== undefined && recurringDay !== null ? Number(recurringDay) : null,
        members: {
          create: (memberIds || []).map((userId: string) => ({ userId }))
        }
      },
      include: { members: { include: { user: { select: { id: true, nome: true, cognome: true } } } } }
    });

    const userId = await getCurrentUserId();
    await logAudit(userId, `Creata PrepList: ${title}`, 'PrepList', `${memberIds?.length || 0} membri`);

    return NextResponse.json(list, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
