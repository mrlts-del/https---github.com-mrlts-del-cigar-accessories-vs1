import React from 'react';
import { notFound } from 'next/navigation';
import { ProductForm } from '@/components/admin/products/product-form';
import { db } from '@/lib/db';
import type { Category } from '@prisma/client';
import { fetchCategories } from '@/actions/category'; // Import fetch action

interface EditProductPageProps {
  params: {
    productId: string;
  };
}

// Function to fetch a single product with relations for editing
async function getProductForEdit(productId: string) {
   try {
      const product = await db.product.findUnique({
         where: { id: productId },
         include: {
            images: true,
            category: true,
         },
      });
      return product;
   } catch (error) {
      console.error(`Failed to fetch product ${productId} for editing:`, error);
      return null;
   }
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { productId } = params;

  // Fetch product and categories in parallel
  const [product, categories] = await Promise.all([
    getProductForEdit(productId),
    fetchCategories(), // Use actual category fetch action
    // Promise.resolve([] as Category[]) // Remove placeholder
  ]);

  if (!product) {
    notFound();
  }

  // Ensure categories is an array even if fetch fails (though fetchCategories returns [])
  const categoryList = Array.isArray(categories) ? categories : [];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Edit Product</h1>
      {/* Pass potentially null product and fetched categories */}
      <ProductForm initialData={product} categories={categoryList} />
    </div>
  );
}

// TODO: Add generateMetadata function?
