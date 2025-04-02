import { auth } from '@/lib/auth'; // Import the auth helper
import { NextResponse } from 'next/server';
// Removed: import { Role } from '@prisma/client';

// Define Role type locally based on your schema
type Role = "ADMIN" | "USER";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const { auth } = req; // Get session/token from the request object injected by the auth middleware

  // Authorization Check for Admin Routes
  if (pathname.startsWith('/admin')) {
    // If user is not logged in (auth is null) or not an ADMIN, redirect
    // Compare with string literal "ADMIN" instead of Role.ADMIN
    if (!auth || auth.user?.role !== "ADMIN") {
      console.log(
        `Unauthorized access attempt to ${pathname} by user ${
          auth?.user?.email ?? 'guest'
        }`
      );
      // Redirect non-admins trying to access /admin to the home page
      return NextResponse.redirect(new URL('/', req.url));
    }
    // Allow access if user is admin
    console.log(`Admin access granted to ${pathname} for user ${auth.user.email}`);
    return NextResponse.next(); // Explicitly allow admin access
  }

  // For all other routes covered by the matcher,
  // if the user is not authenticated, the `auth` middleware
  // will automatically redirect them to the signIn page defined in `lib/auth.ts`.
  // If they are authenticated, we allow them to proceed.
  console.log(`Authenticated access granted to ${pathname} for user ${auth?.user?.email ?? 'unknown'}`);
  return NextResponse.next();
});

// Configure middleware to match routes - Use the guide's recommended matcher
// Skip API routes, static files, public files, etc.
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)"
  ],
};
