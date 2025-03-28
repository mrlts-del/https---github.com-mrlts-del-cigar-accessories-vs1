'use server';

import Stripe from 'stripe';
import { z } from 'zod';
// Removed useCartStore import as it's client-side only
import { getCurrentUserId } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { Prisma, OrderStatus } from '@prisma/client'; // Import OrderStatus
import { revalidatePath } from 'next/cache';

// Initialize Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set.');
}
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
});

// --- Schemas ---

// Input for creating the order - requires items to recalculate price server-side
const CreateOrderSchema = z.object({
  paymentIntentId: z.string(),
  addressId: z.string(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
  })).min(1, 'Cannot create order with empty cart'),
});

type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

// --- Result Types ---

interface PaymentIntentResult {
  success: boolean;
  clientSecret?: string | null;
  error?: string;
}

interface CreateOrderResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

// --- Server Actions ---

/**
 * Creates a Stripe Payment Intent.
 * Amount calculation MUST happen server-side before calling this or be recalculated within.
 */
export async function createPaymentIntent(
  amountInCents: number
): Promise<PaymentIntentResult> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, error: 'User not authenticated.' };
  }

  // Basic validation for amount
  if (amountInCents <= 0) {
     return { success: false, error: 'Invalid order amount.' };
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: { userId },
    });
    return { success: true, clientSecret: paymentIntent.client_secret };
  } catch (error: any) {
    console.error('Stripe Error creating PaymentIntent:', error);
    return { success: false, error: error.message || 'Failed to create payment intent.' };
  }
}

/**
 * Verifies payment intent and creates an order in the database.
 */
export async function createOrder(
  values: CreateOrderInput
): Promise<CreateOrderResult> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, error: 'User not authenticated.' };
  }

  // 1. Validate input
  const validatedData = CreateOrderSchema.safeParse(values);
  if (!validatedData.success) {
    return { success: false, error: 'Invalid input data.' };
  }
  const { paymentIntentId, addressId, items } = validatedData.data;

  try {
    // 2. Verify Payment Intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent) {
      return { success: false, error: 'Invalid Payment Intent ID.' };
    }
    if (paymentIntent.metadata.userId !== userId) {
       return { success: false, error: 'Payment does not belong to user.' };
    }
    if (paymentIntent.status !== 'succeeded') {
      return { success: false, error: `Payment not successful (Status: ${paymentIntent.status}).` };
    }

    // 3. Recalculate total server-side for verification
    let serverCalculatedTotal = 0;
    const productIds = items.map(item => item.productId);
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true /* , stock: true */ }, // Select stock if checking availability
    });

    const orderItemsData: Prisma.OrderItemCreateManyOrderInput[] = [];

    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        return { success: false, error: `Product with ID ${item.productId} not found.` };
      }
      // TODO: Check stock if implementing inventory management
      // if (product.stock < item.quantity) {
      //    return { success: false, error: `Insufficient stock for ${product.name}.` };
      // }
      const itemTotal = product.price * item.quantity;
      serverCalculatedTotal += itemTotal;
      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price, // Store price at time of purchase
      });
    }

    // Convert server total to cents for comparison
    const serverCalculatedTotalCents = Math.round(serverCalculatedTotal * 100);

    // 4. Compare server total with Payment Intent amount
    if (serverCalculatedTotalCents !== paymentIntent.amount) {
      // Handle discrepancy - log, potentially refund, return error
      console.error(`Amount mismatch! Server: ${serverCalculatedTotalCents}, Stripe: ${paymentIntent.amount}. PI: ${paymentIntentId}`);
      // TODO: Consider refunding paymentIntent here if possible
      return { success: false, error: 'Order amount mismatch. Please contact support.' };
    }

    // 5. Create Order and OrderItems in DB within a transaction
    const newOrder = await db.order.create({
      data: {
        userId: userId,
        addressId: addressId,
        total: serverCalculatedTotal, // Store final calculated total (e.g., float)
        status: OrderStatus.PROCESSING, // Or PENDING until shipment?
        stripePaymentIntentId: paymentIntentId,
        items: {
          createMany: {
            data: orderItemsData,
          },
        },
      },
      select: { id: true }, // Only select the ID of the new order
    });

    // TODO: Decrement stock levels here if implementing inventory management

    console.log(`Order ${newOrder.id} created successfully for user ${userId}`);
    // Revalidate user's order history page
    revalidatePath('/account/orders');

    return { success: true, orderId: newOrder.id };

  } catch (error: any) {
    console.error('Error creating order:', error);
    return { success: false, error: error.message || 'Failed to create order.' };
  }
}

// TODO: Add Stripe Webhook handler for asynchronous events
