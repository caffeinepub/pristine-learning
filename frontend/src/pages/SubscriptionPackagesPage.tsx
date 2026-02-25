import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Check, Star, Zap, Crown, Loader2, CreditCard, Infinity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { ShoppingItem } from '../backend';
import { subscriptionStore, type SubscriptionPackage } from '../lib/localStore';
import { toast } from 'sonner';

type CheckoutSession = {
  id: string;
  url: string;
};

export default function SubscriptionPackagesPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const [checkingOutPackageId, setCheckingOutPackageId] = useState<string | null>(null);

  const packages = subscriptionStore.getPackages();

  const { data: isStripeConfigured } = useQuery({
    queryKey: ['isStripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor,
  });

  const createCheckoutSession = useMutation({
    mutationFn: async (items: ShoppingItem[]): Promise<CheckoutSession> => {
      if (!actor) throw new Error('Actor not available');
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/payment-failure`;
      const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
      const session = JSON.parse(result) as CheckoutSession;
      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }
      return session;
    },
    onSuccess: (session) => {
      if (!session?.url) {
        toast.error('Payment session URL is missing. Please try again.');
        return;
      }
      window.location.href = session.url;
    },
    onError: (error: Error) => {
      toast.error(`Checkout failed: ${error.message}`);
      setCheckingOutPackageId(null);
    },
  });

  const handleSubscribe = async (pkg: SubscriptionPackage) => {
    if (!identity) {
      toast.error('Please log in to subscribe');
      navigate({ to: '/' });
      return;
    }

    const principalId = identity.getPrincipal().toString();
    const isUnlimited = subscriptionStore.isUnlimited(pkg);

    if (!isStripeConfigured) {
      // Demo mode: simulate subscription
      const renewalDate = new Date();
      renewalDate.setMonth(renewalDate.getMonth() + 1);
      subscriptionStore.setUserSubscription(principalId, {
        packageId: pkg.id,
        packageName: pkg.name,
        sessionsRemaining: pkg.sessionsPerMonth,
        renewalDate: renewalDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        active: true,
      });
      toast.success(`Demo: Subscribed to ${pkg.name} plan!`);
      navigate({ to: '/student' });
      return;
    }

    setCheckingOutPackageId(pkg.id);

    const sessionDescription = isUnlimited
      ? 'Unlimited tutoring sessions per month'
      : `${pkg.sessionsPerMonth} tutoring sessions per month`;

    const items: ShoppingItem[] = [
      {
        productName: `${pkg.name} Subscription`,
        currency: 'usd',
        quantity: BigInt(1),
        priceInCents: BigInt(Math.round(pkg.price * 100)),
        productDescription: sessionDescription,
      },
    ];

    await createCheckoutSession.mutateAsync(items);
  };

  const getPackageIcon = (id: string) => {
    switch (id) {
      case 'pkg-basic': return <Star className="w-6 h-6" />;
      case 'pkg-standard': return <Zap className="w-6 h-6" />;
      case 'pkg-premium': return <Crown className="w-6 h-6" />;
      default: return <Star className="w-6 h-6" />;
    }
  };

  const getPackageColor = (id: string) => {
    switch (id) {
      case 'pkg-basic': return 'border-border';
      case 'pkg-standard': return 'border-primary ring-2 ring-primary';
      case 'pkg-premium': return 'border-accent ring-2 ring-accent';
      default: return 'border-border';
    }
  };

  const getSessionsLabel = (pkg: SubscriptionPackage): string => {
    return subscriptionStore.isUnlimited(pkg)
      ? 'Unlimited sessions per month'
      : `${pkg.sessionsPerMonth} sessions per month`;
  };

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Subscription Plans</Badge>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Choose Your Learning Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Unlock premium features and accelerate your learning journey with our flexible subscription plans.
          </p>
          {!isStripeConfigured && (
            <div className="mt-4 inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-4 py-2 rounded-full text-sm border border-amber-200 dark:border-amber-800">
              <span>⚠️</span>
              <span>Demo mode — payments not yet configured by admin</span>
            </div>
          )}
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {packages.map((pkg) => {
            const isPopular = pkg.id === 'pkg-standard';
            const isPremium = pkg.id === 'pkg-premium';
            const isUnlimited = subscriptionStore.isUnlimited(pkg);
            const isCheckingOut = checkingOutPackageId === pkg.id && createCheckoutSession.isPending;

            return (
              <Card
                key={pkg.id}
                className={`relative flex flex-col transition-all duration-200 hover:shadow-lg ${getPackageColor(pkg.id)}`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}

                {isPremium && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-accent text-accent-foreground px-4 py-1">
                      Best Value
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                    isPremium
                      ? 'bg-accent text-accent-foreground'
                      : isPopular
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {getPackageIcon(pkg.id)}
                  </div>
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>

                  {/* Sessions label — highlight "Unlimited" for Premium */}
                  {isUnlimited ? (
                    <div className="flex items-center justify-center gap-1.5 mt-1">
                      <Infinity className="w-4 h-4 text-accent" />
                      <span className="text-sm font-semibold text-accent">Unlimited Sessions</span>
                    </div>
                  ) : (
                    <CardDescription>{getSessionsLabel(pkg)}</CardDescription>
                  )}

                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">${pkg.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>

                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isPremium ? 'text-accent' : 'text-green-500'}`} />
                        <span className={`text-sm ${
                          isPremium && idx === 0
                            ? 'text-foreground font-semibold'
                            : 'text-muted-foreground'
                        }`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-4">
                  <Button
                    className="w-full"
                    variant={isPremium ? 'default' : isPopular ? 'default' : 'outline'}
                    onClick={() => handleSubscribe(pkg)}
                    disabled={isCheckingOut || (createCheckoutSession.isPending && checkingOutPackageId !== pkg.id)}
                  >
                    {isCheckingOut ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        {isStripeConfigured ? 'Subscribe with Stripe' : 'Try Demo'}
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Payment Info */}
        {isStripeConfigured && (
          <div className="text-center text-sm text-muted-foreground">
            <p className="flex items-center justify-center gap-2">
              <CreditCard className="w-4 h-4" />
              Secure payment powered by Stripe. Cancel anytime.
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
