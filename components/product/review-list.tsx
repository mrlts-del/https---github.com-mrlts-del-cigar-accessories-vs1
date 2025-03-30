import React from 'react';
import { getProductReviews } from '@/actions/review';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Star } from 'lucide-react'; // For displaying rating

interface ReviewListProps {
  productId: string;
}

// Helper to render star ratings
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? 'fill-primary text-primary' : 'fill-muted stroke-muted-foreground'
          }`}
        />
      ))}
    </div>
  );
}

export async function ReviewList({ productId }: ReviewListProps) {
  const reviews = await getProductReviews(productId);

  if (reviews.length === 0) {
    return <p className="text-muted-foreground">No reviews yet.</p>;
  }

  // TODO: Calculate average rating
  // const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

  return (
    <div className="space-y-6">
       {/* Optional: Display average rating summary */}
       {/* <div>Average Rating: {averageRating.toFixed(1)} / 5</div> */}

      {reviews.map((review, index) => (
        <React.Fragment key={review.id}>
          <div className="flex gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={review.user.image ?? undefined} alt={review.user.name ?? 'User'} />
              <AvatarFallback>
                {review.user.name ? review.user.name.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                 <p className="font-semibold">{review.user.name ?? 'Anonymous'}</p>
                 <span className="text-xs text-muted-foreground">
                   {new Intl.DateTimeFormat('en-US').format(review.createdAt)}
                 </span>
              </div>
              <div className="my-1">
                 <StarRating rating={review.rating} />
              </div>
              <p className="text-sm text-muted-foreground">{review.comment}</p>
            </div>
          </div>
          {index < reviews.length - 1 && <Separator />}
        </React.Fragment>
      ))}
    </div>
  );
}
