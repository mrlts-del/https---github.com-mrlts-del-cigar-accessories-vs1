'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import type { Address } from '@prisma/client';

import { getUserAddresses, addAddress } from '@/actions/user';
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

const addressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  zip: z.string().min(1, 'ZIP / Postal code is required'),
  country: z.string().min(1, 'Country is required'),
});

type AddressFormValues = z.infer<typeof addressSchema>;

interface AddressStepProps {
  onAddressSelect: (addressId: string) => void;
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
      // Select the first address by default if available and none is selected
      if (fetchedAddresses.length > 0 && !selectedAddressId) {
        const firstAddressId = fetchedAddresses[0].id;
        setSelectedAddressId(firstAddressId);
        onAddressSelect(firstAddressId); // Call callback with the default selection
      } else if (fetchedAddresses.length === 0) {
         setShowAddForm(true);
      }
    });
  // Add missing dependencies: onAddressSelect, selectedAddressId
  // Note: Adding onAddressSelect might cause infinite loops if it's not memoized (useCallback)
  // in the parent component. For now, we add it as requested by the lint rule.
  // If issues arise, consider memoizing onAddressSelect in CheckoutPage.
  }, [onAddressSelect, selectedAddressId]);

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: { street: '', city: '', state: '', zip: '', country: '' },
  });

  async function handleAddAddress(values: AddressFormValues) {
     startAddingAddress(async () => {
        try {
            const newAddress = await addAddress(values);
            if (newAddress) {
               setAddresses([newAddress, ...addresses]);
               setSelectedAddressId(newAddress.id);
               onAddressSelect(newAddress.id);
               setShowAddForm(false);
               form.reset();
               toast.success("Address added successfully.");
            } else {
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
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Shipping Address</h2>
      {isLoadingAddresses ? ( <p>Loading addresses...</p> ) : (
        <RadioGroup value={selectedAddressId ?? undefined} onValueChange={handleSelectAddress} className="space-y-4">
          {addresses.map((address) => (
            <Label key={address.id} htmlFor={`address-${address.id}`} className="flex cursor-pointer items-start space-x-3 rounded-md border p-4 [&:has([data-state=checked])]:border-primary">
              <RadioGroupItem value={address.id} id={`address-${address.id}`} />
              <div className="text-sm">
                <p className="font-medium">{address.street}</p>
                <p className="text-muted-foreground"> {address.city}, {address.state ? `${address.state} ` : ''} {address.zip} </p>
                <p className="text-muted-foreground">{address.country}</p>
              </div>
            </Label>
          ))}
        </RadioGroup>
      )}
      <Separator />
      {showAddForm ? (
        <Card>
          <CardHeader> <CardTitle className="text-lg">Add New Address</CardTitle> </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddAddress)} className="space-y-4">
                <FormField control={form.control} name="street" render={({ field }) => ( <FormItem> <FormLabel>Street Address</FormLabel> <FormControl> <Input placeholder="123 Main St" {...field} disabled={isAddingAddress} /> </FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="city" render={({ field }) => ( <FormItem> <FormLabel>City</FormLabel> <FormControl> <Input placeholder="Anytown" {...field} disabled={isAddingAddress} /> </FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="state" render={({ field }) => ( <FormItem> <FormLabel>State / Province (Optional)</FormLabel> <FormControl> <Input placeholder="CA" {...field} disabled={isAddingAddress} /> </FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="zip" render={({ field }) => ( <FormItem> <FormLabel>ZIP / Postal Code</FormLabel> <FormControl> <Input placeholder="90210" {...field} disabled={isAddingAddress} /> </FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="country" render={({ field }) => ( <FormItem> <FormLabel>Country</FormLabel> <FormControl> <Input placeholder="United States" {...field} disabled={isAddingAddress} /> </FormControl> <FormMessage /> </FormItem> )}/>
                <div className="flex justify-end gap-2 pt-2">
                   <Button type="button" variant="outline" onClick={() => setShowAddForm(false)} disabled={isAddingAddress}>Cancel</Button>
                   <Button type="submit" disabled={isAddingAddress}> {isAddingAddress && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />} Save Address </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" onClick={() => setShowAddForm(true)}> Add New Address </Button>
      )}
       {/* Remove the explicit continue button as selection triggers the next step via onAddressSelect */}
       {/* <div className="pt-4 text-right"> <Button disabled={!selectedAddressId}> Continue to Shipping </Button> </div> */}
    </div>
  );
}
