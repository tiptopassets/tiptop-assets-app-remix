
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

    const { address, totalMonthlyRevenue, availableAssets } = propertyData;
    const topAssets = availableAssets.slice(0, 2);
    
    if (availableAssets.length === 0) {
      return `Hi! I've analyzed your property at ${address}, but I couldn't find any available assets for monetization. Would you like to tell me more about your property features?`;
    }

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
      const context: ConversationContext = {
        propertyData,
        selectedAssets: propertyData?.availableAssets.map(a => a.type) || [],
        journeyStage: 'asset_selection',
        conversationHistory
      };

      const { data, error } = await supabase.functions.invoke('analyze-conversation', {
        body: {
          message: userMessage,
          context: context,
          analysisType: 'property_monetization'
        }
      });

      if (error) {
        console.error('OpenAI conversation error:', error);
        return generateFallbackResponse(userMessage);
      }

      return {
        response: data.response || "I'm here to help with your property monetization questions.",
        suggestedActions: data.suggestedActions?.map((action: any) => action.action).slice(0, 3) || [],
        detectedAssets: data.detectedAssets?.map((asset: any) => asset.assetType) || []
      };
    } catch (error) {
      console.error('Error generating intelligent response:', error);
      return generateFallbackResponse(userMessage);
    } finally {
      setIsLoading(false);
    }
  }, [propertyData, conversationHistory]);

  const generateFallbackResponse = useCallback((userMessage: string): {
    response: string;
    suggestedActions: string[];
    detectedAssets: string[];
  } => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('requirement') || lowerMessage.includes('need')) {
      if (propertyData && propertyData.availableAssets.length > 0) {
        const topAsset = propertyData.availableAssets[0];
        return {
          response: `For ${topAsset.name}, the main requirements typically include: initial setup verification, any necessary permits or approvals, and connecting with our trusted service providers. The setup process usually takes 1-2 weeks and can generate $${topAsset.monthlyRevenue}/month.`,
          suggestedActions: [
            'Tell me about setup costs',
            'How long does it take?',
            'Connect me with providers'
          ],
          detectedAssets: [topAsset.type]
        };
      }
    }

    if (lowerMessage.includes('start') || lowerMessage.includes('begin')) {
      if (propertyData && propertyData.availableAssets.length > 0) {
        const topAsset = propertyData.availableAssets[0];
        return {
          response: `Let's start with your highest earning potential: ${topAsset.name}. This could generate $${topAsset.monthlyRevenue}/month. I can connect you with our trusted partners to begin the setup process.`,
          suggestedActions: [
            `Set up ${topAsset.name}`,
            'What are the requirements?',
            'Show me other options'
          ],
          detectedAssets: [topAsset.type]
        };
      }
    }

    return {
      response: "I understand you're looking for specific information about your property assets. Could you please be more specific about what you'd like to know?",
      suggestedActions: [
        'What are the requirements?',
        'How do I get started?',
        'Show me my options'
      ],
      detectedAssets: []
    };
  }, [propertyData]);

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
