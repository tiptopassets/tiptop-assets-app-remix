import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, ExternalLink, Sparkles, Clock, DollarSign, Star, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { PropertyAnalysisData } from '@/hooks/useUserPropertyAnalysis';
import { useOpenAIConversation } from '@/hooks/useOpenAIConversation';
import { generatePartnerRecommendations, initializePartnerIntegration } from '@/services/partnerRecommendationService';
import PartnerRecommendationCard from './PartnerRecommendationCard';
import AssetPartnerCarousel from './AssetPartnerCarousel';
import type { PartnerRecommendation } from '@/services/partnerRecommendationService';

interface EnhancedChatInterfaceProps {
  onAssetDetected?: (assets: string[]) => void;
  onConversationStageChange?: (stage: string) => void;
  propertyData?: PropertyAnalysisData | null;
  onSendMessageReady?: (sendMessage: (message: string) => Promise<void>) => void;
}

const EnhancedChatInterface = ({ 
  onAssetDetected, 
  onConversationStageChange,
  propertyData,
  onSendMessageReady
}: EnhancedChatInterfaceProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [recommendations, setRecommendations] = useState<PartnerRecommendation[]>([]);
  const [integratingPartners, setIntegratingPartners] = useState<Set<string>>(new Set());
  const [completedIntegrations, setCompletedIntegrations] = useState<Set<string>>(new Set());

  const {
    messages,
    input,
    setInput,
    handleSendMessage,
    loading: chatLoading,
    error: chatError,
  } = useOpenAIConversation({
    onAssetDetected: (assets: string[]) => {
      console.log('Assets detected in chat:', assets);
      onAssetDetected?.(assets);
    },
    onConversationStageChange: (stage: string) => {
      console.log('Conversation stage changed:', stage);
      onConversationStageChange?.(stage);
    },
    propertyData: propertyData,
    onRecommendationsGenerated: (recs: PartnerRecommendation[]) => {
      console.log('Recommendations generated:', recs);
      setRecommendations(recs);
    }
  });

  useEffect(() => {
    if (onSendMessageReady) {
      onSendMessageReady(handleSendMessage);
    }
  }, [handleSendMessage, onSendMessageReady]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handlePartnerIntegration = async (partnerName: string, referralLink: string) => {
    if (!user?.id || !propertyData?.analysisId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to integrate with partners.",
        variant: "destructive"
      });
      return;
    }

    setIntegratingPartners(prev => new Set([...prev, partnerName]));

    try {
      const result = await initializePartnerIntegration(
        user.id,
        propertyData.analysisId,
        partnerName,
        referralLink
      );

      if (result) {
        setCompletedIntegrations(prev => new Set([...prev, partnerName]));
        toast({
          title: "Integration Started",
          description: `Successfully initiated setup for ${partnerName}. Check your email for next steps.`,
        });

        // Open the referral link
        window.open(referralLink, '_blank', 'noopener,noreferrer');
      } else {
        throw new Error('Failed to initialize integration');
      }
    } catch (error) {
      console.error('Partner integration error:', error);
      toast({
        title: "Integration Error",
        description: `Failed to start integration with ${partnerName}. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIntegratingPartners(prev => {
        const newSet = new Set(prev);
        newSet.delete(partnerName);
        return newSet;
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 px-4">
        <div className="max-w-4xl mx-auto space-y-4 py-4">
          {messages.map((message, index) => (
            <div key={index} className="flex flex-col">
              <div className={`flex items-start gap-3 ${message.role === 'user' ? 'self-end' : 'self-start'}`}>
                {message.role === 'bot' && (
                  <Bot className="w-5 h-5 text-tiptop-purple flex-shrink-0" />
                )}
                {message.role === 'user' && (
                  <User className="w-5 h-5 text-blue-500 flex-shrink-0" />
                )}
                <Card className={`w-fit max-w-[80%] break-words border-0 shadow-md ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-100'}`}>
                  <CardContent className="p-3">
                    <p className="text-sm">{message.content}</p>
                    <div className="text-xs text-gray-400 mt-1 text-right">{formatTimestamp(message.timestamp)}</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
          
          {recommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Recommended Partner Platforms
                </h3>
                <p className="text-gray-400 text-sm">
                  Based on your property analysis, here are the best monetization options:
                </p>
              </div>
              
              <div className="overflow-x-auto pb-4">
                <div className="flex gap-4 min-w-max px-2">
                  {recommendations.map((recommendation) => (
                    <div key={recommendation.id} className="flex-shrink-0 w-80">
                      <PartnerRecommendationCard
                        recommendation={recommendation}
                        onIntegrate={handlePartnerIntegration}
                        isIntegrating={integratingPartners.has(recommendation.partner_name)}
                        isCompleted={completedIntegrations.has(recommendation.partner_name)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {propertyData?.selectedAssets && propertyData.selectedAssets.length > 0 && (
            <AssetPartnerCarousel
              selectedAssets={propertyData.selectedAssets}
              onPartnerClick={handlePartnerIntegration}
            />
          )}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>
    </div>
  );
};

export default EnhancedChatInterface;
