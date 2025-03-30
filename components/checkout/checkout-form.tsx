'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { loadStripe, type StripeElementsOptions } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { toast } from 'sonner';
// import { useRouter } from 'next/navigation'; // Removed unused import

import { createPaymentIntent, createOrder } from '@/actions/checkout';
import { PaymentStep } from './payment-step';
import { useCartStore } from '@/store/cart-store';
import { Icons } from '@/components/icons';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

interface CheckoutFormProps {
  addressId: string;
  onOrderCreated: (orderId: string) => void;
}

export function CheckoutForm({ addressId, onOrderCreated }: CheckoutFormProps) {
  // const router = useRouter(); // Removed unused router
  const [clientSecret, setClientSecret] = useState('');
  const [isLoadingPI, setIsLoadingPI] = useState(true);
  const [isProcessingOrder, startOrderProcessing] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { items, totalPrice, clearCart } = useCartStore();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
       console.error("Stripe publishable key is not set.");
       setError("Payment configuration error.");
       setIsLoadingPI(false);
       return;
    }
    const amountInCents = Math.round(totalPrice() * 100);
    if (amountInCents <= 0) {
       setError("Cart is empty.");
       setIsLoadingPI(false);
       return;
    }
    setIsLoadingPI(true);
    createPaymentIntent(amountInCents)
      .then((data) => {
        if (data.success && data.clientSecret) {
          setClientSecret(data.clientSecret);
          setError(null);
        } else {
          setError(data.error || 'Failed to initialize payment.');
          toast.error(data.error || 'Failed to initialize payment.');
        }
      })
      .catch((err) => {
         console.error("Error creating payment intent:", err);
         setError('Failed to initialize payment.');
         toast.error('Failed to initialize payment.');
      })
      .finally(() => { setIsLoadingPI(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePaymentSuccess = (paymentIntentId: string) => {
    startOrderProcessing(async () => {
      try {
        const orderItems = items.map(item => ({ productId: item.id, quantity: item.quantity }));
        const result = await createOrder({ paymentIntentId, addressId, items: orderItems });
        if (result.success && result.orderId) {
          toast.success('Order placed successfully!');
          clearCart();
          onOrderCreated(result.orderId);
        } else {
          toast.error(result.error || 'Failed to save order details.');
        }
      } catch (err) {
        console.error("Error creating order after payment:", err);
        toast.error('An unexpected error occurred while saving your order.');
      }
    });
  };

  const appearance = { theme: 'stripe' as const };
  const options: StripeElementsOptions = { clientSecret, appearance };

  if (isLoadingPI) { return <div className="text-center p-8">Loading payment options...</div>; }
  if (error) { return <div className="text-center p-8 text-destructive">{error}</div>; }
  if (!clientSecret) { return <div className="text-center p-8">Could not load payment form.</div>; }

  return (
    <div className="relative">
      {isProcessingOrder && (
         <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/80">
            <Icons.spinner className="h-8 w-8 animate-spin" />
            <span className="ml-2">Processing order...</span>
         </div>
      )}
      <Elements options={options} stripe={stripePromise}>
        <PaymentStep clientSecret={clientSecret} orderAmount={totalPrice()} onPaymentSuccess={handlePaymentSuccess} />
      </Elements>
    </div>
  );
}
