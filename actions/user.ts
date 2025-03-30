'use server';

import { db } from '@/lib/db';
import type { Address, User } from '@prisma/client';
import { getCurrentUserId } from '@/lib/auth-utils';
import * as z from 'zod';
import { revalidatePath } from 'next/cache';
import { Role, Prisma } from '@prisma/client'; // Import Prisma

// Helper function to check admin role
async function isAdmin(): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId) return false;
  const user = await db.user.findUnique({ where: { id: userId }, select: { role: true } });
  return user?.role === Role.ADMIN;
}

// --- Schemas ---

const AddressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  zip: z.string().min(1, 'ZIP / Postal code is required'),
  country: z.string().min(1, 'Country is required'),
});
type AddressInput = z.infer<typeof AddressSchema>;

const UpdateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required.').optional(),
  // Add other updatable fields here if needed
});
type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

// --- Result Type ---
interface ActionResult {
  success: boolean;
  error?: string;
}

// --- Address Actions ---

export async function getUserAddresses(): Promise<Address[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];
  try {
    return await db.address.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  } catch (error) {
    console.error('Database Error: Failed to fetch user addresses.', error);
    return [];
  }
}

export async function addAddress(values: AddressInput): Promise<Address | null> {
  const userId = await getCurrentUserId();
  if (!userId) { console.error('addAddress: User not authenticated.'); return null; }
  const validatedFields = AddressSchema.safeParse(values);
  if (!validatedFields.success) { console.error('addAddress: Server-side validation failed:', validatedFields.error); return null; }
  try {
    const newAddress = await db.address.create({ data: { ...validatedFields.data, userId: userId } });
    console.log('Address added successfully for user:', userId);
    revalidatePath('/checkout');
    revalidatePath('/account/addresses');
    return newAddress;
  } catch (error) {
    console.error('Database Error: Failed to add address.', error);
    return null;
  }
}

// --- User Actions (Admin) ---

export async function getAllUsers(): Promise<Omit<User, 'password'>[]> {
   if (!(await isAdmin())) { console.warn('Non-admin user attempted to fetch all users.'); return []; }
   try {
      return await db.user.findMany({
         select: { id: true, name: true, email: true, emailVerified: true, image: true, role: true, createdAt: true, updatedAt: true },
         orderBy: { createdAt: 'desc' },
      });
   } catch (error) {
      console.error('Database Error: Failed to fetch all users.', error);
      return [];
   }
}

export async function updateUserRole(userIdToUpdate: string, newRole: Role): Promise<ActionResult> {
   if (!(await isAdmin())) { return { success: false, error: 'Unauthorized' }; }
   const currentUserId = await getCurrentUserId();
   if (currentUserId === userIdToUpdate) { return { success: false, error: 'Admins cannot change their own role.' }; }
   if (!Object.values(Role).includes(newRole)) { return { success: false, error: 'Invalid role value.' }; }
   try {
      await db.user.update({ where: { id: userIdToUpdate }, data: { role: newRole } });
      console.log(`User ${userIdToUpdate} role updated to ${newRole}`);
      revalidatePath('/admin/users');
      return { success: true };
   } catch (error: any) {
      console.error(`Error updating role for user ${userIdToUpdate}:`, error);
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') { return { success: false, error: 'User not found.' }; }
      return { success: false, error: 'Failed to update user role.' };
   }
}

export async function deleteUser(userIdToDelete: string): Promise<ActionResult> {
   if (!(await isAdmin())) { return { success: false, error: 'Unauthorized' }; }
   const currentUserId = await getCurrentUserId();
   if (currentUserId === userIdToDelete) { return { success: false, error: 'Admins cannot delete their own account.' }; }
   try {
      await db.user.delete({ where: { id: userIdToDelete } });
      console.log(`User ${userIdToDelete} deleted successfully.`);
      revalidatePath('/admin/users');
      return { success: true };
   } catch (error: any) {
      console.error(`Error deleting user ${userIdToDelete}:`, error);
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') { return { success: false, error: 'User not found.' }; }
      return { success: false, error: 'Failed to delete user.' };
   }
}

// --- User Actions (Self) ---

/**
 * Updates the profile (e.g., name) of the currently logged-in user.
 */
export async function updateUserProfile(values: UpdateProfileInput): Promise<ActionResult> {
   const userId = await getCurrentUserId();
   if (!userId) {
     return { success: false, error: 'User not authenticated.' };
   }

   const validatedFields = UpdateProfileSchema.safeParse(values);
   if (!validatedFields.success) {
     return { success: false, error: 'Invalid input data.' };
   }

   // Filter out undefined values so Prisma doesn't try to set them to null
   const dataToUpdate: Partial<UpdateProfileInput> = {};
   if (validatedFields.data.name !== undefined) {
      dataToUpdate.name = validatedFields.data.name;
   }
   // Add other fields here if they become updatable

   if (Object.keys(dataToUpdate).length === 0) {
      return { success: false, error: 'No changes provided.' };
   }

   try {
      await db.user.update({
         where: { id: userId },
         data: dataToUpdate,
      });
      console.log(`User profile updated for user ${userId}`);
      revalidatePath('/account/profile'); // Revalidate profile page
      // Revalidate header if name is displayed there? Maybe session update is better.
      // TODO: Consider updating the session data if name changes
      return { success: true };
   } catch (error: any) {
      console.error(`Error updating profile for user ${userId}:`, error);
      return { success: false, error: 'Failed to update profile.' };
   }
}

/**
 * Updates an existing address for the currently logged-in user.
 */
export async function updateAddress(addressId: string, values: AddressInput): Promise<Address | null> {
   const userId = await getCurrentUserId();
   if (!userId) {
     console.error('updateAddress: User not authenticated.');
     return null;
   }

   // Validate input
   const validatedFields = AddressSchema.safeParse(values);
   if (!validatedFields.success) {
     console.error('updateAddress: Server-side validation failed:', validatedFields.error);
     return null;
   }

   try {
      // Verify the address belongs to the current user before updating
      const address = await db.address.findUnique({
         where: { id: addressId },
      });
      if (!address || address.userId !== userId) {
         console.error(`updateAddress: Address ${addressId} not found or does not belong to user ${userId}.`);
         return null; // Or throw an authorization error
      }

      const updatedAddress = await db.address.update({
         where: { id: addressId },
         data: validatedFields.data,
      });
      console.log(`Address ${addressId} updated successfully for user ${userId}`);
      revalidatePath('/account/addresses');
      revalidatePath('/checkout'); // Revalidate checkout in case address was selected
      return updatedAddress;
   } catch (error) {
      console.error(`Database Error: Failed to update address ${addressId}.`, error);
      return null;
   }
}

/**
 * Deletes an address for the currently logged-in user.
 */
export async function deleteAddress(addressId: string): Promise<{ success: boolean; error?: string }> {
   const userId = await getCurrentUserId();
   if (!userId) {
     return { success: false, error: 'User not authenticated.' };
   }

   try {
       // Verify the address belongs to the current user before deleting
      const address = await db.address.findUnique({
         where: { id: addressId },
      });
      if (!address || address.userId !== userId) {
         return { success: false, error: 'Address not found or unauthorized.' };
      }

      // TODO: Check if address is used in any non-completed orders? Prevent deletion?

      await db.address.delete({
         where: { id: addressId },
      });
      console.log(`Address ${addressId} deleted successfully for user ${userId}`);
      revalidatePath('/account/addresses');
      revalidatePath('/checkout');
      return { success: true };
   } catch (error: any) {
      console.error(`Database Error: Failed to delete address ${addressId}.`, error);
       if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
         return { success: false, error: 'Address not found.' };
      }
      return { success: false, error: 'Failed to delete address.' };
   }
}
