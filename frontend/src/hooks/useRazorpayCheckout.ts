import { useState, useCallback } from 'react';
import { useGetRazorpayConfig } from './useQueries';

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number; // in paise (smallest currency unit)
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  handler: (response: RazorpayPaymentResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open(): void;
  on(event: string, handler: () => void): void;
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

interface InitiatePaymentParams {
  amount: number; // in smallest currency unit (paise for INR)
  currency?: string;
  name?: string;
  description: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  onSuccess: (response: RazorpayPaymentResponse) => void;
  onFailure?: (error: string) => void;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function useRazorpayCheckout() {
  const [isLoading, setIsLoading] = useState(false);
  const { data: razorpayConfig } = useGetRazorpayConfig();

  const initiatePayment = useCallback(
    async (params: InitiatePaymentParams) => {
      if (!razorpayConfig?.keyId) {
        params.onFailure?.('Razorpay is not configured. Please contact the administrator.');
        return;
      }

      setIsLoading(true);

      try {
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          throw new Error('Failed to load Razorpay checkout script.');
        }

        const options: RazorpayOptions = {
          key: razorpayConfig.keyId,
          amount: params.amount,
          currency: params.currency ?? 'INR',
          name: params.name ?? 'Pristine Learning',
          description: params.description,
          handler: (response: RazorpayPaymentResponse) => {
            setIsLoading(false);
            params.onSuccess(response);
          },
          prefill: params.prefill,
          theme: {
            color: '#2563eb',
          },
          modal: {
            ondismiss: () => {
              setIsLoading(false);
              params.onFailure?.('Payment was cancelled.');
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err) {
        setIsLoading(false);
        const message = err instanceof Error ? err.message : 'Payment initiation failed.';
        params.onFailure?.(message);
      }
    },
    [razorpayConfig]
  );

  return {
    initiatePayment,
    isLoading,
    isConfigured: !!razorpayConfig?.keyId,
  };
}
