import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { XCircle, RefreshCw, Home, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function PaymentFailure() {
  const navigate = useNavigate();

  const params = new URLSearchParams(window.location.search);
  const errorMessage = params.get('error') || 'Your payment was cancelled or could not be processed.';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl text-red-700 dark:text-red-400">
            Payment Failed
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {errorMessage}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted rounded-lg p-4 text-sm text-muted-foreground">
            <p>Your payment was not completed. No charges have been made to your account.</p>
            <p className="mt-2">
              If you believe this is an error, please try again or contact our support team.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate({ to: '/subscription-packages' })}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: '/' })}>
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </div>

          <div className="pt-2 text-xs text-muted-foreground flex items-center justify-center gap-1">
            <CreditCard className="w-3 h-3" />
            <span>Payments are securely processed by Stripe</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
