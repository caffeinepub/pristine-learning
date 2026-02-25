import { reviewsStore, type Review } from '../lib/localStore';
import { useQuery } from '@tanstack/react-query';
import { Star } from 'lucide-react';

interface Props {
  teacherId: string;
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const sz = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`${sz} ${i <= rating ? 'star-filled' : 'star-empty'}`} />
      ))}
    </div>
  );
}

export default function ReviewsSection({ teacherId }: Props) {
  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ['reviews', teacherId],
    queryFn: () => reviewsStore.getForTeacher(teacherId),
    refetchInterval: 10000,
  });

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="text-center">
          <p className="text-4xl font-bold text-foreground">{avgRating.toFixed(1)}</p>
          <StarRating rating={Math.round(avgRating)} size="md" />
          <p className="text-xs text-muted-foreground mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex-1 space-y-1">
          {[5, 4, 3, 2, 1].map(star => {
            const count = reviews.filter(r => r.rating === star).length;
            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="w-3 text-right">{star}</span>
                <Star className="w-3 h-3 star-filled" />
                <div className="flex-1 bg-muted rounded-full h-1.5">
                  <div className="bg-amber-400 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-4 text-muted-foreground">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {reviews.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-4">No reviews yet. Be the first to review!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="border border-border rounded-xl p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                    {review.studentName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{review.studentName}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <StarRating rating={review.rating} />
              </div>
              {review.text && <p className="text-sm text-foreground/80 mt-2 leading-relaxed">{review.text}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
