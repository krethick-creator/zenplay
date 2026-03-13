import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const updateCoins = useMutation({
    mutationFn: async (amount: number) => {
      const { error } = await supabase
        .from('profiles')
        .update({ coins: (profile?.coins ?? 0) + amount })
        .eq('user_id', user!.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  });

  const addXp = useMutation({
    mutationFn: async (xpAmount: number) => {
      const newXp = (profile?.xp ?? 0) + xpAmount;
      const newLevel = Math.floor(newXp / 100) + 1;
      const { error } = await supabase
        .from('profiles')
        .update({ xp: newXp, level: newLevel })
        .eq('user_id', user!.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  });

  return { profile, isLoading, updateCoins, addXp };
};
