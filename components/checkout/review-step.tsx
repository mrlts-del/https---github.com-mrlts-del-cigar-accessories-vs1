'use client'; // May need client hooks later if interacting with state

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface ReviewStepProps {
  orderId: string;
  // Could potentially receive full order details if fetched after creation
}

export function ReviewStep({ orderId }: ReviewStepProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 rounded border p-8 text-center shadow">
       <CheckCircle className="h-16 w-16 text-green-500" />
      <h2 className="text-2xl font-semibold">Order Confirmed!</h2>
      <p className="text-muted-foreground">
        Thank you for your purchase. Your order ID is{' '}
        <span className="font-medium text-foreground">{orderId.substring(0, 8)}...</span>.
      </p>
      <p className="text-muted-foreground">
        You will receive an email confirmation shortly.
      </p>
      <div className="flex gap-4">
         <Button variant="outline" asChild>
            <Link href="/account/orders">View Order History</Link>
         </Button>
         <Button asChild>
            <Link href="/products">Continue Shopping</Link>
         </Button>
      </div>
    </div>
  );
}
