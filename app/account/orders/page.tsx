import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getUserOrders } from '@/actions/order'; // Fetch orders action
import type { OrderWithItems } from '@/actions/order'; // Import type
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge'; // Assuming Badge component exists
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

function formatOrderDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export default async function OrdersPage() {
  const orders = await getUserOrders();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Order History</h1>
      {orders.length === 0 ? (
        <p className="text-muted-foreground">You haven't placed any orders yet.</p>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-sm font-medium">Order #{order.id.substring(0, 8)}...</CardTitle>
                  <CardDescription>Placed on {formatOrderDate(order.createdAt)}</CardDescription>
                </div>
                <Badge variant="outline">{order.status}</Badge>
              </CardHeader>
              <CardContent className="p-0">
                <Separator />
                <div className="divide-y divide-border">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4">
                       <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded">
                         <Image
                           src={item.product.images?.[0]?.url || '/placeholder-image.png'}
                           alt={item.product.name}
                           fill
                           sizes="64px"
                           className="object-cover"
                         />
                       </div>
                       <div className="flex-grow overflow-hidden">
                         <Link href={`/product/${item.product.slug}`} className="font-medium hover:underline">
                           {item.product.name}
                         </Link>
                         <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                       </div>
                       <p className="flex-shrink-0 text-sm font-medium">
                         {formatCurrency(item.price * item.quantity)}
                       </p>
                    </div>
                  ))}
                </div>
              </CardContent>
              <Separator />
              <CardFooter className="flex justify-end gap-4 p-4 text-sm">
                 {/* TODO: Add link to order details page */}
                 <span className="font-semibold">Total: {formatCurrency(order.total)}</span>
                 {/* <Button variant="outline" size="sm">View Details</Button> */}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
