import React from 'react';
import { ProductForm } from '@/components/admin/products/product-form';
import { fetchCategories } from '@/actions/category'; // Import fetch action

// Force dynamic rendering as suggested by guide
export const dynamic = 'force-dynamic';

export default async function AddProductPage() {
  // Fetch categories for the dropdown
  const categories = await fetchCategories();

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Add New Product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
