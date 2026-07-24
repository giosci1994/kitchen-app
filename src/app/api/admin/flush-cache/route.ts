import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('kitchen_token')?.value;
    if (!token) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
    }
    const currentUser = await prisma.user.findUnique({ where: { id: payload.userId as string }, select: { ruolo: true } });
    if (!currentUser || currentUser.ruolo !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
    }

    // Esempio: svuotiamo la cache del magazzino rimettendo tutto a zero (se desiderato)
    // Nel mockup dice "Clear all real-time stock counts to force manual recount sync"
    await prisma.warehouse.updateMany({
      data: { stockQuantity: 0 }
    });

    // Registra nel log delle operazioni
    await prisma.auditLog.create({
      data: {
        userId: payload.userId as string,
        action: 'Flush Inventory Cache',
        entity: 'Inventory',
        details: 'Cleared all stock data to force manual recount.'
      }
    });

    return NextResponse.json({ message: 'Dati di magazzino azzerati.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
