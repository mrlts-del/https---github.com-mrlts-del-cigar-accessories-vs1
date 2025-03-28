import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

// Define the type for the product data we want to fetch, including images and category name
export type ProductWithDetails = Prisma.ProductGetPayload<{
  include: {
    images: true;
    category: {
      select: { name: true };
    };
  };
}>;

/**
 * Fetches a list of products.
 * TODO: Add parameters for pagination, filtering, sorting.
 */
export async function fetchProducts(): Promise<ProductWithDetails[]> {
  try {
    const products = await db.product.findMany({
      include: {
        images: true, // Include related images
        category: {
          select: { name: true }, // Include category name
        },
      },
      orderBy: {
        createdAt: 'desc', // Default sort by newest
      },
      // TODO: Add take and skip for pagination
    });
    return products;
  } catch (error) {
    console.error('Database Error: Failed to fetch products.', error);
    // In a real app, you might throw a more specific error or return an empty array
    throw new Error('Failed to fetch products.');
  }
}

/**
 * Fetches a single product by its slug.
 * @param slug - The product slug.
 * @returns The product details or null if not found.
 */
export async function fetchProductBySlug(
  slug: string
): Promise<ProductWithDetails | null> {
  try {
    const product = await db.product.findUnique({
      where: { slug },
      include: {
        images: true,
        category: {
          select: { name: true },
        },
        // TODO: Include reviews later
      },
    });
    return product;
  } catch (error) {
    console.error(`Database Error: Failed to fetch product with slug "${slug}".`, error);
    // Return null or throw an error based on how you want to handle DB errors
    return null;
    // throw new Error(`Failed to fetch product: ${slug}`);
  }
}
