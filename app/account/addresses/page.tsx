import React from 'react';
import { getUserAddresses } from '@/actions/user'; // Fetch addresses
import { Button } from '@/components/ui/button';
// TODO: Import components for Add/Edit Address Modal/Form

export default async function AddressesPage() {
  const addresses = await getUserAddresses();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Addresses</h1>
          <p className="text-muted-foreground">Manage your saved addresses.</p>
        </div>
        {/* TODO: Add button to open "Add Address" modal/form */}
        <Button>Add New Address</Button>
      </div>

      {addresses.length === 0 ? (
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
                {/* TODO: Add Edit/Delete buttons and functionality */}
                <Button variant="outline" size="sm">Edit</Button>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
