import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createSystemMessage } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nome, cognome, email, password, acceptedTerms } = body;

    if (!nome || !cognome || !email || !password) {
      return NextResponse.json({ error: 'Tutti i campi sono obbligatori' }, { status: 400 });
    }

    if (!acceptedTerms) {
      return NextResponse.json({ error: 'Devi accettare i Termini di Servizio e la Privacy Policy' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'La password deve avere almeno 6 caratteri' }, { status: 400 });
    }

    const emailLower = email.toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: emailLower },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email già registrata' }, { status: 400 });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Il primo utente che si registra diventerà automaticamente SUPER_ADMIN
    const userCount = await prisma.user.count();
    const isFirstUser = userCount === 0;

    const user = await prisma.user.create({
      data: {
        nome,
        cognome,
        email: emailLower,
        passwordHash,
        ruolo: isFirstUser ? 'SUPER_ADMIN' : 'USER',
        posizione: isFirstUser ? 'SUPER_ADMIN' : 'COMMIS_CUCINA',
        status: isFirstUser ? 'ACTIVE' : 'PENDING',
        acceptedTermsAt: new Date()
      },
    });

    // Genera messaggio per il Message Center admin
    await createSystemMessage(
      'Nuova Registrazione',
      `${nome} ${cognome} (${emailLower}) si è registrato e ${isFirstUser ? 'è stato attivato come Super Admin' : 'attende approvazione'}.`,
      'ALERT'
    );

    return NextResponse.json({ 
      message: 'Registrazione completata', 
      user: { id: user.id, email: user.email, status: user.status, ruolo: user.ruolo } 
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ error: 'Errore durante la registrazione: ' + error.message }, { status: 500 });
  }
}
