// 2. middleware.ts
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

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
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}