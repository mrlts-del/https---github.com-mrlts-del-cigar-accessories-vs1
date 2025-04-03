import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"; // Import v4 getServerSession
import { authOptions } from "@/lib/auth-options"; // Import v4 authOptions

export async function GET(request: Request) {
  console.log("Attempting to get session in /api/test-session using getServerSession...");
  try {
    // Use v4 getServerSession pattern
    const session = await getServerSession(authOptions);
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
