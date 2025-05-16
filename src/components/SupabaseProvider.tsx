
import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { useSupabaseConfig } from '@/hooks/useSupabase';

interface SupabaseProviderProps {
  children: React.ReactNode;
  queryClient: QueryClient;
}

export const SupabaseProvider: React.FC<SupabaseProviderProps> = ({
  children,
  queryClient
}) => {
  // Set up global Supabase configuration for React Query
  useSupabaseConfig(queryClient);
  
  return <>{children}</>;
};

export default SupabaseProvider;
