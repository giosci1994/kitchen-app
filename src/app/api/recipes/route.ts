import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId, logAudit } from '@/lib/audit';

export async function GET() {
  try {
    const recipes = await prisma.recipe.findMany({
      include: { ingredients: true },
      orderBy: { title: 'asc' }
    });
    return NextResponse.json(recipes);
  } catch (error: any) {
    return NextResponse.json({ error: 'Errore nel recupero ricette' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, category, instructions, imageUrl, ingredients } = body;

    if (!title) return NextResponse.json({ error: 'Titolo mancante' }, { status: 400 });

    const newRecipe = await prisma.recipe.create({
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
    await logAudit(userId, `Creata Ricetta: ${title}`, 'Ricetta', `Categoria: ${category || 'ALTRO'}`);

    return NextResponse.json(newRecipe, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

