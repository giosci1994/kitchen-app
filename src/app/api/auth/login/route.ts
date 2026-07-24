import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { logAudit, createSystemMessage } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, rememberMe } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e password sono obbligatori' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({ error: 'Credenziali non valide' }, { status: 401 });
    }

    if (user.status !== 'ACTIVE') {
      if (user.status === 'PENDING') {
        return NextResponse.json({ error: 'Account in attesa di approvazione da un amministratore' }, { status: 403 });
      }
      return NextResponse.json({ error: 'Account sospeso' }, { status: 403 });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return NextResponse.json({ error: 'Credenziali non valide' }, { status: 401 });
    }

    // Aggiorna ultimo accesso
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Registra nel Message Center e nell'AuditLog
    await createSystemMessage(
      'Accesso Utente',
      `${user.nome} ${user.cognome} ha effettuato l'accesso.`,
      'INFO'
    );
    await logAudit(user.id, 'Login', 'Utente', `${user.nome} ${user.cognome} (${user.email})`);

    const token = await signToken({ userId: user.id, email: user.email, ruolo: user.ruolo, sessionVersion: user.sessionVersion });

    // Imposta la durata del cookie (30 giorni se rememberMe è selezionato, altrimenti 24 ore)
    const maxAgeSeconds = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24;

    // Set cookie
    (await cookies()).set({
      name: 'kitchen_token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: false, // true solo se usi HTTPS
      maxAge: maxAgeSeconds,
    });

    return NextResponse.json({ 
      message: 'Login effettuato', 
      user: { id: user.id, email: user.email, nome: user.nome, cognome: user.cognome, ruolo: user.ruolo } 
    });

  } catch (error: any) {
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}
