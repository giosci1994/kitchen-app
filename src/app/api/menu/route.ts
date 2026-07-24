import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId, logAudit } from '@/lib/audit';

// GET - Lista tutti i menu
export async function GET() {
  try {
    const menus = await prisma.menu.findMany({
      include: { items: { include: { dish: true }, orderBy: { sortOrder: 'asc' } } },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(menus);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST - Crea o aggiorna un menu
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, title, items } = body;

    // Disattiva eventuali menu attivi dello stesso tipo
    await prisma.menu.updateMany({
      where: { type, isActive: true },
      data: { isActive: false }
    });

    const menu = await prisma.menu.create({
      data: {
        type,
        title: title || (type === 'CARTA' ? 'La Carta' : 'Menu Degustazione'),
        isActive: true,
        items: {
          create: items?.map((item: any, idx: number) => ({
            dishId: item.dishId || null,
            section: item.section,
            price: item.price ? String(item.price) : null,
            sortOrder: idx,
          })) || []
        }
      },
      include: { items: { include: { dish: true }, orderBy: { sortOrder: 'asc' } } }
    });

    const menuTitle = title || (type === 'CARTA' ? 'La Carta' : 'Menu Degustazione');
    const userId = await getCurrentUserId();
    await logAudit(userId, `Creato Menu: ${menuTitle}`, 'Menu', `Tipo: ${type}, ${items?.length || 0} elementi`);

    return NextResponse.json(menu, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
