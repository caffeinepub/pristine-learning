import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { userProfileStore, bookingsStore, notificationsStore, type Booking } from '../lib/localStore';
import { useIsStripeConfigured, useGetRazorpayConfig } from '../hooks/useQueries';
import { useRazorpayCheckout } from '../hooks/useRazorpayCheckout';
import { getAvailablePaymentGateways, inrToPaise } from '../utils/paymentGateway';
import { isDemoMode } from '../components/DemoModeButton';
import { useActor } from '../hooks/useActor';
import { useTimezone } from '../hooks/useTimezone';
import { formatTime } from '../utils/formatTime';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Globe, Video, CheckCircle, CreditCard, Loader2, AlertCircle } from 'lucide-react';
import type { TeacherProfile } from '../backend';

interface Props {
  open: boolean;
  onClose: () => void;
  teacher: TeacherProfile;
  teacherId: string;
  defaultSessionType?: 'demo' | 'paid';
}

function generateMeetingLink(): string {
  const id = Math.random().toString(36).substring(2, 12);
  return `https://zoom.us/j/${id}`;
}

function generateId(): string {
  return `bk_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

export default function BookingModal({ open, onClose, teacher, teacherId, defaultSessionType = 'paid' }: Props) {
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const { timezone, abbr } = useTimezone();
  const [sessionType, setSessionType] = useState<'demo' | 'paid'>(defaultSessionType);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentGateway, setPaymentGateway] = useState<'stripe' | 'razorpay' | null>(null);

  const { data: stripeConfigured, isLoading: stripeLoading } = useIsStripeConfigured();
  const { data: razorpayConfig, isLoading: razorpayLoading } = useGetRazorpayConfig();
  const { initiatePayment, isLoading: razorpayCheckoutLoading } = useRazorpayCheckout();

  const demoMode = isDemoMode();
  const principalId = identity?.getPrincipal().toString() || '';
  const profile = principalId ? userProfileStore.get(principalId) : null;

  const isLoadingGateways = stripeLoading || razorpayLoading;
  const availableGateways = getAvailablePaymentGateways(
    !!stripeConfigured,
    razorpayConfig?.keyId
  );
  const hasStripe = availableGateways.includes('stripe');
  const hasRazorpay = availableGateways.includes('razorpay');
  const hasAnyGateway = availableGateways.length > 0;

  // Generate time slots for next 7 days
  const slots = teacher.availabilitySlots.length > 0
    ? teacher.availabilitySlots.slice(0, 8)
    : ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  const today = new Date();
  const timeSlots: { label: string; iso: string }[] = [];
  for (let d = 1; d <= 5; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    slots.slice(0, 3).forEach(time => {
      const [h, m] = time.split(':').map(Number);
      const slotDate = new Date(date);
      slotDate.setHours(h, m, 0, 0);
      timeSlots.push({ label: `${dateStr} ${time}`, iso: slotDate.toISOString() });
    });
  }

  const amount = sessionType === 'demo' ? Math.min(Number(teacher.hourlyRate) * 0.2, 15) : Number(teacher.hourlyRate);
  const amountInr = Math.round(amount * 83); // rough USD→INR conversion

  const saveBookingAndNotify = (newBooking: Booking) => {
    bookingsStore.save(newBooking);
    notificationsStore.add({
      id: `notif_${Date.now()}`,
      userId: principalId,
      title: 'Booking Confirmed!',
      message: `Your ${sessionType} session with ${teacher.name} is booked for ${formatTime(selectedSlot!, timezone)}.`,
      read: false,
      createdAt: new Date().toISOString(),
      type: 'booking',
    });
    notificationsStore.add({
      id: `notif_t_${Date.now()}`,
      userId: teacherId,
      title: 'New Booking!',
      message: `${profile?.name || 'A student'} booked a ${sessionType} session with you.`,
      read: false,
      createdAt: new Date().toISOString(),
      type: 'booking',
    });
    setBooking(newBooking);
    setConfirmed(true);
    toast.success('Session booked successfully!');
  };

  const handleConfirmFreeOrDemo = async () => {
    if (!selectedSlot || !principalId) return;
    setLoading(true);

    const newBooking: Booking = {
      id: generateId(),
      teacherId,
      teacherName: teacher.name,
      studentId: principalId,
      studentName: profile?.name || 'Student',
      sessionType,
      scheduledTime: selectedSlot,
      timezone,
      status: 'confirmed',
      meetingLink: generateMeetingLink(),
      amount,
    };

    saveBookingAndNotify(newBooking);
    setLoading(false);
  };

  const handleStripePayment = async () => {
    if (!selectedSlot || !principalId || !actor) return;
    if (!stripeConfigured) {
      toast.error('Stripe is not configured. Please contact the administrator.');
      return;
    }

    setLoading(true);
    setPaymentGateway('stripe');

    try {
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success?booking=${generateId()}`;
      const cancelUrl = `${baseUrl}/payment-failure`;

      const sessionJson = await actor.createCheckoutSession(
        [
          {
            productName: `Session with ${teacher.name}`,
            currency: 'inr',
            quantity: BigInt(1),
            priceInCents: BigInt(inrToPaise(amountInr)),
            productDescription: `${sessionType} session - ${teacher.subjects.join(', ')}`,
          },
        ],
        successUrl,
        cancelUrl
      );

      const session = JSON.parse(sessionJson);
      if (!session?.url) throw new Error('Stripe session missing URL');
      window.location.href = session.url;
    } catch (err) {
      toast.error('Failed to initiate Stripe checkout. Please try again.');
      setLoading(false);
      setPaymentGateway(null);
    }
  };

  const handleRazorpayPayment = async () => {
    if (!selectedSlot || !principalId) return;

    setLoading(true);
    setPaymentGateway('razorpay');

    await initiatePayment({
      amount: inrToPaise(amountInr),
      currency: 'INR',
      name: 'Pristine Learning',
      description: `Session with ${teacher.name} - ${teacher.subjects.join(', ')}`,
      onSuccess: (response) => {
        const newBooking: Booking = {
          id: generateId(),
          teacherId,
          teacherName: teacher.name,
          studentId: principalId,
          studentName: profile?.name || 'Student',
          sessionType,
          scheduledTime: selectedSlot!,
          timezone,
          status: 'confirmed',
          meetingLink: generateMeetingLink(),
          amount,
        };
        saveBookingAndNotify(newBooking);
        setLoading(false);
        setPaymentGateway(null);
      },
      onFailure: (error) => {
        if (error !== 'Payment was cancelled.') {
          toast.error(`Razorpay payment failed: ${error}`);
        }
        setLoading(false);
        setPaymentGateway(null);
      },
    });
  };

  const handleClose = () => {
    setConfirmed(false);
    setSelectedSlot(null);
    setBooking(null);
    setPaymentGateway(null);
    onClose();
  };

  const isPaidSession = sessionType === 'paid';
  const needsPayment = isPaidSession && !demoMode;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {!confirmed ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-display">Book a Session with {teacher.name}</DialogTitle>
              <DialogDescription>
                Select session type and a time slot that works for you.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 pt-2">
              {/* Session type */}
              <div>
                <p className="text-sm font-medium mb-2">Session Type</p>
                <div className="grid grid-cols-2 gap-3">
                  {(['demo', 'paid'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setSessionType(type)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        sessionType === type
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/40'
                      }`}
                    >
                      <p className="font-semibold text-sm capitalize">{type === 'demo' ? '🎯 Demo' : '📚 Paid'}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {type === 'demo' ? `$${Math.min(Number(teacher.hourlyRate) * 0.2, 15).toFixed(0)} intro session` : `$${Number(teacher.hourlyRate)}/hr`}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Timezone */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                <Globe className="w-3.5 h-3.5" />
                <span>Times shown in your timezone: <strong>{abbr}</strong> ({timezone})</span>
              </div>

              {/* Time slots */}
              <div>
                <p className="text-sm font-medium mb-2">Select a Time Slot</p>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {timeSlots.map(slot => (
                    <button
                      key={slot.iso}
                      onClick={() => setSelectedSlot(slot.iso)}
                      className={`p-2.5 rounded-lg border text-xs text-left transition-all ${
                        selectedSlot === slot.iso
                          ? 'border-primary bg-primary/5 text-primary font-medium'
                          : 'border-border hover:border-primary/40'
                      }`}
                    >
                      <Clock className="w-3 h-3 inline mr-1" />
                      {slot.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price summary */}
              <div className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-3">
                <span className="text-sm text-muted-foreground">Session Fee</span>
                <span className="font-semibold text-foreground">
                  ${amount.toFixed(0)} {isPaidSession && '≈ ₹' + amountInr}
                </span>
              </div>

              {/* Payment gateway warning for paid sessions */}
              {needsPayment && !isLoadingGateways && !hasAnyGateway && (
                <div className="flex items-center gap-2 p-3 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  No payment gateway configured. Please contact the administrator.
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2 pt-2">
              {!needsPayment ? (
                // Free / demo session — single confirm button
                <Button
                  className="w-full"
                  onClick={handleConfirmFreeOrDemo}
                  disabled={!selectedSlot || loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4 mr-2" />
                      {demoMode ? 'Confirm Booking (Demo)' : 'Confirm Booking'}
                    </>
                  )}
                </Button>
              ) : isLoadingGateways ? (
                <Button className="w-full" disabled>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading payment options...
                </Button>
              ) : (
                <>
                  {hasStripe && (
                    <Button
                      className="w-full"
                      onClick={handleStripePayment}
                      disabled={!selectedSlot || loading || razorpayCheckoutLoading}
                    >
                      {paymentGateway === 'stripe' && loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pay with Stripe
                        </>
                      )}
                    </Button>
                  )}

                  {hasRazorpay && (
                    <Button
                      variant={hasStripe ? 'outline' : 'default'}
                      className="w-full"
                      onClick={handleRazorpayPayment}
                      disabled={!selectedSlot || loading || razorpayCheckoutLoading}
                    >
                      {(paymentGateway === 'razorpay' && loading) || razorpayCheckoutLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing payment...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pay with Razorpay
                        </>
                      )}
                    </Button>
                  )}

                  {!hasAnyGateway && (
                    <Button className="w-full" disabled>
                      <AlertCircle className="w-4 h-4 mr-2" />
                      No Payment Gateway
                    </Button>
                  )}
                </>
              )}

              <Button variant="ghost" className="w-full" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
            </div>
          </>
        ) : (
          // Confirmation screen
          <>
            <DialogHeader>
              <DialogTitle className="font-display flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                Booking Confirmed!
              </DialogTitle>
              <DialogDescription>
                Your session has been successfully booked.
              </DialogDescription>
            </DialogHeader>

            {booking && (
              <div className="space-y-4 py-2">
                <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Video className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Teacher</p>
                      <p className="text-sm font-medium">{booking.teacherName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Scheduled Time</p>
                      <p className="text-sm font-medium">{formatTime(booking.scheduledTime, timezone)} ({abbr})</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Session Type</p>
                      <p className="text-sm font-medium capitalize">{booking.sessionType}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Meeting Link</p>
                  <a
                    href={booking.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary underline break-all"
                  >
                    {booking.meetingLink}
                  </a>
                </div>
              </div>
            )}

            <Button className="w-full" onClick={handleClose}>
              Done
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
