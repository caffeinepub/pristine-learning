import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, BookOpen, DollarSign, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useGetWeeklySnapshots, useCreateWeeklySnapshot } from '../hooks/useQueries';
import type { DemoWeeklySnapshot } from '../utils/seedDemoData';
import type { WeeklySnapshot } from '../backend';

interface WeeklyAnalyticsTabProps {
  demoMode?: boolean;
  demoSnapshots?: DemoWeeklySnapshot[];
}

function formatWeek(weekId: string): string {
  const [year, week] = weekId.split('-W');
  return `W${week} '${year?.slice(2)}`;
}

export default function WeeklyAnalyticsTab({ demoMode = false, demoSnapshots = [] }: WeeklyAnalyticsTabProps) {
  const { data: backendSnapshots = [], isLoading } = useGetWeeklySnapshots();
  const createSnapshot = useCreateWeeklySnapshot();

  const snapshots: Array<{ weekIdentifier: string; newUsers: number; newTeachers: number; sessionsBooked: number; sessionsCompleted: number; totalRevenue: number; commissionEarned: number; messagesSent: number; reviewsSubmitted: number; newSubscriptions: number }> = demoMode
    ? demoSnapshots
    : (backendSnapshots as WeeklySnapshot[]).map((s) => ({
        weekIdentifier: s.weekIdentifier,
        newUsers: Number(s.newUsers),
        newTeachers: Number(s.newTeachers),
        sessionsBooked: Number(s.sessionsBooked),
        sessionsCompleted: Number(s.sessionsCompleted),
        totalRevenue: Number(s.totalRevenue),
        commissionEarned: Number(s.commissionEarned),
        messagesSent: Number(s.messagesSent),
        reviewsSubmitted: Number(s.reviewsSubmitted),
        newSubscriptions: Number(s.newSubscriptions),
      }));

  const sorted = [...snapshots].sort((a, b) => b.weekIdentifier.localeCompare(a.weekIdentifier));
  const latest = sorted[0];
  const chartData = sorted.slice(0, 12).reverse();

  const handleGenerateSnapshot = async () => {
    if (demoMode) return;
    const now = new Date();
    const year = now.getFullYear();
    const week = Math.ceil(
      ((now.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + new Date(year, 0, 1).getDay() + 1) / 7
    );
    const weekId = `${year}-W${String(week).padStart(2, '0')}`;
    await createSnapshot.mutateAsync({
      weekIdentifier: weekId,
      newUsers: BigInt(0),
      newTeachers: BigInt(0),
      sessionsBooked: BigInt(0),
      sessionsCompleted: BigInt(0),
      totalRevenue: BigInt(0),
      commissionEarned: BigInt(0),
      messagesSent: BigInt(0),
      reviewsSubmitted: BigInt(0),
      newSubscriptions: BigInt(0),
    });
  };

  if (isLoading && !demoMode) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {latest && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'New Users', value: latest.newUsers, icon: Users, color: 'text-blue-500' },
            { label: 'Sessions Booked', value: latest.sessionsBooked, icon: BookOpen, color: 'text-green-500' },
            { label: 'Revenue', value: `₹${latest.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-purple-500' },
            { label: 'New Subscriptions', value: latest.newSubscriptions, icon: TrendingUp, color: 'text-accent' },
          ].map((stat) => (
            <Card key={stat.label} className="border-border/60">
              <CardContent className="p-4">
                <stat.icon className={`w-4 h-4 ${stat.color} mb-2`} />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Latest week</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3 text-foreground">Last {chartData.length} Weeks</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="weekIdentifier"
                  tickFormatter={formatWeek}
                  tick={{ fontSize: 11 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  labelFormatter={formatWeek}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="newUsers" name="New Users" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="sessionsBooked" name="Sessions Booked" fill="#22c55e" radius={[3, 3, 0, 0]} />
                <Bar dataKey="newSubscriptions" name="New Subscriptions" fill="#a855f7" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">
            Historical Snapshots
            <Badge variant="secondary" className="ml-2 text-xs">{sorted.length}</Badge>
          </h3>
          {!demoMode && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Plus className="w-3.5 h-3.5" />
                  Generate Snapshot
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Generate Weekly Snapshot</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will create a new snapshot for the current week. If a snapshot already exists for this week, it will be overwritten.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleGenerateSnapshot} disabled={createSnapshot.isPending}>
                    {createSnapshot.isPending ? (
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Generate
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {sorted.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No weekly snapshots yet.</p>
            {!demoMode && <p className="text-sm mt-1">Generate the first snapshot to start tracking analytics.</p>}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Week</th>
                  <th className="text-left px-4 py-3 font-medium">New Users</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Sessions Booked</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Completed</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Revenue</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Commission</th>
                  <th className="text-left px-4 py-3 font-medium hidden xl:table-cell">Subscriptions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((snap) => (
                  <tr key={snap.weekIdentifier} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-medium">{snap.weekIdentifier}</td>
                    <td className="px-4 py-3">{snap.newUsers}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">{snap.sessionsBooked}</td>
                    <td className="px-4 py-3 hidden md:table-cell">{snap.sessionsCompleted}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">₹{snap.totalRevenue.toLocaleString()}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">₹{snap.commissionEarned.toLocaleString()}</td>
                    <td className="px-4 py-3 hidden xl:table-cell">{snap.newSubscriptions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
