import React from 'react';
import { getAllUsers } from '@/actions/user'; // Import fetch action
import { columns, type UserColumn } from '@/components/admin/users/columns'; // Import columns
import { DataTable } from '@/components/ui/data-table'; // Import DataTable

export default async function AdminUsersPage() {
  // Fetch users for admin view
  const users = await getAllUsers();

  // Ensure data matches the expected type for columns
  const formattedData: UserColumn[] = users;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Manage Users</h1>
        {/* Add any relevant actions */}
      </div>

      {/* Implement User Data Table */}
      <DataTable
         columns={columns}
         data={formattedData}
         filterColumnId="email" // Allow filtering by user email
         filterInputPlaceholder="Filter users by email..."
      />
    </div>
  );
}
