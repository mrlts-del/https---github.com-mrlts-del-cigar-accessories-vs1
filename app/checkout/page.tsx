'use client';

import React, { useState } from 'react';
import { OrderSummary } from '@/components/checkout/order-summary';
import { AddressStep } from '@/components/checkout/address-step';
import { CheckoutForm } from '@/components/checkout/checkout-form';
import { ShippingStep, type ShippingOption } from '@/components/checkout/shipping-step';
import { ReviewStep } from '@/components/checkout/review-step'; // Import ReviewStep

export default function CheckoutPage() {
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedShippingOption, setSelectedShippingOption] = useState<ShippingOption | null>(null);
  const [currentStep, setCurrentStep] = useState<'address' | 'shipping' | 'payment' | 'review'>('address');
  const [orderId, setOrderId] = useState<string | null>(null); // Store created order ID

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    setCurrentStep('shipping');
  };

  const handleShippingSelect = (option: ShippingOption) => {
    setSelectedShippingOption(option);
    setCurrentStep('payment');
  };

  const handleOrderCreated = (createdOrderId: string) => {
    setOrderId(createdOrderId);
    setCurrentStep('review'); // Move to review/confirmation step
  };

  return (
    <div>
      {/* Hide title on review step? */}
      {currentStep !== 'review' && (
         <h1 className="mb-6 text-3xl font-semibold">Checkout</h1>
      )}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content (Steps, Forms) */}
        <div className="lg:col-span-2">
          {currentStep === 'address' && (
            <AddressStep onAddressSelect={handleAddressSelect} />
          )}
          {currentStep === 'shipping' && selectedAddressId && (
             <ShippingStep onShippingSelect={handleShippingSelect} />
           )}
          {currentStep === 'payment' && selectedAddressId && selectedShippingOption && (
            <CheckoutForm
              addressId={selectedAddressId}
              // Pass shippingOption if needed by createOrder or payment intent
              onOrderCreated={handleOrderCreated}
            />
          )}
           {currentStep === 'review' && orderId && (
             <ReviewStep orderId={orderId} /> // Render ReviewStep
           )}
        </div>

        {/* Order Summary (Hide on review step?) */}
        {currentStep !== 'review' && (
           <div className="lg:col-span-1">
             <OrderSummary selectedShippingOption={selectedShippingOption} />
           </div>
        )}
      </div>
    </div>
  );
}
