
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
      const { data, error } = await supabase.functions.invoke('analyze-conversation', {
        body: {
          message,
          context,
          analysisType: 'comprehensive'
        }
      });

      if (error) throw error;

      // Update context based on AI analysis
      setContext(prev => ({
        ...prev,
        detectedAssets: [...new Set([...prev.detectedAssets, ...data.detectedAssets])],
        conversationStage: data.suggestedStage || prev.conversationStage,
        userProfile: {
          ...prev.userProfile,
          ...data.userProfileUpdates
        }
      }));

      return {
        message: data.response,
        suggestedActions: data.suggestedActions || [],
        detectedAssets: data.detectedAssets || [],
        confidence: data.confidence || 0.8
      };
    } catch (error) {
      console.error('Error analyzing conversation:', error);
      return {
        message: "I understand you're interested in monetizing your property. Could you tell me more about what assets you have available?",
        suggestedActions: ['Ask about rooftop space', 'Ask about parking', 'Ask about internet speed'],
        detectedAssets: [],
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

  return {
    context,
    analyzeUserMessage,
    generateSmartResponse,
    isAnalyzing,
    updateContext: setContext
  };
};
