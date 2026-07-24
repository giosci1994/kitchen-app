import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId, logAudit } from '@/lib/audit';

// GET - Lista tutti gli ordini
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { date: 'desc' }
    });
    return NextResponse.json(orders);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST - Crea un nuovo ordine
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, date, notes, items } = body;

    const order = await prisma.order.create({
      data: {
        title: title || 'Ordine Spesa',
        date: new Date(date),
        notes: notes || null,
        status: 'INVIATO',
        items: {
          create: items?.map((item: any) => ({
            name: item.name,
            unit: item.unit,
            category: item.category || 'ALTRO',
            quantity: Number(item.quantity)
          })) || []
        }
      },
      include: { items: true }
    });

    const userId = await getCurrentUserId();
    await logAudit(userId, `Creato Ordine: ${title || 'Ordine Spesa'}`, 'Ordine', `${items?.length || 0} articoli`);

    return NextResponse.json(order, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
