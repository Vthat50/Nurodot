import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if user has visited before
  const hasVisited = request.cookies.get('visited')

  // If accessing root path and haven't visited, show landing page
  if (request.nextUrl.pathname === '/' && !hasVisited) {
    const response = NextResponse.redirect(new URL('/landing', request.url))
    // Set cookie to mark as visited
    response.cookies.set('visited', 'true', { maxAge: 60 * 60 * 24 * 365 }) // 1 year
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/',
}
