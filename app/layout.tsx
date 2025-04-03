import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Import Inter font
import './globals.css';
// Remove direct SessionProvider import
import AuthProvider from '@/components/providers/session-provider'; // Import the client component wrapper
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

// Setup Inter font
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans', // Use standard CSS variable name
});

export const metadata: Metadata = {
  title: 'Cigar Accessories E-commerce',
  description: 'Your one-stop shop for cigar accessories',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Use the AuthProvider wrapper component
    <AuthProvider>
      <html lang="en" suppressHydrationWarning className="h-full">
        <body
          className={cn(
            'relative flex min-h-full flex-col bg-background font-sans antialiased',
            inter.variable // Apply the Inter font variable
          )}
        >
          <Header />
          <div className="flex-1">
             <main className="container relative py-6 md:py-10">
               {children}
             </main>
          </div>
          <Footer />
          <Toaster richColors position="top-right" />
        </body>
      </html>
    </AuthProvider>
  );
}
