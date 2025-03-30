import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { fetchProductBySlug } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { ProductImageGallery } from '@/components/product/product-image-gallery';
import { AddToCartButton } from '@/components/product/add-to-cart-button';
import { ReviewList } from '@/components/product/review-list'; // Import ReviewList
import { ReviewForm } from '@/components/product/review-form'; // Import ReviewForm
import { Separator } from '@/components/ui/separator'; // Import Separator
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
    // Use React.Fragment to return multiple top-level elements
    <React.Fragment>
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

          <AddToCartButton product={product} className="mt-4 w-full" />

          {/* TODO: Add Wishlist Button (Optional) */}
        </div>
      </div>

      {/* Reviews Section */}
      <Separator className="my-8" />
      <div className="space-y-6">
         <h2 className="text-2xl font-semibold">Customer Reviews</h2>
         {/* Review Form */}
         <div className="mb-6 rounded border p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-medium">Leave a Review</h3>
            <ReviewForm productId={product.id} />
         </div>
         {/* Review List (Suspense for independent loading) */}
         <Suspense fallback={<ReviewListSkeleton />}>
            <ReviewList productId={product.id} />
         </Suspense>
      </div>
    </React.Fragment>
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

// TODO: Create Skeleton for Review List
function ReviewListSkeleton() {
   return (
      <div className="space-y-6">
         {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4">
               <div className="h-10 w-10 rounded-full bg-muted"></div>
               <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/4 rounded bg-muted"></div>
                  <div className="h-4 w-1/2 rounded bg-muted"></div>
                  <div className="h-4 w-3/4 rounded bg-muted"></div>
               </div>
            </div>
         ))}
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
