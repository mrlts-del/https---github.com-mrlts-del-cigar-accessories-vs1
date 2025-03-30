'use client'; // Need client component for dialog state

import React, { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { fetchCategories, deleteCategory } from '@/actions/category'; // Import actions
import type { Category } from '@prisma/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  // DialogFooter, // Removed unused import
  // DialogClose, // Removed unused import
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
} from '@/components/ui/alert-dialog'; // For delete confirmation
import { CategoryForm } from '@/components/admin/categories/category-form'; // Import form
import { toast } from 'sonner';
import { Edit, Trash2, PlusCircle } from 'lucide-react'; // Icons

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, startLoading] = useTransition();
  const [isDeleting, startDeleting] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    startLoading(async () => {
      const fetchedCategories = await fetchCategories();
      setCategories(fetchedCategories);
    });
  }, []);

  const handleFormSuccess = async () => {
    setIsDialogOpen(false); // Close dialog
    setEditingCategory(null); // Reset editing state
    // Refetch categories
    startLoading(async () => {
      const fetchedCategories = await fetchCategories();
      setCategories(fetchedCategories);
    });
  };

  const handleDelete = (categoryId: string) => {
     startDeleting(async () => {
        try {
           const result = await deleteCategory(categoryId);
           if (result.success) {
              toast.success('Category deleted successfully.');
              // Refetch categories after delete
              const fetchedCategories = await fetchCategories();
              setCategories(fetchedCategories);
           } else {
              toast.error(result.error || 'Failed to delete category.');
           }
        } catch (error) {
           toast.error('An unexpected error occurred.');
           console.error('Delete category error:', error);
        }
     });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Manage Categories</h1>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCategory(null)}> {/* Reset editing state when adding */}
              <PlusCircle className="mr-2 h-4 w-4" /> Add Category
            </Button>
          </DialogTrigger>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Existing Categories</CardTitle>
            <CardDescription>View and manage product categories.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
               <p>Loading categories...</p>
            ) : categories.length === 0 ? (
              <p className="text-muted-foreground">No categories found.</p>
            ) : (
              <ul className="divide-y divide-border">
                {categories.map((category) => (
                  <li key={category.id} className="flex items-center justify-between py-3">
                    <div>
                      <span className="font-medium">{category.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">({category.slug})</span>
                    </div>
                    <div className="flex space-x-2">
                       {/* Edit Button */}
                       <DialogTrigger asChild>
                          <Button
                             variant="outline"
                             size="sm"
                             onClick={() => setEditingCategory(category)}
                          >
                             <Edit className="mr-1 h-3 w-3" /> Edit
                          </Button>
                       </DialogTrigger>
                       {/* Delete Button with Confirmation */}
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
                                   This action cannot be undone. This will permanently delete the category "{category.name}". Make sure no products are assigned to this category. {/* Escaped quotes */}
                                </AlertDialogDescription>
                             </AlertDialogHeader>
                             <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                   onClick={() => handleDelete(category.id)}
                                   disabled={isDeleting}
                                   className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                   {isDeleting ? 'Deleting...' : 'Delete'}
                                </AlertDialogAction>
                             </AlertDialogFooter>
                          </AlertDialogContent>
                       </AlertDialog>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Dialog Content for Add/Edit Form */}
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
            <DialogDescription>
              {editingCategory ? 'Make changes to the category name.' : 'Enter the name for the new category.'}
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
             key={editingCategory?.id ?? 'new'} // Force re-render on edit/add switch
             initialData={editingCategory}
             onSuccess={handleFormSuccess}
          />
          {/* Optional: Add explicit close button if needed */}
          {/* <DialogFooter> <DialogClose asChild> <Button type="button" variant="secondary"> Close </Button> </DialogClose> </DialogFooter> */}
        </DialogContent>
      </div>
    </Dialog>
  );
}
