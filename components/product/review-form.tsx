'use client';

import React, { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react'; // To check if user is logged in

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea'; // Assuming textarea exists
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'; // For rating
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Icons } from '@/components/icons';
// TODO: Import server action to submit review
import { submitReview } from '@/actions/review'; // Import server action

const reviewSchema = z.object({
  rating: z.coerce // Coerce string value from radio group to number
    .number({ required_error: 'Please select a rating.' })
    .min(1, 'Rating must be at least 1.')
    .max(5, 'Rating must be at most 5.'),
  comment: z.string().optional(),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  productId: string;
  onReviewSubmit?: () => void; // Optional callback after submission
}

export function ReviewForm({ productId, onReviewSubmit }: ReviewFormProps) {
  const { data: session, status } = useSession();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0, // Default to 0 or null? Zod requires number here.
      comment: '',
    },
  });

  async function onSubmit(values: ReviewFormValues) {
    if (!session?.user) {
      toast.error('You must be logged in to submit a review.');
      // TODO: Redirect to login?
      return;
    }

    startTransition(async () => {
      try {
        // Call submitReview server action
        const result = await submitReview({
          productId,
          rating: values.rating,
          comment: values.comment,
        });
        if (result.success) {
          toast.success('Review submitted successfully!');
          form.reset();
          onReviewSubmit?.(); // Call callback if provided
        } else {
          toast.error(result.error || 'Failed to submit review.');
        }
      } catch (error) {
        console.error('Submit review error:', error);
        toast.error('An unexpected error occurred.');
      }
    });
  }

  if (status === 'loading') {
    return <p>Loading...</p>; // Or a skeleton
  }

  if (!session) {
    return <p>Please <a href="/auth/signin" className="underline">sign in</a> to leave a review.</p>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Your Rating *</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  // defaultValue={field.value.toString()} // defaultValue might cause issues with react-hook-form state
                  value={field.value > 0 ? field.value.toString() : undefined} // Control value
                  className="flex space-x-2"
                  disabled={isPending}
                >
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <FormItem key={rating} className="flex items-center space-x-1 space-y-0">
                      <FormControl>
                        <RadioGroupItem value={rating.toString()} />
                      </FormControl>
                      <FormLabel className="font-normal">{rating}</FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Review (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us what you think about this product..."
                  className="resize-none"
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Submit Review
        </Button>
      </form>
    </Form>
  );
}
