import React, { Suspense } from 'react';
import { fetchProducts } from '@/lib/data'; // Import fetch function
import { ProductCard } from '@/components/product/product-card'; // Import card component
// TODO: Import Skeleton component for loading state

async function ProductGrid() {
  // Fetch products data
  const products = await fetchProducts();

  if (products.length === 0) {
    return <p>No products found.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

// TODO: Create a skeleton component for the product grid
function ProductGridSkeleton() {
  return (
     <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="h-[350px] w-full animate-pulse rounded-lg bg-muted"></div> // Simple skeleton
      ))}
    </div>
  );
}


export default function ProductsPage() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-semibold">Products</h1>
      {/* Use Suspense for streaming the product grid */}
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGrid />
      </Suspense>
      {/* TODO: Add Pagination controls */}
    </div>
  );
}
