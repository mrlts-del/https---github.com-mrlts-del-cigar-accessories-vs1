'use server';

import * as z from 'zod';
import { db } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth-utils';
import { Role } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
// TODO: Import function to delete images from Uploadthing if needed

// Helper function to check admin role
async function isAdmin(): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId) return false;
  const user = await db.user.findUnique({ where: { id: userId }, select: { role: true } });
  return user?.role === Role.ADMIN;
}

// Schema for product data (excluding images initially, handled separately)
const ProductBaseSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  price: z.coerce.number().min(0),
  categoryId: z.string().min(1),
  stock: z.coerce.number().int().min(0),
});

// Schema for image data expected from the form
const ImageSchema = z.object({ key: z.string(), url: z.string() });

// Combined schema for full product creation/update
const ProductInputSchema = ProductBaseSchema.extend({
  images: z.array(ImageSchema).min(1, 'At least one image is required.'),
});

type ProductInput = z.infer<typeof ProductInputSchema>;

interface ActionResult {
  success: boolean;
  error?: string;
  productId?: string; // Return ID on success
}

// Helper function to generate slug (basic example)
function generateSlug(name: string): string {
   return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
}

/**
 * Creates a new product.
 */
export async function createProduct(values: ProductInput): Promise<ActionResult> {
  if (!(await isAdmin())) {
    return { success: false, error: 'Unauthorized' };
  }

  const validatedFields = ProductInputSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, error: 'Invalid input data.' };
  }
  const { images, ...productData } = validatedFields.data;

  // Generate slug (consider checking for uniqueness)
  const slug = generateSlug(productData.name);
  // TODO: Add logic to ensure slug uniqueness (e.g., append number if exists)

  try {
    const newProduct = await db.product.create({
      data: {
        ...productData,
        slug: slug, // Add generated slug
        images: {
          // Create related image records
          create: images.map(img => ({ url: img.url /* , key: img.key // Store key if needed for deletion */ })),
        },
      },
    });
    console.log(`Product created: ${newProduct.id}`);
    revalidatePath('/admin/products');
    revalidatePath('/products'); // Revalidate public product listing
    return { success: true, productId: newProduct.id };
  } catch (error) {
    console.error('Error creating product:', error);
    // Handle potential unique constraint errors (e.g., slug)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
       return { success: false, error: 'A product with this name/slug might already exist.' };
    }
    return { success: false, error: 'Failed to create product.' };
  }
}

/**
 * Updates an existing product.
 */
export async function updateProduct(
  productId: string,
  values: ProductInput
): Promise<ActionResult> {
   if (!(await isAdmin())) {
    return { success: false, error: 'Unauthorized' };
  }

  const validatedFields = ProductInputSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, error: 'Invalid input data.' };
  }
   const { images, ...productData } = validatedFields.data;

   // Regenerate slug if name changed (optional, consider implications)
   const slug = generateSlug(productData.name);
   // TODO: Ensure slug uniqueness if regenerating

   try {
      // Use transaction to update product and manage images
      await db.$transaction(async (tx) => {
         // 1. Update product base data
         await tx.product.update({
            where: { id: productId },
            data: {
               ...productData,
               slug: slug, // Update slug if needed
            },
         });

         // 2. Get current images from DB
         const currentImages = await tx.image.findMany({ where: { productId } });
         const currentImageUrls = currentImages.map(img => img.url);
         const newImageUrls = images.map(img => img.url);

         // 3. Identify images to delete (in DB but not in new list)
         const imagesToDelete = currentImages.filter(img => !newImageUrls.includes(img.url));
         if (imagesToDelete.length > 0) {
            await tx.image.deleteMany({
               where: { id: { in: imagesToDelete.map(img => img.id) } },
            });
            // TODO: Trigger deletion from Uploadthing using keys if stored
            // await Promise.all(imagesToDelete.map(img => deleteImageAction(img.key)));
            console.log(`Deleted ${imagesToDelete.length} images for product ${productId}`);
         }

         // 4. Identify images to add (in new list but not in DB)
         const imagesToAdd = images.filter(img => !currentImageUrls.includes(img.url));
         if (imagesToAdd.length > 0) {
            await tx.image.createMany({
               data: imagesToAdd.map(img => ({
                  productId: productId,
                  url: img.url,
                  // key: img.key // Store key if needed
               })),
            });
             console.log(`Added ${imagesToAdd.length} images for product ${productId}`);
         }
      });

      console.log(`Product updated: ${productId}`);
      revalidatePath('/admin/products');
      revalidatePath(`/product/${slug}`); // Revalidate specific product page
      revalidatePath('/products');
      return { success: true, productId: productId };

   } catch (error) {
      console.error(`Error updating product ${productId}:`, error);
       if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
         return { success: false, error: 'A product with this name/slug might already exist.' };
      }
      return { success: false, error: 'Failed to update product.' };
   }
}


/**
 * Deletes a product.
 */
export async function deleteProduct(productId: string): Promise<ActionResult> {
   if (!(await isAdmin())) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
     // Use transaction? Maybe not strictly necessary if cascade delete is set up,
     // but needed if deleting images from storage first.

     // TODO: Delete associated images from Uploadthing/storage first

     // Delete the product (related images, order items might cascade delete depending on schema)
     await db.product.delete({
        where: { id: productId },
     });

     console.log(`Product deleted: ${productId}`);
     revalidatePath('/admin/products');
     revalidatePath('/products');
     return { success: true };
  } catch (error) {
     console.error(`Error deleting product ${productId}:`, error);
     // Handle specific errors like product not found (P2025)
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
         return { success: false, error: 'Product not found.' };
      }
     return { success: false, error: 'Failed to delete product.' };
  }
}
