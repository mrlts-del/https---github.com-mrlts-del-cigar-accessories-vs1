'use client';

import React, { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import type { Product, Category, Image as ProductImage } from '@prisma/client';

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { UploadDropzone } from '@/lib/uploadthing';
import Image from 'next/image';
import { X } from 'lucide-react';
import { createProduct, updateProduct } from '@/actions/product';

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
  // Keep local state for images as UploadDropzone needs it
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
          images: initialData.images?.map(mapPrismaImageToFormImage) ?? [], // Use mapped images for default
        }
      : {
          name: '', description: '', price: 0, categoryId: '', stock: 0, images: [],
        },
  });

  // Update form state when local image state changes
  React.useEffect(() => {
    // Ensure the value passed to react-hook-form matches the schema type
    form.setValue('images', uploadedImages, { shouldValidate: true });
  }, [uploadedImages, form]);

  async function onSubmit(values: ProductFormValues) {
     // Use values directly from react-hook-form. The 'images' field is kept in sync via useEffect.
     startTransition(async () => {
       try {
         let result: { success: boolean; error?: string; productId?: string; };
         if (isEditing && initialData) {
           result = await updateProduct(initialData.id, values); // Pass RHF values
           if (result.success) {
             toast.success('Product updated successfully!');
             router.push('/admin/products');
             router.refresh();
           } else {
             toast.error(result.error || 'Failed to update product.');
           }
         } else {
           result = await createProduct(values); // Pass RHF values
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
      const updated = uploadedImages.filter((img) => img.key !== keyToDelete);
      setUploadedImages(updated);
      // useEffect will handle form.setValue
      toast.info('Image removed. Save product to confirm changes.');
   };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader><CardTitle>{formTitle}</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            {/* Wrap name Input in div */}
            <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Product Name</FormLabel> <FormControl> <div><Input placeholder="e.g., Premium Humidor" {...field} disabled={isPending} /></div> </FormControl> <FormMessage /> </FormItem> )}/>
            {/* Wrap description Textarea in div */}
            <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Description</FormLabel> <FormControl> <div><Textarea placeholder="Describe the product..." {...field} disabled={isPending} rows={5} /></div> </FormControl> <FormMessage /> </FormItem> )}/>
             <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Wrap price Input in div */}
                <FormField control={form.control} name="price" render={({ field }) => ( <FormItem> <FormLabel>Price ($)</FormLabel> <FormControl> <div><Input type="number" step="0.01" placeholder="0.00" {...field} disabled={isPending} /></div> </FormControl> <FormMessage /> </FormItem> )}/>
                 {/* Wrap stock Input in div */}
                 <FormField control={form.control} name="stock" render={({ field }) => ( <FormItem> <FormLabel>Stock Quantity</FormLabel> <FormControl> <div><Input type="number" step="1" placeholder="0" {...field} disabled={isPending} /></div> </FormControl> <FormMessage /> </FormItem> )}/>
             </div>
             {/* Wrap SelectTrigger in div */}
             <FormField control={form.control} name="categoryId" render={({ field }) => ( <FormItem> <FormLabel>Category</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}> <FormControl> <div><SelectTrigger> <SelectValue placeholder="Select a category" /> </SelectTrigger></div> </FormControl> <SelectContent> {categories.map((category) => ( <SelectItem key={category.id} value={category.id}> {category.name} </SelectItem> ))} </SelectContent> </Select> <FormMessage /> </FormItem> )}/>
             {/* Wrap images div in another div */}
             <FormField control={form.control} name="images" render={({ field }) => ( // field is needed for RHF connection
                <FormItem>
                   <FormLabel>Product Images</FormLabel>
                   <FormControl>
                      {/* Wrap the existing div in another div */}
                      <div>
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
                               onClientUploadComplete={(res: any) => {
                                  if (res) {
                                     const newImages = res.map((file: any) => ({ key: file.key, url: file.url }));
                                     setUploadedImages((currentImages) => [...currentImages, ...newImages]);
                                     // useEffect handles form.setValue
                                     toast.success(`${newImages.length} image(s) uploaded successfully!`);
                                  }
                               }}
                               onUploadError={(error: Error) => { toast.error(`Image upload failed: ${error.message}`); }}
                               config={{ mode: 'auto' }}
                            />
                         </div>
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
