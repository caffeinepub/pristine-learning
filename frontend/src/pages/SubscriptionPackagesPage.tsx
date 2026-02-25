import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { subscriptionStore, userProfileStore, type SubscriptionPackage } from '../lib/localStore';
import { useIsStripeConfigured, useCreateCheckoutSession } from '../hooks/useQueries';
import Navbar from '../components/Navbar';
import { CheckCircle, Package, Zap, Star, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

function PackageCard({
  pkg,
  onSubscribe,
  loading,
  isActive,
}: {
  pkg: SubscriptionPackage;
  onSubscribe: (pkg: SubscriptionPackage) => void;
  loading: boolean;
  isActive: boolean;
}) {
  const isPopular = pkg.name === 'Standard';

  return (
    <div
      className={`relative bg-white rounded-2xl border-2 p-6 flex flex-col shadow-card transition-all duration-200 hover:shadow-card-hover ${
        isPopular ? 'border-primary scale-105' : 'border-border'
      } ${isActive ? 'ring-2 ring-green-400' : ''}`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground px-3 py-0.5 text-xs font-semibold">
            Most Popular
          </Badge>
        </div>
      )}
      {isActive && (
        <div className="absolute -top-3 right-4">
          <Badge className="bg-green-500 text-white px-3 py-0.5 text-xs font-semibold">
            Active
          </Badge>
        </div>
      )}

      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
        isPopular ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
      }`}>
        {pkg.name === 'Basic' ? <Package className="w-6 h-6" /> :
         pkg.name === 'Standard' ? <Zap className="w-6 h-6" /> :
         <Star className="w-6 h-6" />}
      </div>

      <h3 className="font-display text-xl font-bold mb-1">{pkg.name}</h3>
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-4xl font-bold text-primary">${pkg.price}</span>
        <span className="text-muted-foreground text-sm">/month</span>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        {pkg.sessionsPerMonth} sessions per month
      </p>

      <ul className="space-y-2.5 mb-6 flex-1">
        {pkg.features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        onClick={() => onSubscribe(pkg)}
        disabled={loading || isActive}
        className={`w-full h-11 font-semibold ${isPopular ? 'btn-primary' : ''}`}
        variant={isPopular ? 'default' : 'outline'}
      >
        {isActive ? 'Current Plan' : loading ? 'Processing…' : `Get ${pkg.name}`}
      </Button>
    </div>
  );
}

export default function SubscriptionPackagesPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const [loadingPkgId, setLoadingPkgId] = useState<string | null>(null);
  const { data: stripeConfigured } = useIsStripeConfigured();
  const createCheckout = useCreateCheckoutSession();

  const principalId = identity?.getPrincipal().toString() || '';
  const profile = principalId ? userProfileStore.get(principalId) : null;
  const packages = subscriptionStore.getPackages();
  const activeSubscription = principalId ? subscriptionStore.getUserSubscription(principalId) : null;

  const handleSubscribe = async (pkg: SubscriptionPackage) => {
    if (!identity) {
      toast.error('Please log in to subscribe.');
      return;
    }

    setLoadingPkgId(pkg.id);

    try {
      if (stripeConfigured) {
        // Use Stripe checkout
        const items = [
          {
            productName: `${pkg.name} Subscription`,
            currency: 'usd',
            quantity: BigInt(1),
            priceInCents: BigInt(Math.round(pkg.price * 100)),
            productDescription: `${pkg.sessionsPerMonth} tutoring sessions per month`,
          },
        ];
        const session = await createCheckout.mutateAsync(items);
        if (!session?.url) throw new Error('Stripe session missing url');
        window.location.href = session.url;
      } else {
        // Fallback: save subscription locally (demo mode)
        const renewalDate = new Date();
        renewalDate.setMonth(renewalDate.getMonth() + 1);
        subscriptionStore.setUserSubscription(principalId, {
          packageId: pkg.id,
          packageName: pkg.name,
          sessionsRemaining: pkg.sessionsPerMonth,
          renewalDate: renewalDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          active: true,
        });
        toast.success(`Subscribed to ${pkg.name} plan! (Demo mode — Stripe not configured)`);
        navigate({ to: '/student' });
      }
    } catch (err) {
      toast.error('Failed to process subscription. Please try again.');
    } finally {
      setLoadingPkgId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-14">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
            💎 Subscription Plans
          </Badge>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            Invest in Your Education
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose a plan that fits your learning goals. All plans include access to our global network
            of expert tutors and AI study tools.
          </p>
        </div>

        {/* Active subscription banner */}
        {activeSubscription && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8 flex items-center justify-between">
            <div>
              <p className="font-semibold text-green-800">
                ✅ Active: {activeSubscription.packageName} Plan
              </p>
              <p className="text-sm text-green-600">
                {activeSubscription.sessionsRemaining} sessions remaining · Renews {activeSubscription.renewalDate}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: '/student' })}
              className="border-green-300 text-green-700 hover:bg-green-100"
            >
              Go to Dashboard
            </Button>
          </div>
        )}

        {/* Packages grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onSubscribe={handleSubscribe}
              loading={loadingPkgId === pkg.id}
              isActive={activeSubscription?.packageId === pkg.id}
            />
          ))}
        </div>

        {/* FAQ / features */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {[
            { icon: '🔒', title: 'Secure Payments', desc: 'All payments processed securely via Stripe.' },
            { icon: '🔄', title: 'Cancel Anytime', desc: 'No long-term commitment. Cancel whenever you want.' },
            { icon: '🌍', title: 'Global Tutors', desc: 'Access tutors from 50+ countries in your timezone.' },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-xl border border-border p-5">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-semibold mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-sidebar text-sidebar-foreground py-8 mt-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-sidebar-foreground/50">
          <p>© {new Date().getFullYear()} Pristine Learning. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400 mx-1" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sidebar-primary hover:underline ml-1"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
