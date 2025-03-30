'use server';

import * as z from 'zod';
import { db } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth-utils';
import { Role } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';

// Helper function to check admin role
async function isAdmin(): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId) return false;
  const user = await db.user.findUnique({ where: { id: userId }, select: { role: true } });
  return user?.role === Role.ADMIN;
}

// Schema for category input
const CategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters.'),
});

type CategoryInput = z.infer<typeof CategorySchema>;

interface ActionResult {
  success: boolean;
  error?: string;
  categoryId?: string;
}

// Helper function to generate slug (basic example)
function generateSlug(name: string): string {
   return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
}

/**
 * Fetches all categories.
 */
export async function fetchCategories() {
   // No admin check needed for fetching public data? Or maybe restrict?
   // For now, allow fetching by anyone.
   try {
      return await db.category.findMany({
         orderBy: { name: 'asc' },
      });
   } catch (error) {
      console.error('Database Error: Failed to fetch categories.', error);
      return [];
   }
}

/**
 * Creates a new category.
 */
export async function createCategory(values: CategoryInput): Promise<ActionResult> {
  if (!(await isAdmin())) {
    return { success: false, error: 'Unauthorized' };
  }

  const validatedFields = CategorySchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, error: 'Invalid input data.' };
  }
  const { name } = validatedFields.data;
  const slug = generateSlug(name);
  // TODO: Ensure slug uniqueness

  try {
    const newCategory = await db.category.create({
      data: { name, slug },
    });
    console.log(`Category created: ${newCategory.id}`);
    revalidatePath('/admin/categories');
    // Revalidate other paths if categories are shown elsewhere
    return { success: true, categoryId: newCategory.id };
  } catch (error) {
    console.error('Error creating category:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
       return { success: false, error: 'A category with this name/slug might already exist.' };
    }
    return { success: false, error: 'Failed to create category.' };
  }
}

/**
 * Updates an existing category.
 */
export async function updateCategory(
  categoryId: string,
  values: CategoryInput
): Promise<ActionResult> {
   if (!(await isAdmin())) {
    return { success: false, error: 'Unauthorized' };
  }

  const validatedFields = CategorySchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, error: 'Invalid input data.' };
  }
   const { name } = validatedFields.data;
   const slug = generateSlug(name);
   // TODO: Ensure slug uniqueness

   try {
      const updatedCategory = await db.category.update({
         where: { id: categoryId },
         data: { name, slug },
      });
      console.log(`Category updated: ${updatedCategory.id}`);
      revalidatePath('/admin/categories');
      // Revalidate product pages if category name is shown
      return { success: true, categoryId: updatedCategory.id };
   } catch (error) {
      console.error(`Error updating category ${categoryId}:`, error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
         if (error.code === 'P2002') {
            return { success: false, error: 'A category with this name/slug might already exist.' };
         }
         if (error.code === 'P2025') {
             return { success: false, error: 'Category not found.' };
         }
      }
      return { success: false, error: 'Failed to update category.' };
   }
}

/**
 * Deletes a category.
 * NOTE: This might fail if products are associated with it, depending on schema relations.
 * Consider preventing deletion if products exist or re-assigning products first.
 */
export async function deleteCategory(categoryId: string): Promise<ActionResult> {
   if (!(await isAdmin())) {
    return { success: false, error: 'Unauthorized' };
  }

  // Optional: Check if any products are using this category
  const productCount = await db.product.count({ where: { categoryId } });
  if (productCount > 0) {
     return { success: false, error: `Cannot delete category with ${productCount} associated product(s). Reassign products first.` };
  }

  try {
     await db.category.delete({
        where: { id: categoryId },
     });
     console.log(`Category deleted: ${categoryId}`);
     revalidatePath('/admin/categories');
     return { success: true };
  } catch (error) {
     console.error(`Error deleting category ${categoryId}:`, error);
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
         return { success: false, error: 'Category not found.' };
      }
     return { success: false, error: 'Failed to delete category.' };
  }
}
