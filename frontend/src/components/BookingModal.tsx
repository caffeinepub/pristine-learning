import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { userProfileStore, bookingsStore, notificationsStore, type Booking } from '../lib/localStore';
import { useTimezone } from '../hooks/useTimezone';
import { formatTime } from '../utils/formatTime';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Globe, Video, CheckCircle } from 'lucide-react';
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
  const { timezone, abbr } = useTimezone();
  const [sessionType, setSessionType] = useState<'demo' | 'paid'>(defaultSessionType);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);

  const principalId = identity?.getPrincipal().toString() || '';
  const profile = principalId ? userProfileStore.get(principalId) : null;

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

  const handleConfirm = async () => {
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
      status: sessionType === 'demo' ? 'confirmed' : 'pending',
      meetingLink: generateMeetingLink(),
      amount,
    };

    bookingsStore.save(newBooking);

    // Notifications
    notificationsStore.add({
      id: `notif_${Date.now()}`,
      userId: principalId,
      title: 'Booking Confirmed!',
      message: `Your ${sessionType} session with ${teacher.name} is booked for ${formatTime(selectedSlot, timezone)}.`,
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
    setLoading(false);
    toast.success('Session booked successfully!');
  };

  const handleClose = () => {
    setConfirmed(false);
    setSelectedSlot(null);
    setBooking(null);
    onClose();
  };

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
                        {type === 'demo' ? `$${amount.toFixed(0)} intro session` : `$${amount}/hr`}
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
                <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> Available Slots
                </p>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {timeSlots.map(slot => (
                    <button
                      key={slot.iso}
                      onClick={() => setSelectedSlot(slot.iso)}
                      className={`p-2.5 rounded-lg border text-xs text-left transition-all ${
                        selectedSlot === slot.iso
                          ? 'border-primary bg-primary/10 text-primary font-medium'
                          : 'border-border hover:border-primary/40'
                      }`}
                    >
                      <Clock className="w-3 h-3 inline mr-1" />
                      {slot.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleConfirm}
                disabled={!selectedSlot || loading || !principalId}
                className="w-full btn-primary h-11"
              >
                {loading ? 'Booking…' : !principalId ? 'Login to Book' : `Confirm ${sessionType === 'demo' ? 'Demo' : 'Session'}`}
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-9 h-9 text-green-600" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold">Booking Confirmed!</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Your {sessionType} session with {teacher.name} is scheduled.
              </p>
            </div>
            {booking && (
              <div className="bg-muted/50 rounded-xl p-4 text-left space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date & Time</span>
                  <span className="font-medium">{formatTime(booking.scheduledTime, timezone)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Session Type</span>
                  <Badge variant="secondary" className="capitalize">{booking.sessionType}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Meeting Link</span>
                  <a href={booking.meetingLink} target="_blank" rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1 text-xs">
                    <Video className="w-3 h-3" /> Join Meeting
                  </a>
                </div>
              </div>
            )}
            <Button onClick={handleClose} className="w-full btn-primary">
              Go to Dashboard
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
