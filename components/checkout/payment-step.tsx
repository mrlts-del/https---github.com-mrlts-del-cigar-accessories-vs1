'use client';

import React, { useState, useEffect } from 'react';
import {
  PaymentElement,
  LinkAuthenticationElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { type StripePaymentElementOptions } from '@stripe/stripe-js';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { formatCurrency } from '@/lib/utils';

interface PaymentStepProps {
  clientSecret: string; // The PaymentIntent client secret from the backend
  orderAmount: number; // To display the amount
  onPaymentSuccess: (paymentIntentId: string) => void; // Callback on success
  // Add props for selected address/shipping if needed for display or final order creation
}

export function PaymentStep({
  clientSecret,
  orderAmount,
  onPaymentSuccess,
}: PaymentStepProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [email, setEmail] = useState(''); // For LinkAuthenticationElement
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!stripe || !clientSecret) {
      return;
    }
    // Optionally retrieve PaymentIntent status here if needed
  }, [stripe, clientSecret]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      setMessage('Stripe is not ready. Please wait a moment.');
      return;
    }

    setIsLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: `${window.location.origin}/checkout/success`, // Or handle success directly
        // receipt_email: email, // Optional: if collecting email via LinkAuthenticationElement
      },
      redirect: 'if_required', // Only redirect if required (e.g., 3D Secure)
    });

    // Handle result
    if (error) {
      // This point will only be reached if there is an immediate error when
      // confirming the payment. Otherwise, your customer will be redirected to
      // your `return_url`. For some payment methods like iDEAL, your customer will
      // be redirected to an intermediate site first to authorize the payment, then
      // redirected to the `return_url`.
       setMessage(error.message || 'An unexpected error occurred.');
       toast.error(error.message || 'Payment failed.');
       console.error("Stripe confirmPayment error:", error);
    } else if (paymentIntent) {
       // Payment succeeded (or requires further action like 3D Secure redirect)
       switch (paymentIntent.status) {
         case 'succeeded':
           setMessage('Payment successful!');
           toast.success('Payment successful!');
           onPaymentSuccess(paymentIntent.id); // Pass paymentIntent ID back
           break;
         case 'processing':
           setMessage('Payment processing. We\'ll update you when payment is received.');
           toast.info('Payment processing...');
           // Handle processing state (e.g., disable form, show message)
           break;
         case 'requires_payment_method':
           setMessage('Payment failed. Please try another payment method.');
           toast.error('Payment failed. Please try another payment method.');
           // Reset Elements to allow trying again
           elements.getElement('payment')?.clear();
           break;
         default:
           setMessage('Something went wrong.');
           toast.error('Something went wrong during payment.');
           break;
       }
    } else {
       // Should not happen if redirect: 'if_required' is used without immediate error
       setMessage('An unexpected state occurred.');
       toast.error('An unexpected state occurred during payment.');
    }


    setIsLoading(false);
  };

  const paymentElementOptions: StripePaymentElementOptions = {
    layout: 'tabs', // or 'accordion'
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <h2 className="mb-4 text-xl font-semibold">Payment Details</h2>

      {/* Optional: Email collection for guest checkout / Link */}
      {/* <LinkAuthenticationElement
        id="link-authentication-element"
        onChange={(e) => setEmail(e.value.email)}
        className="mb-4"
      /> */}

      <PaymentElement id="payment-element" options={paymentElementOptions} className="mb-4" />

      <Button disabled={isLoading || !stripe || !elements} id="submit" className="w-full">
        <span id="button-text">
          {isLoading ? (
             <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            `Pay ${formatCurrency(orderAmount)}`
          )}
        </span>
      </Button>

      {/* Show any error or success messages */}
      {message && <div id="payment-message" className="mt-4 text-center text-sm text-destructive">{message}</div>}
    </form>
  );
}
