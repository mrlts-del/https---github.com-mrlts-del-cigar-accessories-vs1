'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCartStore } from '@/store/cart-store';
import { formatCurrency } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ShippingOption } from './shipping-step'; // Import type

interface OrderSummaryProps {
  selectedShippingOption?: ShippingOption | null; // Make optional
}

export function OrderSummary({ selectedShippingOption }: OrderSummaryProps) {
  const { items, totalPrice } = useCartStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const cartTotal = isMounted ? totalPrice() : 0;
  // Use selected shipping option price, default to 0 if not selected/mounted
  const shippingCost = isMounted && selectedShippingOption ? selectedShippingOption.price : 0;
  const taxes = 0; // TODO: Implement tax calculation
  const orderTotal = cartTotal + shippingCost + taxes;

  if (!isMounted) {
    // Render a loading state or null until the store is hydrated
    return (
      <div className="rounded border p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>
        <div className="h-40 w-full animate-pulse rounded bg-muted"></div>
      </div>
    );
  }

  return (
    <div className="rounded border p-6 shadow">
      <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>
      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded">
                <Image
                  src={item.images?.[0]?.url || '/placeholder-image.png'}
                  alt={item.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
                 <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground">
                   {item.quantity}
                 </span>
              </div>
              <div className="flex-grow overflow-hidden">
                <p className="truncate font-medium">{item.name}</p>
              </div>
              <p className="flex-shrink-0 text-sm font-medium">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>
      </ScrollArea>
      <Separator className="my-4" />
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(cartTotal)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Shipping</span>
          {/* Display selected option name if available */}
          <span>
             {selectedShippingOption ? `${selectedShippingOption.name} - ` : ''}
             {shippingCost === 0 ? 'Free' : formatCurrency(shippingCost)}
          </span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Taxes</span>
          <span>{taxes === 0 ? 'Calculated at next step' : formatCurrency(taxes)}</span>
        </div>
      </div>
      <Separator className="my-4" />
      <div className="flex justify-between text-lg font-bold">
        <span>Order total</span>
        <span>{formatCurrency(orderTotal)}</span>
      </div>
    </div>
  );
}
