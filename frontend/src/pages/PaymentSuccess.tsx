import { useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useGetStripeSessionStatus } from '../hooks/useQueries';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentSuccess() {
  const navigate = useNavigate();

  // Extract sessionId from URL query params
  const search = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams();
  const sessionId = search.get('session_id') || '';

  const { data: sessionStatus, isLoading } = useGetStripeSessionStatus(sessionId);

  const isCompleted = sessionStatus?.__kind__ === 'completed';
  const isFailed = sessionStatus?.__kind__ === 'failed';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {isLoading && sessionId ? (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
            <p className="text-muted-foreground">Verifying your payment…</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-border p-8 shadow-card space-y-5 animate-fade-in">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-11 h-11 text-green-600" />
            </div>

            <div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                Payment Successful!
              </h1>
              <p className="text-muted-foreground">
                Your payment has been processed successfully. Your session is now confirmed.
              </p>
            </div>

            {isCompleted && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700">
                ✅ Payment verified and booking confirmed.
              </div>
            )}

            <div className="space-y-3 pt-2">
              <Button
                onClick={() => navigate({ to: '/student' })}
                className="w-full btn-primary h-11 gap-2"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate({ to: '/search' })}
                className="w-full"
              >
                Book Another Session
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              A confirmation has been added to your dashboard. Check your bookings for the meeting link.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
