import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import AdminClient from './AdminClient';

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('kitchen_token')?.value;
  if (!token) redirect('/');
  
  const payload = await verifyToken(token);
  if (!payload || !payload.userId) redirect('/');

  // Leggi il ruolo AGGIORNATO dal database, non dal token (potrebbe essere stale)
  const currentUser = await prisma.user.findUnique({
    where: { id: payload.userId as string },
    select: { ruolo: true, posizione: true }
  });

  if (!currentUser || (currentUser.ruolo !== 'ADMIN' && currentUser.ruolo !== 'SUPER_ADMIN')) {
    redirect('/dashboard');
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });
  
  // Recupera gli AuditLogs (ultimi 20)
  const logs = await prisma.auditLog.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { nome: true, cognome: true } }
    }
  });

  // Recupera i SystemMessage (ultimi 15)
  const messages = await prisma.systemMessage.findMany({
    take: 15,
    orderBy: { createdAt: 'desc' }
  });

  return (
    <AdminClient 
      initialUsers={users}
      initialLogs={logs}
      initialMessages={messages}
      currentUserRole={currentUser.ruolo}
      currentUserId={payload.userId as string}
    />
  );
}
