import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId, logAudit } from '@/lib/audit';

export async function GET() {
  try {
    const dishes = await prisma.dish.findMany({
      include: {
        recipes: {
          include: {
            recipe: { select: { id: true, title: true } }
          }
        },
        ingredients: true
      },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(dishes);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, category, price, recipes, ingredients } = body;

    const dish = await prisma.dish.create({
      data: {
        name,
        category,
        price,
        recipes: {
          create: recipes.map((rId: string) => ({ recipeId: rId }))
        },
        ingredients: {
          create: ingredients.map((ing: any) => ({ name: ing.name, quantity: ing.quantity }))
        }
      },
      include: {
        recipes: { include: { recipe: true } },
        ingredients: true
      }
    });

    const userId = await getCurrentUserId();
    await logAudit(userId, `Creato Piatto: ${name}`, 'Piatto', `Categoria: ${category || 'N/A'}`);

    return NextResponse.json(dish);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
