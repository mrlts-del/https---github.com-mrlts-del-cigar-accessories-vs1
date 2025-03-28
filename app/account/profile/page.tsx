import React from 'react';
import getServerSession from 'next-auth'; // Use default import
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import type { Session } from 'next-auth'; // Import augmented Session type
import { redirect } from 'next/navigation';
// TODO: Import ProfileForm component

export default async function ProfilePage() {
  // Fetch session server-side
  const session = (await getServerSession(authOptions)) as unknown as Session | null;

  // Redirect if not logged in (middleware should also handle this, but good practice)
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/account/profile');
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <p className="text-muted-foreground">Manage your account details.</p>
      {/* TODO: Render ProfileForm component */}
      <div className="rounded border p-8 shadow">
         <p>Name: {session.user.name ?? 'Not set'}</p>
         <p>Email: {session.user.email ?? 'Not set'}</p>
         <p>Role: {session.user.role ?? 'USER'}</p>
         <p className="mt-4 text-center text-muted-foreground">(Profile editing form will go here)</p>
      </div>
    </div>
  );
}
