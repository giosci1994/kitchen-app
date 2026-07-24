import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_please_change_in_production';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

export async function proxy(req: NextRequest) {
  const token = req.cookies.get('kitchen_token')?.value;
  const isAuthPage = req.nextUrl.pathname === '/';

  if (!token) {
    if (!isAuthPage) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { payload } = await jwtVerify(token, encodedSecret);
    
    if (isAuthPage) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  } catch (err) {
    if (!isAuthPage) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icons|sw\\.js|manifest|~offline).*)'],
};
