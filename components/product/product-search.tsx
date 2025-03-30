'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { useDebouncedCallback } from 'use-debounce'; // Need to install this

export function ProductSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentQuery = searchParams?.get('query') || '';

  // Debounce the search input to avoid excessive requests
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams ?? undefined);
    params.set('page', '1'); // Reset page on new search
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, 300); // 300ms debounce

  return (
    <div className="relative">
      <Input
        type="search"
        placeholder="Search products..."
        className="w-full sm:w-64 md:w-80 pl-8" // Add padding for potential icon
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={currentQuery}
      />
      {/* Optional: Add search icon absolutely positioned */}
      {/* <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /> */}
    </div>
  );
}
