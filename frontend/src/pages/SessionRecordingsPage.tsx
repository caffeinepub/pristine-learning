import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import { bookingsStore } from '../lib/localStore';
import DashboardLayout from '../components/DashboardLayout';
import { formatTime } from '../utils/formatTime';
import { useTimezone } from '../hooks/useTimezone';
import { Video, ExternalLink, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function SessionRecordingsPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { timezone } = useTimezone();

  if (!identity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold mb-3">Login Required</h2>
          <Button onClick={() => navigate({ to: '/' })} className="btn-primary">Go to Homepage</Button>
        </div>
      </div>
    );
  }

  const principalId = identity.getPrincipal().toString();
  const completedBookings = bookingsStore
    .getForStudent(principalId)
    .filter(b => b.status === 'completed');

  const withRecordings = completedBookings.filter(b => b.recordingUrl);
  const withoutRecordings = completedBookings.filter(b => !b.recordingUrl);

  return (
    <DashboardLayout role="student">
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Video className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Session Recordings</h1>
            <p className="text-muted-foreground text-sm">
              {completedBookings.length} completed session{completedBookings.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {completedBookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-border">
            <Video className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No recordings yet</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Recordings will appear here after your sessions are completed.
            </p>
            <Button onClick={() => navigate({ to: '/search' })} className="btn-primary">
              Book a Session
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {withRecordings.length > 0 && (
              <div>
                <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                  Available Recordings ({withRecordings.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {withRecordings.map(b => (
                    <div key={b.id} className="bg-white rounded-xl border border-border overflow-hidden shadow-card">
                      <div className="aspect-video bg-muted flex items-center justify-center relative">
                        <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                          <Play className="w-7 h-7 text-primary ml-1" />
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-sm">{b.teacherName}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatTime(b.scheduledTime, timezone)}
                            </p>
                          </div>
                          <Badge variant="secondary" className="capitalize text-xs">{b.sessionType}</Badge>
                        </div>
                        <a
                          href={b.recordingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 flex items-center gap-1.5 text-sm text-primary hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Watch Recording
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {withoutRecordings.length > 0 && (
              <div>
                <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                  Completed Sessions — Recording Pending ({withoutRecordings.length})
                </h2>
                <div className="space-y-2">
                  {withoutRecordings.map(b => (
                    <div key={b.id} className="bg-white rounded-xl border border-border p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{b.teacherName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatTime(b.scheduledTime, timezone)}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">Recording pending</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
