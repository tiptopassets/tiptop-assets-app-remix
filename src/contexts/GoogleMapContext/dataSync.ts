
import { AnalysisResults } from './types';
import { useUserData } from '@/hooks/useUserData';

export interface DataSyncManager {
  syncAnalysisToDatabase: (address: string, analysis: AnalysisResults, coordinates?: any) => Promise<void>;
  syncAddressToDatabase: (address: string, coordinates?: any, formattedAddress?: string) => Promise<string | null>;
}

export const createDataSyncManager = (userData: ReturnType<typeof useUserData>): DataSyncManager => {
  const syncAddressToDatabase = async (
    address: string, 
    coordinates?: any, 
    formattedAddress?: string
  ): Promise<string | null> => {
    console.log('Syncing address to database:', address);
    
    // Check if address already exists
    const existingAddress = userData.addresses.find(addr => 
      addr.address === address || addr.formatted_address === formattedAddress
    );
    
    if (existingAddress) {
      console.log('Address already exists:', existingAddress.id);
      return existingAddress.id;
    }
    
    return await userData.saveAddress(address, coordinates, formattedAddress);
  };

  const syncAnalysisToDatabase = async (
    address: string, 
    analysis: AnalysisResults, 
    coordinates?: any
  ): Promise<void> => {
    console.log('Syncing analysis to database for address:', address);
    
    // First ensure address exists
    const addressId = await syncAddressToDatabase(address, coordinates);
    
    if (!addressId) {
      console.error('Failed to get address ID for analysis sync');
      return;
    }
    
    // Check if analysis already exists for this address
    const existingAnalysis = userData.analyses.find(analysis => analysis.address_id === addressId);
    
    if (existingAnalysis) {
      console.log('Analysis already exists for this address');
      return;
    }
    
    // Save the analysis
    const analysisId = await userData.savePropertyAnalysis(addressId, analysis, coordinates);
    
    if (analysisId) {
      console.log('Analysis saved with ID:', analysisId);
      
      // Auto-save top opportunities as asset selections
      for (const opportunity of analysis.topOpportunities) {
        await userData.saveAssetSelection(
          analysisId,
          opportunity.icon, // Use icon as asset type identifier
          opportunity,
          opportunity.monthlyRevenue,
          opportunity.setupCost || 0,
          opportunity.roi || undefined
        );
      }
    }
  };

  return {
    syncAnalysisToDatabase,
    syncAddressToDatabase
  };
};
