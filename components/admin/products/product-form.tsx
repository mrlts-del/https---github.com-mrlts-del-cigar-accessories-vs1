'use client';

import React, { useState, useTransition } from 'react'; // Removed useEffect
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import type { Product, Category, Image as ProductImage } from '@prisma/client';
// Removed incorrect UploadFileResponse import

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
// import { Checkbox } from '@/components/ui/checkbox'; // Removed unused import
import {
  Form,
  FormControl,
  // FormDescription, // Removed unused import
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { UploadDropzone } from '@/lib/uploadthing'; // Corrected import path
import Image from 'next/image';
import { X } from 'lucide-react';
import { createProduct, updateProduct } from '@/actions/product'; // Import product actions

// Define Zod schema
const productFormSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters.'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be a positive number.'),
  categoryId: z.string().min(1, 'Please select a category.'),
  stock: z.coerce.number().int().min(0, 'Stock must be a non-negative integer.'),
  images: z
    .array(z.object({ key: z.string(), url: z.string() }))
    .min(1, 'Please upload at least one image.'),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

type ProductWithRelations = Product & {
  category: Category | null;
  images: ProductImage[];
};

interface ProductFormProps {
  initialData?: ProductWithRelations | null;
  categories: Category[];
}

// Helper to map Prisma Image to form image state
const mapPrismaImageToFormImage = (img: ProductImage): { key: string; url: string } => ({
  key: img.id, // Use Prisma ID as key for existing images
  url: img.url,
});

export function ProductForm({ initialData, categories }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [uploadedImages, setUploadedImages] = useState<{ key: string; url: string }[]>(
    initialData?.images?.map(mapPrismaImageToFormImage) ?? []
  );

  const isEditing = !!initialData;
  const formTitle = isEditing ? 'Edit Product' : 'Create Product';
  const actionButtonText = isEditing ? 'Save Changes' : 'Create Product';

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          description: initialData.description ?? '',
          price: initialData.price ?? 0,
          stock: initialData.stock ?? 0,
          categoryId: initialData.categoryId ?? '',
          images: initialData.images?.map(mapPrismaImageToFormImage) ?? [],
        }
      : {
          name: '', description: '', price: 0, categoryId: '', stock: 0, images: [],
        },
  });

  async function onSubmit(values: ProductFormValues) {
     const submissionData = { ...values, images: uploadedImages };
     startTransition(async () => {
       try {
         let result: { success: boolean; error?: string; productId?: string; };
         if (isEditing && initialData) {
           result = await updateProduct(initialData.id, submissionData);
           if (result.success) {
             toast.success('Product updated successfully!');
             router.push('/admin/products');
             router.refresh();
           } else {
             toast.error(result.error || 'Failed to update product.');
           }
         } else {
           result = await createProduct(submissionData);
           if (result.success) {
             toast.success('Product created successfully!');
             router.push('/admin/products');
           } else {
             toast.error(result.error || 'Failed to create product.');
           }
         }
       } catch (error) {
         console.error('Product form error:', error);
         toast.error('An unexpected error occurred.');
       }
     });
  }

   const handleImageDelete = (keyToDelete: string) => {
      const updatedImages = uploadedImages.filter((img) => img.key !== keyToDelete);
      setUploadedImages(updatedImages);
      form.setValue('images', updatedImages, { shouldValidate: true });
      toast.info('Image removed. Save product to confirm changes.');
   };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader><CardTitle>{formTitle}</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Product Name</FormLabel> <FormControl> <Input placeholder="e.g., Premium Humidor" {...field} disabled={isPending} /> </FormControl> <FormMessage /> </FormItem> )}/>
            <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Description</FormLabel> <FormControl> <Textarea placeholder="Describe the product..." {...field} disabled={isPending} rows={5} /> </FormControl> <FormMessage /> </FormItem> )}/>
             <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField control={form.control} name="price" render={({ field }) => ( <FormItem> <FormLabel>Price ($)</FormLabel> <FormControl> <Input type="number" step="0.01" placeholder="0.00" {...field} disabled={isPending} /> </FormControl> <FormMessage /> </FormItem> )}/>
                 <FormField control={form.control} name="stock" render={({ field }) => ( <FormItem> <FormLabel>Stock Quantity</FormLabel> <FormControl> <Input type="number" step="1" placeholder="0" {...field} disabled={isPending} /> </FormControl> <FormMessage /> </FormItem> )}/>
             </div>
             <FormField control={form.control} name="categoryId" render={({ field }) => ( <FormItem> <FormLabel>Category</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}> <FormControl> <SelectTrigger> <SelectValue placeholder="Select a category" /> </SelectTrigger> </FormControl> <SelectContent> {categories.map((category) => ( <SelectItem key={category.id} value={category.id}> {category.name} </SelectItem> ))} </SelectContent> </Select> <FormMessage /> </FormItem> )}/>
             <FormField control={form.control} name="images" render={() => ( // Removed unused field
                <FormItem>
                   <FormLabel>Product Images</FormLabel>
                   <FormControl>
                      <div>
                         {uploadedImages.length > 0 && (
                            <div className="mb-4 grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                               {uploadedImages.map((image) => (
                                  <div key={image.key} className="relative group aspect-square">
                                     <Image src={image.url} alt="Uploaded product image" fill className="object-cover rounded-md" sizes="(max-width: 768px) 30vw, 150px"/>
                                     <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleImageDelete(image.key)} disabled={isPending}> <X className="h-4 w-4" /> <span className="sr-only">Delete image</span> </Button>
                                  </div>
                               ))}
                            </div>
                         )}
                         <UploadDropzone
                            endpoint="productImageUploader"
                            // Revert to using 'any' for now
                            onClientUploadComplete={(res: any) => {
                               if (res) {
                                  // Assuming res is an array of objects with key and url
                                  const newImages = res.map((file: any) => ({ key: file.key, url: file.url }));
                                  const updatedImages = [...uploadedImages, ...newImages];
                                  setUploadedImages(updatedImages);
                                  form.setValue('images', updatedImages, { shouldValidate: true });
                                  toast.success(`${newImages.length} image(s) uploaded successfully!`);
                               }
                            }}
                            onUploadError={(error: Error) => { toast.error(`Image upload failed: ${error.message}`); }}
                            config={{ mode: 'auto' }}
                         />
                      </div>
                   </FormControl>
                   <FormMessage />
                </FormItem>
             )}/>
          </CardContent>
        </Card>
        <Button type="submit" disabled={isPending}> {isPending && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />} {actionButtonText} </Button>
      </form>
    </Form>
  );
}
