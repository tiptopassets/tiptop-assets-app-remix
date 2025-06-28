
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PropertyAnalysisData, AssetInfo } from '@/hooks/useUserPropertyAnalysis';

interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestedActions?: string[];
  detectedAssets?: string[];
  confidence?: number;
}

interface ConversationContext {
  propertyData: PropertyAnalysisData | null;
  selectedAssets: string[];
  journeyStage: string;
  conversationHistory: ConversationMessage[];
}

export const useOpenAIConversation = (propertyData: PropertyAnalysisData | null) => {
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);

  const generateWelcomeMessage = useCallback((): string => {
    if (!propertyData) {
      return "Hi! I'm here to help you set up monetization for your property assets. Let me analyze your property first.";
    }

    console.log('🏠 [CONVERSATION] Generating welcome for property:', {
      address: propertyData.address,
      totalRevenue: propertyData.totalMonthlyRevenue,
      assetsCount: propertyData.availableAssets.length,
      assets: propertyData.availableAssets.map(a => `${a.name}: $${a.monthlyRevenue}`)
    });

    const { address, totalMonthlyRevenue, availableAssets } = propertyData;
    
    if (availableAssets.length === 0) {
      return `Hi! I've analyzed your property at ${address}, but I couldn't find any available assets for monetization with revenue potential. Would you like to tell me more about your property features?`;
    }

    const topAssets = availableAssets.slice(0, 2);
    const assetList = topAssets.map(asset => `${asset.name} ($${asset.monthlyRevenue}/month)`).join(' and ');
    
    return `Hi! I've analyzed your property at ${address} and found great monetization opportunities. Your top assets are ${assetList}, with a total potential of $${totalMonthlyRevenue}/month. Which asset would you like to start with?`;
  }, [propertyData]);

  const generateIntelligentResponse = useCallback(async (userMessage: string): Promise<{
    response: string;
    suggestedActions: string[];
    detectedAssets: string[];
  }> => {
    setIsLoading(true);
    
    try {
      if (!propertyData) {
        return {
          response: "I need to analyze your property first to provide accurate information. Could you tell me about your property?",
          suggestedActions: ['Analyze my property', 'Tell me about available services'],
          detectedAssets: []
        };
      }

      const context: ConversationContext = {
        propertyData,
        selectedAssets: propertyData.availableAssets.map(a => a.type),
        journeyStage: 'asset_selection',
        conversationHistory
      };

      console.log('🤖 [OPENAI] Sending context:', {
        propertyAddress: propertyData.address,
        totalRevenue: propertyData.totalMonthlyRevenue,
        availableAssets: propertyData.availableAssets.length,
        message: userMessage
      });

      const { data, error } = await supabase.functions.invoke('analyze-conversation', {
        body: {
          message: userMessage,
          context: context,
          analysisType: 'property_monetization'
        }
      });

      if (error) {
        console.error('OpenAI conversation error:', error);
        return generateContextualFallbackResponse(userMessage, propertyData);
      }

      return {
        response: data.response || "I'm here to help with your property monetization questions.",
        suggestedActions: data.suggestedActions?.map((action: any) => action.action).slice(0, 3) || [],
        detectedAssets: data.detectedAssets?.map((asset: any) => asset.assetType) || []
      };
    } catch (error) {
      console.error('Error generating intelligent response:', error);
      return generateContextualFallbackResponse(userMessage, propertyData);
    } finally {
      setIsLoading(false);
    }
  }, [propertyData, conversationHistory]);

  const generateContextualFallbackResponse = useCallback((userMessage: string, propData: PropertyAnalysisData): {
    response: string;
    suggestedActions: string[];
    detectedAssets: string[];
  } => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (!propData || propData.availableAssets.length === 0) {
      return {
        response: "I don't have analysis data for your property yet. Let me help you get started with property analysis.",
        suggestedActions: [
          'Analyze my property',
          'What services do you offer?',
          'How does this work?'
        ],
        detectedAssets: []
      };
    }

    const topAsset = propData.availableAssets[0];
    
    if (lowerMessage.includes('requirement') || lowerMessage.includes('need')) {
      return {
        response: `For ${topAsset.name}, the main requirements typically include: initial setup verification, any necessary permits or approvals, and connecting with our trusted service providers. The setup process usually takes 1-2 weeks and can generate $${topAsset.monthlyRevenue}/month based on your property analysis.`,
        suggestedActions: [
          'Tell me about setup costs',
          'How long does it take?',
          'Connect me with providers'
        ],
        detectedAssets: [topAsset.type]
      };
    }

    if (lowerMessage.includes('start') || lowerMessage.includes('begin')) {
      return {
        response: `Let's start with your highest earning potential: ${topAsset.name}. Based on your property analysis, this could generate $${topAsset.monthlyRevenue}/month. I can connect you with our trusted partners to begin the setup process.`,
        suggestedActions: [
          `Set up ${topAsset.name}`,
          'What are the requirements?',
          'Show me other options'
        ],
        detectedAssets: [topAsset.type]
      };
    }

    return {
      response: `Based on your property analysis at ${propData.address}, you have ${propData.availableAssets.length} monetization opportunities. Your top asset is ${topAsset.name} with $${topAsset.monthlyRevenue}/month potential. What would you like to know about it?`,
      suggestedActions: [
        `What are the requirements for ${topAsset.name}?`,
        'How do I get started?',
        'Show me all my options'
      ],
      detectedAssets: [topAsset.type]
    };
  }, []);

  const addMessage = useCallback((message: ConversationMessage) => {
    setConversationHistory(prev => [...prev, message]);
  }, []);

  return {
    generateWelcomeMessage,
    generateIntelligentResponse,
    addMessage,
    isLoading,
    conversationHistory
  };
};
