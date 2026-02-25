import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { UserProfile, TeacherProfile, ShoppingItem, StripeSessionStatus } from '../backend';

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Teacher Profiles ─────────────────────────────────────────────────────────

export function useListTeacherProfiles() {
  const { actor, isFetching } = useActor();

  return useQuery<TeacherProfile[]>({
    queryKey: ['teacherProfiles'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await actor.listTeacherProfiles();
        return Array.isArray(result) ? result : [];
      } catch (err) {
        console.error('Failed to fetch teacher profiles:', err);
        throw err;
      }
    },
    enabled: !!actor && !isFetching,
    retry: 1,
    initialData: undefined,
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
    retry: 1,
  });
}

export function useCreateTeacherProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, profile }: { id: string; profile: TeacherProfile }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.createTeacherProfile(id, profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherProfiles'] });
    },
  });
}

export function useUpdateTeacherProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, profile }: { id: string; profile: TeacherProfile }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateTeacherProfile(id, profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherProfiles'] });
    },
  });
}

// ─── Stripe Payments ──────────────────────────────────────────────────────────

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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: { secretKey: string; allowedCountries: string[] }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isStripeConfigured'] });
    },
  });
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (items: ShoppingItem[]): Promise<{ id: string; url: string }> => {
      if (!actor) throw new Error('Actor not available');
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/payment-failure`;
      const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
      const session = JSON.parse(result) as { id: string; url: string };
      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }
      return session;
    },
  });
}

export function useGetStripeSessionStatus(sessionId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<StripeSessionStatus>({
    queryKey: ['stripeSessionStatus', sessionId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getStripeSessionStatus(sessionId);
    },
    enabled: !!actor && !isFetching && !!sessionId,
  });
}
