import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from '@auth/core/jwt'; // Use getToken to manually fetch token
import { Role } from '@prisma/client';

// Define the expected shape of the token (including role)
// Role is added in the jwt callback, so it might be present
interface TokenWithRole {
  role?: Role; // Keep optional as it's added customly
  email?: string | null; // Add email for logging
  [key: string]: any; // Allow other JWT properties
}

const secret = process.env.AUTH_SECRET;
const publicPaths = ['/auth/signin', '/auth/signup', '/auth/forgot-password']; // Paths accessible without login
const staticFileExtensions = /\.(ico|png|jpg|jpeg|gif|svg|css|js|map|webmanifest)$/i; // Regex for common static file extensions

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow requests to public paths, API routes, static files, etc.
  if (
    publicPaths.some((path) => pathname.startsWith(path)) ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    staticFileExtensions.test(pathname) // Check if it looks like a static file path
  ) {
    return NextResponse.next();
  }

  // Fetch the token
  if (!secret) {
     console.error("AUTH_SECRET environment variable is not set!");
     // Handle appropriately - maybe redirect to an error page or allow access with warning
     // For now, let's prevent access if secret is missing for security
     return new NextResponse("Internal Server Error: Auth secret missing", { status: 500 });
  }
  const token = (await getToken({ req: request, secret })) as TokenWithRole | null;

  // --- Authentication Check ---
  // If no token and path is not public, redirect to signin
  if (!token) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname); // Add callbackUrl
    console.log(`No token found for path ${pathname}, redirecting to signin.`);
    return NextResponse.redirect(signInUrl);
  }

  // --- Authorization Check (Role-based) ---
  // Check if the user is trying to access the admin area
  if (pathname.startsWith('/admin')) {
    // Check if the user has the ADMIN role
    if (token.role !== Role.ADMIN) {
      console.log(`Unauthorized access attempt to ${pathname} by user ${token?.email ?? 'guest'}`);
      // Redirect non-admins to the home page
      return NextResponse.redirect(new URL('/', request.url));
    }
    // Allow access if user is admin
    console.log(`Admin access granted to ${pathname} for user ${token?.email}`);
    return NextResponse.next();
  }

  // Allow access to other protected routes if authenticated
  console.log(`Authenticated access granted to ${pathname} for user ${token?.email}`);
  return NextResponse.next();
}

// Configure which paths the middleware should run on.
// This matcher needs to cover all paths *except* the ones explicitly allowed above.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) - Handled in middleware logic
     * - _next/static (static files) - Handled in middleware logic
     * - _next/image (image optimization files) - Handled in middleware logic
     * - Files with extensions (e.g., favicon.ico, image.png) - Handled in middleware logic
     *
     * This simplified matcher covers most application routes.
     */
    '/((?!api|_next/static|_next/image|.*\\..*).*)',
    // Explicitly include root if needed, otherwise the above pattern covers it
     '/',
  ],
};
