import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatCurrency } from '@/lib/utils';
import type { RecentOrder } from '@/actions/admin'; // Import the type

interface RecentOrdersProps {
  orders: RecentOrder[];
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  if (!orders || orders.length === 0) {
    return <p className="text-sm text-muted-foreground">No recent orders found.</p>;
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="flex items-center gap-4">
          {/* User Avatar/Fallback */}
          <Avatar className="hidden h-9 w-9 sm:flex">
             {/* Assuming user might not have an image */}
            <AvatarFallback>
               {order.user.name ? order.user.name.charAt(0).toUpperCase() : '?'}
            </AvatarFallback>
          </Avatar>
          {/* Order Details */}
          <div className="grid gap-1 text-sm">
            <p className="font-medium leading-none">{order.user.name || 'Unknown User'}</p>
            <p className="text-muted-foreground">{order.user.email || 'No email'}</p>
          </div>
          {/* Order Total */}
          <div className="ml-auto font-medium">{formatCurrency(order.total)}</div>
        </div>
      ))}
    </div>
  );
}
