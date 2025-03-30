import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
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
    <SessionProvider>
      <html lang="en" suppressHydrationWarning className="h-full">
        <body
          className={cn(
            'relative flex min-h-full flex-col bg-background font-sans antialiased',
            geistSans.variable,
            geistMono.variable
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
    </SessionProvider>
  );
}
