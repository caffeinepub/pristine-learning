import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useIsStripeConfigured, useGetRazorpayConfig } from '../hooks/useQueries';
import { useRazorpayCheckout } from '../hooks/useRazorpayCheckout';
import { subscriptionStore } from '../lib/localStore';
import { isDemoMode } from '../components/DemoModeButton';
import { getAvailablePaymentGateways, inrToPaise } from '../utils/paymentGateway';
import { useActor } from '../hooks/useActor';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, CreditCard, Star, Zap, Crown, AlertCircle, Infinity } from 'lucide-react';

interface SubscriptionPackage {
  id: string;
  name: string;
  price: number; // INR
  priceInPaise: number;
  sessionsPerMonth: number;
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
}

const packages: SubscriptionPackage[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 999,
    priceInPaise: inrToPaise(999),
    sessionsPerMonth: 4,
    features: [
      '4 sessions per month',
      'Access to all teachers',
      'Session recordings',
      'Email support',
    ],
    icon: <Star className="h-6 w-6" />,
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 1999,
    priceInPaise: inrToPaise(1999),
    sessionsPerMonth: 9,
    features: [
      '9 sessions per month',
      'Access to all teachers',
      'Session recordings',
      'Priority support',
      'AI Study Assistant',
    ],
    popular: true,
    icon: <Zap className="h-6 w-6" />,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 3499,
    priceInPaise: inrToPaise(3499),
    sessionsPerMonth: 9999,
    features: [
      'Unlimited sessions',
      'Access to all teachers',
      'Session recordings',
      '24/7 priority support',
      'AI Study Assistant',
      'Exclusive content',
    ],
    icon: <Crown className="h-6 w-6" />,
  },
];

export default function SubscriptionPackagesPage() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const [processingPackageId, setProcessingPackageId] = useState<string | null>(null);

  const { data: stripeConfigured, isLoading: stripeLoading } = useIsStripeConfigured();
  const { data: razorpayConfig, isLoading: razorpayLoading } = useGetRazorpayConfig();
  const { initiatePayment, isLoading: razorpayCheckoutLoading } = useRazorpayCheckout();

  const demoMode = isDemoMode();
  const principalId = identity?.getPrincipal().toString() ?? '';

  // Read current subscription for the logged-in user
  const currentSubscription = principalId
    ? subscriptionStore.getUserSubscription(principalId)
    : null;

  const availableGateways = getAvailablePaymentGateways(
    !!stripeConfigured,
    razorpayConfig?.keyId
  );

  const isLoadingGateways = stripeLoading || razorpayLoading;
  const hasStripe = availableGateways.includes('stripe');
  const hasRazorpay = availableGateways.includes('razorpay');
  const hasAnyGateway = availableGateways.length > 0;

  const handleStripeCheckout = async (pkg: SubscriptionPackage) => {
    if (!actor) {
      toast.error('Please log in to subscribe.');
      return;
    }
    if (!stripeConfigured) {
      toast.error('Stripe is not configured. Please contact the administrator.');
      return;
    }

    setProcessingPackageId(pkg.id + '_stripe');
    try {
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success?package=${pkg.id}`;
      const cancelUrl = `${baseUrl}/payment-failure`;

      const sessionJson = await actor.createCheckoutSession(
        [
          {
            productName: `${pkg.name} Subscription`,
            currency: 'inr',
            quantity: BigInt(1),
            priceInCents: BigInt(pkg.priceInPaise),
            productDescription: `Pristine Learning ${pkg.name} plan - ${
              pkg.sessionsPerMonth === 9999 ? 'Unlimited' : pkg.sessionsPerMonth
            } sessions/month`,
          },
        ],
        successUrl,
        cancelUrl
      );

      const session = JSON.parse(sessionJson);
      if (!session?.url) throw new Error('Stripe session missing URL');
      window.location.href = session.url;
    } catch (err) {
      toast.error('Failed to initiate Stripe checkout. Please try again.');
      setProcessingPackageId(null);
    }
  };

  const handleRazorpayCheckout = async (pkg: SubscriptionPackage) => {
    if (!principalId) {
      toast.error('Please log in to subscribe.');
      return;
    }

    setProcessingPackageId(pkg.id + '_razorpay');

    await initiatePayment({
      amount: pkg.priceInPaise,
      currency: 'INR',
      name: 'Pristine Learning',
      description: `${pkg.name} Subscription - ${
        pkg.sessionsPerMonth === 9999 ? 'Unlimited' : pkg.sessionsPerMonth
      } sessions/month`,
      onSuccess: (response) => {
        // Activate subscription only after successful payment
        const renewalDate = new Date();
        renewalDate.setMonth(renewalDate.getMonth() + 1);
        subscriptionStore.setUserSubscription(principalId, {
          packageId: pkg.id,
          packageName: pkg.name,
          sessionsRemaining: pkg.sessionsPerMonth,
          renewalDate: renewalDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
          active: true,
        });
        toast.success(`Payment successful via Razorpay! ${pkg.name} plan activated.`);
        setProcessingPackageId(null);
        navigate({ to: '/student' });
      },
      onFailure: (error) => {
        if (error !== 'Payment was cancelled.') {
          toast.error(`Razorpay payment failed: ${error}`);
        }
        setProcessingPackageId(null);
      },
    });
  };

  const handleDemoSubscribe = (pkg: SubscriptionPackage) => {
    if (!principalId) {
      toast.error('Please log in to subscribe.');
      return;
    }
    const renewalDate = new Date();
    renewalDate.setMonth(renewalDate.getMonth() + 1);
    subscriptionStore.setUserSubscription(principalId, {
      packageId: pkg.id,
      packageName: pkg.name,
      sessionsRemaining: pkg.sessionsPerMonth,
      renewalDate: renewalDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      active: true,
    });
    toast.success(`Demo: ${pkg.name} plan activated!`);
    navigate({ to: '/student' });
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-3">Subscription Packages</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that works best for you and start learning with the best teachers.
          </p>
          {currentSubscription && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Check className="h-4 w-4" />
              Current plan: {currentSubscription.packageName}
            </div>
          )}
          {demoMode && (
            <div className="mt-4 inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-4 py-2 rounded-full text-sm border border-amber-200 dark:border-amber-800">
              <span>⚠️</span>
              <span>Demo mode — clicking Subscribe will simulate activation without payment</span>
            </div>
          )}
        </div>

        {/* Gateway Status */}
        {!demoMode && !isLoadingGateways && !hasAnyGateway && (
          <div className="mb-8 flex items-center gap-3 p-4 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive max-w-2xl mx-auto">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">
              No payment gateway is configured. Please contact the administrator to set up Stripe or Razorpay.
            </p>
          </div>
        )}

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => {
            const isCurrentPlan = currentSubscription?.packageId === pkg.id && currentSubscription?.active;
            const isProcessingStripe = processingPackageId === pkg.id + '_stripe';
            const isProcessingRazorpay = processingPackageId === pkg.id + '_razorpay';
            const isProcessing = isProcessingStripe || isProcessingRazorpay;
            const isUnlimited = pkg.sessionsPerMonth === 9999;

            return (
              <Card
                key={pkg.id}
                className={`relative flex flex-col transition-shadow hover:shadow-lg ${
                  pkg.popular ? 'border-primary shadow-md ring-1 ring-primary/20' : 'border-border'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-3 py-0.5 text-xs font-semibold">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                    pkg.popular ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {pkg.icon}
                  </div>
                  <CardTitle className="text-xl text-foreground">{pkg.name}</CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground">₹{pkg.price}</span>
                    <span className="text-muted-foreground text-sm">/month</span>
                  </div>
                  {isUnlimited ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <Infinity className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold text-primary">Unlimited Sessions</span>
                    </div>
                  ) : (
                    <CardDescription>{pkg.sessionsPerMonth} sessions per month</CardDescription>
                  )}
                </CardHeader>

                <CardContent className="flex-1">
                  <ul className="space-y-2">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="flex flex-col gap-2 pt-4">
                  {isCurrentPlan ? (
                    <Button variant="outline" className="w-full" disabled>
                      <Check className="mr-2 h-4 w-4" />
                      Current Plan
                    </Button>
                  ) : demoMode ? (
                    <Button
                      className="w-full"
                      onClick={() => handleDemoSubscribe(pkg)}
                      disabled={isProcessing}
                    >
                      Subscribe (Demo)
                    </Button>
                  ) : isLoadingGateways ? (
                    <Button className="w-full" disabled>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </Button>
                  ) : (
                    <>
                      {/* Stripe button — primary when available */}
                      {hasStripe && (
                        <Button
                          className="w-full"
                          onClick={() => handleStripeCheckout(pkg)}
                          disabled={isProcessing || razorpayCheckoutLoading}
                        >
                          {isProcessingStripe ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CreditCard className="mr-2 h-4 w-4" />
                              Pay with Stripe
                            </>
                          )}
                        </Button>
                      )}

                      {/* Razorpay button — secondary when Stripe also available */}
                      {hasRazorpay && (
                        <Button
                          variant={hasStripe ? 'outline' : 'default'}
                          className="w-full"
                          onClick={() => handleRazorpayCheckout(pkg)}
                          disabled={isProcessing || razorpayCheckoutLoading}
                        >
                          {isProcessingRazorpay ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing payment...
                            </>
                          ) : (
                            <>
                              <CreditCard className="mr-2 h-4 w-4" />
                              Pay with Razorpay
                            </>
                          )}
                        </Button>
                      )}

                      {/* No gateway configured */}
                      {!hasAnyGateway && (
                        <Button className="w-full" disabled>
                          <AlertCircle className="mr-2 h-4 w-4" />
                          No Payment Gateway
                        </Button>
                      )}
                    </>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Payment Gateway Info */}
        {!demoMode && hasAnyGateway && (
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p className="flex items-center justify-center gap-2">
              <CreditCard className="h-4 w-4" />
              Secure payments powered by{' '}
              {hasStripe && hasRazorpay
                ? 'Stripe & Razorpay'
                : hasStripe
                ? 'Stripe'
                : 'Razorpay'}
            </p>
          </div>
        )}

        {/* Back Button */}
        <div className="text-center mt-8">
          <Button variant="ghost" onClick={() => navigate({ to: '/' })}>
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
