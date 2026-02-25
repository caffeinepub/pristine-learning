import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { TeacherProfile, ShoppingItem, StripeConfiguration } from '../backend';

// ─── Teacher Profiles ───────────────────────────────────────────────────────

export function useListTeacherProfiles() {
  const { actor, isFetching } = useActor();
  return useQuery<TeacherProfile[]>({
    queryKey: ['teacherProfiles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listTeacherProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTeacherProfile(id: string) {
  const { actor, isFetching } = useActor();
  return useQuery<TeacherProfile | null>({
    queryKey: ['teacherProfile', id],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getTeacherProfile(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useCreateTeacherProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, profile }: { id: string; profile: TeacherProfile }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createTeacherProfile(id, profile);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teacherProfiles'] }),
  });
}

export function useUpdateTeacherProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, profile }: { id: string; profile: TeacherProfile }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTeacherProfile(id, profile);
    },
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: ['teacherProfiles'] });
      qc.invalidateQueries({ queryKey: ['teacherProfile', id] });
    },
  });
}

// ─── Auth / User Profile ─────────────────────────────────────────────────────

export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['callerUserRole'],
    queryFn: async () => {
      if (!actor) return 'guest';
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Stripe ──────────────────────────────────────────────────────────────────

export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['isStripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setStripeConfiguration(config);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['isStripeConfigured'] }),
  });
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (items: ShoppingItem[]) => {
      if (!actor) throw new Error('Actor not available');
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/payment-failure`;
      const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
      const session = JSON.parse(result) as { id: string; url: string };
      if (!session?.url) throw new Error('Stripe session missing url');
      return session;
    },
  });
}

export function useGetStripeSessionStatus(sessionId: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['stripeSession', sessionId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getStripeSessionStatus(sessionId);
    },
    enabled: !!actor && !isFetching && !!sessionId,
  });
}
