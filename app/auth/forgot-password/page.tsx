import React from 'react';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'; // To be created

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="mb-6 text-3xl font-semibold">Forgot Password</h1>
      <ForgotPasswordForm />
    </div>
  );
}
