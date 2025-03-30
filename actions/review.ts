'use server';

import * as z from 'zod';
import { db } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';

// Schema for submitting a review
const SubmitReviewSchema = z.object({
  productId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

type SubmitReviewInput = z.infer<typeof SubmitReviewSchema>;

interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Submits a new review or updates an existing one for a product by the current user.
 */
export async function submitReview(
  values: SubmitReviewInput
): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, error: 'User not authenticated.' };
  }

  // Validate input
  const validatedFields = SubmitReviewSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, error: 'Invalid input data.' };
  }
  const { productId, rating, comment } = validatedFields.data;

  // TODO: Verify if the user has purchased this product before allowing review.
  // This requires checking the Order history.
  // const userOrders = await db.order.findMany({
  //   where: { userId, status: 'DELIVERED' /* or other completed status */ },
  //   include: { items: { where: { productId } } },
  // });
  // if (userOrders.length === 0 || userOrders.every(order => order.items.length === 0)) {
  //   return { success: false, error: 'You must purchase this product to leave a review.' };
  // }

  try {
    // Use upsert to create or update the review
    await db.review.upsert({
      where: {
        // Unique constraint defined in schema
        userId_productId: {
          userId: userId,
          productId: productId,
        },
      },
      update: {
        // Update existing review
        rating: rating,
        comment: comment,
      },
      create: {
        // Create new review
        userId: userId,
        productId: productId,
        rating: rating,
        comment: comment,
      },
    });

    console.log(`Review submitted/updated for product ${productId} by user ${userId}`);

    // Revalidate the product page to show the new review
    const product = await db.product.findUnique({ where: { id: productId }, select: { slug: true } });
    if (product?.slug) {
       revalidatePath(`/product/${product.slug}`);
    }

    return { success: true };

  } catch (error) {
    console.error('Error submitting review:', error);
    return { success: false, error: 'Failed to submit review.' };
  }
}

/**
 * Fetches reviews for a specific product.
 */
export async function getProductReviews(productId: string) {
  try {
    const reviews = await db.review.findMany({
      where: { productId },
      include: {
        user: {
          select: { name: true, image: true }, // Select user details to display
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return reviews;
  } catch (error) {
    console.error(`Error fetching reviews for product ${productId}:`, error);
    return []; // Return empty array on error
  }
}
