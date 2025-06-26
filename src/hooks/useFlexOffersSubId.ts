
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

        // Check if user has FlexOffers earnings record
        const { data, error: queryError } = await supabase
          .from('affiliate_earnings')
          .select('provider_name')
          .eq('user_id', user.id)
          .eq('provider_name', 'FlexOffers')
          .maybeSingle();
          
        if (queryError) {
          throw queryError;
        }
        
        if (data) {
          // Generate sub-affiliate ID based on user ID
          const subAffiliateId = `tiptop_${user.id.substring(0, 8)}`;
          setFlexoffersSubId(subAffiliateId);
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
