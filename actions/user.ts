'use server';

import { db } from '@/lib/db';
import type { Address } from '@prisma/client';
import { getCurrentUserId } from '@/lib/auth-utils';
import * as z from 'zod';
import { revalidatePath } from 'next/cache'; // Import revalidatePath

// Schema for adding/editing an address
const AddressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  zip: z.string().min(1, 'ZIP / Postal code is required'),
  country: z.string().min(1, 'Country is required'),
});

type AddressInput = z.infer<typeof AddressSchema>;

/**
 * Fetches addresses for the currently logged-in user.
 */
export async function getUserAddresses(): Promise<Address[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  try {
    return await db.address.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Database Error: Failed to fetch user addresses.', error);
    return [];
  }
}

/**
 * Adds a new address for the currently logged-in user.
 */
export async function addAddress(values: AddressInput): Promise<Address | null> {
  const userId = await getCurrentUserId();
  if (!userId) {
    console.error('addAddress: User not authenticated.');
    // Optionally throw an error or return null/error object
    return null;
  }

  // Validate input on the server
  const validatedFields = AddressSchema.safeParse(values);
  if (!validatedFields.success) {
    console.error('addAddress: Server-side validation failed:', validatedFields.error);
    // Consider throwing a validation error or returning null
    return null;
  }

  try {
    const newAddress = await db.address.create({
      data: {
        ...validatedFields.data,
        userId: userId,
      },
    });
    console.log('Address added successfully for user:', userId);
    // Revalidate paths where addresses might be displayed (e.g., checkout, account)
    revalidatePath('/checkout');
    revalidatePath('/account/addresses'); // Assuming an account addresses page exists
    return newAddress;
  } catch (error) {
    console.error('Database Error: Failed to add address.', error);
    return null; // Return null on error
  }
}

// TODO: Add actions to update/delete addresses
