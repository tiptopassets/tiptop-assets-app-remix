
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useOpenAIChat } from '@/hooks/useOpenAIChat';
import { PropertyAnalysisData } from '@/hooks/useUserPropertyAnalysis';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Wifi, Bot, User, Send } from 'lucide-react';

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
    messages: assistantMessages,
    isLoading: aiLoading,
    error: assistantError,
    sendMessage,
    clearChat
  } = useOpenAIChat();

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
  }, [assistantMessages]);

  // Enhanced message handling with debouncing
  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || aiLoading) return;

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
  }, [inputMessage, aiLoading, sendMessage, onConversationStageChange]);

  const handleSuggestedAction = useCallback(async (action: string) => {
    if (aiLoading) return;
    
    console.log('🎯 [CHAT] Suggested action selected:', action);
    setShowSuggestions(false);
    
    try {
      await sendMessage(action);
      onConversationStageChange('discussion');
    } catch (error) {
      console.error('❌ [CHAT] Error with suggested action:', error);
    }
  }, [aiLoading, sendMessage, onConversationStageChange]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Enhanced loading state detection
  const showLoadingState = aiLoading;
  const showReadyState = !aiLoading && !assistantError;

  // Connection status indicator
  const getConnectionStatus = () => {
    if (showReadyState) return { icon: Wifi, label: 'Ready', color: 'text-green-600 border-green-200' };
    if (assistantError) return { icon: AlertCircle, label: 'Error', color: 'text-red-600 border-red-200' };
    return { icon: Bot, label: 'Starting...', color: 'text-blue-600 border-blue-200' };
  };

  const connectionStatus = getConnectionStatus();

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

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-purple-50">
      {/* Enhanced Header with better status indicators */}
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
        {assistantMessages.length === 0 && !showLoadingState && (
          <div className="text-center text-muted-foreground py-8">
            <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>Hi! I'm your property assistant. I can help you understand your property's monetization potential.</p>
            <p className="text-sm mt-2">Ask me about solar panels, EV charging, internet sharing, or any other opportunities!</p>
          </div>
        )}

        {/* Enhanced Error state with retry options */}
        {assistantError && (
          <div className="flex justify-center mb-4">
            <div className="bg-destructive/10 text-destructive rounded-lg px-4 py-3 border border-destructive/20 max-w-md">
              <div className="flex items-center mb-2">
                <AlertCircle className="w-4 h-4 mr-2" />
                <div className="text-sm font-medium">Assistant Error</div>
              </div>
              <div className="text-sm mb-3 whitespace-pre-line">{assistantError}</div>
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
            {assistantMessages.map((message) => (
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
                  <div className={`text-xs mt-1 opacity-70`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {aiLoading && (
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

          {/* Enhanced Quick Start Suggestions */}
          {showSuggestions && assistantMessages.length <= 1 && propertyData && showReadyState && (
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
                      disabled={!showReadyState || aiLoading}
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
              showReadyState 
                ? "Ask me about your property monetization..." 
                : showLoadingState
                  ? "Assistant is starting up..."
                  : assistantError
                    ? "Assistant error - please retry"
                    : "Assistant not available"
            }
            disabled={!showReadyState || aiLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || !showReadyState || aiLoading}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Quick suggestions */}
        {showSuggestions && assistantMessages.length === 0 && !showLoadingState && showReadyState && (
          <div className="mt-3 flex flex-wrap gap-2">
            {quickStartSuggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestedAction(suggestion)}
                disabled={!showReadyState || aiLoading}
                className="text-xs"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        )}
        
        {/* Enhanced context indicators */}
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
          {showReadyState && (
            <Badge variant="secondary" className="text-xs bg-green-50 text-green-700">
              Assistant Ready
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedChatInterface;
