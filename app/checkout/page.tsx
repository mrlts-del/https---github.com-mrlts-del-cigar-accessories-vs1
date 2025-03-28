'use client';

import React, { useState } from 'react';
import { OrderSummary } from '@/components/checkout/order-summary';
import { AddressStep } from '@/components/checkout/address-step';
import { CheckoutForm } from '@/components/checkout/checkout-form';
// TODO: Import ShippingStep, ReviewStep

export default function CheckoutPage() {
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'address' | 'shipping' | 'payment' | 'review'>('address');
  const [orderId, setOrderId] = useState<string | null>(null); // Store created order ID

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    console.log('Selected Address ID:', addressId);
    // Skip shipping for now
    setCurrentStep('payment');
  };

  // TODO: Implement handleShippingSelect

  // Renamed handler and updated logic
  const handleOrderCreated = (createdOrderId: string) => {
    console.log('Order created successfully! Order ID:', createdOrderId);
    setOrderId(createdOrderId);
    // setCurrentStep('review'); // Move to review step
    // Or redirect to a success page immediately
    // router.push(`/order/success?orderId=${createdOrderId}`);
    // For now, just log and maybe show a success message or move to a placeholder review step
    setCurrentStep('review'); // Go to placeholder review step
  };

  return (
    <div>
      <h1 className="mb-6 text-3xl font-semibold">Checkout</h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content (Steps, Forms) */}
        <div className="lg:col-span-2">
          {currentStep === 'address' && (
            <AddressStep onAddressSelect={handleAddressSelect} />
          )}
          {/* TODO: Render ShippingStep */}
          {currentStep === 'shipping' && (
             <div className="rounded border p-8 shadow">
               <p className="text-center text-muted-foreground">
                 Step: {currentStep} (Shipping Component not implemented yet)
               </p>
             </div>
           )}

          {/* Render PaymentStep via CheckoutForm */}
          {currentStep === 'payment' && selectedAddressId && (
            <CheckoutForm
              addressId={selectedAddressId} // Pass selected address ID
              onOrderCreated={handleOrderCreated} // Pass the correct handler
            />
          )}

          {/* TODO: Render ReviewStep */}
           {currentStep === 'review' && orderId && (
             <div className="rounded border p-8 shadow">
               <h2 className="text-xl font-semibold mb-4">Order Confirmed!</h2>
               <p className="text-center text-muted-foreground">
                 Your order (ID: {orderId}) has been placed successfully.
                 (Review Component not implemented yet)
               </p>
               {/* Add link to order details page */}
             </div>
           )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <OrderSummary />
        </div>
      </div>
    </div>
  );
}
