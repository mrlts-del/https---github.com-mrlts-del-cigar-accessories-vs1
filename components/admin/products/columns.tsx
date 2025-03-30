'use client';

import React, { useTransition } from 'react'; // Import useTransition
import { type ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'; // Import AlertDialog
import type { ProductWithDetails } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { deleteProduct } from '@/actions/product'; // Import delete action
import { toast } from 'sonner'; // Import toast

export type ProductColumn = ProductWithDetails;

// Define Cell component for actions separately to use hooks
const ActionsCell: React.FC<{ row: any }> = ({ row }) => {
  const product = row.original as ProductColumn;
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deleteProduct(product.id);
        if (result.success) {
          toast.success('Product deleted successfully.');
          // Revalidation is handled by the server action
        } else {
          toast.error(result.error || 'Failed to delete product.');
        }
      } catch (error) {
        toast.error('An unexpected error occurred.');
        console.error('Delete product error:', error);
      }
    });
  };

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(product.id)}>
            Copy product ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/admin/products/edit/${product.id}`}>Edit Product</Link>
          </DropdownMenuItem>
          {/* Use AlertDialogTrigger within DropdownMenuItem */}
          <AlertDialogTrigger asChild>
             <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onSelect={(e) => e.preventDefault()}>
                Delete Product
             </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      {/* Alert Dialog Content */}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the product
            "{product.name}" and remove its data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};


export const columns: ColumnDef<ProductColumn>[] = [
  {
    id: 'select',
    header: ({ table }) => ( <Checkbox checked={ table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate') } onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all" /> ),
    cell: ({ row }) => ( <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" /> ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'images',
    header: 'Image',
    cell: ({ row }) => {
      const images = row.getValue('images') as ProductColumn['images'];
      const firstImage = images?.[0]?.url;
      return ( <div className="relative h-10 w-10 overflow-hidden rounded-sm"> {firstImage ? ( <Image src={firstImage} alt={row.original.name} fill className="object-cover" sizes="40px" /> ) : ( <div className="h-full w-full bg-muted"></div> )} </div> );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => ( <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}> Name <ArrowUpDown className="ml-2 h-4 w-4" /> </Button> ),
    cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => <div>{row.original.category?.name || 'N/A'}</div>,
  },
  {
    accessorKey: 'price',
    header: ({ column }) => ( <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="text-right"> Price <ArrowUpDown className="ml-2 h-4 w-4" /> </Button> ),
    cell: ({ row }) => <div className="text-right font-medium">{formatCurrency(parseFloat(row.getValue('price')))}</div>,
  },
  {
    accessorKey: 'stock',
    header: ({ column }) => ( <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="text-right"> Stock <ArrowUpDown className="ml-2 h-4 w-4" /> </Button> ),
     cell: ({ row }) => <div className="text-right">{row.getValue('stock')}</div>,
  },
  {
    id: 'actions',
    cell: ActionsCell, // Use the dedicated component
    enableSorting: false,
    enableHiding: false,
  },
];
