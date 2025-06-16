
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ConversationContext {
  detectedAssets: string[];
  userPreferences: Record<string, any>;
  conversationStage: 'greeting' | 'discovery' | 'recommendation' | 'setup' | 'completion';
  userProfile: {
    experienceLevel: 'beginner' | 'intermediate' | 'advanced';
    primaryGoals: string[];
    propertyType: string;
  };
}

interface AIResponse {
  message: string;
  suggestedActions: string[];
  detectedAssets: string[];
  confidence: number;
}

export const useConversationIntelligence = () => {
  const [context, setContext] = useState<ConversationContext>({
    detectedAssets: [],
    userPreferences: {},
    conversationStage: 'greeting',
    userProfile: {
      experienceLevel: 'beginner',
      primaryGoals: [],
      propertyType: ''
    }
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeUserMessage = useCallback(async (message: string): Promise<AIResponse> => {
    setIsAnalyzing(true);
    
    try {
      console.log('Analyzing message:', message);
      
      const { data, error } = await supabase.functions.invoke('analyze-conversation', {
        body: {
          message,
          context,
          analysisType: 'comprehensive'
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to analyze conversation');
      }

      console.log('Analysis result:', data);

      // Update context based on AI analysis
      if (data && typeof data === 'object') {
        setContext(prev => ({
          ...prev,
          detectedAssets: data.detectedAssets ? [...new Set([...prev.detectedAssets, ...data.detectedAssets])] : prev.detectedAssets,
          conversationStage: data.suggestedStage || prev.conversationStage,
          userProfile: {
            ...prev.userProfile,
            ...(data.userProfileUpdates || {})
          }
        }));

        return {
          message: data.response || "I understand you're interested in monetizing your property. Could you tell me more about what assets you have available?",
          suggestedActions: data.suggestedActions || ['Ask about rooftop space', 'Ask about parking', 'Ask about internet speed'],
          detectedAssets: data.detectedAssets || [],
          confidence: data.confidence || 0.8
        };
      } else {
        throw new Error('Invalid response format from analysis service');
      }
    } catch (error) {
      console.error('Error analyzing conversation:', error);
      
      // Provide intelligent fallback based on message content
      const fallbackAssets = detectAssetsLocally(message);
      const fallbackResponse = generateFallbackResponse(message, fallbackAssets);
      
      return {
        message: fallbackResponse,
        suggestedActions: generateFallbackActions(fallbackAssets),
        detectedAssets: fallbackAssets,
        confidence: 0.5
      };
    } finally {
      setIsAnalyzing(false);
    }
  }, [context]);

  const generateSmartResponse = useCallback(async (userInput: string) => {
    const analysis = await analyzeUserMessage(userInput);
    
    // Generate contextual follow-up questions
    const followUpQuestions = generateFollowUpQuestions(context.conversationStage, analysis.detectedAssets);
    
    return {
      ...analysis,
      followUpQuestions
    };
  }, [analyzeUserMessage, context.conversationStage]);

  const generateFollowUpQuestions = (stage: string, assets: string[]) => {
    const questionMap: Record<string, string[]> = {
      greeting: [
        "What type of property do you own?",
        "What's your main goal for generating income?",
        "Are you looking for passive or active income opportunities?"
      ],
      discovery: [
        "How much outdoor space do you have?",
        "What's your average internet speed?",
        "Do you have any parking spaces available?"
      ],
      recommendation: [
        "Which opportunity interests you most?",
        "What's your preferred setup timeline?",
        "Do you have a budget in mind for initial setup?"
      ]
    };

    return questionMap[stage] || questionMap.discovery;
  };

  // Local fallback asset detection
  const detectAssetsLocally = (message: string): string[] => {
    const assetKeywords = {
      'rooftop': ['roof', 'rooftop', 'solar', 'panels'],
      'parking': ['parking', 'driveway', 'garage', 'car space'],
      'internet': ['internet', 'wifi', 'broadband', 'connection'],
      'pool': ['pool', 'swimming', 'spa'],
      'storage': ['storage', 'basement', 'attic', 'shed'],
      'garden': ['garden', 'yard', 'outdoor space', 'backyard']
    };

    const detectedAssets: string[] = [];
    const lowerMessage = message.toLowerCase();

    for (const [asset, keywords] of Object.entries(assetKeywords)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        detectedAssets.push(asset);
      }
    }

    return detectedAssets;
  };

  const generateFallbackResponse = (message: string, assets: string[]): string => {
    if (assets.length > 0) {
      const assetNames = assets.map(asset => asset.replace('_', ' ')).join(', ');
      return `I can see you mentioned ${assetNames}. These are great assets for monetization! Let me help you explore the opportunities for each of these.`;
    }
    
    return "I understand you're interested in monetizing your property. Could you tell me more about what assets you have available, such as rooftop space, parking, or high-speed internet?";
  };

  const generateFallbackActions = (assets: string[]): string[] => {
    if (assets.includes('rooftop')) {
      return ['Tell me about solar potential', 'What roof size do you have?', 'Is your roof suitable for solar?'];
    }
    
    if (assets.includes('parking')) {
      return ['How many parking spaces?', 'Is parking in demand in your area?', 'What are local parking rates?'];
    }
    
    return ['Ask about rooftop space', 'Ask about parking', 'Ask about internet speed'];
  };

  return {
    context,
    analyzeUserMessage,
    generateSmartResponse,
    isAnalyzing,
    updateContext: setContext
  };
};
