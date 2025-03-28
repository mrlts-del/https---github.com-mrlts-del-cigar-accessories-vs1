'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area'; // Assuming scroll-area exists or will be added
import { Separator } from '@/components/ui/separator';
// Removed unused Input import
import { useCartStore } from '@/store/cart-store';
import { formatCurrency } from '@/lib/utils';
import { ShoppingCart, Trash2, Minus, Plus } from 'lucide-react';

export function CartSheet() {
  const { items, totalItems, totalPrice, removeItem, updateQuantity, clearCart } = useCartStore();
  const [isMounted, setIsMounted] = useState(false); // Prevent hydration errors with Zustand/localStorage

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const itemCount = isMounted ? totalItems() : 0;
  const cartTotal = isMounted ? totalPrice() : 0;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-4 w-4" />
          {isMounted && itemCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {itemCount}
            </span>
          )}
          <span className="sr-only">Open cart</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-4">
          <SheetTitle>Shopping Cart ({itemCount})</SheetTitle>
        </SheetHeader>
        <Separator />
        {isMounted && itemCount > 0 ? (
          <>
            <ScrollArea className="flex-1 px-4"> {/* Added ScrollArea */}
              <div className="flex flex-col gap-4 py-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start gap-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded">
                      <Image
                        src={item.images?.[0]?.url || '/placeholder-image.png'}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <Link
                        href={`/product/${item.slug}`}
                        className="line-clamp-1 font-medium hover:underline"
                      >
                        {item.name}
                      </Link>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(item.price)}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                          <span className="sr-only">Decrease quantity</span>
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          // TODO: Disable based on stock
                        >
                          <Plus className="h-3 w-3" />
                          <span className="sr-only">Increase quantity</span>
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                      <span className="sr-only">Remove item</span>
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Separator />
            <SheetFooter className="flex flex-col gap-4 px-4 pt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Subtotal</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex gap-2">
                 <SheetClose asChild>
                   <Button variant="outline" className="flex-1">Continue Shopping</Button>
                 </SheetClose>
                 <Button className="flex-1" asChild>
                   <Link href="/checkout">Proceed to Checkout</Link> {/* TODO: Create checkout page */}
                 </Button>
              </div>
               <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-destructive hover:text-destructive"
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
            </SheetFooter>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
            <ShoppingCart className="h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground">Your cart is empty</p>
            <SheetClose asChild>
               <Button variant="outline">Continue Shopping</Button>
            </SheetClose>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
