import { NextResponse } from 'next/server';

// Proxy (antes "middleware"): se ejecuta antes de renderizar. Si no hay sesión,
// cualquier vista de la librería o del coworking redirige al login.
export function proxy(request) {
  const tieneSesion = request.cookies.has('nexus_session');
  if (tieneSesion) return NextResponse.next();

  const login = new URL('/login', request.url);
  login.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ['/libreria/:path*', '/coworking/:path*'],
};
