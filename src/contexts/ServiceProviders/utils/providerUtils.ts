
import { ServiceProviderInfo } from '../types';

// Helper function to determine which asset types a service is applicable for
export const getAssetTypesForService = (serviceName: string): string[] => {
  switch (serviceName.toLowerCase()) {
    case 'swimply':
      return ['pool'];
    case 'honeygain':
      return ['bandwidth', 'internet'];
    case 'neighbor':
      return ['storage', 'parking'];
    case 'yardrental':
    case 'yardyum':
      return ['garden', 'yard'];
    case 'sunrun':
    case 'tesla solar':
      return ['rooftop', 'solar'];
    case 'flexoffers': 
      return ['internet', 'solar', 'pool', 'storage', 'parking'];
    default:
      return [];
  }
};

// Format service provider data from database to UI format
export const formatProviderInfo = (service: any): ServiceProviderInfo => {
  return {
    id: service.name.toLowerCase(),
    name: service.name,
    description: `Connect to ${service.name} to monetize your property assets`,
    logo: `/lovable-uploads/${service.name.toLowerCase()}-logo.png`,
    url: service.api_url || `https://${service.name.toLowerCase()}.com`,
    loginUrl: service.login_url || `https://${service.name.toLowerCase()}.com/login`,
    assetTypes: getAssetTypesForService(service.name),
    connected: false,
    setupInstructions: `To connect with ${service.name}, you'll need to create an account or sign in to your existing account.`,
    // Adding referral link template for FlexOffers
    referralLinkTemplate: service.name === 'FlexOffers' ? 
      'https://www.flexoffers.com/affiliate-link/?sid={{subAffiliateId}}&url={{destinationUrl}}' : 
      undefined
  };
};
