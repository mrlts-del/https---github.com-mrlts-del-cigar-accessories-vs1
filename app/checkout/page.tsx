import React from 'react';
import { OrderSummary } from '@/components/checkout/order-summary'; // Import OrderSummary
// TODO: Import other checkout components

export default function CheckoutPage() {
  // Middleware should ensure user is logged in
  // Cart data comes from client-side Zustand store, rendered in OrderSummary

  return (
    <div>
      <h1 className="mb-6 text-3xl font-semibold">Checkout</h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content (Steps, Forms) */}
        <div className="lg:col-span-2">
          {/* TODO: Implement Stepper Component */}
          <div className="rounded border p-8 shadow">
            <p className="text-center text-muted-foreground">
              Checkout steps (Address, Shipping, Payment, Review) will go here.
            </p>
            {/* Example: <CheckoutStepper /> */}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          {/* OrderSummary is a client component using Zustand */}
          <OrderSummary />
        </div>
      </div>
    </div>
  );
}
