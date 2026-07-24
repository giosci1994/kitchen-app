import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import Sidebar from './Sidebar';
import ChatWidget from './ChatWidget';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('kitchen_token')?.value;
  
  if (!token) redirect('/');
  
  const payload = await verifyToken(token);
  if (!payload || !payload.userId) {
    cookieStore.delete('kitchen_token');
    redirect('/');
  }
  
  const user = await prisma.user.findUnique({
    where: { id: payload.userId as string },
    select: { id: true, nome: true, cognome: true, ruolo: true, posizione: true, status: true }
  });

  if (!user) {
    cookieStore.delete('kitchen_token');
    redirect('/');
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar user={user} />
      <main className="main-content">
        {children}
      </main>
      <ChatWidget currentUserId={user.id} />
    </div>
  );
}
