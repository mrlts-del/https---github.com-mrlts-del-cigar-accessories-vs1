import React, { Suspense } from 'react'; // Import Suspense
import { SignInForm } from '@/components/auth/sign-in-form';
import { Icons } from '@/components/icons'; // For loading fallback

// Define the main page component
export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
      {/* Wrap the component using useSearchParams in Suspense */}
      <Suspense fallback={<LoadingFallback />}>
        <SignInForm />
      </Suspense>
    </div>
  );
}

// Optional: Define a loading fallback component
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <Icons.spinner className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}
