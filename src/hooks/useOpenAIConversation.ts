
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
    console.log('🎬 [OPENAI WELCOME] Generating welcome message with data:', {
      hasPropertyData: !!propertyData,
      address: propertyData?.address,
      totalRevenue: propertyData?.totalMonthlyRevenue,
      assetsCount: propertyData?.availableAssets.length
    });

    if (!propertyData) {
      return "Hi! I'm your AI property assistant. I'm ready to help you monetize your property, but I need to load your property analysis first. Please wait a moment...";
    }

    const { address, totalMonthlyRevenue, availableAssets } = propertyData;
    
    // Filter assets with actual revenue potential
    const viableAssets = availableAssets.filter(asset => 
      asset.hasRevenuePotential && asset.monthlyRevenue > 0
    );
    
    console.log('📊 [OPENAI WELCOME] Viable assets found:', {
      total: availableAssets.length,
      viable: viableAssets.length,
      topAssets: viableAssets.slice(0, 2).map(a => ({ name: a.name, revenue: a.monthlyRevenue }))
    });
    
    if (viableAssets.length === 0) {
      return `Hi! I've analyzed your property at **${address}**, but I couldn't find any available assets with monetization potential right now. This could mean your assets are already configured or there may be limited opportunities available. Would you like to tell me more about your property features so I can help you explore other options?`;
    }

    const topAssets = viableAssets.slice(0, 2);
    
    if (topAssets.length === 1) {
      const asset = topAssets[0];
      return `Hi! I'm your AI property assistant and I've analyzed your property at **${address}**! 🏠

I found a great monetization opportunity with your **${asset.name}**, which could generate **$${asset.monthlyRevenue}/month**.

Your total earning potential is **$${totalMonthlyRevenue}/month**. I'm here to help you set up ${asset.name?.toLowerCase() || 'asset'} monetization and guide you through the entire process. What would you like to know?`;
    }

    const assetList = topAssets
      .map(asset => `**${asset.name}** ($${asset.monthlyRevenue}/month)`)
      .join(' and ');
    
    return `Hi! I'm your AI property assistant and I've analyzed your property at **${address}**! 🏠

I found excellent monetization opportunities. Your top assets are ${assetList}.

Your total earning potential is **$${totalMonthlyRevenue}/month** across ${availableAssets.length} asset${availableAssets.length === 1 ? '' : 's'}. I'm here to guide you through setting up any of these assets and connecting you with trusted service providers. Which asset interests you most?`;
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
        assetsCount: propertyData?.availableAssets.length
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
    
    console.log('🔄 [OPENAI FALLBACK] Generating fallback response:', {
      hasPropertyData: !!propertyData,
      message: userMessage.substring(0, 50) + '...',
      address: propertyData?.address
    });

    if (!propertyData || propertyData.availableAssets.length === 0) {
      return {
        response: "I don't have access to your property analysis data yet. Please ensure your property has been analyzed first, or there may be limited monetization opportunities available. Let me know if you'd like me to help you get started with a property analysis.",
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
    const totalEarnings = propertyData.availableAssets.reduce((sum, asset) => sum + asset.monthlyRevenue, 0);
    
    if (lowerMessage.includes('requirement') || lowerMessage.includes('need') || lowerMessage.includes('setup')) {
      return {
        response: `Great question! For **${topAsset.name}** at your property on **${propertyData.address}**, the main requirements typically include:

• **Initial setup verification** - Ensuring your property meets basic requirements
• **Documentation and permits** - Any necessary approvals for your area
• **Service provider connection** - I'll connect you with our trusted partners
• **Insurance and safety compliance** - Protecting your investment

The setup process usually takes 1-2 weeks and can generate **$${topAsset.monthlyRevenue}/month** based on your specific property analysis. Would you like me to start connecting you with our service providers?`,
        suggestedActions: [
          'Connect me with providers',
          'What are the setup costs?',
          'How long does it take?'
        ],
        detectedAssets: [topAsset.type]
      };
    }

    if (lowerMessage.includes('start') || lowerMessage.includes('begin') || lowerMessage.includes('get started')) {
      return {
        response: `Perfect! Let's start with your highest earning potential: **${topAsset.name}** at **${propertyData.address}**! 🚀

This asset could generate **$${topAsset.monthlyRevenue}/month** for you. I can help you:

• **Connect with trusted service providers** in your area
• **Guide you through the setup process** step by step  
• **Handle all the paperwork and requirements**
• **Monitor your progress** until you're earning

Ready to get started? I can have you connected with providers within minutes!`,
        suggestedActions: [
          `Set up ${topAsset.name} now`,
          'What are the requirements?',
          'Show me other options'
        ],
        detectedAssets: [topAsset.type]
      };
    }

    if (lowerMessage.includes('earn') || lowerMessage.includes('money') || lowerMessage.includes('revenue') || lowerMessage.includes('income')) {
      return {
        response: `Excellent question! Based on your property analysis at **${propertyData.address}**, here's your complete earning potential: 💰

**Total Monthly Revenue: $${totalEarnings}**

Your monetization opportunities:
${propertyData.availableAssets.slice(0, 4).map((asset, index) => 
  `${index + 1}. **${asset.name}**: $${asset.monthlyRevenue}/month`
).join('\n')}

${propertyData.availableAssets.length > 4 ? `\n*Plus ${propertyData.availableAssets.length - 4} more opportunities...*` : ''}

This is all passive income you could be generating right now! Which asset would you like to start with?`,
        suggestedActions: [
          'Start with highest earner',
          'Show me all options',
          'What are the requirements?'
        ],
        detectedAssets: propertyData.availableAssets.slice(0, 2).map(a => a.type)
      };
    }

    if (lowerMessage.includes('how') || lowerMessage.includes('process') || lowerMessage.includes('work')) {
      return {
        response: `Great question! Here's how I help you monetize your property at **${propertyData.address}**:

**🎯 Step 1: Choose Your Asset**
You have ${propertyData.availableAssets.length} available asset${propertyData.availableAssets.length === 1 ? '' : 's'} with $${totalEarnings}/month total potential.

**🤝 Step 2: Connect with Providers**  
I'll connect you with pre-vetted, trusted service providers in your area.

**📋 Step 3: Setup & Requirements**
I'll guide you through all paperwork, permits, and setup requirements.

**💰 Step 4: Start Earning**
Once setup is complete, you start earning passive income!

The entire process typically takes 1-3 weeks depending on the asset. Your highest earner is **${topAsset.name}** at $${topAsset.monthlyRevenue}/month. Ready to begin?`,
        suggestedActions: [
          `Start ${topAsset.name} setup`,
          'Connect me with providers',
          'What are the costs?'
        ],
        detectedAssets: [topAsset.type]
      };
    }

    return {
      response: `I'm here to help you monetize your property at **${propertyData.address}**! 🏠

You have **${propertyData.availableAssets.length} available asset${propertyData.availableAssets.length === 1 ? '' : 's'}** with a total potential of **$${totalEarnings}/month**.

Your top opportunity is **${topAsset.name}** which could generate **$${topAsset.monthlyRevenue}/month**.

I can help you with:
• Setting up any of your assets
• Connecting you with trusted service providers  
• Understanding requirements and timelines
• Handling paperwork and permits

What would you like to know more about?`,
      suggestedActions: [
        'How do I get started?',
        'What are the requirements?',
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
