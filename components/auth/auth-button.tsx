'use client';

import React from 'react';
import { useSession, signOut } from 'next-auth/react'; // Removed unused signIn
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons'; // Assuming spinner icon exists
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'; // Assuming dropdown exists
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Assuming avatar exists

export function AuthButton() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  if (isLoading) {
    return (
      <Button variant="outline" size="icon" disabled>
        <Icons.spinner className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  if (session?.user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={session.user.image ?? ''}
                alt={session.user.name ?? session.user.email ?? 'User'}
              />
              <AvatarFallback>
                {session.user.name
                  ? session.user.name.charAt(0).toUpperCase()
                  : session.user.email?.charAt(0).toUpperCase() ?? '?'}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {session.user.name ?? 'User'}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {session.user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {/* Add links to profile, settings, etc. here */}
          <DropdownMenuItem>
             <Link href="/account">Account</Link> {/* Example link */}
          </DropdownMenuItem>
          {session.user.role === 'ADMIN' && (
             <DropdownMenuItem>
               <Link href="/admin">Admin Dashboard</Link> {/* Link for Admins */}
             </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button asChild>
      <Link href="/auth/signin">Sign In</Link>
    </Button>
  );
}
