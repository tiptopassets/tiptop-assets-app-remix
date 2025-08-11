
import { supabase } from "@/integrations/supabase/client";
import { ServiceProviderInfo } from "../types";

export const connectToFlexOffers = async (
  userId: string,
  onSuccess: (provider: ServiceProviderInfo) => void,
  availableProviders: ServiceProviderInfo[]
): Promise<boolean> => {
  try {
    // Generate a pseudo-random sub-affiliate ID based on user ID
    const subAffiliateId = `tiptop_${userId.substring(0, 8)}`;
    
    // Create a placeholder in affiliate_earnings with current column names
    const { error: earningsError } = await supabase
      .from('affiliate_earnings')
      .insert({
        user_id: userId,
        provider_name: 'FlexOffers',
        earnings_amount: 0,
        status: 'pending'
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
    // Delete the earnings record using current column name
    await supabase
      .from('affiliate_earnings')
      .delete()
      .eq('user_id', userId)
      .eq('provider_name', 'FlexOffers'); // Use current column name
    
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
    const subAffiliateId = `tiptop_${userId.substring(0, 8)}`;
    
    // Generate the referral link
    const encodedUrl = encodeURIComponent(destinationUrl);
    const referralLink = `https://track.flexoffers.com/a/${subAffiliateId}?url=${encodedUrl}`;
    
    return { subAffiliateId, referralLink };
  } catch (err) {
    console.error('Error getting FlexOffers referral link:', err);
    // Return original URL if there's an error
    return { subAffiliateId: '', referralLink: destinationUrl };
  }
};
