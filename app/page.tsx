import React, { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { fetchProducts } from '@/lib/data'; // Import fetch function
import { ProductCard } from '@/components/product/product-card'; // Import card component

// Re-use or adapt skeleton from products page
function ProductGridSkeleton() {
  return (
     <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => ( // Show 4 skeletons for recent products
        <div key={i} className="h-[350px] w-full animate-pulse rounded-lg bg-muted"></div>
      ))}
    </div>
  );
}

// Fetch recent products for the home page
async function RecentProductGrid() {
  // Fetch, for example, the 4 newest products
  const recentProducts = await fetchProducts(1, 4, 'newest');

  if (recentProducts.length === 0) {
    return <p className="text-center text-muted-foreground">No products to display yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {recentProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12 md:py-16 lg:py-20 bg-muted/40 rounded-lg">
        <h1 className="mb-4 text-4xl font-bold tracking-tight lg:text-5xl">
          Premium Cigar Accessories
        </h1>
        <p className="mb-8 text-lg text-muted-foreground max-w-2xl mx-auto">
          Find the finest humidors, cutters, lighters, and everything you need to enhance your cigar experience.
        </p>
        <Button size="lg" asChild>
          <Link href="/products">Shop All Products</Link>
        </Button>
      </section>

      {/* Featured/Recent Products Section */}
      <section>
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">
          New Arrivals
        </h2>
        <Suspense fallback={<ProductGridSkeleton />}>
           <RecentProductGrid />
        </Suspense>
      </section>

      {/* TODO: Add other sections like Categories, About snippet, etc. */}
    </div>
  );
}
