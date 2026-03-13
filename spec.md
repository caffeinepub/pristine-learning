# Specification

## Summary
**Goal:** Re-add Razorpay as an official payment gateway alongside Stripe, with admin credential configuration stored securely in the backend.

**Planned changes:**
- Add `RazorpayConfig` type and stable storage in the backend; add admin-only `setRazorpayConfig` and `getRazorpayConfig` functions (key secret masked for non-admin callers)
- Add a "Razorpay Setup" form (Key ID + Key Secret fields, Save button) in the AdminDashboard System Configuration tab; disabled in demo mode, restricted to admins; shows success/error toasts
- Re-integrate Razorpay checkout dynamically (loading checkout.js on demand) for session bookings and subscriptions; if only Razorpay is configured it is the sole option, if both gateways are configured Stripe is default with Razorpay as secondary; post-payment logic records transaction with 10% commission / 90% to teacher wallet, mirroring Stripe flow
- Add `razorpay` namespace to `en.ts` and `ta.ts` i18n files covering setup form labels, status messages, and checkout UI copy; all Razorpay UI text uses `t('razorpay.*')` calls

**User-visible outcome:** Admins can enter and save Razorpay credentials from the dashboard; students can pay with Razorpay (or Stripe) when booking sessions or purchasing subscriptions, with bookings/subscriptions confirmed only after successful payment.
