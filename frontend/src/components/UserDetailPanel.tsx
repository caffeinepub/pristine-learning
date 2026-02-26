import React from 'react';
import { X, User, Activity, TrendingUp, Star, BookOpen, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { DemoActivityLog, DemoPerformanceMetrics } from '../utils/seedDemoData';

interface DisplayUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  registrationTime: number;
  referralCode: string | null;
  isActive: boolean;
  isDemo?: boolean;
}

interface UserDetailPanelProps {
  user: DisplayUser;
  demoMode?: boolean;
  demoActivityLogs?: DemoActivityLog[];
  demoMetrics?: DemoPerformanceMetrics | null;
  onClose: () => void;
}

const actionTypeLabels: Record<string, string> = {
  login: 'Logged In',
  booking_created: 'Booking Created',
  booking_completed: 'Booking Completed',
  review_submitted: 'Review Submitted',
  profile_updated: 'Profile Updated',
  message_sent: 'Message Sent',
};

const actionTypeColors: Record<string, string> = {
  login: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  booking_created: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  booking_completed: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  review_submitted: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  profile_updated: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  message_sent: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
};

export default function UserDetailPanel({
  user,
  demoMode = false,
  demoActivityLogs = [],
  demoMetrics = null,
  onClose,
}: UserDetailPanelProps) {
  const metrics = demoMetrics;
  const activityLogs = demoActivityLogs;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-background rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">{user.fullName}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {demoMode && (
              <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-700 dark:text-amber-400">
                Demo
              </Badge>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {/* Basic Info */}
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Role</span>
                  <p className="font-medium capitalize mt-0.5">{user.role}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status</span>
                  <p className="mt-0.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-600'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Registered</span>
                  <p className="font-medium mt-0.5">{new Date(user.registrationTime).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Referral Code</span>
                  <p className="font-medium mt-0.5">
                    {user.referralCode ? (
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{user.referralCode}</code>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            {metrics && (
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-muted/30 rounded-xl">
                      <BookOpen className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                      <div className="text-xl font-bold">{metrics.completedSessions}</div>
                      <div className="text-xs text-muted-foreground">Completed Sessions</div>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-xl">
                      <Activity className="w-4 h-4 mx-auto mb-1 text-green-500" />
                      <div className="text-xl font-bold">{metrics.totalSessions}</div>
                      <div className="text-xs text-muted-foreground">Total Sessions</div>
                    </div>
                    {metrics.averageRating > 0 && (
                      <div className="text-center p-3 bg-muted/30 rounded-xl">
                        <Star className="w-4 h-4 mx-auto mb-1 text-yellow-500" />
                        <div className="text-xl font-bold">{metrics.averageRating.toFixed(1)}</div>
                        <div className="text-xs text-muted-foreground">Avg Rating</div>
                      </div>
                    )}
                    {metrics.earnings > 0 && (
                      <div className="text-center p-3 bg-muted/30 rounded-xl">
                        <DollarSign className="w-4 h-4 mx-auto mb-1 text-purple-500" />
                        <div className="text-xl font-bold">₹{metrics.earnings.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Total Earnings</div>
                      </div>
                    )}
                    <div className="text-center p-3 bg-muted/30 rounded-xl">
                      <X className="w-4 h-4 mx-auto mb-1 text-red-400" />
                      <div className="text-xl font-bold">{metrics.cancelledSessions}</div>
                      <div className="text-xs text-muted-foreground">Cancelled</div>
                    </div>
                    {metrics.activeSubscription !== 'None' && (
                      <div className="text-center p-3 bg-muted/30 rounded-xl">
                        <Activity className="w-4 h-4 mx-auto mb-1 text-accent" />
                        <div className="text-sm font-bold">{metrics.activeSubscription}</div>
                        <div className="text-xs text-muted-foreground">Subscription</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activity Log */}
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Activity Log
                  <Badge variant="secondary" className="ml-auto text-xs">{activityLogs.length} entries</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activityLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No activity recorded.</p>
                ) : (
                  <div className="space-y-2">
                    {activityLogs
                      .sort((a, b) => b.timestamp - a.timestamp)
                      .map((log) => (
                        <div
                          key={log.id}
                          className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${actionTypeColors[log.actionType] || 'bg-gray-100 text-gray-600'}`}
                            >
                              {actionTypeLabels[log.actionType] || log.actionType}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
