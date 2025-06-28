
import { useState, useCallback } from 'react';
import { PropertyAnalysisData, AssetInfo } from '@/hooks/useUserPropertyAnalysis';

interface ConversationState {
  currentAsset: string | null;
  completedAssets: string[];
  availableAssets: AssetInfo[];
  userName: string;
  propertyAddress: string;
  analysisId: string | null;
  isInitialized: boolean;
}

export const useIntelligentConversation = (propertyData: PropertyAnalysisData | null) => {
  const [conversationState, setConversationState] = useState<ConversationState>({
    currentAsset: null,
    completedAssets: [],
    availableAssets: [],
    userName: '',
    propertyAddress: '',
    analysisId: null,
    isInitialized: false
  });

  const initializeConversation = useCallback((targetAsset?: string, userName?: string) => {
    if (!propertyData) {
      console.log('⚠️ [CONVERSATION] No property data available for initialization');
      return;
    }

    console.log('🔄 [CONVERSATION] Initializing conversation with actual data:', {
      analysisId: propertyData.analysisId,
      address: propertyData.address,
      totalRevenue: propertyData.totalMonthlyRevenue,
      assetsCount: propertyData.availableAssets.length,
      targetAsset,
      userName
    });

    const unconfiguredAssets = propertyData.availableAssets.filter(asset => 
      !asset.isConfigured && asset.hasRevenuePotential && asset.monthlyRevenue > 0
    );

    setConversationState({
      currentAsset: targetAsset || null,
      completedAssets: propertyData.availableAssets
        .filter(asset => asset.isConfigured)
        .map(asset => asset.type),
      availableAssets: unconfiguredAssets,
      userName: userName || 'there',
      propertyAddress: propertyData.address,
      analysisId: propertyData.analysisId,
      isInitialized: true
    });
  }, [propertyData]);

  const generateWelcomeMessage = useCallback(() => {
    if (!conversationState.isInitialized || !propertyData) {
      return "Hi! I'm here to help you set up monetization for your property assets. Let me analyze your property first.";
    }

    if (conversationState.availableAssets.length === 0) {
      return `Hi ${conversationState.userName}! I've analyzed your property at ${conversationState.propertyAddress} but all available assets appear to be configured already, or there may be limited monetization opportunities available. Would you like me to help you explore other options?`;
    }

    const { userName, propertyAddress, availableAssets, currentAsset } = conversationState;
    
    // Get actual revenue amounts from the analysis
    const topAssets = availableAssets.slice(0, 3);

    if (currentAsset) {
      const asset = availableAssets.find(a => a.type === currentAsset);
      if (asset) {
        return `Hi ${userName}! I see you want to set up your ${asset.name.toLowerCase()} for monetization. Based on your property analysis at ${propertyAddress}, this could generate $${asset.monthlyRevenue}/month. Let's get started with the configuration!`;
      }
    }

    // Use actual asset names and revenue amounts from the analysis
    const assetList = topAssets
      .map(asset => `${asset.name} ($${asset.monthlyRevenue}/month)`)
      .join(' and ');

    const totalRevenue = topAssets.reduce((sum, asset) => sum + asset.monthlyRevenue, 0);

    return `Hi ${userName}! Based on your property analysis at ${propertyAddress}, I found ${availableAssets.length} monetization opportunit${availableAssets.length === 1 ? 'y' : 'ies'}: ${assetList}. ${availableAssets.length > 1 ? `These could generate up to $${totalRevenue}/month combined.` : `This could generate $${totalRevenue}/month.`} Which asset would you like to start with?`;
  }, [propertyData, conversationState]);

  const generateAssetSuggestions = useCallback(() => {
    if (!conversationState.isInitialized || conversationState.availableAssets.length === 0) {
      return [
        'Tell me about your rooftop',
        'Do you have parking spaces?',
        'What about high-speed internet?'
      ];
    }

    // Generate suggestions based on actual available assets
    return conversationState.availableAssets.slice(0, 3).map(asset => 
      `Start with ${asset.name} ($${asset.monthlyRevenue}/month)`
    );
  }, [conversationState]);

  const selectAsset = useCallback((assetType: string) => {
    console.log('🎯 [CONVERSATION] Selecting asset:', assetType);
    setConversationState(prev => ({
      ...prev,
      currentAsset: assetType
    }));
  }, []);

  const getAssetInfo = useCallback((assetType: string): AssetInfo | null => {
    return conversationState.availableAssets.find(asset => asset.type === assetType) || null;
  }, [conversationState.availableAssets]);

  const generateAssetResponse = useCallback((assetType: string) => {
    const asset = getAssetInfo(assetType);
    if (!asset) {
      return `I don't have specific information about ${assetType} for your property analysis. Let me help you explore the available options from your actual property analysis.`;
    }

    // Use actual asset data for responses
    const responses = {
      'rooftop': `Great choice! Your rooftop analysis shows ${asset.area} of space and could generate $${asset.monthlyRevenue}/month with solar panels. The setup typically takes 2-6 weeks and I can connect you with trusted solar installation partners who handle all the paperwork and permitting.`,
      
      'parking': `Perfect! Your parking analysis shows ${asset.area} that could earn $${asset.monthlyRevenue}/month through parking rentals. This is one of the easiest assets to monetize - you can start earning within days. I can connect you with platforms like SpotHero and ParkWhiz to list your spaces.`,
      
      'pool': `Excellent! Your pool analysis shows a ${asset.area} pool that could generate $${asset.monthlyRevenue}/month through hourly rentals. Pool sharing is very popular and you maintain full control of your schedule. I'll help you set up with Swimply and other pool-sharing platforms.`,
      
      'bandwidth': `Smart choice! Your internet analysis shows ${asset.area} connection that could earn $${asset.monthlyRevenue}/month by sharing unused bandwidth. This is completely passive income that runs in the background. I can help you set up with Honeygain and similar services.`,
      
      'garden': `Great idea! Your garden analysis shows ${asset.area} space that could generate $${asset.monthlyRevenue}/month through community gardening or private event hosting. This creates beautiful community connections while earning income. Let me connect you with the right platforms.`,
      
      'storage': `Perfect! Your storage analysis shows space that could earn $${asset.monthlyRevenue}/month through peer-to-peer storage rentals. People always need secure storage and you can set your own rates and availability. I'll help you get started with Neighbor and similar platforms.`
    };

    return responses[assetType as keyof typeof responses] || 
           `I can help you set up your ${asset.name.toLowerCase()} to generate $${asset.monthlyRevenue}/month based on your property analysis. This asset has good earning potential and I'll connect you with the right service providers to get started.`;
  }, [getAssetInfo]);

  return {
    conversationState,
    initializeConversation,
    generateWelcomeMessage,
    generateAssetSuggestions,
    selectAsset,
    getAssetInfo,
    generateAssetResponse
  };
};
