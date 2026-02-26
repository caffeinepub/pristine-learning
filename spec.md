# Specification

## Summary
**Goal:** Give administrators full server control by adding admin-only backend functions and extending the AdminDashboard with new management tabs and row-level actions.

**Planned changes:**
- Add backend `setUserRole` function (admin-only) to change any user's role
- Add backend `deleteUser` function (admin-only) to permanently remove a user and all associated data
- Add backend `adminUpdateBookingStatus` and `adminDeleteBooking` functions (admin-only) for booking management
- Add backend `deleteReview` and `deleteMessage` functions (admin-only) for content moderation
- Add/secure backend `setStripeConfig`, `setPlatformCommissionRate`, and `getPlatformConfig` functions (admin-only) for system configuration
- Add backend `approveWithdrawal` and `rejectWithdrawal` functions (admin-only) for withdrawal management
- Extend AdminDashboard User Management tab with per-row "Change Role" dropdown and "Delete User" button (with confirmation dialog), disabled in demo mode
- Extend AdminDashboard Bookings tab with per-row status override dropdown and "Delete Booking" button (with confirmation), disabled in demo mode
- Add "Content Moderation" tab to AdminDashboard listing all reviews and messages platform-wide, each with a delete action and confirmation dialog, disabled in demo mode
- Add "System Configuration" tab to AdminDashboard for editing platform commission rate, Stripe config, and a Danger Zone for user deletion
- Extend AdminDashboard Withdrawals tab with "Approve" and "Reject" buttons per pending withdrawal (Reject prompts for a reason), disabled in demo mode
- All destructive/mutating actions show success/error toasts and are non-interactive in demo mode

**User-visible outcome:** Administrators can fully manage users, bookings, reviews, messages, withdrawals, and platform configuration directly from the AdminDashboard, while demo mode keeps all destructive actions safely disabled.
