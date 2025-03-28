import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// Removed Button import as it's handled by AddToCartButton
import type { ProductWithDetails } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { AddToCartButton } from './add-to-cart-button'; // Import AddToCartButton

interface ProductCardProps {
  product: ProductWithDetails;
}

export function ProductCard({ product }: ProductCardProps) {
  const firstImage = product.images?.[0]?.url;
  const placeholderImage = '/placeholder-image.png'; // TODO: Add a real placeholder image

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader className="p-0">
        <Link href={`/product/${product.slug}`} aria-label={product.name} className="group"> {/* Added group class */}
          <div className="relative aspect-square w-full overflow-hidden">
            <Image
              src={firstImage || placeholderImage}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
              priority={false}
              loading="lazy"
            />
          </div>
        </Link>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <Link href={`/product/${product.slug}`}>
          <CardTitle className="mb-1 line-clamp-2 text-lg font-semibold leading-tight hover:text-primary">
            {product.name}
          </CardTitle>
        </Link>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <span className="text-lg font-semibold">
          {formatCurrency(product.price)}
        </span>
        {/* Use AddToCartButton component (removed size prop) */}
        <AddToCartButton product={product} showIcon={false} />
      </CardFooter>
    </Card>
  );
}
