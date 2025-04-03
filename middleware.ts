import { withAuth, NextRequestWithAuth } from 'next-auth/middleware'; // Import v4 middleware helper
import { NextResponse } from 'next/server';

// Define Role type locally based on your schema
type Role = "ADMIN" | "USER";

// Define the middleware logic as a separate function
function middleware(req: NextRequestWithAuth) {
  const { pathname } = req.nextUrl;
  const token = req.nextauth.token; // Access token via req.nextauth.token in v4

  // Authorization Check for Admin Routes
  if (pathname.startsWith('/admin')) {
    // If user is not logged in (token is null) or not an ADMIN, redirect
    // Access role from the token (ensure it's added in callbacks.jwt)
    if (!token || (token as any).role !== "ADMIN") {
      console.log(
        `Unauthorized access attempt to ${pathname} by user ${
          token?.email ?? 'guest'
        }`
      );
      // Redirect non-admins trying to access /admin to the home page
      return NextResponse.redirect(new URL('/', req.url));
    }
    // Allow access if user is admin
    console.log(`Admin access granted to ${pathname} for user ${token.email}`);
    return NextResponse.next(); // Explicitly allow admin access
  }

  // For non-admin routes, withAuth handles the basic authentication check
  // (redirects to login if not authenticated). If authenticated, allow access.
  console.log(`Authenticated access granted to ${pathname} for user ${token?.email ?? 'unknown'}`);
  return NextResponse.next();
}

// Export the middleware wrapped with withAuth
export default withAuth(
  // Pass the custom middleware function
  middleware,
  // Configuration for withAuth (e.g., pages, callbacks)
  {
    callbacks: {
      // This authorized callback determines if the user is authorized *at all*
      // before the main middleware function runs.
      // Returning true means the main middleware function will execute.
      // Returning false redirects to the login page.
      authorized: ({ token }) => {
        console.log("[DEBUG] Middleware Authorized Callback - Token:", token); // Log token
        const isAuthorized = !!token; // Restore the actual token check
        console.log("[DEBUG] Middleware Authorized Callback - Result:", isAuthorized); // Log result
        return isAuthorized; // Allow access if token exists
      },
    },
    pages: {
      signIn: '/auth/signin', // Specify custom sign-in page
      // error: '/auth/error', // Optional: specify custom error page
    },
  }
);

// Configure middleware to match routes - Use the guide's recommended matcher
// Skip API routes, static files, public files, etc.
// NOTE: The matcher needs to cover routes where you want *any* auth check,
// including the admin routes checked inside the middleware function.
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)"
  ],
};
