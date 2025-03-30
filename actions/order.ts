'use server';

import { db } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth-utils';
import { Prisma, Role, OrderStatus } from '@prisma/client'; // Import Role, OrderStatus
import { revalidatePath } from 'next/cache';
import { Resend } from 'resend'; // Import Resend
import { ShipmentNotificationEmail } from '@/emails/shipment-notification-email'; // Import Email Component
import React from 'react'; // Import React

// Initialize Resend
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Helper function to check admin role
async function isAdmin(): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId) return false;
  const user = await db.user.findUnique({ where: { id: userId }, select: { role: true } });
  return user?.role === Role.ADMIN;
}

// Define the type for order data including items and product details
export type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    address: true;
    items: {
      include: {
        product: {
          select: { name: true; slug: true; images: { take: 1, select: { url: true } } };
        };
      };
    };
  };
}>;

// Define type for admin view, including user email/name
export type AdminOrderView = OrderWithItems & {
   user: { email: string | null; name: string | null }; // Add user email and name
};

/**
 * Fetches orders for the currently logged-in user.
 */
export async function getUserOrders(): Promise<OrderWithItems[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];
  try {
    return await db.order.findMany({
      where: { userId },
      include: {
        address: true,
        items: {
          include: {
            product: {
              select: { name: true, slug: true, images: { take: 1, select: { url: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Database Error: Failed to fetch user orders.', error);
    return [];
  }
}

/**
 * Fetches all orders for the admin view.
 */
export async function getAllOrders(): Promise<AdminOrderView[]> {
   if (!(await isAdmin())) {
     console.warn('Non-admin user attempted to fetch all orders.');
     return [];
   }
   try {
      const orders = await db.order.findMany({
         include: {
            user: { select: { email: true, name: true } }, // Include name too
            address: true,
            items: {
               include: {
                  product: {
                     select: { name: true, slug: true, images: { take: 1, select: { url: true } } },
                  },
               },
            },
         },
         orderBy: { createdAt: 'desc' },
      });
      return orders as AdminOrderView[]; // Cast needed
   } catch (error) {
      console.error('Database Error: Failed to fetch all orders for admin.', error);
      return [];
   }
}

/**
 * Fetches a single order by its ID for the admin view.
 */
export async function getOrderById(orderId: string): Promise<AdminOrderView | null> {
   if (!(await isAdmin())) {
     console.warn('Non-admin user attempted to fetch order details.');
     return null;
   }
   try {
      const order = await db.order.findUnique({
         where: { id: orderId },
         include: {
            user: { select: { email: true, name: true } },
            address: true,
            items: {
               include: {
                  product: {
                     select: { name: true, slug: true, images: { take: 1, select: { url: true } } },
                  },
               },
            },
         },
      });
      return order as AdminOrderView | null; // Cast needed
   } catch (error) {
      console.error(`Database Error: Failed to fetch order ${orderId}.`, error);
      return null;
   }
}

/**
 * Updates the status of an order and sends notification email if shipped. (Admin only)
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<{ success: boolean; error?: string }> {
   if (!(await isAdmin())) { return { success: false, error: 'Unauthorized' }; }
   if (!Object.values(OrderStatus).includes(status)) { return { success: false, error: 'Invalid status value.' }; }

   try {
      const updatedOrder = await db.order.update({ // Get updated order data
         where: { id: orderId },
         data: { status },
         include: { // Include user data for email
            user: { select: { email: true, name: true } }
         }
      });
      console.log(`Order ${orderId} status updated to ${status}`);
      revalidatePath('/admin/orders');

      // Send Shipment Notification Email if status is SHIPPED
      if (status === OrderStatus.SHIPPED && resend && updatedOrder.user?.email) {
         try {
            // TODO: Add tracking number and carrier if available
            await resend.emails.send({
               from: 'Cigar Accessories <noreply@yourdomain.com>', // TODO: Replace domain
               to: [updatedOrder.user.email],
               subject: `Your Order #${orderId.substring(0, 8)} Has Shipped!`,
               react: React.createElement(ShipmentNotificationEmail, {
                  orderId: orderId,
                  userName: updatedOrder.user.name,
                  // trackingNumber: '...', // Pass tracking info if available
                  // shippingCarrier: '...'
               }),
            });
            console.log(`Shipment notification sent for order ${orderId}`);
         } catch (emailError) {
            console.error(`Failed to send shipment notification for order ${orderId}:`, emailError);
            // Log error but don't fail the status update itself
         }
      } else if (status === OrderStatus.SHIPPED && !resend) {
         console.warn(`Resend not configured, skipping shipment notification for order ${orderId}.`);
      } else if (status === OrderStatus.SHIPPED && !updatedOrder.user?.email) {
         console.warn(`User email not found for order ${orderId}, skipping shipment notification.`);
      }

      return { success: true };
   } catch (error: any) {
      console.error(`Error updating status for order ${orderId}:`, error);
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
         return { success: false, error: 'Order not found.' };
      }
      return { success: false, error: 'Failed to update order status.' };
   }
}
