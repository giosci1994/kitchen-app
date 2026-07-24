import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId, logAudit } from '@/lib/audit';

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { date: 'asc' }
    });
    return NextResponse.json(events);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { title, date, description, type } = await req.json();
    if (!title || !date) return NextResponse.json({ error: 'Titolo e data obbligatori' }, { status: 400 });

    const newEvent = await prisma.event.create({
      data: {
        title,
        date: new Date(date),
        description: description || null,
        type: type || 'EVENT'
      }
    });

    const userId = await getCurrentUserId();
    await logAudit(userId, `Creato Evento: ${title}`, 'Evento', `Data: ${new Date(date).toLocaleDateString('it-IT')}, Tipo: ${type || 'EVENT'}`);

    return NextResponse.json(newEvent, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
