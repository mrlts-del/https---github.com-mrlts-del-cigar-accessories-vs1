import React from 'react';
// You would typically import layout components from react-email here
// e.g., import { Html, Button, Text, Heading, Container } from '@react-email/components';

interface PasswordResetEmailProps {
  resetLink: string;
}

// Basic functional component structure for the email
export const PasswordResetEmail: React.FC<Readonly<PasswordResetEmailProps>> = ({ resetLink }) => {
  // In a real scenario using react-email, you'd structure this with
  // Html, Head, Body, Container, Heading, Text, Button, Link etc.
  // For now, just returning the basic JSX structure needed by Resend's `react` property.
  return (
    <div>
      <h1>Reset Your Password</h1>
      <p>Click the link below to reset your password:</p>
      <a href={resetLink} target="_blank" rel="noopener noreferrer">
        Reset Password
      </a>
      <p>This link is valid for 1 hour.</p>
      <p>If you did not request a password reset, please ignore this email.</p>
    </div>
  );
};

export default PasswordResetEmail; // Default export might be preferred by some setups
