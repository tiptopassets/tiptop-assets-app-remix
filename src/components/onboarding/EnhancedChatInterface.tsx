import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocalChat } from '@/hooks/useLocalChat';
import { PropertyAnalysisData } from '@/hooks/useUserPropertyAnalysis';
import { PartnerIntegrationService } from '@/services/partnerIntegrationService';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, User, ExternalLink, DollarSign, Clock, CheckCircle, Star } from 'lucide-react';
import PartnerRecommendationCard from './PartnerRecommendationCard';
import MessageContent from './MessageContent';

interface ExtendedPropertyData extends PropertyAnalysisData {
  selectedAssets?: Array<{
    asset_type: string;
    asset_data: any;
  }>;
}

interface EnhancedChatInterfaceProps {
  onAssetDetected: (assets: string[]) => void;
  onConversationStageChange: (stage: string) => void;
  propertyData: ExtendedPropertyData | null;
  onSendMessageReady?: (sendMessage: (message: string) => Promise<void>) => void;
  onInteractionTriggered?: () => void;
}

const EnhancedChatInterface = ({ 
  onAssetDetected, 
  onConversationStageChange, 
  propertyData,
  onSendMessageReady,
  onInteractionTriggered
}: EnhancedChatInterfaceProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    getContext
  } = useLocalChat(propertyData);

  console.log('🎯 [CHAT_INTERFACE] Component rendered with:', {
    messageCount: messages.length,
    isLoading,
    hasError: !!error,
    hasSendMessage: !!sendMessage,
    hasPropertyData: !!propertyData
  });

  // Provide sendMessage function to parent component once ready
  useEffect(() => {
    console.log('🔄 [CHAT_INTERFACE] Setting up sendMessage callback:', {
      hasCallback: !!onSendMessageReady,
      hasSendMessage: !!sendMessage,
      readyToConnect: !!(onSendMessageReady && sendMessage)
    });
    
    if (onSendMessageReady && sendMessage) {
      console.log('✅ [CHAT_INTERFACE] Providing sendMessage to parent');
      onSendMessageReady(sendMessage);
    }
  }, [onSendMessageReady, sendMessage]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'nearest'
    });
  }, [messages]);

  // Update detected assets based on chat context
  useEffect(() => {
    const context = getContext();
    if (context.detectedAssets.length > 0) {
      onAssetDetected(context.detectedAssets);
    }
    if (context.currentStage) {
      onConversationStageChange(context.currentStage);
    }
  }, [messages, onAssetDetected, onConversationStageChange, getContext]);

  const handlePartnerReferral = useCallback((platformId: string) => {
    // Trigger interaction when partner referral is clicked
    if (onInteractionTriggered) {
      onInteractionTriggered();
    }
    PartnerIntegrationService.openReferralLink(platformId, user?.id);
  }, [user?.id, onInteractionTriggered]);

  const handlePartnerIntegration = useCallback(async (partnerName: string, referralLink: string) => {
    console.log('🔗 [CHAT_INTERFACE] Partner integration requested:', { partnerName, referralLink });
    
    // Trigger interaction when partner integration is clicked (like "Manage" button)
    if (onInteractionTriggered) {
      onInteractionTriggered();
    }
    
    // Track the click and open the referral link
    if (referralLink) {
      window.open(referralLink, '_blank');
    }
  }, [onInteractionTriggered]);

  // Helper function to normalize setup complexity
  const normalizeSetupComplexity = (setupTime: string): "easy" | "medium" | "hard" => {
    if (setupTime.includes('5 min') || setupTime.includes('15 min') || setupTime.includes('20 min')) {
      return 'easy';
    } else if (setupTime.includes('30 min') || setupTime.includes('1 hour') || setupTime.includes('1-2 hour')) {
      return 'medium';
    } else {
      return 'hard';
    }
  };

  // Render partner cards section
  const renderPartnerCards = (partnerOptions: any[], messageIndex: number) => {
    const partnerRecommendations = partnerOptions.map((partner) => {
      // Transform partner data to match PartnerRecommendationCard interface
      return {
        id: partner.id,
        partner_name: partner.name,
        asset_type: partner.assetType || 'general',
        estimated_monthly_earnings: partner.earningRange?.min || 0,
        priority_score: partner.priority === 1 ? 10 : 7,
        setup_complexity: normalizeSetupComplexity(partner.setupTime || ''),
        recommendation_reason: partner.description,
        referral_link: partner.referralLink || `#${partner.id}`
      };
    });

    return (
      <>
        {/* Desktop Version - Inside conversation */}
        <div className="hidden md:block mt-4">
          <div className="flex overflow-x-auto gap-2 pb-2 -mx-1 px-1">
            {partnerRecommendations.map((partner) => (
              <PartnerRecommendationCard
                key={partner.id}
                recommendation={partner}
                onIntegrate={handlePartnerIntegration}
                isIntegrating={false}
                isCompleted={false}
              />
            ))}
          </div>
        </div>

        {/* Mobile Version - Full width, breaking out of conversation */}
        <div 
          key={`mobile-partners-${messageIndex}`}
          className="md:hidden relative -mx-3 md:-mx-6 mt-4"
        >
          <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
            <div className="flex overflow-x-auto gap-3 px-4 pb-2">
              {partnerRecommendations.map((partner) => (
                <div key={partner.id} className="w-56 min-w-56 flex-shrink-0">
                  <PartnerRecommendationCard
                    recommendation={partner}
                    onIntegrate={handlePartnerIntegration}
                    isIntegrating={false}
                    isCompleted={false}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-xl relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-20" />
      

      {/* Messages Area - Clean scrollable zone with padding for fixed components */}
      <div className="flex-1 overflow-y-auto px-3 md:px-6 pt-6 md:pt-8 pb-40 md:pb-48 relative z-10">
        {messages.length === 0 && !isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="p-4 rounded-3xl glass-effect glow-effect w-fit mx-auto mb-6">
              <img 
                src="/lovable-uploads/e24798be-80af-43c7-98ff-618e9adc0ee4.png" 
                alt="AI Assistant" 
                className="h-12 w-12 rounded-full object-cover"
              />
            </div>
            <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              What asset do you want to start monetizing?
            </h3>
            <p className="text-muted-foreground/80 text-sm max-w-md mx-auto">
              I'll help you maximize earnings from your property assets through smart partnerships.
            </p>
          </motion.div>
        )}

        {/* Modern Error state */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center mb-6"
          >
            <div className="glass-effect border border-red-200/30 text-red-600 rounded-2xl px-6 py-4 max-w-md backdrop-blur-lg">
              <div className="flex items-center mb-3">
                <div className="p-2 rounded-xl bg-red-100/20 mr-3">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div className="font-medium">Connection Issue</div>
              </div>
              <div className="text-sm mb-4 opacity-90">{error}</div>
              <div className="flex gap-3">
                <button 
                  onClick={clearChat}
                  className="text-sm font-medium hover:opacity-70 transition-opacity"
                >
                  Clear Chat
                </button>
                {!user && (
                  <button 
                    onClick={() => navigate('/auth')}
                    className="text-sm font-medium hover:opacity-70 transition-opacity"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        <div className="space-y-3 md:space-y-4">
          <AnimatePresence>
            {messages.map((message, messageIndex) => (
              <React.Fragment key={message.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-start gap-2 md:gap-3 ${
                    message.role === 'assistant' ? 'justify-start' : 'justify-end'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl glass-effect glow-effect flex items-center justify-center flex-shrink-0 border border-primary/20">
                      <img 
                        src="/lovable-uploads/e24798be-80af-43c7-98ff-618e9adc0ee4.png" 
                        alt="AI Assistant" 
                        className="h-4 w-4 md:h-6 md:w-6 rounded-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className={`max-w-[85%] md:max-w-[80%] rounded-xl md:rounded-2xl p-3 md:p-4 ${
                    message.role === 'assistant'
                      ? 'bg-background/40 backdrop-blur-xl border border-border/20 text-foreground shadow-sm'
                      : 'bg-primary/90 backdrop-blur-xl text-primary-foreground ml-auto shadow-lg border border-primary/30'
                  }`}>
                    <div className="text-xs md:text-sm">
                      <MessageContent content={message.content} />
                    </div>
                    
                    {/* Asset Cards Display */}
                    {message.assetCards && message.assetCards.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {message.assetCards.map((asset) => (
                          <Card 
                            key={asset.id} 
                            className="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/30"
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-sm">{asset.name}</h4>
                                <Badge variant="secondary" className="text-xs">
                                  <DollarSign className="w-3 h-3 mr-1" />
                                  ${asset.monthlyRevenue}/month potential
                                </Badge>
                              </div>
                              
                              <div className="flex items-center text-xs text-muted-foreground mb-3">
                                <Clock className="w-3 h-3 mr-1" />
                                {asset.setupTime} setup time
                              </div>

                              {asset.partnerInfo && (
                                <div className="mb-3">
                                  <p className="text-xs font-medium text-muted-foreground mb-1">
                                    Platform: {asset.partnerInfo.platform}
                                  </p>
                                  <div className="text-xs text-muted-foreground">
                                    <p className="mb-1">Requirements:</p>
                                    <ul className="list-disc list-inside space-y-0.5 ml-2">
                                      {asset.requirements.slice(0, 3).map((req, idx) => (
                                        <li key={idx}>{req}</li>
                                      ))}
                                      {asset.requirements.length > 3 && (
                                        <li className="text-primary">...and {asset.requirements.length - 3} more</li>
                                      )}
                                    </ul>
                                  </div>
                                </div>
                              )}

                              <Button 
                                size="sm" 
                                className="w-full" 
                                variant="outline"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Start Setup
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    <div className={`text-xs mt-2 opacity-70`}>
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                    
                    {/* Add partner referral buttons for assistant messages */}
                    {message.role === 'assistant' && message.content.includes('Ready to start') && !message.assetCards && !message.partnerOptions && (
                      <div className="mt-3 space-y-2">
                        {PartnerIntegrationService.getAllPlatforms().map(platform => (
                          <Button
                            key={platform.id}
                            size="sm"
                            onClick={() => handlePartnerReferral(platform.id)}
                            className="mr-2 mb-2"
                            variant="outline"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Open {platform.name}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <User className="h-4 w-4 md:h-5 md:w-5 text-primary-foreground" />
                    </div>
                  )}
                </motion.div>

                {/* Partner Options Display - Rendered separately for mobile full-width */}
                {message.partnerOptions && message.partnerOptions.length > 0 && 
                  renderPartnerCards(message.partnerOptions, messageIndex)
                }
              </React.Fragment>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-2 md:gap-3"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl glass-effect glow-effect flex items-center justify-center flex-shrink-0 border border-primary/20">
                <img 
                  src="/lovable-uploads/e24798be-80af-43c7-98ff-618e9adc0ee4.png" 
                  alt="AI Assistant" 
                  className="h-4 w-4 md:h-6 md:w-6 rounded-full object-cover"
                />
              </div>
              <div className="glass-effect rounded-xl md:rounded-2xl p-3 md:p-4 border border-border/30">
                <div className="flex items-center space-x-2">
                  <div className="animate-pulse flex space-x-1">
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
};

export default EnhancedChatInterface;
