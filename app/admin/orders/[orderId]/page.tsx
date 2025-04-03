import React from 'react';
import { notFound } from 'next/navigation';
import getServerSession from 'next-auth'; // Use default import
import { authOptions } from '@/lib/auth-options'; // Correct import path for authOptions
import { getOrderById } from '@/actions/order'; // Import fetch action
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata, ResolvingMetadata } from 'next'; // Import Next.js types
// Remove Prisma type import for OrderItem

// TODO: Import component/action for updating status from this page if needed

// Helper function to format date (could be moved to utils)
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

// Explicitly type params in the function signature
export default async function AdminOrderDetailPage({ params }: { params: { orderId: string } }) {
  // Example of getting session server-side (though not strictly needed for this page's logic)
  const session = await getServerSession(authOptions);
  // You could add checks here based on session if needed

  const { orderId } = params;
  const order = await getOrderById(orderId);

  if (!order) {
    notFound();
  }

  const shippingAddress = order.address;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-2xl font-semibold">Order Details</h1>
         {/* TODO: Add actions like Print Invoice, Resend Confirmation */}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
         {/* Order Info & Items */}
         <div className="lg:col-span-2 space-y-6">
            <Card>
               <CardHeader>
                  <CardTitle>Order #{order.id.substring(0, 8)}...</CardTitle>
                  <CardDescription>Placed on {formatDate(order.createdAt)}</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div className="flex justify-between">
                     <span className="text-muted-foreground">Status:</span>
                     <Badge variant="outline">{order.status}</Badge>
                  </div>
                  <div className="flex justify-between">
                     <span className="text-muted-foreground">Stripe Payment ID:</span>
                     <span className="font-mono text-xs">{order.stripePaymentIntentId || 'N/A'}</span>
                  </div>
                  {/* TODO: Add status update controls here? */}
               </CardContent>
            </Card>

            <Card>
               <CardHeader><CardTitle>Items Ordered</CardTitle></CardHeader>
               <CardContent className="p-0">
                  <ul className="divide-y divide-border">
                     {/* Explicitly type 'item' as any as a workaround for type resolution issues */}
                     {order.items.map((item: any) => (
                        <li key={item.id} className="flex items-center gap-4 p-4">
                           <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded">
                              <Image
                                 src={item.product?.images?.[0]?.url || '/placeholder-image.png'}
                                 alt={item.product?.name || 'Product Image'}
                                 fill sizes="64px" className="object-cover"
                              />
                           </div>
                           <div className="flex-grow overflow-hidden">
                              <Link href={`/product/${item.product?.slug || ''}`} className="font-medium hover:underline">
                                 {item.product?.name || 'Product Not Found'}
                              </Link>
                              <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                           </div>
                           <div className="text-right text-sm">
                              <p>{formatCurrency(item.price)} ea.</p>
                              <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                           </div>
                        </li>
                     ))}
                  </ul>
               </CardContent>
            </Card>
         </div>

         {/* Customer & Shipping Info */}
         <div className="lg:col-span-1 space-y-6">
             <Card>
               <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
               <CardContent className="space-y-1 text-sm">
                  <p>{order.user?.name || 'N/A'}</p>
                  <p className="text-muted-foreground">{order.user?.email || 'N/A'}</p>
                  {/* TODO: Link to user management page? */}
               </CardContent>
            </Card>
             <Card>
               <CardHeader><CardTitle>Shipping Address</CardTitle></CardHeader>
               <CardContent className="space-y-1 text-sm">
                  {shippingAddress ? (
                     <>
                        <p>{shippingAddress.street}</p>
                        <p>{shippingAddress.city}, {shippingAddress.state ? `${shippingAddress.state} ` : ''}{shippingAddress.zip}</p>
                        <p>{shippingAddress.country}</p>
                     </>
                  ) : (
                     <p className="text-muted-foreground">Address not found.</p>
                  )}
               </CardContent>
            </Card>
             <Card>
               <CardHeader><CardTitle>Order Totals</CardTitle></CardHeader>
               <CardContent className="space-y-2 text-sm">
                  {/* TODO: Display subtotal, shipping, tax separately if stored */}
                  <div className="flex justify-between font-semibold">
                     <span>Total Paid</span>
                     <span>{formatCurrency(order.total)}</span>
                  </div>
               </CardContent>
            </Card>
         </div>
      </div>
    </div>
  );
}
