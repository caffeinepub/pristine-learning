import React, { useState } from 'react';
import { toast } from 'sonner';
import { useSetRazorpayConfig, useGetRazorpayConfig } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CreditCard, Eye, EyeOff } from 'lucide-react';

interface RazorpaySetupModalProps {
  demoMode?: boolean;
}

export default function RazorpaySetupModal({ demoMode = false }: RazorpaySetupModalProps) {
  const [keyId, setKeyId] = useState('');
  const [keySecret, setKeySecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);

  const { data: existingConfig } = useGetRazorpayConfig();
  const setRazorpayConfig = useSetRazorpayConfig();

  const isConfigured = !!existingConfig?.keyId;
  const isDisabled = demoMode || setRazorpayConfig.isPending;

  const handleSave = async () => {
    if (!keyId.trim()) {
      toast.error('Key ID is required');
      return;
    }
    if (!keySecret.trim()) {
      toast.error('Key Secret is required');
      return;
    }

    try {
      await setRazorpayConfig.mutateAsync({ keyId: keyId.trim(), keySecret: keySecret.trim() });
      toast.success('Razorpay configuration saved successfully');
      setKeyId('');
      setKeySecret('');
    } catch (err) {
      toast.error('Failed to save Razorpay configuration. Please try again.');
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <CreditCard className="h-5 w-5 text-primary" />
          Razorpay Setup
        </CardTitle>
        <CardDescription>
          {isConfigured
            ? 'Razorpay is configured. Enter new credentials to update.'
            : 'Configure Razorpay payment gateway for accepting payments.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {demoMode && (
          <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-700">
            Razorpay configuration is disabled in demo mode.
          </div>
        )}

        {isConfigured && !demoMode && (
          <div className="rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
            ✓ Razorpay is currently configured (Key ID: {existingConfig.keyId})
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="razorpay-key-id" className="text-foreground">
            Key ID
          </Label>
          <Input
            id="razorpay-key-id"
            type="text"
            placeholder="rzp_live_xxxxxxxxxxxx"
            value={keyId}
            onChange={(e) => setKeyId(e.target.value)}
            disabled={isDisabled}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Your Razorpay Key ID (starts with rzp_live_ or rzp_test_)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="razorpay-key-secret" className="text-foreground">
            Key Secret
          </Label>
          <div className="relative">
            <Input
              id="razorpay-key-secret"
              type={showSecret ? 'text' : 'password'}
              placeholder="Enter your Razorpay Key Secret"
              value={keySecret}
              onChange={(e) => setKeySecret(e.target.value)}
              disabled={isDisabled}
              className="font-mono text-sm pr-10"
            />
            <button
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              disabled={isDisabled}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Your Razorpay Key Secret — keep this confidential.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={isDisabled}
          className="w-full"
        >
          {setRazorpayConfig.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Razorpay Config'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
