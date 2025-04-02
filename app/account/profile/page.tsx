import React from 'react';
// Remove getServerSession and authOptions import
import { auth } from '@/lib/auth'; // Import the auth function
import type { Session } from 'next-auth';
import { redirect } from 'next/navigation';
import { ProfileForm } from '@/components/account/profile-form'; // Import form
import type { User } from '@prisma/client'; // Keep User import if needed for ProfileForm prop type

export default async function ProfilePage() {
  const session = await auth(); // Use the auth function

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/account/profile');
  }

  // We need to pass the user object to the form, excluding sensitive fields
  // The session object might not have all User fields, adjust as needed
  // or fetch the full user object from DB if necessary.
  const userForForm: Omit<User, 'password' | 'emailVerified'> = {
     id: session.user.id,
     name: session.user.name ?? null, // Ensure null if undefined
      email: session.user.email ?? null, // Ensure null if undefined
      image: session.user.image ?? null, // Ensure null if undefined
      role: session.user.role!, // Use non-null assertion assuming role exists after auth check
      // Add default/null values for other non-sensitive User fields if ProfileForm expects them
      // For now, assuming ProfileForm only needs id, name, email, image, role
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
