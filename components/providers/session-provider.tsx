'use client'; // Mark this component as a Client Component

import { SessionProvider } from 'next-auth/react';
import React from 'react';

// Define props type to accept children
interface AuthProviderProps {
  children: React.ReactNode;
}

// Create the wrapper component
export default function AuthProvider({ children }: AuthProviderProps) {
  // Wrap children with the SessionProvider from next-auth/react
  return <SessionProvider>{children}</SessionProvider>;
}
