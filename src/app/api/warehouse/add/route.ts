import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Crea un nuovo ingrediente con giacenza iniziale
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, unit, category, stockQuantity } = body;

    if (!name?.trim()) return NextResponse.json({ error: 'Nome obbligatorio' }, { status: 400 });

    // Verifica se esiste già 
    const existing = await prisma.ingredient.findUnique({ where: { name: name.trim() } });
    if (existing) return NextResponse.json({ error: 'Ingrediente già esistente' }, { status: 409 });

    const ingredient = await prisma.ingredient.create({
      data: {
        name: name.trim(),
        unit: unit || 'pz',
        category: category || 'ALTRO',
        warehouseStock: {
          create: { stockQuantity: Number(stockQuantity) || 0 }
        }
      },
      include: { warehouseStock: true }
    });

    return NextResponse.json(ingredient, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
