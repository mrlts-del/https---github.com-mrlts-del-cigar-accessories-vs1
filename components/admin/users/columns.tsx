'use client';

import React, { useTransition } from 'react'; // Import useTransition
import { type ColumnDef, type Row } from '@tanstack/react-table'; // Import Row type
import { Button } from '@/components/ui/button';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
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
import type { User } from '@prisma/client';
import { Role } from '@prisma/client';
import { updateUserRole, deleteUser } from '@/actions/user'; // Import deleteUser
import { toast } from 'sonner';

export type UserColumn = Omit<User, 'password'>;

function formatDate(date: Date | null): string {
  if (!date) return 'N/A';
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

// Actions Cell Component - Use specific Row type
const ActionsCell: React.FC<{ row: Row<UserColumn> }> = ({ row }) => {
  const user = row.original; // No cast needed
  const [isRolePending, startRoleTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition(); // State for delete

  const handleRoleUpdate = (newRole: Role) => {
    startRoleTransition(async () => {
      try {
        const result = await updateUserRole(user.id, newRole);
        if (result.success) {
          toast.success(`User role updated to ${newRole}.`);
        } else {
          toast.error(result.error || 'Failed to update role.');
        }
      } catch (error) {
        toast.error('An unexpected error occurred.');
        console.error('Update user role error:', error);
      }
    });
  };

  // Handler for deleting user
  const handleDeleteUser = () => {
     startDeleteTransition(async () => {
        try {
           const result = await deleteUser(user.id);
           if (result.success) {
              toast.success('User deleted successfully.');
              // Revalidation is handled by the server action
           } else {
              toast.error(result.error || 'Failed to delete user.');
           }
        } catch (error) {
           toast.error('An unexpected error occurred.');
           console.error('Delete user error:', error);
        }
     });
  };

  return (
    <AlertDialog> {/* Wrap DropdownMenu for delete confirmation */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
            Copy user ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger disabled={isRolePending}>
              <span>Change Role</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
               <DropdownMenuSubContent>
                 <DropdownMenuLabel>Set role to</DropdownMenuLabel>
                 <DropdownMenuSeparator />
                 {Object.values(Role).map((role) => (
                   <DropdownMenuItem
                     key={role}
                     disabled={isRolePending || user.role === role}
                     onClick={() => handleRoleUpdate(role)}
                   >
                     {role}
                   </DropdownMenuItem>
                 ))}
               </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          {/* Delete User Trigger */}
          <AlertDialogTrigger asChild>
             <DropdownMenuItem
               className="text-destructive focus:text-destructive focus:bg-destructive/10"
               onSelect={(e) => e.preventDefault()} // Prevent default close on select
               disabled={isDeletePending}
             >
               Delete User
             </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      {/* Delete Confirmation Dialog Content */}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the user
            "{user.name || user.email}" and all associated data. {/* Ensure correct escape */}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeletePending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteUser}
            disabled={isDeletePending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeletePending ? 'Deleting...' : 'Delete User'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};


// Column Definitions
export const columns: ColumnDef<UserColumn>[] = [
  { accessorKey: 'id', header: 'User ID', cell: ({ row }) => <div className="font-mono text-xs">{row.original.id}</div> },
  { accessorKey: 'name', header: ({ column }) => (<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}> Name <ArrowUpDown className="ml-2 h-4 w-4" /> </Button>), cell: ({ row }) => ( <div className="flex items-center gap-2"> <Avatar className="h-8 w-8"> <AvatarImage src={row.original.image ?? undefined} alt={row.original.name ?? 'User'} /> <AvatarFallback> {row.original.name ? row.original.name.charAt(0).toUpperCase() : 'U'} </AvatarFallback> </Avatar> <span className="font-medium">{row.original.name || 'N/A'}</span> </div> ) },
  { accessorKey: 'email', header: ({ column }) => (<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}> Email <ArrowUpDown className="ml-2 h-4 w-4" /> </Button>), cell: ({ row }) => <div>{row.original.email || 'N/A'}</div> },
  { accessorKey: 'role', header: 'Role', cell: ({ row }) => <Badge variant={row.original.role === 'ADMIN' ? 'default' : 'secondary'}>{row.original.role}</Badge> },
  { accessorKey: 'emailVerified', header: 'Email Verified', cell: ({ row }) => ( <div className="flex justify-center"> {row.original.emailVerified ? ( <Checkbox checked={true} disabled aria-label="Verified" /> ) : ( <Checkbox checked={false} disabled aria-label="Not Verified" /> )} </div> ) },
  { accessorKey: 'createdAt', header: ({ column }) => (<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}> Joined <ArrowUpDown className="ml-2 h-4 w-4" /> </Button>), cell: ({ row }) => <div>{formatDate(row.original.createdAt)}</div> },
  { id: 'actions', cell: ActionsCell, enableSorting: false, enableHiding: false },
];
