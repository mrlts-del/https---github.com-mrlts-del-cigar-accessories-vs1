import React from 'react';
import { getAllOrders } from '@/actions/order'; // Import fetch action
import { columns, type OrderColumn } from '@/components/admin/orders/columns'; // Import columns
import { DataTable } from '@/components/ui/data-table'; // Import DataTable

export default async function AdminOrdersPage() {
  // Fetch orders for admin view
  const orders = await getAllOrders();

  // Ensure data matches the expected type for columns
  const formattedData: OrderColumn[] = orders;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Manage Orders</h1>
        {/* Add any relevant actions like export, etc. */}
      </div>

      {/* Implement Order Data Table */}
      <DataTable
         columns={columns}
         data={formattedData}
         filterColumnId="user" // Allow filtering by customer email (adjust if needed)
         filterInputPlaceholder="Filter by customer email..."
      />
    </div>
  );
}
