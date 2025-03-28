import React, { Suspense } from 'react';
import { ResetPasswordForm } from '@/components/auth/reset-password-form'; // To be created

// Helper component to read search params in a client component
function ResetPasswordFormWrapper() {
  return <ResetPasswordForm />;
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="mb-6 text-3xl font-semibold">Reset Your Password</h1>
      {/* Suspense is needed because ResetPasswordForm uses useSearchParams */}
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordFormWrapper />
      </Suspense>
    </div>
  );
}
