import React from 'react';
import Link from 'next/link';
import { AuthButton } from '@/components/auth/auth-button';
import { CartSheet } from '@/components/cart/cart-sheet'; // Import CartSheet

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            {/* <Icons.logo className="h-6 w-6" /> */} {/* TODO: Add Logo */}
            <span className="hidden font-bold sm:inline-block">
              Cigar Accessories
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {/* TODO: Add Navigation Links (Products, Categories, etc.) */}
            <Link
              href="/products"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Products
            </Link>
          </nav>
        </div>
        {/* TODO: Add Mobile Menu */}
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <CartSheet /> {/* Add CartSheet */}
            <AuthButton />
          </nav>
        </div>
      </div>
    </header>
  );
}
