import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { logAudit } from '@/lib/audit';

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('kitchen_token')?.value;
    if (!token) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) return NextResponse.json({ error: 'Token invalido' }, { status: 401 });

    const body = await req.json();
    const { telefono, indirizzo, nome, cognome } = body;

    const updatedUser = await prisma.user.update({
      where: { id: payload.userId as string },
      data: {
        ...(telefono !== undefined && { telefono }),
        ...(indirizzo !== undefined && { indirizzo }),
        ...(nome !== undefined && { nome }),
        ...(cognome !== undefined && { cognome }),
      },
      select: { id: true, nome: true, cognome: true, email: true, telefono: true, indirizzo: true }
    });

    await logAudit(payload.userId as string, 'Aggiornato Profilo', 'Utente', `${updatedUser.nome} ${updatedUser.cognome}`);

    return NextResponse.json(updatedUser);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('kitchen_token')?.value;
    if (!token) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) return NextResponse.json({ error: 'Token invalido' }, { status: 401 });

    const body = await req.json();
    const { password } = body;
    
    if (!password || password.length < 6) return NextResponse.json({ error: 'Password troppo corta' }, { status: 400 });

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: payload.userId as string },
      data: { passwordHash }
    });

    await logAudit(payload.userId as string, 'Cambiata Password', 'Utente');

    return NextResponse.json({ message: 'Password aggiornata con successo' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
