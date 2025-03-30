import { NextResponse } from 'next/server';
import getServerSession from 'next-auth'; // Use default import
import { authOptions } from '@/lib/auth'; // Import authOptions from lib

export async function GET() {
  console.log("Attempting to get session in /api/test-session...");
  try {
    const session = await getServerSession(authOptions);
    if (session) {
      console.log("Session found:", JSON.stringify(session, null, 2));
      return NextResponse.json({ success: true, session });
    } else {
      console.log("No session found.");
      return NextResponse.json({ success: false, message: "No session found." }, { status: 401 });
    }
  } catch (error: any) {
    console.error("Error in /api/test-session:", error);
    return NextResponse.json({ success: false, message: "Internal server error fetching session.", error: error.message }, { status: 500 });
  }
}
