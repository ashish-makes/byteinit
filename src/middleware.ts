import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export default auth((req) => {
  const isLoggedIn = !!req.auth; // Check if the user is authenticated
  const { pathname } = req.nextUrl; // Extract the pathname from the request URL

  // Define routes accessible only to logged-out users
  const loggedOutOnlyRoutes = ['/auth/login', '/auth/register', '/auth/verify', '/auth/verify-email', '/auth/verify-success'];

  // Define routes accessible only to logged-in users
  const protectedRoutes = ['/dashboard', '/dashboard/resources/new'];

  // Redirect logged-in users trying to access logged-out-only routes
  if (isLoggedIn && loggedOutOnlyRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Redirect logged-out users trying to access protected routes
  if (!isLoggedIn && protectedRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // Allow access if none of the conditions match
  return NextResponse.next();
});

// Middleware configuration: Exclude specific static assets and API routes
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
