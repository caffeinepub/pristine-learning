import React, { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetAllUserProfiles, useGetWeeklySnapshots, useIsStripeConfigured } from '../hooks/useQueries';
import { isDemoMode } from '../components/DemoModeButton';
import DemoModeBanner from '../components/DemoModeBanner';
import UserManagementTab from '../components/UserManagementTab';
import WeeklyAnalyticsTab from '../components/WeeklyAnalyticsTab';
import StripeSetupModal from '../components/StripeSetupModal';
import RazorpaySetupModal from '../components/RazorpaySetupModal';
import { getDemoUsers, getDemoWeeklySnapshots } from '../utils/seedDemoData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  Calendar,
  CreditCard,
  Wallet,
  FileText,
  Share2,
  BarChart3,
  Settings,
  Shield,
  TrendingUp,
  BookOpen,
  DollarSign,
} from 'lucide-react';

export default function AdminDashboard() {
  const { identity } = useInternetIdentity();
  const [stripeModalOpen, setStripeModalOpen] = useState(false);
  const demoMode = isDemoMode();

  const { data: allUsers } = useGetAllUserProfiles();
  const { data: snapshots } = useGetWeeklySnapshots();
  const { data: stripeConfigured } = useIsStripeConfigured();

  const demoUsers = demoMode ? getDemoUsers() : [];
  const demoSnapshots = demoMode ? getDemoWeeklySnapshots() : [];

  const users = demoMode ? demoUsers : (allUsers ?? []);
  const snapshotData = demoMode ? demoSnapshots : (snapshots ?? []);

  const totalUsers = users.length;
  const activeUsers = users.filter((u: any) => u.isActive !== false).length;
  const latestSnapshot = snapshotData[snapshotData.length - 1];

  if (!identity && !demoMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-destructive" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You must be logged in as an administrator to access this dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {demoMode && <DemoModeBanner />}

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Shield className="h-8 w-8 text-primary" />
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your platform, users, and configurations
              </p>
            </div>
            {demoMode && (
              <Badge variant="outline" className="border-amber-400 text-amber-600 bg-amber-50">
                Demo Mode
              </Badge>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold text-foreground">{totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-primary opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold text-foreground">{activeUsers}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sessions Booked</p>
                  <p className="text-2xl font-bold text-foreground">
                    {latestSnapshot ? Number(latestSnapshot.sessionsBooked) : 0}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold text-foreground">
                    ₹{latestSnapshot ? Number(latestSnapshot.totalRevenue) : 0}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="flex flex-wrap gap-1 h-auto p-1">
            <TabsTrigger value="users" className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              Subscriptions
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="flex items-center gap-1.5">
              <Wallet className="h-4 w-4" />
              Withdrawals
            </TabsTrigger>
            <TabsTrigger value="blog" className="flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              Blog
            </TabsTrigger>
            <TabsTrigger value="referrals" className="flex items-center gap-1.5">
              <Share2 className="h-4 w-4" />
              Referrals
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-1.5">
              <Settings className="h-4 w-4" />
              System Config
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <UserManagementTab demoMode={demoMode} demoUsers={demoUsers as any} />
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Booking Management
                </CardTitle>
                <CardDescription>
                  View and manage all session bookings on the platform.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  {demoMode
                    ? 'Demo: Booking management is available in live mode.'
                    : 'Booking management features are managed through the backend.'}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Subscription Management
                </CardTitle>
                <CardDescription>
                  Monitor active subscriptions and manage subscription packages.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  {demoMode
                    ? 'Demo: Subscription management is available in live mode.'
                    : 'Subscription data is managed through the platform.'}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  Withdrawal Requests
                </CardTitle>
                <CardDescription>
                  Review and process teacher withdrawal requests.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  {demoMode
                    ? 'Demo: Withdrawal management is available in live mode.'
                    : 'No pending withdrawal requests.'}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Blog Tab */}
          <TabsContent value="blog">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Blog Management
                </CardTitle>
                <CardDescription>
                  Create and manage blog posts and learning resources.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Blog management features coming soon.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Referrals Tab */}
          <TabsContent value="referrals">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-primary" />
                  Referral Program
                </CardTitle>
                <CardDescription>
                  Track referrals and manage the referral reward program.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  {demoMode
                    ? 'Demo: Referral tracking is available in live mode.'
                    : 'Referral data will appear here as users join through referral links.'}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <WeeklyAnalyticsTab
              demoMode={demoMode}
              demoSnapshots={demoSnapshots as any}
            />
          </TabsContent>

          {/* System Configuration Tab */}
          <TabsContent value="config">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2 mb-1">
                  <Settings className="h-5 w-5 text-primary" />
                  System Configuration
                </h2>
                <p className="text-muted-foreground text-sm">
                  Configure payment gateways and platform settings.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Stripe Setup */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <CreditCard className="h-5 w-5 text-primary" />
                      Stripe Setup
                    </CardTitle>
                    <CardDescription>
                      {stripeConfigured
                        ? '✓ Stripe is currently configured and active.'
                        : 'Configure Stripe payment gateway for card payments.'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {demoMode ? (
                      <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-700">
                        Stripe configuration is disabled in demo mode.
                      </div>
                    ) : (
                      <Button
                        onClick={() => setStripeModalOpen(true)}
                        variant={stripeConfigured ? 'outline' : 'default'}
                        className="w-full"
                      >
                        {stripeConfigured ? 'Update Stripe Config' : 'Configure Stripe'}
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Razorpay Setup */}
                <RazorpaySetupModal demoMode={demoMode} />
              </div>

              {/* Commission Rate */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Commission Settings
                  </CardTitle>
                  <CardDescription>
                    Platform commission rate: 10% (1000 basis points). Teachers receive 90% of session fees.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 p-3 rounded-md bg-muted">
                    <div className="text-2xl font-bold text-primary">10%</div>
                    <div className="text-sm text-muted-foreground">
                      Platform commission on all paid sessions and subscriptions.
                      Teachers receive 90% of the session fee directly to their wallet.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Stripe Setup Modal */}
      <StripeSetupModal
        open={stripeModalOpen}
        onClose={() => setStripeModalOpen(false)}
      />
    </div>
  );
}
