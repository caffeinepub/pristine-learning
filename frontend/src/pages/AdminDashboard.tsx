import React, { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  BookOpen,
  CreditCard,
  FileText,
  Gift,
  BarChart3,
  Shield,
  TrendingUp,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import UserManagementTab from '../components/UserManagementTab';
import WeeklyAnalyticsTab from '../components/WeeklyAnalyticsTab';
import DemoModeBanner from '../components/DemoModeBanner';
import StripeSetupModal from '../components/StripeSetupModal';
import { isDemoMode } from '../components/DemoModeButton';
import { getDemoBookings, getDemoUsers, getDemoWeeklySnapshots } from '../utils/seedDemoData';

// ─── Sub-tab components ───────────────────────────────────────────────────────

function BookingsTab() {
  const demoMode = isDemoMode();
  const bookings = demoMode ? getDemoBookings() : [];

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };

  if (demoMode && bookings.length > 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">All Bookings</h3>
          <Badge variant="secondary">{bookings.length} total</Badge>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Student</th>
                <th className="text-left px-4 py-3 font-medium">Teacher</th>
                <th className="text-left px-4 py-3 font-medium">Subject</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">{b.studentName}</td>
                  <td className="px-4 py-3">{b.teacherName}</td>
                  <td className="px-4 py-3">{b.subject}</td>
                  <td className="px-4 py-3">{b.date}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[b.status] ?? ''}`}>
                      {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">₹{b.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-12 text-muted-foreground">
      <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
      <p>Bookings data is managed through the platform.</p>
      <p className="text-sm mt-1">Enter demo mode to see sample bookings.</p>
    </div>
  );
}

function WithdrawalsTab() {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-40" />
      <p>Withdrawal requests from teachers appear here.</p>
      <p className="text-sm mt-1">No pending withdrawals at this time.</p>
    </div>
  );
}

function SubscriptionsTab() {
  const demoMode = isDemoMode();

  if (demoMode) {
    const subs: Array<{
      id: string;
      userPrincipal: string;
      packageName: string;
      startDate: number;
      endDate: number;
      isActive: boolean;
    }> = JSON.parse(localStorage.getItem('demoSubscriptions') || '[]');

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Subscriptions</h3>
          <Badge variant="secondary">{subs.length} total</Badge>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">User</th>
                <th className="text-left px-4 py-3 font-medium">Package</th>
                <th className="text-left px-4 py-3 font-medium">Start Date</th>
                <th className="text-left px-4 py-3 font-medium">End Date</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">{s.userPrincipal.replace('-principal', '')}</td>
                  <td className="px-4 py-3">{s.packageName}</td>
                  <td className="px-4 py-3">{new Date(s.startDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{new Date(s.endDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        s.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}
                    >
                      {s.isActive ? 'Active' : 'Expired'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-12 text-muted-foreground">
      <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-40" />
      <p>Active subscriptions are listed here.</p>
    </div>
  );
}

function BlogTab() {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
      <p>Blog posts and content management.</p>
      <p className="text-sm mt-1">Create and manage educational blog content here.</p>
    </div>
  );
}

function ReferralsTab() {
  const demoMode = isDemoMode();
  const users = demoMode ? getDemoUsers() : [];
  const usersWithReferral = users.filter((u) => u.referralCode);

  if (demoMode) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Referral Codes</h3>
          <Badge variant="secondary">{usersWithReferral.length} codes</Badge>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">User</th>
                <th className="text-left px-4 py-3 font-medium">Role</th>
                <th className="text-left px-4 py-3 font-medium">Referral Code</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {usersWithReferral.map((u) => (
                <tr key={u.principal} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{u.fullName}</td>
                  <td className="px-4 py-3 capitalize">{u.role}</td>
                  <td className="px-4 py-3 font-mono text-xs bg-muted/30 rounded">{u.referralCode}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        u.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-12 text-muted-foreground">
      <Gift className="w-12 h-12 mx-auto mb-3 opacity-40" />
      <p>Referral program statistics and management.</p>
    </div>
  );
}

// ─── Main AdminDashboard ──────────────────────────────────────────────────────

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const demoMode = isDemoMode();
  const [stripeModalOpen, setStripeModalOpen] = useState(false);

  // Guard: must be authenticated or in demo mode
  useEffect(() => {
    if (!identity && !demoMode) {
      navigate({ to: '/' });
    }
  }, [identity, demoMode, navigate]);

  if (!identity && !demoMode) {
    return null;
  }

  const demoUsers = demoMode ? getDemoUsers() : [];
  const demoSnapshots = demoMode ? getDemoWeeklySnapshots() : [];
  const demoBookings = demoMode ? getDemoBookings() : [];

  const statsCards = [
    {
      label: 'Total Users',
      value: demoMode ? demoUsers.length : '—',
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      label: 'Total Bookings',
      value: demoMode ? demoBookings.length : '—',
      icon: BookOpen,
      color: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-950/30',
    },
    {
      label: 'Weekly Revenue',
      value:
        demoMode && demoSnapshots.length > 0
          ? `₹${demoSnapshots[0].totalRevenue.toLocaleString()}`
          : '—',
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-950/30',
    },
    {
      label: 'Active Teachers',
      value: demoMode
        ? demoUsers.filter((u) => u.fullName.includes('Teacher') && u.isActive).length
        : '—',
      icon: Shield,
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {/* Demo Banner */}
        {demoMode && <DemoModeBanner />}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground text-sm">
                {demoMode ? 'Demo Mode — Pre-seeded data' : 'Platform management and analytics'}
              </p>
            </div>
            {!demoMode && (
              <Button
                variant="outline"
                size="sm"
                className="ml-auto gap-2 border-amber-300 text-amber-700 hover:bg-amber-50"
                onClick={() => setStripeModalOpen(true)}
              >
                ⚙️ Configure Stripe
              </Button>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsCards.map((stat) => (
            <Card key={stat.label} className="border-border/60">
              <CardContent className="p-4">
                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="flex flex-wrap gap-1 h-auto p-1 bg-muted/50 rounded-xl">
            <TabsTrigger value="users" className="gap-1.5 text-xs sm:text-sm">
              <Users className="w-3.5 h-3.5" />
              Users
            </TabsTrigger>
            <TabsTrigger value="bookings" className="gap-1.5 text-xs sm:text-sm">
              <BookOpen className="w-3.5 h-3.5" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="gap-1.5 text-xs sm:text-sm">
              <CreditCard className="w-3.5 h-3.5" />
              Subscriptions
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="gap-1.5 text-xs sm:text-sm">
              <CreditCard className="w-3.5 h-3.5" />
              Withdrawals
            </TabsTrigger>
            <TabsTrigger value="blog" className="gap-1.5 text-xs sm:text-sm">
              <FileText className="w-3.5 h-3.5" />
              Blog
            </TabsTrigger>
            <TabsTrigger value="referrals" className="gap-1.5 text-xs sm:text-sm">
              <Gift className="w-3.5 h-3.5" />
              Referrals
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1.5 text-xs sm:text-sm">
              <BarChart3 className="w-3.5 h-3.5" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="w-4 h-4" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UserManagementTab demoMode={demoMode} demoUsers={demoUsers} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="w-4 h-4" />
                  Bookings Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BookingsTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscriptions">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="w-4 h-4" />
                  Subscription Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SubscriptionsTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdrawals">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="w-4 h-4" />
                  Withdrawal Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <WithdrawalsTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blog">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="w-4 h-4" />
                  Blog Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BlogTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referrals">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Gift className="w-4 h-4" />
                  Referral Program
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ReferralsTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="w-4 h-4" />
                  Weekly Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <WeeklyAnalyticsTab demoMode={demoMode} demoSnapshots={demoSnapshots} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />

      {/* Stripe Setup Modal — only in live mode */}
      <StripeSetupModal
        open={stripeModalOpen}
        onClose={() => setStripeModalOpen(false)}
      />
    </div>
  );
}
