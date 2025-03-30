'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils';

// Placeholder shipping options
const shippingOptions = [
  { id: 'standard', name: 'Standard Shipping', price: 0, description: '5-7 business days' },
  { id: 'express', name: 'Express Shipping', price: 15.00, description: '2-3 business days' },
  // Add more options as needed
];

export type ShippingOption = typeof shippingOptions[number];

interface ShippingStepProps {
  onShippingSelect: (option: ShippingOption) => void;
}

export function ShippingStep({ onShippingSelect }: ShippingStepProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const handleSelectOption = (value: string) => {
    setSelectedOptionId(value);
  };

  const handleContinue = () => {
    const selectedOption = shippingOptions.find(opt => opt.id === selectedOptionId);
    if (selectedOption) {
      onShippingSelect(selectedOption);
    } else {
      // Handle case where no option is selected (though button should be disabled)
      console.error("No shipping option selected.");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Shipping Method</h2>
      <RadioGroup
        value={selectedOptionId ?? undefined}
        onValueChange={handleSelectOption}
        className="space-y-4"
      >
        {shippingOptions.map((option) => (
          <Label
            key={option.id}
            htmlFor={`shipping-${option.id}`}
            className="flex cursor-pointer items-start justify-between rounded-md border p-4 [&:has([data-state=checked])]:border-primary"
          >
            <div className="flex items-center space-x-3">
               <RadioGroupItem value={option.id} id={`shipping-${option.id}`} />
               <div className="text-sm">
                 <p className="font-medium">{option.name}</p>
                 <p className="text-muted-foreground">{option.description}</p>
               </div>
            </div>
             <span className="font-medium text-sm">
               {option.price === 0 ? 'Free' : formatCurrency(option.price)}
             </span>
          </Label>
        ))}
      </RadioGroup>

      <div className="pt-4 text-right">
        <Button onClick={handleContinue} disabled={!selectedOptionId}>
          Continue to Payment
        </Button>
      </div>
    </div>
  );
}
