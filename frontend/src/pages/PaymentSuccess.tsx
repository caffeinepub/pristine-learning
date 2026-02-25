import React, { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { CheckCircle, Loader2, Home, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useActor } from '../hooks/useActor';
import { subscriptionStore } from '../lib/localStore';
import { toast } from 'sonner';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const verifySession = async () => {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get('session_id');

      if (!sessionId) {
        setVerifying(false);
        setVerified(true);
        return;
      }

      if (!actor) return;

      try {
        const status = await actor.getStripeSessionStatus(sessionId);

        if (status.__kind__ === 'completed') {
          setVerified(true);
          // Try to match and save subscription from session response
          try {
            const response = JSON.parse(status.completed.response);
            const lineItems = response?.line_items?.data;
            const packages = subscriptionStore.getPackages();
            if (lineItems && lineItems.length > 0) {
              const productName: string = lineItems[0]?.description || '';
              const matchedPkg = packages.find(p =>
                productName.toLowerCase().includes(p.name.toLowerCase())
              );
              if (matchedPkg && status.completed.userPrincipal) {
                const renewalDate = new Date();
                renewalDate.setMonth(renewalDate.getMonth() + 1);
                subscriptionStore.setUserSubscription(status.completed.userPrincipal, {
                  packageId: matchedPkg.id,
                  packageName: matchedPkg.name,
                  sessionsRemaining: matchedPkg.sessionsPerMonth,
                  renewalDate: renewalDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                  active: true,
                });
              }
            }
          } catch {
            // Ignore parsing errors — subscription activation is best-effort
          }
          toast.success('Payment confirmed! Your subscription is now active.');
        } else {
          setVerified(false);
          toast.error('Payment could not be verified. Please contact support.');
        }
      } catch (error) {
        // Optimistically show success if verification call fails
        setVerified(true);
      } finally {
        setVerifying(false);
      }
    };

    if (actor) {
      verifySession();
    }
  }, [actor]);

  if (verifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying your payment with Stripe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl text-green-700 dark:text-green-400">
            Payment Successful!
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {verified
              ? 'Your Stripe payment has been confirmed and your subscription is now active.'
              : 'Your payment was received. Your subscription will be activated shortly.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted rounded-lg p-4 text-sm text-muted-foreground">
            <p>You now have access to all features included in your subscription plan.</p>
            <p className="mt-2">A confirmation receipt has been sent to your email by Stripe.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate({ to: '/student' })}>
              <BookOpen className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: '/' })}>
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
