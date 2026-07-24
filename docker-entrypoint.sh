#!/bin/sh
set -e

echo "⏳ Sincronizzazione schema database..."
./node_modules/.bin/prisma db push --url "$DATABASE_URL" --schema prisma/schema.prisma
echo "✅ Database pronto!"

echo "🔄 Sincronizzazione posizioni utenti esistenti..."
node -e "
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect().then(async () => {
  await client.query(\"UPDATE \\\"User\\\" SET posizione='SUPER_ADMIN' WHERE ruolo='SUPER_ADMIN' AND posizione='COMMIS_CUCINA'\");
  await client.query(\"UPDATE \\\"User\\\" SET posizione='RESTAURANT_MANAGER' WHERE ruolo='ADMIN' AND posizione='COMMIS_CUCINA'\");
  console.log('✅ Posizioni sincronizzate');
  await client.end();
}).catch(e => { console.error('⚠️ Sync posizioni fallita:', e.message); process.exit(0); });
"

echo "🚀 Avvio Kitchen App..."
exec node server.js
