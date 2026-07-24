import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId, logAudit } from '@/lib/audit';

export async function GET() {
  try {
    const ingredients = await prisma.ingredient.findMany({
      include: {
        warehouseStock: true
      },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(ingredients);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { ingredientId, quantityChange, exactQuantity } = body;
    
    let newStock = 0;
    
    const warehouse = await prisma.warehouse.findUnique({
      where: { ingredientId }
    });

    if (exactQuantity !== undefined) {
      newStock = Number(exactQuantity);
    } else {
      newStock = (warehouse?.stockQuantity || 0) + Number(quantityChange || 0);
      if (newStock < 0) newStock = 0;
    }

    const updated = await prisma.warehouse.upsert({
      where: { ingredientId },
      update: { stockQuantity: newStock },
      create: { ingredientId, stockQuantity: newStock }
    });

    // Recupera nome ingrediente per il log
    const ingredient = await prisma.ingredient.findUnique({ where: { id: ingredientId }, select: { name: true } });
    const userId = await getCurrentUserId();
    await logAudit(userId, `Aggiornata Giacenza: ${ingredient?.name || ingredientId}`, 'Magazzino', `Quantità: ${newStock}`);

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await prisma.warehouse.updateMany({
      data: { stockQuantity: 0 }
    });

    const userId = await getCurrentUserId();
    await logAudit(userId, 'Azzerato Magazzino', 'Magazzino', 'Tutte le giacenze azzerate');

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
