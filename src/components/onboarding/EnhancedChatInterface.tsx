
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useOpenAIAssistant } from '@/hooks/useOpenAIAssistant';
import { PropertyAnalysisData } from '@/hooks/useUserPropertyAnalysis';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface EnhancedChatInterfaceProps {
  onAssetDetected: (assets: string[]) => void;
  onConversationStageChange: (stage: string) => void;
  propertyData: PropertyAnalysisData | null;
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
    initializeAssistant,
    sendMessage,
    messages: assistantMessages,
    isLoading: aiLoading,
    isProcessing,
    isReady,
    error: assistantError,
    authError,
    userContext,
    clearError
  } = useOpenAIAssistant(propertyData);

  // Provide sendMessage function to parent component once ready
  useEffect(() => {
    if (onSendMessageReady && isReady) {
      onSendMessageReady(sendMessage);
    }
  }, [onSendMessageReady, sendMessage, isReady]);

  // Scroll to bottom when messages change (only within chat container)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'nearest' // Prevents page-level scrolling
    });
  }, [assistantMessages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !isReady || isProcessing) return;

    const message = inputMessage.trim();
    setInputMessage('');
    setShowSuggestions(false);

    console.log('💬 [CHAT] Sending message to assistant:', message);

    try {
      await sendMessage(message);
      onConversationStageChange('discussion');
    } catch (error) {
      console.error('❌ [CHAT] Error sending message:', error);
    }
  };

  const handleSuggestedAction = async (action: string) => {
    if (!isReady || isProcessing) return;
    
    console.log('🎯 [CHAT] Suggested action selected:', action);
    setShowSuggestions(false);
    
    try {
      await sendMessage(action);
      onConversationStageChange('discussion');
    } catch (error) {
      console.error('❌ [CHAT] Error with suggested action:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Quick start suggestions based on property data and authentication status
  const quickStartSuggestions = React.useMemo(() => {
    if (!propertyData || !propertyData.availableAssets.length) {
      return [
        'Tell me about property monetization',
        'What services are available?',
        'How can I earn money from my property?'
      ];
    }

    const topAssets = propertyData.availableAssets
      .filter(asset => asset.hasRevenuePotential)
      .slice(0, 3);

    return topAssets.length > 0 
      ? topAssets.map(asset => `Tell me about ${asset.name} setup`)
      : [
          'What are my options?',
          'How do I get started?',
          'Show me requirements'
        ];
  }, [propertyData]);

  // Loading state indicator
  const showLoadingState = aiLoading || (!userContext.isLoaded && !assistantError);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">AI Assistant</h3>
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
            {showLoadingState && (
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-1 animate-pulse"></div>
                Loading
              </Badge>
            )}
            {isReady && !showLoadingState && (
              <Badge variant="outline" className="text-green-600 border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                Connected
              </Badge>
            )}
            {isProcessing && (
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-1 animate-pulse"></div>
                Processing
              </Badge>
            )}
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
        {/* Loading state */}
        {showLoadingState && (
          <div className="flex justify-center items-center h-full">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="text-sm text-muted-foreground">
                {userContext.isLoaded ? 'Initializing AI assistant...' : 'Loading your data...'}
              </span>
            </div>
          </div>
        )}

        {/* Error state */}
        {assistantError && (
          <div className="flex justify-center mb-4">
            <div className="bg-destructive/10 text-destructive rounded-lg px-4 py-2 border border-destructive/20">
              <div className="text-sm">{assistantError}</div>
              <div className="flex gap-2 mt-2">
                <button 
                  onClick={clearError}
                  className="text-xs underline"
                >
                  Dismiss
                </button>
                {authError && !user && (
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
            {assistantMessages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                  <Card className={`${
                    message.role === 'user' 
                      ? 'bg-tiptop-purple text-white' 
                      : 'bg-white border-gray-200'
                  }`}>
                    <CardContent className="p-3">
                      <div 
                        className="text-sm prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ 
                          __html: message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') 
                        }}
                      />
                      
                      {/* Function calls indicator */}
                      {message.functionCalls && message.functionCalls.length > 0 && (
                        <div className="mt-2 text-xs opacity-70">
                          <div className="flex items-center space-x-1">
                            <div className="animate-pulse w-2 h-2 bg-primary rounded-full"></div>
                            <span>Processing {message.functionCalls.length} function call(s)...</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <div className={`text-xs text-gray-500 mt-1 ${
                    message.role === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <Card className="bg-white border-gray-200">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="text-sm text-gray-600">AI assistant is working...</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Quick Start Suggestions */}
          {showSuggestions && assistantMessages.length <= 1 && propertyData && isReady && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">
                  Click to start asset setup:
                  {!user && (
                    <span className="block text-xs text-amber-600 mt-1">
                      Sign in to save progress and connect with partners
                    </span>
                  )}
                </p>
                <div className="grid gap-2">
                  {propertyData.availableAssets.filter(a => a.hasRevenuePotential).slice(0, 3).map((asset) => (
                    <Button
                      key={asset.type}
                      variant="outline"
                      className="h-auto p-3 justify-start hover:bg-tiptop-purple hover:text-white transition-colors"
                      onClick={() => handleSuggestedAction(`I want to set up ${asset.name.toLowerCase()} at my property. What do I need to get started?`)}
                      disabled={!isReady || isProcessing}
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

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              isReady 
                ? "Ask me about your property monetization..." 
                : showLoadingState
                  ? "Assistant is starting up..."
                  : "Assistant not available"
            }
            disabled={!isReady || isProcessing}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || !isReady || isProcessing}
            className="px-6"
          >
            Send
          </Button>
        </div>
        
        {/* Quick suggestions */}
        {showSuggestions && assistantMessages.length === 0 && !showLoadingState && isReady && (
          <div className="mt-3 flex flex-wrap gap-2">
            {quickStartSuggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestedAction(suggestion)}
                disabled={!isReady || isProcessing}
                className="text-xs"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        )}
        
        {/* Context indicators */}
        {userContext.isLoaded && (
          <div className="mt-2 flex flex-wrap gap-1 text-xs text-gray-500">
            {userContext.propertyData && (
              <Badge variant="secondary" className="text-xs">
                Property: {userContext.propertyData.address}
              </Badge>
            )}
            {userContext.serviceProviders.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {userContext.serviceProviders.length} Partners Available
              </Badge>
            )}
            {user && (
              <Badge variant="secondary" className="text-xs">
                Signed In: Full Features
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedChatInterface;
