import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, WeeklySnapshot, ActivityLog, PerformanceMetrics } from '../backend';
import { isDemoMode } from '../components/DemoModeButton';
import {
  getDemoUsers,
  getDemoActivityLogs,
  getDemoPerformanceMetrics,
  getDemoWeeklySnapshots,
} from '../utils/seedDemoData';
import { Principal } from '@dfinity/principal';

// ---- User Profile Hooks ----

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      // In demo mode, return the demo admin profile immediately
      if (isDemoMode()) {
        const stored = localStorage.getItem('demoAdminProfile');
        if (stored) {
          const p = JSON.parse(stored);
          return {
            fullName: p.fullName,
            email: p.email,
            role: p.role as any,
            registrationTime: BigInt(p.registrationTime),
            referralCode: p.referralCode ?? undefined,
            isActive: p.isActive,
          } as UserProfile;
        }
      }
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: isDemoMode() || (!!actor && !actorFetching),
    retry: false,
  });

  return {
    ...query,
    isLoading: !isDemoMode() && (actorFetching || query.isLoading),
    isFetched: isDemoMode() ? true : !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetAllUserProfiles() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile[]>({
    queryKey: ['allUserProfiles'],
    queryFn: async () => {
      if (isDemoMode()) {
        // Return demo users as UserProfile-like objects
        return getDemoUsers().map((u) => ({
          fullName: u.fullName,
          email: u.email,
          role: u.role as any,
          registrationTime: BigInt(u.registrationTime),
          referralCode: u.referralCode ?? undefined,
          isActive: u.isActive,
        })) as UserProfile[];
      }
      if (!actor) return [];
      return actor.getAllUserProfiles();
    },
    enabled: isDemoMode() || (!!actor && !actorFetching),
  });
}

// ---- Activity Log Hooks ----

export function useGetActivityLogsByUserId(userId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ActivityLog[]>({
    queryKey: ['activityLogs', userId],
    queryFn: async () => {
      if (isDemoMode()) {
        return getDemoActivityLogs(userId).map((l) => ({
          userId: { toString: () => l.userId } as any,
          actionType: l.actionType,
          timestamp: BigInt(l.timestamp),
          metadata: l.metadata,
        })) as ActivityLog[];
      }
      if (!actor) return [];
      return actor.getActivityLogsByUserId(Principal.fromText(userId));
    },
    enabled: isDemoMode() || (!!actor && !actorFetching && !!userId),
  });
}

export function useGetAllActivityLogs() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ActivityLog[]>({
    queryKey: ['allActivityLogs'],
    queryFn: async () => {
      if (isDemoMode()) {
        return getDemoActivityLogs().map((l) => ({
          userId: { toString: () => l.userId } as any,
          actionType: l.actionType,
          timestamp: BigInt(l.timestamp),
          metadata: l.metadata,
        })) as ActivityLog[];
      }
      if (!actor) return [];
      return actor.getAllActivityLogs();
    },
    enabled: isDemoMode() || (!!actor && !actorFetching),
  });
}

// ---- Performance Metrics Hooks ----

export function useGetPerformanceMetrics(userId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PerformanceMetrics | null>({
    queryKey: ['performanceMetrics', userId],
    queryFn: async () => {
      if (isDemoMode()) {
        const m = getDemoPerformanceMetrics(userId) as any;
        if (!m) return null;
        return {
          totalSessions: BigInt(m.totalSessions),
          completedSessions: BigInt(m.completedSessions),
          cancelledSessions: BigInt(m.cancelledSessions),
          reviewsGiven: BigInt(m.reviewsGiven),
          activeSubscription: m.activeSubscription,
          earnings: BigInt(m.earnings),
          averageRating: m.averageRating,
          totalReviews: BigInt(m.totalReviews),
          withdrawalHistory: m.withdrawalHistory.map((w: number) => BigInt(w)),
        } as PerformanceMetrics;
      }
      if (!actor) return null;
      return actor.getPerformanceMetrics(Principal.fromText(userId));
    },
    enabled: isDemoMode() || (!!actor && !actorFetching && !!userId),
  });
}

export function useUpdatePerformanceMetrics() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, metrics }: { userId: string; metrics: PerformanceMetrics }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updatePerformanceMetrics(Principal.fromText(userId), metrics);
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['performanceMetrics', userId] });
    },
  });
}

// ---- Weekly Snapshot Hooks ----

export function useGetWeeklySnapshots() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<WeeklySnapshot[]>({
    queryKey: ['weeklySnapshots'],
    queryFn: async () => {
      if (isDemoMode()) {
        return getDemoWeeklySnapshots().map((s) => ({
          weekIdentifier: s.weekIdentifier,
          newUsers: BigInt(s.newUsers),
          newTeachers: BigInt(s.newTeachers),
          sessionsBooked: BigInt(s.sessionsBooked),
          sessionsCompleted: BigInt(s.sessionsCompleted),
          totalRevenue: BigInt(s.totalRevenue),
          commissionEarned: BigInt(s.commissionEarned),
          messagesSent: BigInt(s.messagesSent),
          reviewsSubmitted: BigInt(s.reviewsSubmitted),
          newSubscriptions: BigInt(s.newSubscriptions),
        })) as WeeklySnapshot[];
      }
      if (!actor) return [];
      return actor.getWeeklySnapshots();
    },
    enabled: isDemoMode() || (!!actor && !actorFetching),
  });
}

export function useCreateWeeklySnapshot() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (snapshot: WeeklySnapshot) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createWeeklySnapshot(snapshot);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeklySnapshots'] });
    },
  });
}

// ---- Teacher Profile Hooks ----

export function useListTeacherProfiles() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['teacherProfiles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listTeacherProfiles();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetTeacherProfile(id: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['teacherProfile', id],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getTeacherProfile(id);
    },
    enabled: !!actor && !actorFetching && !!id,
  });
}

// ---- Stripe Hooks ----

export function useIsStripeConfigured() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['stripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: { secretKey: string; allowedCountries: string[] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripeConfigured'] });
    },
  });
}

// Stub hooks for tabs that reference these (bookings, withdrawals, subscriptions, blog, referrals)
// These are managed via localStore in the app; stubs prevent import errors
export function useGetAllBookings() { return { data: [], isLoading: false }; }
export function useGetAllWithdrawals() { return { data: [], isLoading: false }; }
export function useGetAllSubscriptions() { return { data: [], isLoading: false }; }
export function useGetAllBlogPosts() { return { data: [], isLoading: false }; }
export function useGetAllReferrals() { return { data: [], isLoading: false }; }
