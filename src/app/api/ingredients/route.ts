import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId, logAudit } from '@/lib/audit';

// GET - Lista tutti gli ingredienti (per autocomplete e magazzino)
export async function GET() {
  try {
    const ingredients = await prisma.ingredient.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, unit: true, category: true }
    });
    return NextResponse.json(ingredients);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT - Aggiorna categoria di un ingrediente
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, category, unit, name } = body;
    const updated = await prisma.ingredient.update({
      where: { id },
      data: {
        ...(category && { category }),
        ...(unit && { unit }),
        ...(name && { name }),
      }
    });

    const userId = await getCurrentUserId();
    await logAudit(userId, `Modificato Ingrediente: ${updated.name}`, 'Ingrediente', `Categoria: ${updated.category}`);

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE - Elimina un ingrediente e la sua giacenza in magazzino
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID mancante' }, { status: 400 });

    const ingredient = await prisma.ingredient.findUnique({ where: { id }, select: { name: true } });
    await prisma.ingredient.delete({ where: { id } });

    const userId = await getCurrentUserId();
    await logAudit(userId, `Eliminato Ingrediente: ${ingredient?.name || id}`, 'Ingrediente');

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
