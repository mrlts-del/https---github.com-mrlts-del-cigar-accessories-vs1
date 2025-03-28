'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart-store';
import type { ProductWithDetails } from '@/lib/data';
import { ShoppingCart } from 'lucide-react'; // Import cart icon

interface AddToCartButtonProps {
  product: ProductWithDetails;
  quantity?: number; // Optional quantity, defaults to 1
  className?: string; // Allow passing custom classes
  buttonText?: string; // Optional custom button text
  showIcon?: boolean; // Option to show/hide icon
}

export function AddToCartButton({
  product,
  quantity = 1,
  className,
  buttonText = 'Add to Cart',
  showIcon = true,
}: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    // TODO: Add check for product stock before adding
    addItem(product, quantity);
  };

  return (
    <Button onClick={handleAddToCart} className={className}>
      {showIcon && <ShoppingCart className="mr-2 h-4 w-4" />}
      {buttonText}
    </Button>
  );
}
