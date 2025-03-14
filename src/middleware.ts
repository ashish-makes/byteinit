/* eslint-disable @typescript-eslint/no-unused-vars */
// 2. middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from "@/auth"

export async function middleware(request: NextRequest) {
  const session = await auth();
  
  // Skip middleware for certain paths
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/auth/complete-profile')
  ) {
    return NextResponse.next();
  }
  
  // Check if the user is logged in and has a placeholder email
  if (
    session?.user?.email && 
    typeof session.user.email === 'string' &&
    session.user.email.includes("placeholder.com")
  ) {
    console.log("Redirecting user with placeholder email to complete profile");
    // Redirect to the complete profile page
    const completeProfileUrl = new URL("/auth/complete-profile", request.url);
    return NextResponse.redirect(completeProfileUrl);
  }
  
  // Continue with the request
  return NextResponse.next();
}

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  // Define routes with their access rules
  const routes = {
    publicOnly: [
      '/auth/login',
      '/auth/register',
      '/auth/verify',
      '/auth/verify-email',
      '/auth/verify-success'
    ],
    protected: [
      '/dashboard',
      '/dashboard/resources/new'
    ],
    public: [
      '/',
      '/about',
      '/contact'
      // Add other public routes here
    ]
  }

  // Helper function to check if path starts with any of the routes
  const pathStartsWith = (paths: string[]) => 
    paths.some(route => pathname.startsWith(route))

  // Check route access
  if (isLoggedIn) {
    // Redirect authenticated users away from auth pages
    if (pathStartsWith(routes.publicOnly)) {
      console.log("Authenticated user redirected from auth page to dashboard")
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  } else {
    // Redirect unauthenticated users away from protected pages
    if (pathStartsWith(routes.protected)) {
      console.log("Unauthenticated user redirected to login")
      const loginUrl = new URL('/auth/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Allow access to all other routes
  return NextResponse.next()
})

// Keep your existing config
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}