/**
 * Utility helpers for determining which payment gateways are available
 * and formatting amounts for different gateways.
 */

export type PaymentGateway = 'stripe' | 'razorpay';

/**
 * Returns the list of configured payment gateways based on backend config.
 */
export function getAvailablePaymentGateways(
  stripeConfigured: boolean,
  razorpayKeyId: string | null | undefined
): PaymentGateway[] {
  const gateways: PaymentGateway[] = [];
  if (stripeConfigured) gateways.push('stripe');
  if (razorpayKeyId) gateways.push('razorpay');
  return gateways;
}

/**
 * Converts a price in USD cents to Razorpay paise (INR smallest unit).
 * Uses a rough conversion: 1 USD ≈ 83 INR.
 * For production, use a live exchange rate API.
 */
export function usdCentsToPaise(usdCents: number): number {
  const usdAmount = usdCents / 100;
  const inrAmount = usdAmount * 83;
  return Math.round(inrAmount * 100); // paise
}

/**
 * Converts a price in INR to paise (Razorpay's smallest unit).
 */
export function inrToPaise(inr: number): number {
  return Math.round(inr * 100);
}

/**
 * Formats a currency amount for display.
 */
export function formatCurrency(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}
