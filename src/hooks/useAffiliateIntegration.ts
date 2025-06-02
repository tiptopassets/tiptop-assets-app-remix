
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useAffiliateIntegration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const generateReferralLink = async (provider: string, destinationUrl: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.functions.invoke('affiliate-partner-integration', {
        body: {
          action: 'get_referral_link',
          userId: user.id,
          provider,
          data: { destinationUrl }
        }
      });

      if (error) throw error;
      return data.referralLink;
    } catch (error) {
      console.error('Referral link error:', error);
      return destinationUrl; // Fallback to original URL
    }
  };

  const registerWithPartner = async (provider: string, registrationData: any) => {
    if (!user) return false;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('affiliate-partner-integration', {
        body: {
          action: 'register',
          userId: user.id,
          provider,
          data: registrationData
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Registration Successful",
          description: `Successfully registered with ${provider}`,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Partner registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register with partner",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const trackClick = async (provider: string, clickData: any) => {
    if (!user) return;

    try {
      await supabase.functions.invoke('affiliate-partner-integration', {
        body: {
          action: 'track_click',
          userId: user.id,
          provider,
          data: clickData
        }
      });
    } catch (error) {
      console.error('Click tracking error:', error);
    }
  };

  const syncEarnings = async (provider: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.functions.invoke('affiliate-partner-integration', {
        body: {
          action: 'sync_earnings',
          userId: user.id,
          provider
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Earnings sync error:', error);
      return null;
    }
  };

  return {
    generateReferralLink,
    registerWithPartner,
    trackClick,
    syncEarnings,
    isLoading
  };
};
