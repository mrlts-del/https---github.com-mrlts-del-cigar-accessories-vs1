import React from 'react';
import Link from 'next/link';
// TODO: Import component for account navigation sidebar/tabs

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
      <aside className="md:col-span-1">
        <h2 className="mb-4 text-lg font-semibold">Account Settings</h2>
        <nav className="flex flex-col space-y-2">
          {/* TODO: Use NavLink component for active state */}
          <Link href="/account/profile" className="text-muted-foreground hover:text-primary">Profile</Link>
          <Link href="/account/addresses" className="text-muted-foreground hover:text-primary">Addresses</Link>
          <Link href="/account/orders" className="text-muted-foreground hover:text-primary">Order History</Link>
          {/* Add other account links */}
        </nav>
      </aside>
      <main className="md:col-span-3">
        {children}
      </main>
    </div>
  );
}
