'use client'; // Carousel requires client-side interaction

import React from 'react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card'; // Use Card for consistent styling
import type { Image as ProductImage } from '@prisma/client'; // Import Image type

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const placeholderImage = '/placeholder-image.png'; // TODO: Add a real placeholder image

  if (!images || images.length === 0) {
    // Display placeholder if no images
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative aspect-square w-full">
            <Image
              src={placeholderImage}
              alt={`${productName} placeholder`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              priority // Prioritize the main product image
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Carousel className="w-full">
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={image.id}>
            <Card className="overflow-hidden">
              <CardContent className="relative aspect-square p-0">
                <Image
                  src={image.url}
                  alt={`${productName} image ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  priority={index === 0} // Prioritize the first image
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      {images.length > 1 && ( // Only show controls if more than one image
        <>
          <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
          <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
        </>
      )}
    </Carousel>
  );
}
