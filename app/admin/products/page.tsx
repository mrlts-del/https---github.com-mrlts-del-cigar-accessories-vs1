import React from 'react';
import { Button } from '@/components/ui/button';
import { fetchProducts } from '@/lib/data'; // Reuse existing fetch function for now
import { columns, type ProductColumn } from '@/components/admin/products/columns'; // Import columns and type
import { DataTable } from '@/components/ui/data-table'; // Import DataTable
import Link from 'next/link'; // Import Link

export default async function AdminProductsPage() {
  // Fetch products for admin view
  const products = await fetchProducts();

  // Ensure data matches the expected type for columns
  const formattedData: ProductColumn[] = products;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Manage Products</h1>
        {/* Link to Add Product page */}
        <Button asChild>
           <Link href="/admin/products/new">Add Product</Link>
        </Button>
      </div>

      {/* Implement Product Data Table */}
      <DataTable
         columns={columns}
         data={formattedData}
         filterColumnId="name" // Allow filtering by product name
         filterInputPlaceholder="Filter products by name..."
      />
    </div>
  );
}
