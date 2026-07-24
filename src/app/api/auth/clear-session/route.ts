import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const res = NextResponse.redirect(new URL('/', req.url));
  res.cookies.delete('kitchen_token');
  return res;
}
