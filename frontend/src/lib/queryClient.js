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
  dashboardSummary: ['dashboard', 'summary'],
  accounts: ['accounts'],
  transactions: (filters = {}) => ['transactions', filters],
  goals: ['goals'],
  insights: ['insights'],
  netWorthWaterfall: ['analytics', 'netWorthWaterfall'],
  profile: ['users', 'profile'],
  settings: ['users', 'settings']
};
