import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes stale time
      gcTime: 1000 * 60 * 10,    // 10 minutes cache garbage collection
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

export const QUERY_KEYS = {
  dashboardSummary: ['dashboard', 'summary'] as const,
  accounts: ['accounts'] as const,
  transactions: (filters: Record<string, any> = {}) => ['transactions', filters] as const,
  goals: ['goals'] as const,
  insights: ['insights'] as const,
  netWorthWaterfall: ['analytics', 'netWorthWaterfall'] as const,
  profile: ['users', 'profile'] as const,
  settings: ['users', 'settings'] as const
};
