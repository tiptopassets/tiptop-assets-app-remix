
import { supabase } from "@/integrations/supabase/client";
import { ServiceProviderInfo } from "../types";
import { useToast } from "@/hooks/use-toast";

export const connectToFlexOffers = async (
  userId: string,
  onSuccess: (provider: ServiceProviderInfo) => void,
  availableProviders: ServiceProviderInfo[]
): Promise<boolean> => {
  try {
    // Generate a pseudo-random sub-affiliate ID based on user ID
    // In a real implementation, this would involve FlexOffers API calls
    const subAffiliateId = `tiptop_${userId.substring(0, 8)}`;
    
    // Store the sub-affiliate ID mapping
    const { error } = await supabase.rpc(
      'create_flexoffers_mapping',
      {
        user_id_param: userId,
        sub_affiliate_id_param: subAffiliateId
      }
    );
    
    if (error) throw error;
    
    // Create a placeholder in affiliate_earnings
    const { error: earningsError } = await supabase
      .from('affiliate_earnings')
      .insert({
        user_id: userId,
        service: 'FlexOffers',
        earnings: 0,
        last_sync_status: 'pending'
      });
    
    if (earningsError) throw earningsError;
    
    // Find the FlexOffers provider and update UI
    const flexoffersProvider = availableProviders.find(p => p.id.toLowerCase() === 'flexoffers');
    if (flexoffersProvider) {
      onSuccess({...flexoffersProvider, connected: true});
    }
    
    return true;
  } catch (err) {
    console.error('Error connecting to FlexOffers:', err);
    return false;
  }
};

export const disconnectFlexOffers = async (
  userId: string,
  onSuccess: () => void
): Promise<boolean> => {
  try {
    // Remove the sub-affiliate mapping
    const { error } = await supabase.rpc(
      'delete_flexoffers_mapping',
      {
        user_id_param: userId
      }
    );
    
    if (error) throw error;
    
    // Delete the earnings record
    await supabase
      .from('affiliate_earnings')
      .delete()
      .eq('user_id', userId)
      .eq('service', 'FlexOffers');
    
    // Update UI
    onSuccess();
    
    return true;
  } catch (err) {
    console.error('Error disconnecting from FlexOffers:', err);
    return false;
  }
};

export const syncFlexOffersEarnings = async (
  userId: string
): Promise<boolean> => {
  try {
    // Call the edge function to sync earnings
    const { data, error } = await supabase.functions.invoke('sync_affiliate_earnings', {
      body: {
        user_id: userId,
        service: 'FlexOffers'
      }
    });
    
    if (error) throw error;
    
    return data.success || false;
  } catch (err) {
    console.error('Error syncing FlexOffers earnings:', err);
    return false;
  }
};

export const getFlexOffersReferralLink = async (
  userId: string,
  destinationUrl: string
): Promise<{ subAffiliateId: string; referralLink: string }> => {
  try {
    // Get the sub-affiliate ID for the user
    const { data, error } = await supabase.rpc<{ sub_affiliate_id: string }>(
      'get_flexoffers_sub_id',
      { user_id_param: userId }
    );
    
    if (error) throw error;
    
    const subAffiliateId = data?.sub_affiliate_id || '';
    
    // Generate the referral link
    // In a real implementation, this would involve FlexOffers API calls
    const encodedUrl = encodeURIComponent(destinationUrl);
    const referralLink = `https://track.flexoffers.com/a/${subAffiliateId}?url=${encodedUrl}`;
    
    return { subAffiliateId, referralLink };
  } catch (err) {
    console.error('Error getting FlexOffers referral link:', err);
    // Return original URL if there's an error
    return { subAffiliateId: '', referralLink: destinationUrl };
  }
};
