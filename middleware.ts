import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Only apply to root path
  if (request.nextUrl.pathname !== '/') {
    return NextResponse.next()
  }

  // Check if user has visited before
  const hasVisited = request.cookies.get('visited')

  // If haven't visited, redirect to landing page
  if (!hasVisited) {
    return NextResponse.redirect(new URL('/landing', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|landing).*)'],
}
