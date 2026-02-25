import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetTeacherProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { userProfileStore, messagesStore, demoSlotsStore } from '../lib/localStore';
import Navbar from '../components/Navbar';
import BookingModal from '../components/BookingModal';
import ReviewsSection from '../components/ReviewsSection';
import { Star, Clock, Globe, Award, Video, MessageSquare, Calendar, DollarSign, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-4 h-4 ${i <= Math.round(rating) ? 'star-filled' : 'star-empty'}`} />
      ))}
    </div>
  );
}

export default function TeacherProfilePage() {
  const { teacherId } = useParams({ from: '/teacher/$teacherId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const qc = useQueryClient();
  const { data: teacher, isLoading } = useGetTeacherProfile(teacherId);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingType, setBookingType] = useState<'demo' | 'paid'>('paid');

  const principalId = identity?.getPrincipal().toString() || '';
  const profile = principalId ? userProfileStore.get(principalId) : null;

  const demoSlots = demoSlotsStore.getForTeacher(teacherId).filter(s => !s.booked);

  const handleMessage = () => {
    if (!principalId || !profile) {
      toast.error('Please log in to send a message.');
      return;
    }
    const conv = messagesStore.getOrCreateConversation(
      principalId,
      profile.name,
      teacherId,
      teacher?.name || 'Teacher'
    );
    qc.invalidateQueries({ queryKey: ['conversations', principalId] });
    toast.success('Conversation started! Go to your dashboard messages.');
  };

  const openBooking = (type: 'demo' | 'paid') => {
    if (!principalId) {
      toast.error('Please log in to book a session.');
      return;
    }
    setBookingType(type);
    setBookingOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-6">
            <Skeleton className="w-32 h-32 rounded-2xl" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h2 className="font-display text-2xl font-bold mb-3">Teacher Not Found</h2>
          <p className="text-muted-foreground mb-6">This teacher profile doesn't exist or has been removed.</p>
          <Button onClick={() => navigate({ to: '/search' })} className="btn-primary">
            Browse Teachers
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <button
          onClick={() => navigate({ to: '/search' })}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Search
        </button>

        {/* Profile header */}
        <div className="bg-white rounded-2xl border border-border p-6 mb-6 shadow-card">
          <div className="flex flex-col sm:flex-row gap-6">
            {teacher.photoUrl ? (
              <img
                src={teacher.photoUrl}
                alt={teacher.name}
                className="w-28 h-28 rounded-2xl object-cover border-2 border-primary/20 shrink-0"
              />
            ) : (
              <div className="w-28 h-28 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-4xl shrink-0">
                {teacher.name.charAt(0)}
              </div>
            )}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl font-bold">{teacher.name}</h1>
                  <p className="text-muted-foreground mt-0.5">{teacher.qualifications}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <StarRating rating={teacher.ratings} />
                    <span className="text-sm font-medium">{teacher.ratings.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">({Number(teacher.reviewCount)} reviews)</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">${Number(teacher.hourlyRate)}</p>
                  <p className="text-sm text-muted-foreground">per hour</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {teacher.subjects.map(s => (
                  <Badge key={s} variant="secondary">{s}</Badge>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-primary" />
                  {teacher.languages.join(', ')}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary" />
                  {teacher.availabilitySlots.length} available slots
                </span>
                <span className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-primary" />
                  {teacher.experience}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-border">
            <Button onClick={() => openBooking('demo')} variant="outline" className="gap-2">
              <Calendar className="w-4 h-4" /> Book Demo
              {demoSlots.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">{demoSlots.length} free</Badge>
              )}
            </Button>
            <Button onClick={() => openBooking('paid')} className="btn-primary gap-2">
              <DollarSign className="w-4 h-4" /> Book Paid Session
            </Button>
            <Button variant="ghost" onClick={handleMessage} className="gap-2">
              <MessageSquare className="w-4 h-4" /> Message
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="about">
          <TabsList className="mb-6">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="demo">Demo Slots</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({Number(teacher.reviewCount)})</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-5">
            <div className="bg-white rounded-2xl border border-border p-6 shadow-card">
              <h2 className="font-semibold text-lg mb-3">About</h2>
              <p className="text-muted-foreground leading-relaxed">{teacher.experience}</p>
            </div>

            {teacher.demoVideoUrl && (
              <div className="bg-white rounded-2xl border border-border p-6 shadow-card">
                <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Video className="w-5 h-5 text-primary" /> Demo Video
                </h2>
                <div className="aspect-video rounded-xl overflow-hidden bg-muted">
                  <iframe
                    src={teacher.demoVideoUrl}
                    className="w-full h-full"
                    allowFullScreen
                    title="Demo video"
                  />
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-border p-6 shadow-card">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> Availability
              </h2>
              {teacher.availabilitySlots.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {teacher.availabilitySlots.map((slot, i) => (
                    <span key={i} className="px-3 py-1.5 bg-primary/5 text-primary text-sm rounded-lg border border-primary/20">
                      {slot}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Contact teacher for availability.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="demo">
            <div className="bg-white rounded-2xl border border-border p-6 shadow-card">
              <h2 className="font-semibold text-lg mb-4">Available Demo Slots</h2>
              {demoSlots.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No demo slots available right now.</p>
                  <Button onClick={() => openBooking('demo')} variant="outline" className="mt-4">
                    Request a Demo
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {demoSlots.map(slot => (
                    <div key={slot.id} className="border border-border rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{slot.date}</p>
                        <p className="text-xs text-muted-foreground">{slot.time}</p>
                        <p className="text-xs font-semibold text-primary mt-1">
                          {slot.price === 0 ? 'Free' : `$${slot.price}`}
                        </p>
                      </div>
                      <Button size="sm" onClick={() => openBooking('demo')} className="btn-primary">
                        Book
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="bg-white rounded-2xl border border-border p-6 shadow-card">
              <h2 className="font-semibold text-lg mb-4">Student Reviews</h2>
              <ReviewsSection teacherId={teacherId} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {teacher && (
        <BookingModal
          open={bookingOpen}
          onClose={() => setBookingOpen(false)}
          teacher={teacher}
          teacherId={teacherId}
          defaultSessionType={bookingType}
        />
      )}
    </div>
  );
}
