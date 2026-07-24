import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function GET(req: Request) {
  try {
    const jsonPath = path.join(process.cwd(), 'parsed_recipes.json');
    if (!fs.existsSync(jsonPath)) {
      return NextResponse.json({ error: 'Nessun file parsed_recipes.json trovato.' }, { status: 404 });
    }

    const recipes = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    // 1. Estrai e normalizza
    const uniqueIngredientsMap = new Map();
    for (const recipe of recipes) {
      for (const ing of recipe.ingredients) {
        if (!uniqueIngredientsMap.has(ing.normalizedName)) {
          uniqueIngredientsMap.set(ing.normalizedName, {
            name: ing.normalizedName,
            unit: ing.unit === 'q.s.' || ing.unit === 'pz' ? 'pz' : ing.unit,
          });
        }
      }
    }

    // 2. Upsert Ingrediente e Warehouse
    for (const [name, ingData] of uniqueIngredientsMap.entries()) {
      const ingredient = await prisma.ingredient.upsert({
        where: { name: name },
        update: {},
        create: {
          name: name,
          unit: ingData.unit,
          category: 'ALTRO',
        }
      });

      await prisma.warehouse.upsert({
        where: { ingredientId: ingredient.id },
        update: {},
        create: {
          ingredientId: ingredient.id,
          stockQuantity: 0
        }
      });
    }

    // 3. Inserimento Ricette
    let addedRecipes = 0;
    for (const recipe of recipes) {
      // Controlla se la ricetta esiste già
      const exist = await prisma.recipe.findFirst({ where: { title: recipe.title } });
      if (exist) continue;

      await prisma.recipe.create({
        data: {
          title: recipe.title,
          category: recipe.category,
          instructions: recipe.instructions,
          ingredients: {
            create: recipe.ingredients.map((ing: any) => ({
              name: ing.normalizedName,
              baseQuantity: Number(ing.baseQuantity) || 0,
              unit: ing.unit
            }))
          }
        }
      });
      addedRecipes++;
    }

    return NextResponse.json({ 
      success: true, 
      message: `Importati ${uniqueIngredientsMap.size} ingredienti unici nel magazzino e ${addedRecipes} nuove ricette.` 
    });

  } catch (err: any) {
    console.error('Import Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
