import React, { Suspense } from 'react';
import { fetchProducts, getProductsCount } from '@/lib/data';
import { ProductCard } from '@/components/product/product-card';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { fetchCategories } from '@/actions/category';
import { ProductFilters } from '@/components/product/product-filters';
import { ProductSearch } from '@/components/product/product-search'; // Import search

const PRODUCTS_PER_PAGE = 12;

// ProductGrid now accepts search query as well
async function ProductGrid({
  currentPage,
  sort,
  categorySlug,
  query, // Add query prop
}: {
  currentPage: number;
  sort: string;
  categorySlug?: string;
  query?: string; // Add query prop type
}) {
  // Pass query to fetchProducts
  const products = await fetchProducts(currentPage, PRODUCTS_PER_PAGE, sort, categorySlug, query);

  if (products.length === 0) {
    return <p className="col-span-full text-center text-muted-foreground">No products found matching your criteria.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function ProductGridSkeleton() {
  return (
     <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(PRODUCTS_PER_PAGE)].map((_, i) => (
        <div key={i} className="h-[350px] w-full animate-pulse rounded-lg bg-muted"></div>
      ))}
    </div>
  );
}

interface ProductsPageProps {
   searchParams?: {
      page?: string;
      sort?: string;
      category?: string; // Category slug
      query?: string; // Add query param type
   };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  // Read params from URL
  const currentPage = Number(searchParams?.page) || 1;
  const currentSort = searchParams?.sort || 'newest';
  const currentCategorySlug = searchParams?.category;
  const currentQuery = searchParams?.query; // Read query param

  // Fetch data based on params, including query
  const [totalProducts, categories] = await Promise.all([
     getProductsCount(currentCategorySlug, currentQuery), // Pass query to count
     fetchCategories()
  ]);

  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

  // Update suspense key to include query
  const suspenseKey = `${currentPage}-${currentSort}-${currentCategorySlug || 'all'}-${currentQuery || ''}`;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold">Products</h1>

      {/* Add Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:justify-between">
         <ProductSearch /> {/* Add Search Input */}
         <ProductFilters categories={categories} />
      </div>

      {/* Use Suspense for streaming the product grid */}
      <Suspense key={suspenseKey} fallback={<ProductGridSkeleton />}>
        <ProductGrid
           currentPage={currentPage}
           sort={currentSort}
           categorySlug={currentCategorySlug}
           query={currentQuery} // Pass query to grid
        />
      </Suspense>

      {/* Add Pagination controls */}
      <PaginationControls currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}
