'use server';

import { db } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth-utils';
import { Prisma } from '@prisma/client';

// Define the type for order data including items and product details
export type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    address: true;
    items: {
      include: {
        product: {
          select: { name: true; slug: true; images: { take: 1, select: { url: true } } }; // Select necessary product details
        };
      };
    };
  };
}>;

/**
 * Fetches orders for the currently logged-in user.
 */
export async function getUserOrders(): Promise<OrderWithItems[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  try {
    const orders = await db.order.findMany({
      where: { userId },
      include: {
        address: true, // Include the shipping address
        items: {
          include: {
            product: {
              select: { // Select only needed fields from product
                name: true,
                slug: true,
                images: { // Get only the first image URL
                  take: 1,
                  select: { url: true },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Show most recent orders first
      },
    });
    return orders;
  } catch (error) {
    console.error('Database Error: Failed to fetch user orders.', error);
    return [];
  }
}

// TODO: Add function to fetch a single order by ID
