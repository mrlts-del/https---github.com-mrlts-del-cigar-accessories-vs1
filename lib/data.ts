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
 * Fetches a paginated list of products with optional sorting, filtering, and search.
 */
export async function fetchProducts(
  page: number = 1,
  limit: number = 12,
  sort: string = 'newest',
  categorySlug?: string,
  query?: string // Optional search query
): Promise<ProductWithDetails[]> {
  const skip = (page - 1) * limit;

  // Define sorting options
  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' }; // Default
  if (sort === 'price-asc') {
    orderBy = { price: 'asc' };
  } else if (sort === 'price-desc') {
    orderBy = { price: 'desc' };
  } // Add more sorting options if needed

  // Define filtering options
  const where: Prisma.ProductWhereInput = {};
  if (categorySlug) {
    where.category = { slug: categorySlug };
  }
  if (query) {
    where.OR = [ // Search in name OR description
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ];
  }

  try {
    const products = await db.product.findMany({
      where: where, // Apply filters
      skip: skip,
      take: limit,
      orderBy: orderBy, // Apply sorting
      include: {
        images: true, // Include related images
        category: {
           select: { name: true }, // Include category name
         },
       },
       // Removed duplicate orderBy
       // TODO: Add take and skip for pagination (take/skip are already implemented above)
    });
    return products;
  } catch (error) {
    console.error('Database Error: Failed to fetch products.', error);
    // Return empty array instead of throwing an error
    return [];
  }
}

/**
 * Fetches the total count of products, optionally filtered by category and search query.
 */
export async function getProductsCount(categorySlug?: string, query?: string): Promise<number> {
   // Define filtering options
   const where: Prisma.ProductWhereInput = {};
   if (categorySlug) {
      where.category = { slug: categorySlug };
   }
    if (query) {
     where.OR = [
       { name: { contains: query, mode: 'insensitive' } },
       { description: { contains: query, mode: 'insensitive' } },
     ];
   }

   try {
      const count = await db.product.count({
         where: where, // Apply filters
      });
      return count;
   } catch (error) {
      console.error('Database Error: Failed to fetch product count.', error);
      return 0;
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
