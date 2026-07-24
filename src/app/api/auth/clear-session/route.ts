import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = '/';
  const res = NextResponse.redirect(url);
  res.cookies.delete('kitchen_token');
  return res;
}
