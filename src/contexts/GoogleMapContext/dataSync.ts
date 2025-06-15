
// This file is deprecated - data syncing is now handled directly in GoogleMapProvider
// using the service functions from /services/ directory

export interface DataSyncManager {
  syncAnalysisToDatabase: (address: string, analysis: any, coordinates?: any) => Promise<void>;
  syncAddressToDatabase: (address: string, coordinates?: any, formattedAddress?: string) => Promise<string | null>;
}

// Legacy compatibility - redirect to proper services
export const createDataSyncManager = (): DataSyncManager => {
  console.warn('⚠️ createDataSyncManager is deprecated. Use service functions directly.');
  
  return {
    syncAnalysisToDatabase: async () => {
      console.log('Use savePropertyAnalysis from userAnalysisService instead');
    },
    syncAddressToDatabase: async () => {
      console.log('Use saveAddress from userAddressService instead');
      return null;
    }
  };
};
