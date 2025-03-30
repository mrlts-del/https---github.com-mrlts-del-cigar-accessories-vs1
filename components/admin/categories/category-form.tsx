'use client';

import React, { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import type { Category } from '@prisma/client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Icons } from '@/components/icons';
import { createCategory, updateCategory } from '@/actions/category'; // Import actions

// Schema matches the one in actions/category.ts
const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters.'),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  initialData?: Category | null; // For editing
  onSuccess?: () => void; // Optional callback on success
}

export function CategoryForm({ initialData, onSuccess }: CategoryFormProps) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!initialData;

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name ?? '',
    },
  });

  async function onSubmit(values: CategoryFormValues) {
    startTransition(async () => {
      try {
        let result: { success: boolean; error?: string };
        if (isEditing && initialData) {
          result = await updateCategory(initialData.id, values);
          if (result.success) {
            toast.success('Category updated successfully!');
            onSuccess?.(); // Call callback (e.g., close modal)
          } else {
            toast.error(result.error || 'Failed to update category.');
          }
        } else {
          result = await createCategory(values);
          if (result.success) {
            toast.success('Category created successfully!');
            form.reset(); // Reset form after creation
            onSuccess?.(); // Call callback
          } else {
            toast.error(result.error || 'Failed to create category.');
          }
        }
      } catch (error) {
        console.error('Category form error:', error);
        toast.error('An unexpected error occurred.');
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Humidors" {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Save Changes' : 'Create Category'}
        </Button>
      </form>
    </Form>
  );
}
