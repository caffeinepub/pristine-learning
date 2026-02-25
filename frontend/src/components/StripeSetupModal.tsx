import { useState } from 'react';
import { useSetStripeConfiguration } from '../hooks/useQueries';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Lock } from 'lucide-react';

const COUNTRIES = ['US', 'CA', 'GB', 'AU', 'IN', 'DE', 'FR', 'SG', 'AE', 'NZ'];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function StripeSetupModal({ open, onClose }: Props) {
  const [secretKey, setSecretKey] = useState('');
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['US', 'CA', 'GB']);
  const setConfig = useSetStripeConfiguration();

  const toggleCountry = (c: string) => {
    setSelectedCountries(prev =>
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
    );
  };

  const handleSave = async () => {
    if (!secretKey.trim()) return;
    try {
      await setConfig.mutateAsync({ secretKey: secretKey.trim(), allowedCountries: selectedCountries });
      toast.success('Stripe configured successfully!');
      onClose();
    } catch {
      toast.error('Failed to configure Stripe.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            <DialogTitle>Configure Stripe Payments</DialogTitle>
          </div>
          <DialogDescription>
            Set up Stripe to enable payment processing on the platform.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="sk">Stripe Secret Key</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="sk"
                type="password"
                placeholder="sk_live_..."
                value={secretKey}
                onChange={e => setSecretKey(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Allowed Countries</Label>
            <div className="flex flex-wrap gap-2">
              {COUNTRIES.map(c => (
                <button
                  key={c}
                  onClick={() => toggleCountry(c)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    selectedCountries.includes(c)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={!secretKey.trim() || setConfig.isPending}
            className="w-full btn-primary"
          >
            {setConfig.isPending ? 'Saving…' : 'Save Configuration'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
