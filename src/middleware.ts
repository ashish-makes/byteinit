import { NextResponse } from 'next/server'
import { auth } from "@/auth"
 
export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAccessingProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard')
  
  if (isAccessingProtectedRoute && !isLoggedIn) {
    return Response.redirect(new URL('/auth/login', req.url))
  }
  
  if (req.nextUrl.pathname === '/login' && isLoggedIn) {
    return Response.redirect(new URL('/dashboard', req.url))
  }
  
  return NextResponse.next()
})

// Optionally configure middleware matcher
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}