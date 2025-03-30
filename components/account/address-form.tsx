'use client';

import React, { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import type { Address } from '@prisma/client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Icons } from '@/components/icons';
import { addAddress, updateAddress } from '@/actions/user'; // Import actions

// Schema matches the one in actions/user.ts
const addressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  zip: z.string().min(1, 'ZIP / Postal code is required'),
  country: z.string().min(1, 'Country is required'),
});

type AddressFormValues = z.infer<typeof addressSchema>;

interface AddressFormProps {
  initialData?: Address | null; // For editing
  onSuccess?: () => void; // Optional callback on success
}

export function AddressForm({ initialData, onSuccess }: AddressFormProps) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!initialData;

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: initialData ? {
        street: initialData.street ?? '',
        city: initialData.city ?? '',
        state: initialData.state ?? '', // Handle null state
        zip: initialData.zip ?? '',
        country: initialData.country ?? '',
    } : {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: '',
    },
  });

  async function onSubmit(values: AddressFormValues) {
    startTransition(async () => {
      try {
        let result: Address | { error?: string } | null;
        if (isEditing && initialData) {
          result = await updateAddress(initialData.id, values);
          if (result && 'id' in result) { // Check if it's an Address object (success)
            toast.success('Address updated successfully!');
             onSuccess?.();
           } else {
             // Type assertion for the error case
             const errorMsg = (result as { error?: string } | null)?.error || 'Failed to update address.';
             toast.error(errorMsg);
           }
         } else {
          result = await addAddress(values);
          if (result && 'id' in result) {
            toast.success('Address added successfully!');
            form.reset(); // Reset form only on add
             onSuccess?.();
           } else {
              // Type assertion for the error case
              const errorMsg = (result as { error?: string } | null)?.error || 'Failed to add address.';
              toast.error(errorMsg);
           }
         }
      } catch (error) {
        console.error('Address form error:', error);
        toast.error('An unexpected error occurred.');
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
         <FormField control={form.control} name="street" render={({ field }) => ( <FormItem> <FormLabel>Street Address</FormLabel> <FormControl> <Input placeholder="123 Main St" {...field} disabled={isPending} /> </FormControl> <FormMessage /> </FormItem> )}/>
         <FormField control={form.control} name="city" render={({ field }) => ( <FormItem> <FormLabel>City</FormLabel> <FormControl> <Input placeholder="Anytown" {...field} disabled={isPending} /> </FormControl> <FormMessage /> </FormItem> )}/>
         <FormField control={form.control} name="state" render={({ field }) => ( <FormItem> <FormLabel>State / Province (Optional)</FormLabel> <FormControl> <Input placeholder="CA" {...field} disabled={isPending} /> </FormControl> <FormMessage /> </FormItem> )}/>
         <FormField control={form.control} name="zip" render={({ field }) => ( <FormItem> <FormLabel>ZIP / Postal Code</FormLabel> <FormControl> <Input placeholder="90210" {...field} disabled={isPending} /> </FormControl> <FormMessage /> </FormItem> )}/>
         <FormField control={form.control} name="country" render={({ field }) => ( <FormItem> <FormLabel>Country</FormLabel> <FormControl> <Input placeholder="United States" {...field} disabled={isPending} /> </FormControl> <FormMessage /> </FormItem> )}/>
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Save Changes' : 'Add Address'}
        </Button>
      </form>
    </Form>
  );
}
