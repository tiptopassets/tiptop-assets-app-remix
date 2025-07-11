import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLocalChat } from '@/hooks/useLocalChat';
import { PropertyAnalysisData } from '@/hooks/useUserPropertyAnalysis';

interface ExtendedPropertyData extends PropertyAnalysisData {
  selectedAssets?: Array<{
    asset_type: string;
    asset_data: any;
  }>;
}
import { PartnerIntegrationService } from '@/services/partnerIntegrationService';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Wifi, Bot, User, Send, ExternalLink, DollarSign, Clock, CheckCircle, Star } from 'lucide-react';
import { AssetCard, PartnerOption } from '@/services/localChatService';
import AssetPartnerCarousel from './AssetPartnerCarousel';

interface EnhancedChatInterfaceProps {
  onAssetDetected: (assets: string[]) => void;
  onConversationStageChange: (stage: string) => void;
  propertyData: ExtendedPropertyData | null;
  onSendMessageReady?: (sendMessage: (message: string) => Promise<void>) => void;
}

const EnhancedChatInterface = ({ 
  onAssetDetected, 
  onConversationStageChange, 
  propertyData,
  onSendMessageReady 
}: EnhancedChatInterfaceProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);

  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    getContext
  } = useLocalChat(propertyData);

  // Provide sendMessage function to parent component once ready
  useEffect(() => {
    if (onSendMessageReady) {
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

  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isLoading) return;

    const message = inputMessage.trim();
    setInputMessage('');
    setShowSuggestions(false);

    console.log('💬 [CHAT] Sending message:', message);

    try {
      await sendMessage(message);
    } catch (error) {
      console.error('❌ [CHAT] Error sending message:', error);
    }
  }, [inputMessage, isLoading, sendMessage]);

  const handleSuggestedAction = useCallback(async (action: string) => {
    if (isLoading) return;
    
    console.log('🎯 [CHAT] Suggested action selected:', action);
    // Don't hide suggestions to keep partner bubbles visible
    
    try {
      await sendMessage(action);
    } catch (error) {
      console.error('❌ [CHAT] Error with suggested action:', error);
    }
  }, [isLoading, sendMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handlePartnerReferral = useCallback((platformId: string) => {
    PartnerIntegrationService.openReferralLink(platformId, user?.id);
  }, [user?.id]);

  // Connection status indicator
  const getConnectionStatus = () => {
    if (isLoading) return { icon: Bot, label: 'Thinking...', color: 'text-blue-600 border-blue-200' };
    if (error) return { icon: AlertCircle, label: 'Error', color: 'text-red-600 border-red-200' };
    return { icon: Wifi, label: 'Ready', color: 'text-green-600 border-green-200' };
  };

  const connectionStatus = getConnectionStatus();

  // Quick start suggestions based on property data
  const quickStartSuggestions = React.useMemo(() => {
    if (!propertyData || !propertyData.availableAssets.length) {
      return [
        'Tell me about property monetization',
        'What services are available?',
        'How can I start earning money?'
      ];
    }

    const topAssets = propertyData.availableAssets
      .filter(asset => asset.hasRevenuePotential)
      .slice(0, 3);

    return topAssets.length > 0 
      ? topAssets.map(asset => `Set up my ${asset.name?.toLowerCase?.() || 'asset'}`)
      : [
          'What are my options?',
          'How do I get started?',
          'Show me requirements'
        ];
  }, [propertyData]);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-purple-50">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Property Assistant</h3>
            <p className="text-sm text-gray-600">
              {propertyData ? `Helping you monetize ${propertyData.address}` : 'Ready to help with property monetization'}
              {!user && (
                <span className="ml-2 text-xs text-amber-600">
                  • Sign in for full features
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className={connectionStatus.color}>
              <connectionStatus.icon className="w-2 h-2 mr-1" />
              {connectionStatus.label}
            </Badge>
            {!user && (
              <Button 
                onClick={() => navigate('/auth')} 
                size="sm" 
                variant="outline"
                className="text-xs"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-muted-foreground py-8">
            <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>Hi! I'm your property monetization assistant.</p>
            <p className="text-sm mt-2">I'll help you set up partner platforms to start earning money from your property!</p>
          </div>
        )}

        {/* Enhanced Error state */}
        {error && (
          <div className="flex justify-center mb-4">
            <div className="bg-destructive/10 text-destructive rounded-lg px-4 py-3 border border-destructive/20 max-w-md">
              <div className="flex items-center mb-2">
                <AlertCircle className="w-4 h-4 mr-2" />
                <div className="text-sm font-medium">Assistant Error</div>
              </div>
              <div className="text-sm mb-3">{error}</div>
              <div className="flex gap-2">
                <button 
                  onClick={clearChat}
                  className="text-xs underline"
                >
                  Clear Chat
                </button>
                {!user && (
                  <button 
                    onClick={() => navigate('/auth')}
                    className="text-xs underline ml-2"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex items-start gap-3 ${
                  message.role === 'assistant' ? 'justify-start' : 'justify-end'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                
                <div className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'assistant'
                    ? 'bg-muted text-foreground'
                    : 'bg-primary text-primary-foreground ml-auto'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Asset Cards Display */}
                  {message.assetCards && message.assetCards.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {message.assetCards.map((asset) => (
                        <Card 
                          key={asset.id} 
                          className="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/30"
                          onClick={() => handleSuggestedAction(`Set up my ${asset.name?.toLowerCase?.() || 'asset'}`)}
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
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSuggestedAction(`Set up my ${asset.name?.toLowerCase?.() || 'asset'}`);
                              }}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Start Setup
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Partner Options Display */}
                  {message.partnerOptions && message.partnerOptions.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {message.partnerOptions.map((partner) => (
                        <Card 
                          key={partner.id} 
                          className="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/30"
                          onClick={() => handlePartnerReferral(partner.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-sm">{partner.name}</h4>
                                {partner.priority === 1 && (
                                  <Badge variant="default" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
                                    <Star className="w-3 h-3 mr-1 fill-current" />
                                    Recommended
                                  </Badge>
                                )}
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                <DollarSign className="w-3 h-3 mr-1" />
                                ${partner.earningRange.min}-${partner.earningRange.max}/month
                              </Badge>
                            </div>
                            
                            <p className="text-xs text-muted-foreground mb-3">{partner.description}</p>
                            
                            <div className="flex items-center text-xs text-muted-foreground mb-3">
                              <Clock className="w-3 h-3 mr-1" />
                              {partner.setupTime} setup time
                            </div>

                            <div className="mb-3">
                              <p className="text-xs font-medium text-muted-foreground mb-1">Key Requirements:</p>
                              <ul className="list-disc list-inside space-y-0.5 ml-2 text-xs text-muted-foreground">
                                {partner.requirements.slice(0, 3).map((req, idx) => (
                                  <li key={idx}>{req}</li>
                                ))}
                                {partner.requirements.length > 3 && (
                                  <li className="text-primary">...and {partner.requirements.length - 3} more</li>
                                )}
                              </ul>
                            </div>

                            <Button 
                              size="sm" 
                              className="w-full" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePartnerReferral(partner.id);
                              }}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Start with {partner.name}
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
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </div>
            </motion.div>
          )}

          {/* Quick Start Suggestions */}
          {showSuggestions && messages.length <= 1 && propertyData && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">
                  Click to start earning money:
                  {!user && (
                    <span className="block text-xs text-amber-600 mt-1">
                      Sign in to save progress and track earnings
                    </span>
                  )}
                </p>
                <div className="grid gap-2">
                  {propertyData.availableAssets.filter(a => a.hasRevenuePotential).slice(0, 3).map((asset) => (
                    <Button
                      key={asset.type}
                      variant="outline"
                      className="h-auto p-3 justify-start hover:bg-tiptop-purple hover:text-white transition-colors"
                      onClick={() => handleSuggestedAction(`I want to set up my ${asset.name?.toLowerCase?.() || 'asset'}. What do I need to get started?`)}
                      disabled={isLoading}
                    >
                      <div className="text-left">
                        <div className="font-medium">{asset.name}</div>
                        <div className="text-xs opacity-70">${asset.monthlyRevenue}/month potential</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Enhanced Input Area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              !isLoading 
                ? "Ask me about earning money from your property..." 
                : "Assistant is thinking..."
            }
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Quick suggestions and partner bubbles */}
        {showSuggestions && !isLoading && (
          <div className="mt-3 flex flex-wrap gap-2">
            {quickStartSuggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestedAction(suggestion)}
                disabled={isLoading}
                className="text-xs"
              >
                {suggestion}
              </Button>
            ))}
            
            {/* Partner bubbles for selected assets - grouped by asset type */}
            {propertyData?.selectedAssets && (() => {
              // Group assets by type to avoid duplicates  
              const assetGroups = propertyData.selectedAssets.reduce((groups, selection) => {
                const assetType = selection.asset_type;
                const getAssetDisplayName = (type: string): string => {
                  const cleanType = type?.toLowerCase?.() || 'asset';
                  const displayNames: Record<string, string> = {
                    'internet': 'Internet Bandwidth Sharing',
                    'bandwidth': 'Internet Bandwidth Sharing',
                    'wifi': 'Internet Bandwidth Sharing',
                    'pool': 'Swimming Pool',
                    'swimming_pool': 'Swimming Pool',
                    'parking': 'Parking Space',
                    'driveway': 'Parking Space', 
                    'storage': 'Storage Space',
                    'garage': 'Storage Space',
                    'basement': 'Storage Space',
                    'event_space': 'Event Space Rental',
                    'event space rental': 'Event Space Rental',
                    'event_space_rental': 'Event Space Rental',
                    'home_gym': 'Home Gym Rental',
                    'home gym rental': 'Home Gym Rental',
                    'home_gym_rental': 'Home Gym Rental',
                    'gym': 'Home Gym Rental',
                    'garden': 'Garden/Yard Space',
                    'yard': 'Garden/Yard Space',
                    'solar': 'Solar Panels',
                    'rooftop': 'Rooftop Solar'
                  };
                  return displayNames[cleanType] || cleanType.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                };

                const displayName = getAssetDisplayName(assetType);
                
                // Group internet-related assets together
                const groupKey = assetType?.toLowerCase?.()?.includes('internet') || 
                               assetType?.toLowerCase?.()?.includes('bandwidth') || 
                               assetType?.toLowerCase?.()?.includes('wifi')
                  ? 'internet'
                  : assetType;

                if (!groups[groupKey]) {
                  groups[groupKey] = {
                    displayName,
                    assetType,
                    selections: []
                  };
                }
                groups[groupKey].selections.push(selection);
                return groups;
              }, {} as Record<string, any>);

              const getPartnersForAsset = (type: string) => {
                const cleanType = type?.toLowerCase?.() || 'asset';
                let platforms = PartnerIntegrationService.getPlatformsByAsset(cleanType);
                
                // Special handling for parking - show both SpotHero and Neighbor, prioritize Neighbor
                if (cleanType.includes('parking') || cleanType.includes('driveway')) {
                  const neighbor = PartnerIntegrationService.getPlatformById('neighbor');
                  const spothero = PartnerIntegrationService.getPlatformById('spothero');
                  
                  if (neighbor && spothero) {
                    return [
                      { ...neighbor, priority: 1 },
                      { ...spothero, priority: 2 }
                    ].sort((a, b) => (a.priority || 999) - (b.priority || 999));
                  }
                }
                
                return platforms;
              };

              return Object.values(assetGroups).map((group: any, groupIndex) => {
                const partners = getPartnersForAsset(group.assetType);
                
                // If there are multiple partners, show one bubble that expands to show partner cards
                if (partners.length > 1) {
                  return (
                    <Button
                      key={`asset-group-${groupIndex}`}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestedAction(`Set up my ${group.displayName.toLowerCase()}`)}
                      disabled={isLoading}
                      className="text-xs bg-primary/5 border-primary/30 hover:bg-primary/10"
                    >
                      Set up my {group.displayName.toLowerCase()}
                    </Button>
                  );
                }
                
                // If only one partner, show simplified button without partner name
                return partners.map((partner, partnerIndex) => (
                  <Button
                    key={`partner-${groupIndex}-${partnerIndex}`}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestedAction(`Set up my ${group.displayName.toLowerCase()}`)}
                    disabled={isLoading}
                    className="text-xs bg-primary/5 border-primary/30 hover:bg-primary/10"
                  >
                    Set up my {group.displayName.toLowerCase()}
                    {partner.priority === 1 && <span className="ml-1">⭐</span>}
                  </Button>
                ));
              }).flat();
            })()}
          </div>
        )}
        
        {/* Enhanced context indicators - Hidden per user request */}
        {/* 
        <div className="mt-2 flex flex-wrap gap-1 text-xs text-gray-500">
          {propertyData && (
            <Badge variant="secondary" className="text-xs">
              Property: {propertyData.address}
            </Badge>
          )}
          {user && (
            <Badge variant="secondary" className="text-xs">
              Signed In: Full Features
            </Badge>
          )}
          <Badge variant="secondary" className="text-xs bg-green-50 text-green-700">
            Local Assistant Ready
          </Badge>
        </div>
        */}
      </div>
    </div>
  );
};

export default EnhancedChatInterface;
