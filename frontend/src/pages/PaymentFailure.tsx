import { useNavigate } from '@tanstack/react-router';
import { useGetStripeSessionStatus } from '../hooks/useQueries';
import { XCircle, RefreshCw, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentFailure() {
  const navigate = useNavigate();

  // Extract sessionId from URL query params
  const search = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams();
  const sessionId = search.get('session_id') || '';

  const { data: sessionStatus, isLoading } = useGetStripeSessionStatus(sessionId);

  const errorMessage =
    sessionStatus?.__kind__ === 'failed'
      ? sessionStatus.failed.error
      : 'Your payment could not be processed. No charges were made.';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {isLoading && sessionId ? (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading payment details…</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-border p-8 shadow-card space-y-5 animate-fade-in">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-11 h-11 text-red-500" />
            </div>

            <div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                Payment Failed
              </h1>
              <p className="text-muted-foreground">{errorMessage}</p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
              ❌ Your booking has not been confirmed. Please try again.
            </div>

            <div className="space-y-3 pt-2">
              <Button
                onClick={() => navigate({ to: '/search' })}
                className="w-full btn-primary h-11 gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Try Again
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate({ to: '/' })}
                className="w-full gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              If you believe this is an error, please contact our support team.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
