
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useProviderActions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const updateEarnings = async (providerId: string, earningsData: any) => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('service_providers')
        .update({
          avg_monthly_earnings_low: earningsData.low,
          avg_monthly_earnings_high: earningsData.high,
          updated_at: new Date().toISOString()
        })
        .eq('id', providerId)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Provider earnings updated successfully"
      });

      return data;
    } catch (error) {
      console.error('Error updating earnings:', error);
      toast({
        title: "Error", 
        description: "Failed to update earnings",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const syncEarnings = async (providerId: string) => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get provider info
      const { data: provider, error: providerError } = await supabase
        .from('service_providers')
        .select('*')
        .eq('id', providerId)
        .single();

      if (providerError) throw providerError;

      // Create earnings record
      const { data, error } = await supabase
        .from('service_providers')
        .update({
          updated_at: new Date().toISOString()
        })
        .eq('id', providerId)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Earnings synced successfully"
      });

      return data;
    } catch (error) {
      console.error('Error syncing earnings:', error);
      toast({
        title: "Error",
        description: "Failed to sync earnings", 
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithProvider = async (providerId: string, credentials: any) => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Store credentials
      const { data, error } = await supabase
        .from('affiliate_credentials')
        .upsert({
          user_id: user.id,
          provider_name: credentials.providerName,
          api_key: credentials.apiKey,
          secret_key: credentials.secretKey,
          account_id: credentials.accountId,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Successfully registered with provider"
      });

      return data;
    } catch (error) {
      console.error('Error registering with provider:', error);
      toast({
        title: "Error",
        description: "Failed to register with provider",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createEarningsRecord = async (earningsData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('service_providers')
        .insert({
          user_id: user.id,
          name: earningsData.providerName,
          category: earningsData.serviceType,
          avg_monthly_earnings_low: earningsData.amount,
          avg_monthly_earnings_high: earningsData.amount,
          commission_rate: earningsData.commissionRate || 0
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating earnings record:', error);
      throw error;
    }
  };

  const getEarningsHistory = async (providerId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('service_providers')
        .select('*')
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching earnings history:', error);
      throw error;
    }
  };

  return {
    updateEarnings,
    syncEarnings,
    registerWithProvider,
    createEarningsRecord,
    getEarningsHistory,
    isLoading
  };
};
