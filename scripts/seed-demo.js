const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
const bcrypt = require('bcryptjs');

const connectionString = process.env.DATABASE_URL || 'postgresql://kitchen_user:kitchen_password@localhost:5432/kitchen_app?schema=public';
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Inizio popolamento dati demo per Kitchen App...');

  // Reset pulito
  await prisma.chatMessage.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.systemMessage.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menu.deleteMany();
  await prisma.dishIngredient.deleteMany();
  await prisma.dishRecipe.deleteMany();
  await prisma.dish.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.prepTask.deleteMany();
  await prisma.prepListUser.deleteMany();
  await prisma.prepList.deleteMany();
  await prisma.event.deleteMany();
  await prisma.recipeIngredient.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Utenti
  const chef = await prisma.user.create({
    data: {
      nome: 'Marco',
      cognome: 'Rossi',
      email: 'admin@kitchen.it',
      passwordHash,
      ruolo: 'SUPER_ADMIN',
      posizione: 'EXECUTIVE_CHEF',
      status: 'ACTIVE',
      acceptedTermsAt: new Date()
    }
  });

  const sousChef = await prisma.user.create({
    data: {
      nome: 'Giulia',
      cognome: 'Bianchi',
      email: 'souschef@kitchen.it',
      passwordHash,
      ruolo: 'ADMIN',
      posizione: 'SOUS_CHEF',
      status: 'ACTIVE',
      acceptedTermsAt: new Date()
    }
  });

  const commis = await prisma.user.create({
    data: {
      nome: 'Luca',
      cognome: 'Verdi',
      email: 'commis@kitchen.it',
      passwordHash,
      ruolo: 'USER',
      posizione: 'COMMIS_CUCINA',
      status: 'ACTIVE',
      acceptedTermsAt: new Date()
    }
  });

  const pasticciere = await prisma.user.create({
    data: {
      nome: 'Elena',
      cognome: 'Neri',
      email: 'pasticciere@kitchen.it',
      passwordHash,
      ruolo: 'USER',
      posizione: 'PASTICCIERE',
      status: 'ACTIVE',
      acceptedTermsAt: new Date()
    }
  });

  console.log('✅ Utenti creati (admin@kitchen.it / password123)');

  // 2. Ingredienti & Magazzino
  const ingredientsData = [
    { name: 'Farina 00 Tipo 1', unit: 'kg', category: 'FARINE', stock: 45.0 },
    { name: 'Olio Extravergine d\'Oliva Chianti DOP', unit: 'L', category: 'SECCHI', stock: 24.5 },
    { name: 'Mozzarella di Bufala Campana DOP', unit: 'kg', category: 'LATTICINI', stock: 12.0 },
    { name: 'Pomodori San Marzano DOP', unit: 'kg', category: 'VERDURE', stock: 35.0 },
    { name: 'Filetto di Chianina IGP', unit: 'kg', category: 'CARNI', stock: 18.5 },
    { name: 'Spigola Fresca del Tirreno', unit: 'kg', category: 'PESCI', stock: 8.0 },
    { name: 'Parmigiano Reggiano 30 Mesi', unit: 'kg', category: 'LATTICINI', stock: 15.0 },
    { name: 'Tartufo Nero Pregiato', unit: 'g', category: 'ALTRO', stock: 250.0 },
    { name: 'Uova Fresche Biologiche', unit: 'box', category: 'SECCHI', stock: 120.0 },
    { name: 'Zucchero Semolato', unit: 'kg', category: 'SECCHI', stock: 20.0 },
    { name: 'Panna Fresca 35%', unit: 'L', category: 'LATTICINI', stock: 10.0 },
    { name: 'Basilico Fresco Biologico', unit: 'kg', category: 'VERDURE', stock: 3.5 },
  ];

  const ingredientMap = {};
  for (const item of ingredientsData) {
    const ing = await prisma.ingredient.create({
      data: {
        name: item.name,
        unit: item.unit,
        category: item.category,
        warehouseStock: {
          create: { stockQuantity: item.stock }
        }
      }
    });
    ingredientMap[item.name] = ing;
  }

  console.log('✅ Ingredienti e Magazzino popolati');

  // 3. Ricette
  const r1 = await prisma.recipe.create({
    data: {
      title: 'Tagliolini al Tartufo Nero e Burro di Malga',
      category: 'PRIMO',
      instructions: '1. Impastare farina e tuorli d\'uovo fino a ottenere un panetto omogeneo. 2. Stendere la sfoglia sottile a mano e ricavare i tagliolini. 3. Sciogliere il burro di malga in padella a fuoco dolce. 4. Cuocere i tagliolini in abbondante acqua salata per 2 minuti, poi mantecare in padella. 5. Spolverare con Parmigiano 30 mesi e abbondante Tartufo Nero affettato a crudo.',
      ingredients: {
        create: [
          { name: 'Farina 00 Tipo 1', unit: 'g', baseQuantity: 100 },
          { name: 'Uova Fresche Biologiche', unit: 'pz', baseQuantity: 2 },
          { name: 'Tartufo Nero Pregiato', unit: 'g', baseQuantity: 15 },
          { name: 'Parmigiano Reggiano 30 Mesi', unit: 'g', baseQuantity: 20 }
        ]
      }
    }
  });

  const r2 = await prisma.recipe.create({
    data: {
      title: 'Filetto di Chianina al Chianti e Erbe Aromatiche',
      category: 'SECONDO',
      instructions: '1. Tamponare il filetto e massaggiarlo con olio EVO e sale maldon. 2. Rosolare a fuoco vivo su ghisa bollente 2 minuti per lato. 3. Sfumare con la riduzione di Chianti DOP. 4. Passare in forno a 180°C per 5 minuti fino al cuore rosé. 5. Far riposare 3 minuti prima del taglio.',
      ingredients: {
        create: [
          { name: 'Filetto di Chianina IGP', unit: 'g', baseQuantity: 220 },
          { name: 'Olio Extravergine d\'Oliva Chianti DOP', unit: 'ml', baseQuantity: 20 }
        ]
      }
    }
  });

  const r3 = await prisma.recipe.create({
    data: {
      title: 'Tiramisù Tradizionale al Mascarpone',
      category: 'DESSERT',
      instructions: '1. Montare i tuorli d\'uovo con lo zucchero fino a raddoppiare il volume. 2. Incorporare delicatamente la panna e il mascarpone. 3. Inzuppare i savoiardi nel caffè espresso senza zuccherarlo. 4. Comporre a strati e riposare in frigocella per almeno 4 ore.',
      ingredients: {
        create: [
          { name: 'Uova Fresche Biologiche', unit: 'pz', baseQuantity: 3 },
          { name: 'Zucchero Semolato', unit: 'g', baseQuantity: 80 },
          { name: 'Panna Fresca 35%', unit: 'ml', baseQuantity: 150 }
        ]
      }
    }
  });

  console.log('✅ Ricette Gourmet inserite');

  // 4. Piatti e Menù
  const dish1 = await prisma.dish.create({
    data: {
      name: 'Tagliolini al Tartufo Nero',
      category: 'PRIMO',
      description: 'Tagliolini fatti in casa con uova fresche, burro nocciola e tartufo nero uncinato fresco.',
      price: '24.00 €',
      recipes: { create: [{ recipeId: r1.id }] }
    }
  });

  const dish2 = await prisma.dish.create({
    data: {
      name: 'Filetto di Chianina al Chianti',
      category: 'SECONDO',
      description: 'Filetto di Chianina IGP scottato alla piastra, riduzione al Chianti Classico e patate soffici.',
      price: '32.00 €',
      recipes: { create: [{ recipeId: r2.id }] }
    }
  });

  const dish3 = await prisma.dish.create({
    data: {
      name: 'Tiramisù Artigianale',
      category: 'DESSERT',
      description: 'Tiramisù della casa monoporzione preparato al momento con caffè arabica selezionato.',
      price: '9.00 €',
      recipes: { create: [{ recipeId: r3.id }] }
    }
  });

  const menuCarta = await prisma.menu.create({
    data: {
      type: 'CARTA',
      title: 'Menù alla Carta Estate 2026',
      isActive: true,
      items: {
        create: [
          { dishId: dish1.id, section: 'PRIMO', price: '24.00 €', sortOrder: 1 },
          { dishId: dish2.id, section: 'SECONDO', price: '32.00 €', sortOrder: 2 },
          { dishId: dish3.id, section: 'DESSERT', price: '9.00 €', sortOrder: 3 }
        ]
      }
    }
  });

  console.log('✅ Piatti e Menù creati');

  // 5. Eventi
  const now = new Date();
  await prisma.event.create({
    data: {
      title: 'Banchetto Matrimonio VIP (120 coperti)',
      date: now,
      description: 'Servizio in Terrazza Panoramica. Inizio aperitivo ore 19:30. Uscita primi ore 20:45.',
      type: 'EVENT'
    }
  });

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  await prisma.event.create({
    data: {
      title: 'Serata Degustazione Vini & Tartufo',
      date: tomorrow,
      description: 'Degustazione abbinata con la cantina partner. 45 prenotazioni confermate.',
      type: 'MENU_DEGUSTAZIONE'
    }
  });

  console.log('✅ Eventi in calendario inseriti');

  // 6. Prep List & Task
  const prepList = await prisma.prepList.create({
    data: {
      title: 'Preparazioni Linea Cucina Pranzo & Cena',
      date: now,
      isRecurring: true,
      recurringDay: now.getDay(),
      members: {
        create: [
          { userId: sousChef.id },
          { userId: commis.id },
          { userId: pasticciere.id }
        ]
      },
      tasks: {
        create: [
          { title: 'Sfilettatura e abbattimento spigole fresche', isCompleted: true, assignedToId: sousChef.id },
          { title: 'Formatura e stesura tagliolini freschi all\'uovo', isCompleted: false, assignedToId: commis.id },
          { title: 'Preparazione riduzione di Chianti per i filetti', isCompleted: true, assignedToId: sousChef.id },
          { title: 'Montatura crema mascarpone e monoporzioni Tiramisù', isCompleted: false, assignedToId: pasticciere.id }
        ]
      }
    }
  });

  console.log('✅ Prep List e Task assegnati');

  // 7. Bacheca Avvisi
  await prisma.announcement.create({
    data: {
      title: '⚠️ Manutenzione Programmate Forni Rational',
      content: '<p>Lunedì mattina dalle ore 08:00 alle 11:00 il tecnico effettuerà la pulizia decalcificante e l\'aggiornamento software del forno triplo. Pianificare le cotture di conseguenza.</p>',
      priority: 'URGENT',
      isPinned: true,
      authorId: chef.id
    }
  });

  await prisma.announcement.create({
    data: {
      title: '🥩 Nuovo Fornitore Carne Chianina IGP',
      content: '<p>Da oggi la carne di Chianina viene fornita direttamente dall\'azienda agricola certificata. Verificare le etichette di tracciabilità prima dello stoccaggio in cella 1.</p>',
      priority: 'NORMAL',
      isPinned: false,
      authorId: sousChef.id
    }
  });

  // 8. Chat & Audit Logs
  await prisma.chatMessage.create({
    data: {
      content: 'Ciao a tutti! Il carico pesce è arrivato alle 7:30 ed è già stoccato nelle celle di raffreddamento.',
      authorId: sousChef.id
    }
  });

  await prisma.chatMessage.create({
    data: {
      content: 'Ottimo Giulia. Ho appena controllato la linea dei dolci, Tiramisù quasi pronti per il servizio di stasera.',
      authorId: pasticciere.id
    }
  });

  await prisma.auditLog.create({
    data: {
      userId: chef.id,
      action: 'System Seeded',
      entity: 'System',
      details: 'Database popolato con successo per la modalità Demo & Screenshot'
    }
  });

  console.log('🎉 POPOLAMENTO DATABASE COMPLETATO CON SUCCESSO!');
}

main()
  .catch((e) => {
    console.error('❌ Errore durante il popolamento:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
