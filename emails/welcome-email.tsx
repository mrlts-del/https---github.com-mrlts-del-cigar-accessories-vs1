import React from 'react';

interface WelcomeEmailProps {
  userName: string | null; // User's name
}

export const WelcomeEmail: React.FC<Readonly<WelcomeEmailProps>> = ({ userName }) => {
  return (
    <div>
      <h1>Welcome to Cigar Accessories, {userName || 'Valued Customer'}!</h1>
      <p>Thanks for creating an account with us.</p>
      <p>You can now browse our products, manage your orders, and save your addresses.</p>
      <p>
         <a href={process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'} target="_blank" rel="noopener noreferrer">
            Start Shopping Now
         </a>
      </p>
      <p>Best regards,</p>
      <p>The Cigar Accessories Team</p>
    </div>
  );
};

export default WelcomeEmail;
