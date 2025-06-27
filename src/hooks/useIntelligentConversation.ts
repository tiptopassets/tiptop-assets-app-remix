
import { useState, useCallback } from 'react';
import { PropertyAnalysisData, AssetInfo } from '@/hooks/useUserPropertyAnalysis';

interface ConversationState {
  currentAsset: string | null;
  completedAssets: string[];
  availableAssets: AssetInfo[];
  userName: string;
  propertyAddress: string;
}

export const useIntelligentConversation = (propertyData: PropertyAnalysisData | null) => {
  const [conversationState, setConversationState] = useState<ConversationState>({
    currentAsset: null,
    completedAssets: [],
    availableAssets: [],
    userName: '',
    propertyAddress: ''
  });

  const initializeConversation = useCallback((targetAsset?: string, userName?: string) => {
    if (!propertyData) return;

    const unconfiguredAssets = propertyData.availableAssets.filter(asset => 
      !asset.isConfigured && asset.hasRevenuePotential
    );

    setConversationState({
      currentAsset: targetAsset || null,
      completedAssets: propertyData.availableAssets
        .filter(asset => asset.isConfigured)
        .map(asset => asset.type),
      availableAssets: unconfiguredAssets,
      userName: userName || 'there',
      propertyAddress: propertyData.address
    });
  }, [propertyData]);

  const generateWelcomeMessage = useCallback(() => {
    if (!propertyData || conversationState.availableAssets.length === 0) {
      return "Hi! I'm here to help you set up monetization for your property assets.";
    }

    const { userName, propertyAddress, availableAssets, currentAsset } = conversationState;
    const topAssets = availableAssets.slice(0, 3);

    if (currentAsset) {
      const asset = availableAssets.find(a => a.type === currentAsset);
      if (asset) {
        return `Hi ${userName}! I see you want to set up your ${asset.name.toLowerCase()} for monetization. Based on your property analysis, this could generate $${asset.monthlyRevenue}/month. Let's get started with the configuration!`;
      }
    }

    const assetList = topAssets
      .map(asset => `${asset.name.toLowerCase()} ($${asset.monthlyRevenue}/month)`)
      .join(', ');

    const totalRevenue = topAssets.reduce((sum, asset) => sum + asset.monthlyRevenue, 0);

    return `Hi ${userName}! Based on your property analysis at ${propertyAddress}, I found ${availableAssets.length} monetization opportunities: ${assetList}. These could generate up to $${totalRevenue}/month combined. Which asset would you like to start with?`;
  }, [propertyData, conversationState]);

  const generateAssetSuggestions = useCallback(() => {
    if (conversationState.availableAssets.length === 0) return [];

    return conversationState.availableAssets.slice(0, 3).map(asset => 
      `Start with ${asset.name} ($${asset.monthlyRevenue}/month)`
    );
  }, [conversationState.availableAssets]);

  const selectAsset = useCallback((assetType: string) => {
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
    if (!asset) return "I don't have information about that asset.";

    switch (assetType) {
      case 'rooftop':
        return `Great choice! Your rooftop has ${asset.area} of space and could generate $${asset.monthlyRevenue}/month with solar panels. I'll help you connect with solar installation partners who can handle the setup and paperwork.`;
      
      case 'parking':
        return `Perfect! You have ${asset.area} that could earn $${asset.monthlyRevenue}/month through parking rentals. I can connect you with platforms like SpotHero and ParkWhiz to list your spaces.`;
      
      case 'pool':
        return `Excellent! Your ${asset.area} pool could generate $${asset.monthlyRevenue}/month through hourly rentals. I'll help you set up with Swimply and other pool-sharing platforms.`;
      
      case 'bandwidth':
        return `Smart choice! Your ${asset.area} internet connection could earn $${asset.monthlyRevenue}/month by sharing unused bandwidth. I can help you set up with Honeygain and similar services.`;
      
      case 'garden':
        return `Great idea! Your ${asset.area} garden space could generate $${asset.monthlyRevenue}/month through community gardening or event hosting. Let me connect you with the right platforms.`;
      
      case 'storage':
        return `Perfect! Your storage space could earn $${asset.monthlyRevenue}/month through peer-to-peer storage rentals. I'll help you get started with Neighbor and similar platforms.`;
      
      default:
        return `I can help you set up your ${asset.name.toLowerCase()} to generate $${asset.monthlyRevenue}/month. Let me connect you with the right service providers.`;
    }
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
