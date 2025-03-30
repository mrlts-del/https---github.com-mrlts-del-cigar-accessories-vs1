'use server';

import Stripe from 'stripe';
import { z } from 'zod';
import { getCurrentUserId } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { Prisma, OrderStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { Resend } from 'resend'; // Import Resend
import { OrderConfirmationEmail } from '@/emails/order-confirmation-email'; // Import Email Component
import React from 'react'; // Import React

// Initialize Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set.');
}
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
});

// Initialize Resend
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// --- Schemas ---
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
interface PaymentIntentResult { success: boolean; clientSecret?: string | null; error?: string; }
interface CreateOrderResult { success: boolean; orderId?: string; error?: string; }

// --- Server Actions ---

/** Creates a Stripe Payment Intent. */
export async function createPaymentIntent(amountInCents: number): Promise<PaymentIntentResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: 'User not authenticated.' };
  if (amountInCents <= 0) return { success: false, error: 'Invalid order amount.' };
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents, currency: 'usd',
      automatic_payment_methods: { enabled: true }, metadata: { userId },
    });
    return { success: true, clientSecret: paymentIntent.client_secret };
  } catch (error: any) {
    console.error('Stripe Error creating PaymentIntent:', error);
    return { success: false, error: error.message || 'Failed to create payment intent.' };
  }
}

/** Verifies payment intent, creates order, and sends confirmation email. */
export async function createOrder(values: CreateOrderInput): Promise<CreateOrderResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: 'User not authenticated.' };

  const validatedData = CreateOrderSchema.safeParse(values);
  if (!validatedData.success) return { success: false, error: 'Invalid input data.' };
  const { paymentIntentId, addressId, items } = validatedData.data;

  try {
    // Verify Payment Intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (!paymentIntent || paymentIntent.metadata.userId !== userId || paymentIntent.status !== 'succeeded') {
      return { success: false, error: 'Invalid or unsuccessful payment.' };
    }

    // Recalculate total server-side
    let serverCalculatedTotal = 0;
    const productIds = items.map(item => item.productId);
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true },
    });
    const orderItemsData: Prisma.OrderItemCreateManyOrderInput[] = [];
    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) return { success: false, error: `Product ID ${item.productId} not found.` };
      serverCalculatedTotal += product.price * item.quantity;
      orderItemsData.push({ productId: item.productId, quantity: item.quantity, price: product.price });
    }
    const serverCalculatedTotalCents = Math.round(serverCalculatedTotal * 100);

    // Compare amounts
    if (serverCalculatedTotalCents !== paymentIntent.amount) {
      console.error(`Amount mismatch! Server: ${serverCalculatedTotalCents}, Stripe: ${paymentIntent.amount}. PI: ${paymentIntentId}`);
      return { success: false, error: 'Order amount mismatch.' };
    }

    // Create Order in DB
    const newOrder = await db.order.create({
      data: {
        userId, addressId, total: serverCalculatedTotal,
        status: OrderStatus.PROCESSING, stripePaymentIntentId: paymentIntentId,
        items: { createMany: { data: orderItemsData } },
      },
      // Include necessary data for the email
      include: {
         user: { select: { email: true, name: true } },
         address: true,
         items: { include: { product: { select: { name: true, images: { take: 1, select: { url: true } } } } } }
      }
    });

    console.log(`Order ${newOrder.id} created successfully for user ${userId}`);
    revalidatePath('/account/orders');

    // Send Confirmation Email
    if (resend && newOrder.user?.email) {
      try {
        await resend.emails.send({
          from: 'Cigar Accessories <noreply@yourdomain.com>', // TODO: Replace domain
          to: [newOrder.user.email],
          subject: `Order Confirmation #${newOrder.id.substring(0, 8)}`,
          react: React.createElement(OrderConfirmationEmail, { order: newOrder as any }), // Cast needed due to include structure
        });
        console.log(`Order confirmation email sent to ${newOrder.user.email}`);
      } catch (emailError) {
        console.error(`Failed to send order confirmation email for order ${newOrder.id}:`, emailError);
        // Don't fail the whole process if email fails, just log it
      }
    } else if (!resend) {
       console.warn(`Resend not configured, skipping order confirmation email for order ${newOrder.id}.`);
    } else if (!newOrder.user?.email) {
       console.warn(`User email not found for order ${newOrder.id}, skipping confirmation email.`);
    }

    return { success: true, orderId: newOrder.id };

  } catch (error: any) {
    console.error('Error creating order:', error);
    return { success: false, error: error.message || 'Failed to create order.' };
  }
}

// TODO: Add Stripe Webhook handler
