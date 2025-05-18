
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useEarningsSubscription = (
  userId: string | undefined, 
  onDataChange: () => void
) => {
  useEffect(() => {
    if (!userId) return;

    // Set up subscription to affiliate_earnings table changes
    const channel = supabase
      .channel('affiliate-earnings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'affiliate_earnings',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Refresh data when changes occur
          onDataChange();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, onDataChange]);
};
