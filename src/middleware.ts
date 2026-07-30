import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Paths that require authentication
  const isApiProtected = pathname.startsWith('/api/posts') || 
                         pathname.startsWith('/api/upload') || 
                         pathname.startsWith('/api/about');
                         
  const isAdminPage = pathname.startsWith('/admin') && pathname !== '/admin/login';

  if (isApiProtected || isAdminPage) {
    const token = request.cookies.get('admin_token')?.value;

    if (token !== 'authenticated') {
      if (isApiProtected) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      } else {
        // Redirect to login page
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    }
  }

  // If trying to access login page while authenticated, redirect to admin dashboard
  if (pathname === '/admin/login') {
    const token = request.cookies.get('admin_token')?.value;
    if (token === 'authenticated') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
