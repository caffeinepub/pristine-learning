# Specification

## Summary
**Goal:** Fix a bug in SubscriptionPackagesPage where clicking "Subscribe" immediately activates the subscription without going through Stripe payment.

**Planned changes:**
- Remove the code path in SubscriptionPackagesPage that writes a subscription record to localStorage or marks a plan as active upon clicking "Subscribe".
- Clicking "Subscribe" must initiate a Stripe checkout session (or show a Stripe configuration prompt if Stripe is not configured).
- The subscription is only recorded as active after the PaymentSuccess page confirms a valid Stripe session ID.
- If Stripe checkout is cancelled or fails, the user is redirected to PaymentFailure and no subscription is recorded.
- Demo mode subscription simulation (via DemoModeButton/seedDemoData) remains intact and unaffected.

**User-visible outcome:** Non-demo authenticated users clicking "Subscribe" are redirected to Stripe checkout instead of having their subscription immediately activated. The subscription only becomes active after successful payment confirmation.
