import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Lista utenti attivi
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, nome: true, cognome: true, ruolo: true },
      orderBy: { nome: 'asc' }
    });
    return NextResponse.json(users);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
