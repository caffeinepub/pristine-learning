import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  bookingsStore, demoSlotsStore, walletStore,
  referralStore, userProfileStore, type DemoSlot,
} from '../lib/localStore';
import DashboardLayout from '../components/DashboardLayout';
import ProfileSetupModal from '../components/ProfileSetupModal';
import MessageInbox from '../components/MessageInbox';
import { useQueryClient } from '@tanstack/react-query';
import { formatTime } from '../utils/formatTime';
import { useTimezone } from '../hooks/useTimezone';
import {
  Calendar, Clock, DollarSign, Plus, Copy, Gift,
  Video, ExternalLink, CheckCircle, Users, Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

export default function TeacherDashboard() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { timezone } = useTimezone();

  const [demoDate, setDemoDate] = useState('');
  const [demoTime, setDemoTime] = useState('');
  const [demoPrice, setDemoPrice] = useState('0');
  const [addingSlot, setAddingSlot] = useState(false);

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

  const bookings = bookingsStore.getForTeacher(principalId);
  const upcoming = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending');
  const completed = bookings.filter(b => b.status === 'completed');
  const demoSlots = demoSlotsStore.getForTeacher(principalId);
  const balance = walletStore.getBalance(principalId);
  const referral = referralStore.getCode(principalId);
  const referralLink = `${window.location.origin}/?ref=${referral.code}`;

  const handleAddDemoSlot = () => {
    if (!demoDate || !demoTime) {
      toast.error('Please fill in date and time.');
      return;
    }
    setAddingSlot(true);
    const slot: DemoSlot = {
      id: `demo_${Date.now()}`,
      teacherId: principalId,
      date: demoDate,
      time: demoTime,
      price: parseFloat(demoPrice) || 0,
      booked: false,
    };
    demoSlotsStore.add(slot);
    setDemoDate('');
    setDemoTime('');
    setDemoPrice('0');
    setAddingSlot(false);
    toast.success('Demo slot created!');
    qc.invalidateQueries({ queryKey: ['demoSlots', principalId] });
  };

  const copyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied!');
  };

  return (
    <DashboardLayout role="teacher">
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Welcome, {profile?.name?.split(' ')[0]}! 🎓</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Manage your sessions and grow your teaching business.</p>
          </div>
          <Button onClick={() => navigate({ to: '/teacher/wallet' })} variant="outline" className="hidden sm:flex gap-2">
            <DollarSign className="w-4 h-4" /> Wallet: ${balance.toFixed(2)}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Upcoming', value: upcoming.length, icon: <Calendar className="w-5 h-5" />, color: 'text-primary' },
            { label: 'Completed', value: completed.length, icon: <CheckCircle className="w-5 h-5" />, color: 'text-green-600' },
            { label: 'Demo Slots', value: demoSlots.filter(s => !s.booked).length, icon: <Users className="w-5 h-5" />, color: 'text-amber-500' },
            { label: 'Balance', value: `$${balance.toFixed(0)}`, icon: <DollarSign className="w-5 h-5" />, color: 'text-purple-600' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl border border-border p-4 shadow-xs">
              <div className={`${stat.color} mb-2`}>{stat.icon}</div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="sessions">
          <TabsList>
            <TabsTrigger value="sessions">My Sessions</TabsTrigger>
            <TabsTrigger value="demo">Demo Slots</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="referral">Referral</TabsTrigger>
          </TabsList>

          <TabsContent value="sessions" className="mt-4">
            {bookings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-border">
                <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="font-medium mb-1">No sessions yet</p>
                <p className="text-sm text-muted-foreground">Students will book sessions from your profile.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map(b => (
                  <div key={b.id} className="bg-white rounded-xl border border-border p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">{b.studentName}</p>
                        <StatusBadge status={b.status} />
                        <Badge variant="outline" className="text-xs capitalize">{b.sessionType}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(b.scheduledTime, timezone)}
                      </p>
                      <p className="text-xs font-medium text-primary mt-0.5">${b.amount}</p>
                    </div>
                    {(b.status === 'confirmed' || b.status === 'completed') && b.meetingLink && (
                      <a
                        href={b.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-primary hover:underline shrink-0"
                      >
                        <Video className="w-3.5 h-3.5" /> Join Meeting
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="demo" className="mt-4">
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-border p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-primary" /> Add Demo Slot
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Date</Label>
                    <Input type="date" value={demoDate} onChange={e => setDemoDate(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Time</Label>
                    <Input type="time" value={demoTime} onChange={e => setDemoTime(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Price ($)</Label>
                    <Input type="number" placeholder="0" value={demoPrice} onChange={e => setDemoPrice(e.target.value)} />
                  </div>
                </div>
                <Button onClick={handleAddDemoSlot} disabled={addingSlot} className="mt-3 btn-primary">
                  Add Slot
                </Button>
              </div>

              {demoSlots.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-xl border border-border">
                  <p className="text-sm text-muted-foreground">No demo slots yet. Add your first slot above.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {demoSlots.map(slot => (
                    <div key={slot.id} className="bg-white rounded-xl border border-border p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{slot.date} at {slot.time}</p>
                        <p className="text-xs text-muted-foreground">${slot.price} · {slot.booked ? 'Booked' : 'Available'}</p>
                      </div>
                      <Badge variant={slot.booked ? 'secondary' : 'default'} className="text-xs">
                        {slot.booked ? 'Booked' : 'Open'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
            <p className="font-medium text-sm">Need Support?</p>
            <p className="text-xs text-muted-foreground">
              Questions about payouts, profile setup, or platform features? Our team is here to help.
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
