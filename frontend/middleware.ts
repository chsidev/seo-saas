import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const { pathname } = request.nextUrl;

  // Get the auth token from cookies
  const token = request.cookies.get('auth-token')?.value;
  
  // Public routes that don't require authentication
  const publicRoutes = ['/', '/pricing', '/features', '/contact', '/about'];
  const authRoutes = ['/auth/login', '/auth/register', '/auth/reset-password', '/auth/verify-email', '/auth/verify'];
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.includes(pathname) || authRoutes.some(route => pathname.startsWith(route));
  
  // If user is not authenticated and trying to access protected route
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  // If user is authenticated and trying to access auth routes, redirect to dashboard
  if (token && authRoutes.some(route => pathname.startsWith(route)) &&
  !pathname.startsWith('/auth/verify-email') && !pathname.startsWith('/auth/verify')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Check if the request is for admin routes
  if (pathname.startsWith('/admin')) {
    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};