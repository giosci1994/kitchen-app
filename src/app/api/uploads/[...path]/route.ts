import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const resolvedParams = await params;
    const filename = resolvedParams.path.join('/');
    
    // Sicurezza: previeni directory traversal
    if (filename.includes('..')) {
      return new NextResponse('Invalid filename', { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'public', 'uploads', filename);

    const buffer = await readFile(filePath);
    
    // Determina il content type in maniera base
    let mime = 'image/jpeg';
    if (filename.endsWith('.png')) mime = 'image/png';
    else if (filename.endsWith('.webp')) mime = 'image/webp';
    else if (filename.endsWith('.gif')) mime = 'image/gif';
    else if (filename.endsWith('.svg')) mime = 'image/svg+xml';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mime,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    return new NextResponse('File non trovato', { status: 404 });
  }
}
