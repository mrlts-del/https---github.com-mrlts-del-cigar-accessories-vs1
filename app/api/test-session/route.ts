import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth'; // Import the auth function

export async function GET(request: Request) { // Add request parameter if needed by auth()
  console.log("Attempting to get session in /api/test-session using auth()...");
  try {
    const session = await auth(); // Use the auth function
    if (session) {
      console.log("Session found:", JSON.stringify(session, null, 2));
      // Return the session directly as per the guide's example
      return NextResponse.json({ session });
    } else {
      console.log("No session found.");
      // Return standard "Not authenticated" message as per guide
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }
  } catch (error: any) {
    console.error("Error in /api/test-session:", error);
    // Keep existing error handling, but simplify message slightly
    return NextResponse.json({ message: "Internal server error fetching session.", error: error.message }, { status: 500 });
  }
}
