import React from 'react';
import Link from 'next/link';
// TODO: Import admin-specific navigation component

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware already protects this route, ensuring only ADMIN users access it.
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-5"> {/* Different grid for admin */}
      <aside className="md:col-span-1">
        <h2 className="mb-4 text-lg font-semibold">Admin Menu</h2>
        <nav className="flex flex-col space-y-2">
          {/* TODO: Use NavLink component for active state */}
          <Link href="/admin" className="text-muted-foreground hover:text-primary">Dashboard</Link>
          <Link href="/admin/products" className="text-muted-foreground hover:text-primary">Products</Link>
          <Link href="/admin/categories" className="text-muted-foreground hover:text-primary">Categories</Link>
          <Link href="/admin/orders" className="text-muted-foreground hover:text-primary">Orders</Link>
          <Link href="/admin/users" className="text-muted-foreground hover:text-primary">Users</Link>
          {/* Add other admin links */}
        </nav>
      </aside>
      <main className="md:col-span-4">
        {children}
      </main>
    </div>
  );
}
