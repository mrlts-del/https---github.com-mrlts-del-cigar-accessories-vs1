import React from 'react';
import { SignUpForm } from '@/components/auth/sign-up-form'; // To be created

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="mb-6 text-3xl font-semibold">Create Account</h1>
      {/* Render the sign-up form */}
      <SignUpForm />
    </div>
  );
}
