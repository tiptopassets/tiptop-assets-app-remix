
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
    
    console.log('🎬 [OPENAI WELCOME] Generating welcome message with specific data:', {
      address,
      totalRevenue: totalMonthlyRevenue,
      assetsCount: availableAssets.length,
      topAssets: availableAssets.slice(0, 2).map(a => ({ name: a.name, revenue: a.monthlyRevenue }))
    });

    // Filter assets with actual revenue potential
    const viableAssets = availableAssets.filter(asset => 
      asset.hasRevenuePotential && asset.monthlyRevenue > 0
    );
    
    if (viableAssets.length === 0) {
      return `Hi! I've analyzed your property at **${address}**, but I couldn't find any available assets with monetization potential right now. This could mean your assets are already configured or there may be limited opportunities available. Would you like to tell me more about your property features?`;
    }

    const topAssets = viableAssets.slice(0, 2);
    
    if (topAssets.length === 1) {
      const asset = topAssets[0];
      return `Hi! I've analyzed your property at **${address}** and found a great monetization opportunity with your **${asset.name}**, which could generate **$${asset.monthlyRevenue}/month**. 

Your total earning potential is **$${totalMonthlyRevenue}/month**. Would you like me to help you set up ${asset.name.toLowerCase()} monetization?`;
    }

    const assetList = topAssets
      .map(asset => `**${asset.name}** ($${asset.monthlyRevenue}/month)`)
      .join(' and ');
    
    return `Hi! I've analyzed your property at **${address}** and found excellent monetization opportunities. Your top assets are ${assetList}.

Your total earning potential is **$${totalMonthlyRevenue}/month** across ${availableAssets.length} asset${availableAssets.length === 1 ? '' : 's'}. Which asset would you like to start with?`;
  }, [propertyData]);

  const generateIntelligentResponse = useCallback(async (userMessage: string): Promise<{
    response: string;
    suggestedActions: string[];
    detectedAssets: string[];
  }> => {
    setIsLoading(true);
    
    try {
      // Build context with actual property data
      const context: ConversationContext = {
        propertyData,
        selectedAssets: propertyData?.availableAssets.map(a => a.type) || [],
        journeyStage: 'asset_selection',
        conversationHistory
      };

      console.log('🤖 [OPENAI REQUEST] Sending enhanced context:', {
        hasPropertyData: !!propertyData,
        analysisId: propertyData?.analysisId,
        address: propertyData?.address,
        totalRevenue: propertyData?.totalMonthlyRevenue,
        assetsCount: propertyData?.availableAssets.length,
        specificAssets: propertyData?.availableAssets.map(a => ({ 
          type: a.type, 
          name: a.name,
          revenue: a.monthlyRevenue,
          configured: a.isConfigured
        }))
      });

      const { data, error } = await supabase.functions.invoke('analyze-conversation', {
        body: {
          message: userMessage,
          context: context,
          analysisType: 'property_monetization'
        }
      });

      if (error) {
        console.error('❌ [OPENAI] OpenAI conversation error:', error);
        return generateEnhancedFallbackResponse(userMessage);
      }

      console.log('✅ [OPENAI] Response received:', {
        hasResponse: !!data.response,
        suggestedActionsCount: data.suggestedActions?.length || 0,
        detectedAssetsCount: data.detectedAssets?.length || 0
      });

      return {
        response: data.response || "I'm here to help with your property monetization questions.",
        suggestedActions: data.suggestedActions?.map((action: any) => 
          typeof action === 'string' ? action : action.action
        ).slice(0, 3) || [],
        detectedAssets: data.detectedAssets?.map((asset: any) => 
          typeof asset === 'string' ? asset : asset.assetType
        ) || []
      };
    } catch (error) {
      console.error('❌ [OPENAI] Error generating intelligent response:', error);
      return generateEnhancedFallbackResponse(userMessage);
    } finally {
      setIsLoading(false);
    }
  }, [propertyData, conversationHistory]);

  const generateEnhancedFallbackResponse = useCallback((userMessage: string): {
    response: string;
    suggestedActions: string[];
    detectedAssets: string[];
  } => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (!propertyData || propertyData.availableAssets.length === 0) {
      return {
        response: "I don't have access to your property analysis data yet. Please ensure your property has been analyzed first, or there may be limited monetization opportunities available.",
        suggestedActions: [
          'Analyze my property',
          'View my dashboard',
          'Contact support'
        ],
        detectedAssets: []
      };
    }

    // Use actual property data for enhanced fallback responses
    const topAsset = propertyData.availableAssets[0];
    
    if (lowerMessage.includes('requirement') || lowerMessage.includes('need') || lowerMessage.includes('setup')) {
      return {
        response: `For **${topAsset.name}** at your property on **${propertyData.address}**, the main requirements typically include:

• Initial setup verification and documentation
• Any necessary permits or approvals  
• Connecting with our trusted service providers
• Insurance and safety compliance

The setup process usually takes 1-2 weeks and can generate **$${topAsset.monthlyRevenue}/month** based on your specific property analysis.`,
        suggestedActions: [
          'What are the setup costs?',
          'How long does it take?',
          'Connect me with providers'
        ],
        detectedAssets: [topAsset.type]
      };
    }

    if (lowerMessage.includes('start') || lowerMessage.includes('begin') || lowerMessage.includes('get started')) {
      return {
        response: `Perfect! Let's start with your highest earning potential: **${topAsset.name}**. 

Based on your property analysis at **${propertyData.address}**, this could generate **$${topAsset.monthlyRevenue}/month**. I can connect you with our trusted partners to begin the setup process right away.`,
        suggestedActions: [
          `Set up ${topAsset.name}`,
          'What are the requirements?',
          'Show me other options'
        ],
        detectedAssets: [topAsset.type]
      };
    }

    if (lowerMessage.includes('earn') || lowerMessage.includes('money') || lowerMessage.includes('revenue')) {
      const totalEarnings = propertyData.availableAssets.reduce((sum, asset) => sum + asset.monthlyRevenue, 0);
      return {
        response: `Great question! Based on your property analysis at **${propertyData.address}**, here's your earning potential:

**Total Monthly Revenue: $${totalEarnings}**

Your top opportunities:
${propertyData.availableAssets.slice(0, 3).map(asset => 
  `• **${asset.name}**: $${asset.monthlyRevenue}/month`
).join('\n')}`,
        suggestedActions: [
          'How do I get started?',
          'What are the requirements?',
          'Show me setup timeline'
        ],
        detectedAssets: propertyData.availableAssets.slice(0, 2).map(a => a.type)
      };
    }

    return {
      response: `I'm here to help you monetize your property at **${propertyData.address}**! 

You have **${propertyData.availableAssets.length} available asset${propertyData.availableAssets.length === 1 ? '' : 's'}** with a total potential of **$${propertyData.totalMonthlyRevenue}/month**. 

Could you please be more specific about what you'd like to know? I can help with setup requirements, timelines, costs, or connecting you with service providers.`,
      suggestedActions: [
        'What are the requirements?',
        'How do I get started?',
        'Show me earning potential'
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
