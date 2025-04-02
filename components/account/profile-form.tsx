'use client';

import React, { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import type { User } from '@prisma/client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { updateUserProfile } from '@/actions/user'; // Import action

// Schema for profile update
const profileSchema = z.object({
  name: z.string().min(1, 'Name is required.').optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  user: Omit<User, 'password' | 'emailVerified'>;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name ?? '',
    },
  });

  async function onSubmit(values: ProfileFormValues) {
    // Only submit if name has actually changed
    if (values.name === user.name) {
       toast.info("No changes detected.");
       return;
    }

    // Prepare only the changed data
    const dataToUpdate: Partial<ProfileFormValues> = {};
    if (values.name !== user.name) {
       dataToUpdate.name = values.name;
    }

    if (Object.keys(dataToUpdate).length === 0) {
       toast.info("No changes detected.");
       return;
    }


    startTransition(async () => {
      try {
        // Call updateUserProfile server action with only changed data
        const result = await updateUserProfile(dataToUpdate);
        if (result.success) {
          toast.success('Profile updated successfully!');
          // Optionally refresh session or page data if needed
          // e.g., router.refresh() or update session state
        } else {
          toast.error(result.error || 'Failed to update profile.');
          // Reset form to original values on error?
          form.reset({ name: user.name ?? '' });
        }
      } catch (error) {
        console.error('Update profile error:', error);
        toast.error('An unexpected error occurred.');
        form.reset({ name: user.name ?? '' }); // Reset on unexpected error
      }
    });
  }

  return (
    <Card>
       <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your account's profile information.</CardDescription> {/* Escaped apostrophe */}
       </CardHeader>
       <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <div> {/* Wrap the single child */}
                        <Input placeholder="Your Name" {...field} disabled={isPending} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div> {/* Wrap the single child */}
                      <Input type="email" value={user.email ?? ''} disabled readOnly />
                    </div>
                  </FormControl>
                  <FormDescription>Email address cannot be changed.</FormDescription>
               </FormItem>
              <Button type="submit" disabled={isPending}>
                {isPending && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </Form>
       </CardContent>
    </Card>
  );
}
