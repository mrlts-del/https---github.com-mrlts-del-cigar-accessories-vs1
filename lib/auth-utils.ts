import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import getServerSession from 'next-auth';
import type { Session } from 'next-auth'; // Import augmented Session type

/**
 * Retrieves the ID of the currently authenticated user from the session.
 * @returns The user ID string or null if not authenticated.
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    // Fetch session using the defined authOptions and cast via unknown
    const session = (await getServerSession(authOptions)) as unknown as Session | null;

    // Safely access the user ID from the potentially augmented session type
    const userId = session?.user?.id;

    if (!userId) {
      // console.log('getCurrentUserId: No user ID found in session.');
      return null;
    }

    return userId;
  } catch (error) {
    console.error('Error fetching session in getCurrentUserId:', error);
    return null;
  }
}

// TODO: Add function to get full user object or specific roles if needed
