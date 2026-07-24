import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId, logAudit } from '@/lib/audit';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const recipe = await prisma.recipe.findUnique({
      where: { id: params.id },
      include: { ingredients: true }
    });
    if (!recipe) return NextResponse.json({ error: 'Non trovata' }, { status: 404 });
    return NextResponse.json(recipe);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const id = params.id;
    const body = await req.json();
    const { title, category, instructions, imageUrl, ingredients } = body;

    // Elimina vecchi ingredient
    await prisma.recipeIngredient.deleteMany({ where: { recipeId: id } });

    const updated = await prisma.recipe.update({
      where: { id },
      data: {
        title,
        category: category || 'ALTRO',
        instructions: instructions || '',
        imageUrl: imageUrl || null,
        ingredients: {
          create: ingredients?.map((ing: any) => ({
            name: ing.name,
            unit: ing.unit || 'g',
            baseQuantity: Number(ing.baseQuantity),
          })) || []
        }
      },
      include: { ingredients: true }
    });

    const userId = await getCurrentUserId();
    await logAudit(userId, `Modificata Ricetta: ${title}`, 'Ricetta', `ID: ${id}`);

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    // Recupera il nome prima di eliminare
    const recipe = await prisma.recipe.findUnique({ where: { id: params.id }, select: { title: true } });
    await prisma.recipe.delete({ where: { id: params.id } });

    const userId = await getCurrentUserId();
    await logAudit(userId, `Eliminata Ricetta: ${recipe?.title || params.id}`, 'Ricetta');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
