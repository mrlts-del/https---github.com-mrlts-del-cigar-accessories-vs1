'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { loadStripe, type StripeElementsOptions } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation'; // Import useRouter for redirect

import { createPaymentIntent, createOrder } from '@/actions/checkout'; // Import createOrder
import { PaymentStep } from './payment-step';
import { useCartStore } from '@/store/cart-store';
import { Icons } from '@/components/icons'; // Import Icons for spinner

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

interface CheckoutFormProps {
  addressId: string; // Need address ID to create order
  // onPaymentSuccess is now handled internally, maybe add onOrderCreated?
  onOrderCreated: (orderId: string) => void; // Callback after order is successfully created
}

export function CheckoutForm({ addressId, onOrderCreated }: CheckoutFormProps) {
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState('');
  const [isLoadingPI, setIsLoadingPI] = useState(true); // Loading Payment Intent
  const [isProcessingOrder, startOrderProcessing] = useTransition(); // Loading state for order creation
  const [error, setError] = useState<string | null>(null);
  const { items, totalPrice, clearCart } = useCartStore(); // Get items and clearCart

  // Effect to create Payment Intent
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
       console.error("Stripe publishable key is not set.");
       setError("Payment configuration error.");
       setIsLoadingPI(false);
       return;
    }

    const amountInCents = Math.round(totalPrice() * 100);
    if (amountInCents <= 0) {
       // Don't proceed if cart is empty, parent component should ideally prevent rendering this form
       setError("Cart is empty.");
       setIsLoadingPI(false);
       return;
    }

    setIsLoadingPI(true); // Set loading before async call
    createPaymentIntent(amountInCents)
      .then((data) => {
        if (data.success && data.clientSecret) {
          setClientSecret(data.clientSecret);
          setError(null); // Clear previous errors
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
      .finally(() => {
        setIsLoadingPI(false);
      });
  // Only run when component mounts or if critical dependencies change (e.g., amount if it could change)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Removed totalPrice dependency to prevent re-creating PI on cart changes during checkout

  // Handler for successful payment confirmation from PaymentStep
  const handlePaymentSuccess = (paymentIntentId: string) => {
    startOrderProcessing(async () => {
      try {
        // Prepare items data for server action
        const orderItems = items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
        }));

        // Call createOrder server action
        const result = await createOrder({
          paymentIntentId,
          addressId,
          items: orderItems,
        });

        if (result.success && result.orderId) {
          toast.success('Order placed successfully!');
          clearCart(); // Clear the cart
          onOrderCreated(result.orderId); // Notify parent/trigger next step/redirect
          // Example redirect to an order confirmation page:
          // router.push(`/order/success?orderId=${result.orderId}`);
        } else {
          toast.error(result.error || 'Failed to save order details.');
          // TODO: Handle order creation failure (e.g., inform user, maybe try again?)
        }
      } catch (err) {
        console.error("Error creating order after payment:", err);
        toast.error('An unexpected error occurred while saving your order.');
      }
    });
  };


  const appearance = { theme: 'stripe' as const };
  const options: StripeElementsOptions = { clientSecret, appearance };

  if (isLoadingPI) {
     return <div className="text-center p-8">Loading payment options...</div>;
  }
  if (error) {
     return <div className="text-center p-8 text-destructive">{error}</div>;
  }
  if (!clientSecret) {
     return <div className="text-center p-8">Could not load payment form.</div>;
  }

  return (
    <div className="relative"> {/* Added relative positioning for overlay */}
      {isProcessingOrder && (
         <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/80"> {/* Added overlay styles */}
            <Icons.spinner className="h-8 w-8 animate-spin" />
            <span className="ml-2">Processing order...</span>
         </div>
      )}
      <Elements options={options} stripe={stripePromise}>
        <PaymentStep
           clientSecret={clientSecret}
           orderAmount={totalPrice()}
           onPaymentSuccess={handlePaymentSuccess} // Pass the new handler
        />
      </Elements>
    </div>
  );
}
