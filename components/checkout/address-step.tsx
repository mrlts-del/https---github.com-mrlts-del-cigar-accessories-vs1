'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import type { Address } from '@prisma/client';

import { getUserAddresses, addAddress } from '@/actions/user'; // Import addAddress
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { Separator } from '@/components/ui/separator';

// Schema for adding a new address
const addressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(), // Optional state/province
  zip: z.string().min(1, 'ZIP / Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  // TODO: Add phone number?
});

type AddressFormValues = z.infer<typeof addressSchema>;

interface AddressStepProps {
  onAddressSelect: (addressId: string) => void; // Callback when address is selected/added
}

export function AddressStep({ onAddressSelect }: AddressStepProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoadingAddresses, startAddressLoading] = useTransition();
  const [isAddingAddress, startAddingAddress] = useTransition();

  // Fetch addresses on component mount
  useEffect(() => {
    startAddressLoading(async () => {
      const fetchedAddresses = await getUserAddresses();
      setAddresses(fetchedAddresses);
      // Select the first address by default if available
      if (fetchedAddresses.length > 0 && !selectedAddressId) {
        setSelectedAddressId(fetchedAddresses[0].id);
        onAddressSelect(fetchedAddresses[0].id);
      } else if (fetchedAddresses.length === 0) {
         setShowAddForm(true); // Show form if no addresses exist
      }
    });
  }, []); // Run once on mount

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: '',
    },
  });

  async function handleAddAddress(values: AddressFormValues) {
     startAddingAddress(async () => {
        try {
            // Call addAddress server action
            const newAddress = await addAddress(values);
            if (newAddress) {
               setAddresses([newAddress, ...addresses]); // Add to list (prepend)
               setSelectedAddressId(newAddress.id); // Select the new address
               onAddressSelect(newAddress.id);
               setShowAddForm(false); // Hide form
               form.reset(); // Reset form fields
               toast.success("Address added successfully.");
            } else {
               // addAddress action handles internal errors and returns null
               toast.error("Failed to add address. Please check your input or try again.");
            }
        } catch (error) {
            console.error("Failed to add address:", error);
            toast.error("An unexpected error occurred while adding the address.");
        }
     });
  }

  const handleSelectAddress = (value: string) => {
    setSelectedAddressId(value);
    onAddressSelect(value);
    setShowAddForm(false); // Hide add form if selecting existing
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Shipping Address</h2>

      {isLoadingAddresses ? (
        <p>Loading addresses...</p>
      ) : (
        <RadioGroup
          value={selectedAddressId ?? undefined}
          onValueChange={handleSelectAddress}
          className="space-y-4"
        >
          {addresses.map((address) => (
            <Label
              key={address.id}
              htmlFor={`address-${address.id}`}
              className="flex cursor-pointer items-start space-x-3 rounded-md border p-4 [&:has([data-state=checked])]:border-primary"
            >
              <RadioGroupItem value={address.id} id={`address-${address.id}`} />
              <div className="text-sm">
                <p className="font-medium">{address.street}</p>
                <p className="text-muted-foreground">
                  {address.city}, {address.state ? `${address.state} ` : ''}
                  {address.zip}
                </p>
                <p className="text-muted-foreground">{address.country}</p>
              </div>
            </Label>
          ))}
        </RadioGroup>
      )}

      <Separator />

      {showAddForm ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add New Address</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddAddress)} className="space-y-4">
                {/* Street */}
                <FormField control={form.control} name="street" render={({ field }) => (
                    <FormItem> <FormLabel>Street Address</FormLabel> <FormControl> <Input placeholder="123 Main St" {...field} disabled={isAddingAddress} /> </FormControl> <FormMessage /> </FormItem>
                )}/>
                {/* City */}
                 <FormField control={form.control} name="city" render={({ field }) => (
                    <FormItem> <FormLabel>City</FormLabel> <FormControl> <Input placeholder="Anytown" {...field} disabled={isAddingAddress} /> </FormControl> <FormMessage /> </FormItem>
                )}/>
                 {/* State / Province (Optional) */}
                 <FormField control={form.control} name="state" render={({ field }) => (
                    <FormItem> <FormLabel>State / Province (Optional)</FormLabel> <FormControl> <Input placeholder="CA" {...field} disabled={isAddingAddress} /> </FormControl> <FormMessage /> </FormItem>
                )}/>
                 {/* ZIP / Postal Code */}
                 <FormField control={form.control} name="zip" render={({ field }) => (
                    <FormItem> <FormLabel>ZIP / Postal Code</FormLabel> <FormControl> <Input placeholder="90210" {...field} disabled={isAddingAddress} /> </FormControl> <FormMessage /> </FormItem>
                )}/>
                 {/* Country */}
                 <FormField control={form.control} name="country" render={({ field }) => (
                    <FormItem> <FormLabel>Country</FormLabel> <FormControl> <Input placeholder="United States" {...field} disabled={isAddingAddress} /> </FormControl> <FormMessage /> </FormItem>
                )}/>

                <div className="flex justify-end gap-2 pt-2">
                   <Button type="button" variant="outline" onClick={() => setShowAddForm(false)} disabled={isAddingAddress}>Cancel</Button>
                   <Button type="submit" disabled={isAddingAddress}>
                     {isAddingAddress && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                     Save Address
                   </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" onClick={() => setShowAddForm(true)}>
          Add New Address
        </Button>
      )}

       {/* TODO: Add button to proceed to next step, disabled until address selected */}
       <div className="pt-4 text-right">
          <Button disabled={!selectedAddressId}>
             Continue to Shipping {/* Placeholder */}
          </Button>
       </div>
    </div>
  );
}
