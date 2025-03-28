import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { fetchProductBySlug } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { ProductImageGallery } from '@/components/product/product-image-gallery';
import { AddToCartButton } from '@/components/product/add-to-cart-button'; // Import AddToCartButton
// TODO: Import components for reviews etc.
// TODO: Import Skeleton components

interface ProductDetailPageProps {
  params: {
    slug: string;
  };
}

async function ProductDetails({ slug }: { slug: string }) {
  const product = await fetchProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* Column 1: Image Gallery */}
      <div>
        <ProductImageGallery images={product.images} productName={product.name} />
      </div>

      {/* Column 2: Product Info & Actions */}
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
        <p className="text-sm text-muted-foreground">{product.category.name}</p>
        {/* TODO: Add Average Rating/Reviews Link */}

        <p className="text-2xl font-semibold">
          {formatCurrency(product.price)}
        </p>

        <p className="text-muted-foreground">
          {product.description || '(No description available)'}
        </p>

        {/* TODO: Add Variant Selection (if applicable) */}
        {/* TODO: Add Quantity Selector */}

        {/* Use AddToCartButton component */}
        <AddToCartButton product={product} className="mt-4 w-full" />

        {/* TODO: Add Wishlist Button (Optional) */}
      </div>

      {/* TODO: Add Reviews Section below grid */}
    </div>
  );
}

function ProductDetailsSkeleton() {
   return (
     <div className="grid gap-8 md:grid-cols-2">
      <div className="aspect-square w-full animate-pulse rounded bg-muted"></div>
      <div className="flex flex-col gap-4">
        <div className="h-8 w-3/4 animate-pulse rounded bg-muted"></div>
        <div className="h-4 w-1/4 animate-pulse rounded bg-muted"></div>
        <div className="h-6 w-1/4 animate-pulse rounded bg-muted"></div>
        <div className="h-20 w-full animate-pulse rounded bg-muted"></div>
        <div className="mt-4 h-10 w-full animate-pulse rounded bg-muted"></div>
      </div>
    </div>
   );
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = params;

  return (
    <div>
      <Suspense fallback={<ProductDetailsSkeleton />}>
        <ProductDetails slug={slug} />
      </Suspense>
    </div>
  );
}

// TODO: Add generateMetadata function
// TODO: Add generateStaticParams function
