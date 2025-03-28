import React from 'react';
// We will import the actual sign-in form component here later
import { SignInForm } from '@/components/auth/sign-in-form'; // Uncommented import

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="mb-6 text-3xl font-semibold">Sign In</h1>
      {/* Render the sign-in form */}
      <SignInForm />
    </div>
  );
}
