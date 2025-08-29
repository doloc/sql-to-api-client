import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect specific routes
  const protectedPaths = ['/api-configs'];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get('auth_token')?.value;
  const exp = request.cookies.get('auth_exp')?.value;
  const isExpired = exp ? Number(exp) * 1000 <= Date.now() : true;

  if (!token || isExpired) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api-configs/:path*'],
};


