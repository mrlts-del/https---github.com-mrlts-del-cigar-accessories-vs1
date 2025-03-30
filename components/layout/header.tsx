import React from 'react';
import Link from 'next/link';
import { AuthButton } from '@/components/auth/auth-button';
import { CartSheet } from '@/components/cart/cart-sheet';
import { Icons } from '@/components/icons'; // Import Icons

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Icons.logo className="h-6 w-6" /> {/* Use placeholder logo */}
            <span className="hidden font-bold sm:inline-block">
              Cigar Accessories
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/products"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Products
            </Link>
            {/* Placeholder Links */}
            <Link href="/about" className="transition-colors hover:text-foreground/80 text-foreground/60"> About </Link>
            <Link href="/contact" className="transition-colors hover:text-foreground/80 text-foreground/60"> Contact </Link>
          </nav>
        </div>
        {/* TODO: Add Mobile Menu */}
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <CartSheet />
            <AuthButton />
          </nav>
        </div>
      </div>
    </header>
  );
}
