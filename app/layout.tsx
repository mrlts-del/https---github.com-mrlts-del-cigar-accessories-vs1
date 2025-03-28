import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { SessionProvider } from 'next-auth/react'; // Import SessionProvider
import { Toaster } from '@/components/ui/sonner'; // Import Toaster
import { cn } from '@/lib/utils'; // Import cn utility
import { Header } from '@/components/layout/header'; // Import Header
import { Footer } from '@/components/layout/footer'; // Import Footer

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Cigar Accessories E-commerce', // Updated title
  description: 'Your one-stop shop for cigar accessories', // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <html lang="en" suppressHydrationWarning className="h-full"> {/* Added h-full */}
        <body
          className={cn(
            'relative flex min-h-full flex-col bg-background font-sans antialiased', // Added flex structure
            geistSans.variable,
            geistMono.variable
          )}
        >
          <Header />
          {/* Added flex-grow and container */}
          <main className="container relative flex-grow py-6 md:py-10">
            {children}
          </main>
          <Footer /> {/* Add Footer component */}
          <Toaster richColors position="top-right" />
        </body>
      </html>
    </SessionProvider>
  );
}
