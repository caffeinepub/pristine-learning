import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { reviewsStore, userProfileStore, type Booking } from '../lib/localStore';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  booking: Booking;
  onSubmitted: () => void;
}

export default function ReviewSubmissionForm({ booking, onSubmitted }: Props) {
  const { identity } = useInternetIdentity();
  const qc = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const principalId = identity?.getPrincipal().toString() || '';
  const profile = principalId ? userProfileStore.get(principalId) : null;

  const handleSubmit = async () => {
    if (!rating || !principalId) return;
    setSubmitting(true);
    reviewsStore.add({
      id: `rev_${Date.now()}`,
      teacherId: booking.teacherId,
      studentId: principalId,
      studentName: profile?.name || 'Student',
      sessionId: booking.id,
      rating,
      text,
      createdAt: new Date().toISOString(),
    });
    qc.invalidateQueries({ queryKey: ['reviews', booking.teacherId] });
    toast.success('Review submitted!');
    setSubmitting(false);
    onSubmitted();
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
      <p className="font-semibold text-sm">Rate your session with {booking.teacherName}</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <button
            key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setRating(i)}
          >
            <Star className={`w-7 h-7 transition-colors ${
              i <= (hovered || rating) ? 'star-filled' : 'star-empty'
            }`} />
          </button>
        ))}
      </div>
      <Textarea
        placeholder="Share your experience (optional)…"
        value={text}
        onChange={e => setText(e.target.value)}
        rows={3}
        className="text-sm"
      />
      <Button
        onClick={handleSubmit}
        disabled={!rating || submitting}
        size="sm"
        className="btn-primary"
      >
        {submitting ? 'Submitting…' : 'Submit Review'}
      </Button>
    </div>
  );
}
