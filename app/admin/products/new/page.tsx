import React from 'react';
import { ProductForm } from '@/components/admin/products/product-form';
// import type { Category } from '@prisma/client'; // Removed unused import
import { fetchCategories } from '@/actions/category'; // Import fetch action

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
