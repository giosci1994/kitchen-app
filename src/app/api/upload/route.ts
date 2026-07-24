import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'Nessun file caricato' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Crea un nome file univoco preservando l'estensione originale
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const publicUploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Assicurati che la cartella public/uploads esista
    try {
      await mkdir(publicUploadDir, { recursive: true });
    } catch (e: any) {
      if (e.code !== 'EEXIST') throw e;
    }

    const filePath = path.join(publicUploadDir, fileName);
    await writeFile(filePath, buffer);

    // Ritorna la URL relativa al file
    const imageUrl = `/uploads/${fileName}`;
    return NextResponse.json({ imageUrl });

  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: error.message || 'Errore durante l\'upload' }, { status: 500 });
  }
}
