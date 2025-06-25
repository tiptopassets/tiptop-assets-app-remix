
import { ServiceProviderInfo } from "../types";

export const connectToFlexOffers = async (
  userId: string,
  onSuccess: (provider: ServiceProviderInfo) => void,
  availableProviders: ServiceProviderInfo[]
): Promise<boolean> => {
  console.log('FlexOffers integration is temporarily disabled');
  return false;
};

export const disconnectFlexOffers = async (
  userId: string,
  onSuccess: () => void
): Promise<boolean> => {
  console.log('FlexOffers integration is temporarily disabled');
  return false;
};

export const syncFlexOffersEarnings = async (
  userId: string
): Promise<boolean> => {
  console.log('FlexOffers integration is temporarily disabled');
  return false;
};

export const getFlexOffersReferralLink = async (
  userId: string,
  destinationUrl: string
): Promise<{ subAffiliateId: string; referralLink: string }> => {
  console.log('FlexOffers integration is temporarily disabled');
  return { subAffiliateId: '', referralLink: destinationUrl };
};
