'use client';

import React, { useTransition } from 'react'; // Import useTransition
import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub, // Import Sub components
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import type { AdminOrderView } from '@/actions/order';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { OrderStatus } from '@prisma/client'; // Import OrderStatus enum
import { updateOrderStatus } from '@/actions/order'; // Import update action
import { toast } from 'sonner'; // Import toast

export type OrderColumn = AdminOrderView;

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  }).format(date);
}

// Actions Cell Component
const ActionsCell: React.FC<{ row: any }> = ({ row }) => {
  const order = row.original as OrderColumn;
  const [isPending, startTransition] = useTransition();

  const handleStatusUpdate = (newStatus: OrderStatus) => {
    startTransition(async () => {
      try {
        const result = await updateOrderStatus(order.id, newStatus);
        if (result.success) {
          toast.success(`Order status updated to ${newStatus}.`);
          // Revalidation is handled by the server action
        } else {
          toast.error(result.error || 'Failed to update status.');
        }
      } catch (error) {
        toast.error('An unexpected error occurred.');
        console.error('Update order status error:', error);
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(order.id)}>
          Copy order ID
        </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/admin/orders/${order.id}`}>View Order Details</Link>
            </DropdownMenuItem>
             {/* Update Status Submenu */}
             <DropdownMenuSub>
          <DropdownMenuSubTrigger disabled={isPending}>
            <span>Update Status</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
             <DropdownMenuSubContent>
               <DropdownMenuLabel>Set status to</DropdownMenuLabel>
               <DropdownMenuSeparator />
               {Object.values(OrderStatus).map((status) => (
                 <DropdownMenuItem
                   key={status}
                   disabled={isPending || order.status === status}
                   onClick={() => handleStatusUpdate(status)}
                 >
                   {status}
                 </DropdownMenuItem>
               ))}
             </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Column Definitions
export const columns: ColumnDef<OrderColumn>[] = [
  { accessorKey: 'id', header: ({ column }) => (<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}> Order ID <ArrowUpDown className="ml-2 h-4 w-4" /> </Button>), cell: ({ row }) => <div className="font-mono text-xs">{row.original.id.substring(0, 8)}...</div> },
  { accessorKey: 'user', header: ({ column }) => (<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}> Customer <ArrowUpDown className="ml-2 h-4 w-4" /> </Button>), cell: ({ row }) => <div>{row.original.user?.email || 'N/A'}</div> },
  { accessorKey: 'createdAt', header: ({ column }) => (<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}> Date <ArrowUpDown className="ml-2 h-4 w-4" /> </Button>), cell: ({ row }) => <div>{formatDate(row.original.createdAt)}</div> },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <Badge variant="outline">{row.original.status}</Badge> },
  { accessorKey: 'total', header: ({ column }) => (<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="text-right"> Total <ArrowUpDown className="ml-2 h-4 w-4" /> </Button>), cell: ({ row }) => <div className="text-right font-medium">{formatCurrency(row.original.total)}</div> },
  { id: 'actions', cell: ActionsCell, enableSorting: false, enableHiding: false },
];
