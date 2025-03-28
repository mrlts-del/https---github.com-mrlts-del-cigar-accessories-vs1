import Stripe from 'stripe';
// Remove 'next/headers' import if no longer needed
import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { OrderStatus } from '@prisma/client';

// Initialize Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set.');
}
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
});

// Get webhook secret
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
if (!webhookSecret) {
   throw new Error('STRIPE_WEBHOOK_SECRET environment variable is not set.');
}

export async function POST(req: Request) {
  const body = await req.text();
  // Get signature from request headers
  const signature = req.headers.get('Stripe-Signature');

  if (!signature) {
    return new NextResponse('Missing Stripe-Signature header', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // Re-add non-null assertion for webhookSecret
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret!);
  } catch (err: any) {
    console.error(`❌ Error verifying Stripe webhook signature: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntentSucceeded = event.data.object as Stripe.PaymentIntent;
      console.log(`✅ PaymentIntent succeeded: ${paymentIntentSucceeded.id}`);

      try {
        const order = await db.order.findUnique({
          where: { stripePaymentIntentId: paymentIntentSucceeded.id },
        });

        if (!order) {
          console.error(`⚠️ Order not found for PaymentIntent: ${paymentIntentSucceeded.id}`);
          return NextResponse.json({ received: true, error: 'Order not found' }, { status: 200 });
        }

        if (order.status === OrderStatus.PENDING || order.status !== OrderStatus.PROCESSING) {
           await db.order.update({
             where: { id: order.id },
             data: { status: OrderStatus.PROCESSING },
           });
           console.log(`📦 Order ${order.id} status updated to PROCESSING.`);
           // TODO: Trigger fulfillment, send confirmation email
        } else {
           console.log(`📦 Order ${order.id} status already updated (${order.status}). Ignoring webhook.`);
        }

      } catch (dbError) {
         console.error(`❌ DB error updating order for PI ${paymentIntentSucceeded.id}:`, dbError);
         return new NextResponse('Internal Server Error', { status: 500 });
      }
      break;

    case 'payment_intent.payment_failed':
      const paymentIntentFailed = event.data.object as Stripe.PaymentIntent;
      console.log(`❌ PaymentIntent failed: ${paymentIntentFailed.id}`, paymentIntentFailed.last_payment_error?.message);
      // TODO: Update order status to FAILED, notify user
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
