
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useFlexOffersSubId = () => {
  const [flexoffersSubId, setFlexoffersSubId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchFlexOffersMapping = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Use RPC function to get user mapping
        const { data, error: rpcError } = await supabase
          .rpc('get_flexoffers_user_mapping' as any);
          
        if (rpcError) {
          throw rpcError;
        }
        
        if (data && (data as any).sub_affiliate_id) {
          setFlexoffersSubId((data as any).sub_affiliate_id);
        } else {
          console.log('No FlexOffers mapping found');
        }
      } catch (err) {
        console.error('Error checking FlexOffers mapping:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch FlexOffers mapping'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFlexOffersMapping();
  }, [user]);

  return { flexoffersSubId, isLoading, error };
};
