'use client'; // Need client component for dialog state and actions

import React, { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { getUserAddresses, deleteAddress } from '@/actions/user'; // Import actions
import type { Address } from '@prisma/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
} from '@/components/ui/alert-dialog';
import { AddressForm } from '@/components/account/address-form'; // Import form
import { toast } from 'sonner';
import { Edit, Trash2, PlusCircle } from 'lucide-react';

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, startLoading] = useTransition();
  const [isDeleting, startDeleting] = useTransition();
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Function to fetch addresses
  const fetchUserAddresses = async () => {
    startLoading(async () => {
      const fetchedAddresses = await getUserAddresses();
      setAddresses(fetchedAddresses);
    });
  };

  // Fetch addresses on component mount
  useEffect(() => {
    fetchUserAddresses();
  }, []);

  const handleFormSuccess = () => {
    setIsAddEditDialogOpen(false); // Close dialog
    setEditingAddress(null); // Reset editing state
    fetchUserAddresses(); // Refetch addresses
  };

  const handleDelete = (addressId: string) => {
     startDeleting(async () => {
        try {
           const result = await deleteAddress(addressId);
           if (result.success) {
              toast.success('Address deleted successfully.');
              fetchUserAddresses(); // Refetch addresses
           } else {
              toast.error(result.error || 'Failed to delete address.');
           }
        } catch (error) {
           toast.error('An unexpected error occurred.');
           console.error('Delete address error:', error);
        }
     });
  };

  return (
    <Dialog open={isAddEditDialogOpen} onOpenChange={setIsAddEditDialogOpen}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
             <h1 className="text-2xl font-semibold">Addresses</h1>
             <p className="text-muted-foreground">Manage your saved addresses.</p>
          </div>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingAddress(null)}> {/* Reset editing state */}
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Address
            </Button>
          </DialogTrigger>
        </div>

        {isLoading ? (
          <p>Loading addresses...</p>
        ) : addresses.length === 0 ? (
          <p className="text-muted-foreground">You have no saved addresses.</p>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <div key={address.id} className="flex items-start justify-between rounded-md border p-4">
                <div className="text-sm">
                  <p className="font-medium">{address.street}</p>
                  <p className="text-muted-foreground">
                    {address.city}, {address.state ? `${address.state} ` : ''}
                    {address.zip}
                  </p>
                  <p className="text-muted-foreground">{address.country}</p>
                </div>
                <div className="flex space-x-2">
                  {/* Edit Button */}
                  <DialogTrigger asChild>
                     <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingAddress(address)}
                     >
                        <Edit className="mr-1 h-3 w-3" /> Edit
                     </Button>
                  </DialogTrigger>
                  {/* Delete Button */}
                  <AlertDialog>
                     <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" disabled={isDeleting}>
                           <Trash2 className="mr-1 h-3 w-3" /> Delete
                        </Button>
                     </AlertDialogTrigger>
                     <AlertDialogContent>
                        <AlertDialogHeader>
                           <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                           <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete this address.
                           </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                           <AlertDialogCancel>Cancel</AlertDialogCancel>
                           <AlertDialogAction
                              onClick={() => handleDelete(address.id)}
                              disabled={isDeleting}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                           >
                              {isDeleting ? 'Deleting...' : 'Delete'}
                           </AlertDialogAction>
                        </AlertDialogFooter>
                     </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dialog Content for Add/Edit Form */}
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
            <DialogDescription>
              {editingAddress ? 'Make changes to your address.' : 'Add a new address to your account.'}
            </DialogDescription>
          </DialogHeader>
          <AddressForm
             key={editingAddress?.id ?? 'new'} // Force re-render
             initialData={editingAddress}
             onSuccess={handleFormSuccess}
          />
        </DialogContent>
      </div>
    </Dialog>
  );
}
