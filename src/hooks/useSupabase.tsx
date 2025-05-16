
import { useEffect } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

// This hook sets up global error handling and retry logic for Supabase requests
export const useSupabaseConfig = (queryClient: QueryClient) => {
  const { toast } = useToast();

  useEffect(() => {
    // Set up global error handling for React Query
    queryClient.setDefaultOptions({
      queries: {
        retry: (failureCount, error: any) => {
          // Don't retry on 4XX errors (client errors)
          if (error?.status >= 400 && error?.status < 500) {
            return false;
          }
          // Retry up to 2 times for other errors
          return failureCount < 2;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        meta: {
          onError: (error: any) => {
            console.error('Query error:', error);
            toast({
              title: "Error",
              description: error?.message || "An error occurred while fetching data",
              variant: "destructive"
            });
          }
        }
      },
      mutations: {
        meta: {
          onError: (error: any) => {
            console.error('Mutation error:', error);
            toast({
              title: "Error",
              description: error?.message || "An error occurred while updating data",
              variant: "destructive"
            });
          }
        }
      }
    });

    // Set up Supabase auth listener to invalidate queries when auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'SIGNED_IN') {
          // When user signs in, invalidate any queries that depend on auth state
          queryClient.invalidateQueries();
        } else if (event === 'SIGNED_OUT') {
          // When user signs out, clear the query cache entirely
          queryClient.clear();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient, toast]);
};

export default useSupabaseConfig;
