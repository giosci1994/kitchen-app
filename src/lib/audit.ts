import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

/**
 * Estrae l'userId dal cookie JWT della request corrente.
 * Restituisce null se l'utente non è autenticato (soft-fail).
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('kitchen_token')?.value;
    if (!token) return null;

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) return null;

    return payload.userId as string;
  } catch {
    return null;
  }
}

/**
 * Registra un'operazione nell'AuditLog.
 * Se userId è null, il log viene saltato (nessun utente autenticato).
 * 
 * @param userId - ID dell'utente che ha eseguito l'operazione
 * @param action - Descrizione dell'azione (es. "Creata Ricetta: Carbonara")
 * @param entity - Entità coinvolta (es. "Ricetta", "Piatto", "Menu", "Utente", "Sistema")
 * @param details - Dettagli aggiuntivi opzionali
 */
export async function logAudit(
  userId: string | null,
  action: string,
  entity: string,
  details?: string
): Promise<void> {
  if (!userId) return; // Nessun utente autenticato, skip
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        details: details || null,
      },
    });
  } catch (err) {
    // Non bloccare l'operazione principale se il log fallisce
    console.error('[AUDIT LOG ERROR]', err);
  }
}

/**
 * Crea un messaggio di sistema visibile nel Message Center admin.
 * 
 * @param title - Titolo del messaggio
 * @param content - Contenuto del messaggio  
 * @param type - Tipo: "ALERT" (arancione) o "INFO" (blu)
 */
export async function createSystemMessage(
  title: string,
  content: string,
  type: 'ALERT' | 'INFO' = 'INFO'
): Promise<void> {
  try {
    await prisma.systemMessage.create({
      data: {
        title,
        content,
        type,
        isRead: false,
      },
    });
  } catch (err) {
    // Non bloccare l'operazione principale se la creazione del messaggio fallisce
    console.error('[SYSTEM MESSAGE ERROR]', err);
  }
}
