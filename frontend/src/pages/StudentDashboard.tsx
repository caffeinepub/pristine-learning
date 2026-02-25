import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  bookingsStore, reviewsStore, subscriptionStore,
  referralStore, userProfileStore, type Booking,
} from '../lib/localStore';
import DashboardLayout from '../components/DashboardLayout';
import ProfileSetupModal from '../components/ProfileSetupModal';
import MessageInbox from '../components/MessageInbox';
import ReviewSubmissionForm from '../components/ReviewSubmissionForm';
import { useQueryClient } from '@tanstack/react-query';
import { formatTime } from '../utils/formatTime';
import { useTimezone } from '../hooks/useTimezone';
import {
  Calendar, Video, Brain, MessageSquare, Gift, Package,
  ExternalLink, Copy, CheckCircle, Clock, Star, Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const CONTACT_EMAIL = 'pristinelearningofficial@gmail.com';

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-muted text-muted-foreground'}`}>
      {status}
    </span>
  );
}

export default function StudentDashboard() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { timezone } = useTimezone();
  const [reviewedSessions, setReviewedSessions] = useState<Set<string>>(new Set());

  const principalId = identity?.getPrincipal().toString() || '';
  const profile = principalId ? userProfileStore.get(principalId) : null;

  const needsProfile = !!identity && !profile;

  if (needsProfile) {
    return <ProfileSetupModal onComplete={() => qc.invalidateQueries()} />;
  }

  if (!identity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold mb-3">Login Required</h2>
          <p className="text-muted-foreground mb-6">Please log in to access your dashboard.</p>
          <Button onClick={() => navigate({ to: '/' })} className="btn-primary">Go to Homepage</Button>
        </div>
      </div>
    );
  }

  const bookings = bookingsStore.getForStudent(principalId);
  const upcoming = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending');
  const completed = bookings.filter(b => b.status === 'completed');
  const pendingReviews = completed.filter(b =>
    !reviewsStore.hasReviewed(principalId, b.id) && !reviewedSessions.has(b.id)
  );

  const subscription = subscriptionStore.getUserSubscription(principalId);
  const referral = referralStore.getCode(principalId);
  const referralLink = `${window.location.origin}/?ref=${referral.code}`;

  const copyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied!');
  };

  return (
    <DashboardLayout role="student">
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Welcome back, {profile?.name?.split(' ')[0]}! 👋</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Ready to learn something new today?</p>
          </div>
          <Button onClick={() => navigate({ to: '/search' })} className="btn-primary hidden sm:flex">
            Find a Teacher
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Upcoming', value: upcoming.length, icon: <Calendar className="w-5 h-5" />, color: 'text-primary' },
            { label: 'Completed', value: completed.length, icon: <CheckCircle className="w-5 h-5" />, color: 'text-green-600' },
            { label: 'Pending Reviews', value: pendingReviews.length, icon: <Star className="w-5 h-5" />, color: 'text-amber-500' },
            { label: 'Sessions Left', value: subscription?.sessionsRemaining ?? '∞', icon: <Package className="w-5 h-5" />, color: 'text-purple-600' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl border border-border p-4 shadow-xs">
              <div className={`${stat.color} mb-2`}>{stat.icon}</div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Subscription widget */}
        {subscription && (
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20 p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">{subscription.packageName} Plan</p>
              <p className="text-xs text-muted-foreground">
                {subscription.sessionsRemaining} sessions remaining · Renews {subscription.renewalDate}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => navigate({ to: '/subscriptions' })}>
              Upgrade
            </Button>
          </div>
        )}

        {/* Pending reviews */}
        {pendingReviews.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Rate Your Sessions</h2>
            {pendingReviews.slice(0, 2).map(b => (
              <ReviewSubmissionForm
                key={b.id}
                booking={b}
                onSubmitted={() => setReviewedSessions(prev => new Set([...prev, b.id]))}
              />
            ))}
          </div>
        )}

        {/* Main tabs */}
        <Tabs defaultValue="bookings">
          <TabsList>
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="referral">Referral</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="mt-4">
            {bookings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-border">
                <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="font-medium mb-1">No bookings yet</p>
                <p className="text-sm text-muted-foreground mb-4">Find a teacher and book your first session!</p>
                <Button onClick={() => navigate({ to: '/search' })} className="btn-primary">
                  Find a Teacher
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map(b => (
                  <BookingCard key={b.id} booking={b} timezone={timezone} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="messages" className="mt-4">
            <MessageInbox />
          </TabsContent>

          <TabsContent value="referral" className="mt-4">
            <div className="bg-white rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
                  <Gift className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">Your Referral Code</h3>
                  <p className="text-xs text-muted-foreground">Share and earn rewards</p>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 flex items-center justify-between mb-3">
                <code className="font-mono font-bold text-primary">{referral.code}</code>
                <Button size="sm" variant="ghost" onClick={copyReferral}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Referral link:</p>
              <div className="bg-muted/50 rounded-lg p-2 flex items-center justify-between">
                <span className="text-xs truncate text-muted-foreground">{referralLink}</span>
                <Button size="sm" variant="ghost" onClick={copyReferral}>
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-bold">{referral.referredCount}</p>
                  <p className="text-xs text-muted-foreground">Referred</p>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-bold">{referral.conversions}</p>
                  <p className="text-xs text-muted-foreground">Conversions</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Support section */}
        <div className="bg-muted/30 rounded-xl border border-border p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
            <Mail className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">Need Help?</p>
            <p className="text-xs text-muted-foreground">
              Reach out to our support team for any questions about bookings, payments, or your account.
            </p>
          </div>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-xs text-primary hover:underline font-medium shrink-0 flex items-center gap-1"
          >
            <Mail className="w-3.5 h-3.5" />
            {CONTACT_EMAIL}
          </a>
        </div>
      </div>
    </DashboardLayout>
  );
}

function BookingCard({ booking, timezone }: { booking: Booking; timezone: string }) {
  return (
    <div className="bg-white rounded-xl border border-border p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-sm">{booking.teacherName}</p>
          <StatusBadge status={booking.status} />
          <Badge variant="outline" className="text-xs capitalize">{booking.sessionType}</Badge>
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatTime(booking.scheduledTime, timezone)}
        </p>
        <p className="text-xs font-medium text-primary mt-0.5">${booking.amount}</p>
      </div>
      {(booking.status === 'confirmed' || booking.status === 'completed') && booking.meetingLink && (
        <a
          href={booking.meetingLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-primary hover:underline shrink-0"
        >
          <Video className="w-3.5 h-3.5" /> Join Meeting
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}
