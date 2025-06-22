
import { ServiceProviderInfo } from "../types";

export const connectToFlexOffers = async (
  userId: string,
  onSuccess: (provider: ServiceProviderInfo) => void,
  availableProviders: ServiceProviderInfo[]
): Promise<boolean> => {
  try {
    // Generate a pseudo-random sub-affiliate ID based on user ID
    const subAffiliateId = `tiptop_${userId.substring(0, 8)}`;
    
    // Use partner_integration_progress to track FlexOffers connection
    console.log(`FlexOffers connection initiated for user ${userId} with sub-affiliate ID: ${subAffiliateId}`);
    
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
    console.log(`FlexOffers disconnection initiated for user ${userId}`);
    
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
    console.log(`FlexOffers earnings sync initiated for user ${userId}`);
    
    // For now, just return success - actual sync would happen in edge function
    return true;
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
