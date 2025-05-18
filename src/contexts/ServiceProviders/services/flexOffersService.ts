
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  FlexOffersSubIdResponse,
  ServiceProviderInfo
} from '../types';

export const connectToFlexOffers = async (
  userId: string,
  onSuccess: (provider: ServiceProviderInfo) => void,
  availableProviders: ServiceProviderInfo[]
) => {
  const { toast } = useToast();
  
  try {
    // Generate a unique sub-affiliate ID using user ID and a timestamp
    const subAffiliateId = `tipTop_${userId.substring(0, 8)}_${Date.now().toString(36)}`;
    
    // Store the mapping using RPC function
    const { error } = await supabase.rpc(
      'create_flexoffers_mapping',
      {
        user_id_param: userId,
        sub_affiliate_id_param: subAffiliateId
      }
    );
    
    if (error) {
      throw error;
    }
    
    // Create a placeholder in affiliate_earnings
    await supabase
      .from('affiliate_earnings')
      .insert({
        user_id: userId,
        service: 'FlexOffers',
        earnings: 0,
        last_sync_status: 'pending'
      });
    
    toast({
      title: 'FlexOffers Connected',
      description: 'Your FlexOffers affiliate account is now linked.',
    });
    
    // Find and return the updated provider
    const provider = availableProviders.find(p => p.id.toLowerCase() === 'flexoffers');
    if (provider) {
      onSuccess({...provider, connected: true});
    }
    
    return true;
  } catch (err) {
    console.error('Error connecting to FlexOffers:', err);
    toast({
      title: 'Connection Failed',
      description: 'Failed to connect to FlexOffers',
      variant: 'destructive'
    });
    
    return false;
  }
};

export const disconnectFlexOffers = async (
  userId: string,
  onSuccess: () => void
) => {
  const { toast } = useToast();
  
  try {
    const { error } = await supabase.rpc(
      'delete_flexoffers_mapping',
      { user_id_param: userId }
    );
    
    if (error) {
      throw error;
    }
    
    toast({
      title: 'FlexOffers Disconnected',
      description: 'Your FlexOffers integration has been removed.',
    });
    
    onSuccess();
    return true;
  } catch (err) {
    console.error('Error disconnecting from FlexOffers:', err);
    toast({
      title: 'Disconnection Failed',
      description: 'Failed to disconnect from FlexOffers',
      variant: 'destructive'
    });
    
    return false;
  }
};

export const syncFlexOffersEarnings = async (userId: string) => {
  const { toast } = useToast();
  
  try {
    // Get the user's sub-affiliate ID using RPC function
    const { data, error } = await supabase.rpc<FlexOffersSubIdResponse>(
      'get_flexoffers_sub_id',
      { user_id_param: userId }
    );
    
    if (error) {
      throw error;
    }
    
    if (!data || !data.sub_affiliate_id) {
      throw new Error('No FlexOffers sub-affiliate ID found');
    }
    
    // Call the sync function with the FlexOffers data
    const { error: syncError } = await supabase.functions.invoke('sync_affiliate_earnings', {
      body: { 
        service: 'FlexOffers',
        user_id: userId,
        sub_affiliate_id: data.sub_affiliate_id
      }
    });
    
    if (syncError) {
      throw syncError;
    }
    
    toast({
      title: 'Sync Initiated',
      description: 'FlexOffers earnings sync has been initiated.',
    });
    
    return true;
  } catch (err) {
    console.error('Error syncing FlexOffers earnings:', err);
    toast({
      title: 'Sync Failed',
      description: 'Failed to sync earnings from FlexOffers',
      variant: 'destructive'
    });
    
    return false;
  }
};

export const getFlexOffersReferralLink = async (userId: string, destinationUrl: string) => {
  // Find the mapping asynchronously
  const { data } = await supabase.rpc<FlexOffersSubIdResponse>(
    'get_flexoffers_sub_id',
    { user_id_param: userId }
  );
      
  // For immediate UI response, use a placeholder or cached value if no data
  const subAffiliateId = data?.sub_affiliate_id || `tipTop_${userId.substring(0, 8)}`;
  
  return {
    subAffiliateId,
    referralLink: `https://www.flexoffers.com/affiliate-link/?sid=${subAffiliateId}&url=${encodeURIComponent(destinationUrl)}`
  };
};
