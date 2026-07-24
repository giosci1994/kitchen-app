import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { getRuoloFromPosizione } from '@/lib/permissions';
import { logAudit, createSystemMessage } from '@/lib/audit';

async function checkAdmin(): Promise<{ userId: string; ruolo: string } | null> {
  const token = (await cookies()).get('kitchen_token')?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || !payload.userId) return null;
  const user = await prisma.user.findUnique({ where: { id: payload.userId as string }, select: { ruolo: true } });
  if (!user || (user.ruolo !== 'ADMIN' && user.ruolo !== 'SUPER_ADMIN')) return null;
  return { userId: payload.userId as string, ruolo: user.ruolo };
}

export async function PUT(req: Request) {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });

  const { userId, action, value } = await req.json();

  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 });

  if (targetUser.ruolo === 'SUPER_ADMIN' && admin.ruolo !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Azione non consentita su Super Admin' }, { status: 403 });
  }

  try {
    let updatedUser;
    if (action === 'status') {
      updatedUser = await prisma.user.update({ where: { id: userId }, data: { status: value } });
      // Log e messaggio per cambio status
      const statusLabels: Record<string, string> = { ACTIVE: 'Approvato', SUSPENDED: 'Sospeso', PENDING: 'In Attesa' };
      const label = statusLabels[value] || value;
      await logAudit(admin.userId, `Utente ${label}: ${targetUser.nome} ${targetUser.cognome}`, 'Utente', `Status cambiato da ${targetUser.status} a ${value}`);
      await createSystemMessage(
        `Utente ${label}`,
        `${targetUser.nome} ${targetUser.cognome} (${targetUser.email}) è stato ${label.toLowerCase()}.`,
        value === 'SUSPENDED' ? 'ALERT' : 'INFO'
      );
    } else if (action === 'posizione') {
      const nuovoRuolo = getRuoloFromPosizione(value);
      if (value === 'SUPER_ADMIN' && admin.ruolo !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Solo i Super Admin possono designare altri Super Admin' }, { status: 403 });
      }
      updatedUser = await prisma.user.update({ 
        where: { id: userId }, 
        data: { posizione: value, ruolo: nuovoRuolo } 
      });
      await logAudit(admin.userId, `Cambio Posizione: ${targetUser.nome} ${targetUser.cognome}`, 'Utente', `Posizione: ${targetUser.posizione} → ${value}`);
    } else if (action === 'ruolo') {
      if (value === 'SUPER_ADMIN' && admin.ruolo !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Solo i Super Admin possono designare altri Super Admin' }, { status: 403 });
      }
      updatedUser = await prisma.user.update({ where: { id: userId }, data: { ruolo: value } });
      await logAudit(admin.userId, `Cambio Ruolo: ${targetUser.nome} ${targetUser.cognome}`, 'Utente', `Ruolo: ${targetUser.ruolo} → ${value}`);
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: 'Errore durante aggiornamento' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });

  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'ID mancante' }, { status: 400 });

  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 });

  if (targetUser.ruolo === 'SUPER_ADMIN' && admin.ruolo !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Azione non consentita su Super Admin' }, { status: 403 });
  }

  try {
    await prisma.user.delete({ where: { id: userId } });
    await logAudit(admin.userId, `Eliminato Utente: ${targetUser.nome} ${targetUser.cognome}`, 'Utente', `Email: ${targetUser.email}`);
    await createSystemMessage(
      'Utente Eliminato',
      `L'account di ${targetUser.nome} ${targetUser.cognome} (${targetUser.email}) è stato eliminato.`,
      'ALERT'
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Errore durante eliminazione' }, { status: 500 });
  }
}
