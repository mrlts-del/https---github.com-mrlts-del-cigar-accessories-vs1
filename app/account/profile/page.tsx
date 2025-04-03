import React from 'react';
import { getServerSession } from "next-auth/next"; // Import v4 getServerSession
import { authOptions } from "@/lib/auth-options"; // Import v4 authOptions
import type { Session } from 'next-auth';
import { redirect } from 'next/navigation';
import { ProfileForm } from '@/components/account/profile-form'; // Import form
// Remove problematic User type import

export default async function ProfilePage() {
  // Use v4 getServerSession pattern
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/account/profile');
  }

  // We need to pass the user object to the form, excluding sensitive fields
  // The session object might not have all User fields, adjust as needed
  // or fetch the full user object from DB if necessary.
  // Use 'any' as a workaround for the User type resolution issue
  const userForForm: Omit<any, 'password' | 'emailVerified'> = {
     // Access user properties from v4 session object
     // Ensure the session callback in authOptions adds necessary fields like id and role
     id: session.user.id!, // Assuming id is added in session callback
     name: session.user.name ?? null,
     email: session.user.email ?? null,
     image: session.user.image ?? null,
     // Access role potentially added in session callback (might need type assertion)
     role: (session.user as any).role ?? 'USER', // Default to USER if role isn't found/added
     // Add default/null values for other non-sensitive User fields if ProfileForm expects them
     createdAt: new Date(), // Placeholder, not needed by form but part of User type
     updatedAt: new Date(), // Placeholder, not needed by form but part of User type
  };


  return (
    <div className="space-y-6">
      <div> {/* Wrap heading and description */}
         <h1 className="text-2xl font-semibold">Profile</h1>
         <p className="text-muted-foreground">Manage your account details.</p>
      </div>
      {/* Render ProfileForm component */}
      <ProfileForm user={userForForm} />
    </div>
  );
}
