import React, { useState } from 'react';
import { CreditCard, Loader2, X, Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useActor } from '../hooks/useActor';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface StripeSetupModalProps {
  open: boolean;
  onClose: () => void;
}

const COMMON_COUNTRIES = ['US', 'CA', 'GB', 'AU', 'IN', 'DE', 'FR', 'SG', 'AE', 'NZ'];

export default function StripeSetupModal({ open, onClose }: StripeSetupModalProps) {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const [secretKey, setSecretKey] = useState('');
  const [allowedCountries, setAllowedCountries] = useState<string[]>(['US', 'CA', 'GB', 'AU', 'IN']);
  const [newCountry, setNewCountry] = useState('');

  const saveConfig = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      if (!secretKey.trim()) throw new Error('Stripe secret key is required');
      if (!secretKey.startsWith('sk_')) throw new Error('Invalid Stripe secret key format (must start with sk_)');
      if (allowedCountries.length === 0) throw new Error('At least one country must be allowed');

      await actor.setStripeConfiguration({
        secretKey: secretKey.trim(),
        allowedCountries,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isStripeConfigured'] });
      toast.success('Stripe payment gateway configured successfully!');
      onClose();
    },
    onError: (error: Error) => {
      toast.error(`Configuration failed: ${error.message}`);
    },
  });

  const addCountry = () => {
    const code = newCountry.trim().toUpperCase();
    if (code.length !== 2) {
      toast.error('Please enter a valid 2-letter country code');
      return;
    }
    if (allowedCountries.includes(code)) {
      toast.error('Country already added');
      return;
    }
    setAllowedCountries([...allowedCountries, code]);
    setNewCountry('');
  };

  const removeCountry = (code: string) => {
    setAllowedCountries(allowedCountries.filter(c => c !== code));
  };

  const toggleCommonCountry = (code: string) => {
    if (allowedCountries.includes(code)) {
      removeCountry(code);
    } else {
      setAllowedCountries([...allowedCountries, code]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Configure Stripe Payments
          </DialogTitle>
          <DialogDescription>
            Set up Stripe as your payment gateway to accept subscription payments from students.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Stripe Secret Key */}
          <div className="space-y-2">
            <Label htmlFor="stripe-secret-key">
              Stripe Secret Key <span className="text-destructive">*</span>
            </Label>
            <Input
              id="stripe-secret-key"
              type="password"
              placeholder="sk_live_... or sk_test_..."
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Find your secret key in the{' '}
              <a
                href="https://dashboard.stripe.com/apikeys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Stripe Dashboard → API Keys
              </a>
            </p>
          </div>

          {/* Allowed Countries */}
          <div className="space-y-2">
            <Label>Allowed Countries</Label>
            <p className="text-xs text-muted-foreground">
              Select countries where students can make payments.
            </p>

            {/* Common country toggles */}
            <div className="flex flex-wrap gap-2">
              {COMMON_COUNTRIES.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => toggleCommonCountry(code)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    allowedCountries.includes(code)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground border-border hover:border-primary'
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>

            {/* Custom country input */}
            <div className="flex gap-2">
              <Input
                placeholder="Add country code (e.g. JP)"
                value={newCountry}
                onChange={(e) => setNewCountry(e.target.value.toUpperCase())}
                maxLength={2}
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && addCountry()}
              />
              <Button type="button" variant="outline" size="icon" onClick={addCountry}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Selected countries */}
            {allowedCountries.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {allowedCountries.map((code) => (
                  <Badge key={code} variant="secondary" className="flex items-center gap-1 pr-1">
                    {code}
                    <button
                      type="button"
                      onClick={() => removeCountry(code)}
                      className="ml-1 hover:text-destructive transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saveConfig.isPending}>
            Cancel
          </Button>
          <Button onClick={() => saveConfig.mutate()} disabled={saveConfig.isPending || !secretKey.trim()}>
            {saveConfig.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Save Stripe Configuration
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
