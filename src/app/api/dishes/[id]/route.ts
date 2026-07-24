import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId, logAudit } from '@/lib/audit';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    const dish = await prisma.dish.findUnique({
      where: { id: resolvedParams.id },
      include: {
        recipes: {
          include: { recipe: true }
        },
        ingredients: true
      }
    });
    if (!dish) return NextResponse.json({ error: 'Piatto non trovato' }, { status: 404 });
    return NextResponse.json(dish);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    const body = await req.json();
    const { name, category, price, recipes, ingredients } = body;

    // Aggiorniamo Dish e ricostruiamo (delete+create) le relazioni
    const dish = await prisma.dish.update({
      where: { id: resolvedParams.id },
      data: {
        name,
        category,
        price,
        recipes: {
          deleteMany: {},
          create: recipes.map((rId: string) => ({ recipeId: rId }))
        },
        ingredients: {
          deleteMany: {},
          create: ingredients.map((ing: any) => ({ name: ing.name, quantity: ing.quantity }))
        }
      },
      include: {
        recipes: { include: { recipe: true } },
        ingredients: true
      }
    });

    const userId = await getCurrentUserId();
    await logAudit(userId, `Modificato Piatto: ${name}`, 'Piatto', `ID: ${resolvedParams.id}`);

    return NextResponse.json(dish);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    const dish = await prisma.dish.findUnique({ where: { id: resolvedParams.id }, select: { name: true } });
    await prisma.dish.delete({ where: { id: resolvedParams.id } });

    const userId = await getCurrentUserId();
    await logAudit(userId, `Eliminato Piatto: ${dish?.name || resolvedParams.id}`, 'Piatto');

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
