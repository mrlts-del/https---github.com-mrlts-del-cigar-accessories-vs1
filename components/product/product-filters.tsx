'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Category } from '@prisma/client';

interface ProductFiltersProps {
  categories: Category[];
  // Add other filter options if needed
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams?.get('category') || 'all';
  const currentSort = searchParams?.get('sort') || 'newest';

  const handleFilterChange = (type: 'category' | 'sort', value: string) => {
    const params = new URLSearchParams(searchParams ?? undefined);
    // Reset page to 1 when filters change
    params.set('page', '1');

    if (type === 'category') {
      if (value === 'all') {
        params.delete('category');
      } else {
        params.set('category', value);
      }
    } else if (type === 'sort') {
       if (value === 'newest') {
         params.delete('sort'); // Remove sort param if it's the default
       } else {
         params.set('sort', value);
       }
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false }); // Prevent scroll to top
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Category Filter */}
      <div className="flex items-center gap-2">
         <span className="text-sm font-medium">Category:</span>
         <Select
            value={currentCategory}
            onValueChange={(value) => handleFilterChange('category', value)}
         >
            <SelectTrigger className="w-[180px]">
               <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
               <SelectItem value="all">All Categories</SelectItem>
               {categories.map((category) => (
                  <SelectItem key={category.id} value={category.slug}>
                     {category.name}
                  </SelectItem>
               ))}
            </SelectContent>
         </Select>
      </div>

      {/* Sort By */}
       <div className="flex items-center gap-2">
         <span className="text-sm font-medium">Sort by:</span>
         <Select
            value={currentSort}
            onValueChange={(value) => handleFilterChange('sort', value)}
         >
            <SelectTrigger className="w-[180px]">
               <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
               <SelectItem value="newest">Newest</SelectItem>
               <SelectItem value="price-asc">Price: Low to High</SelectItem>
               <SelectItem value="price-desc">Price: High to Low</SelectItem>
               {/* Add other sort options like popularity, rating */}
            </SelectContent>
         </Select>
      </div>
    </div>
  );
}
