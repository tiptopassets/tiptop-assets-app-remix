
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Mic, MicOff, Lightbulb, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConversationIntelligence } from '@/hooks/useConversationIntelligence';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestedActions?: string[];
  detectedAssets?: string[];
  confidence?: number;
}

interface EnhancedChatInterfaceProps {
  onAssetDetected: (assets: string[]) => void;
  onConversationStageChange: (stage: string) => void;
}

const EnhancedChatInterface: React.FC<EnhancedChatInterfaceProps> = ({
  onAssetDetected,
  onConversationStageChange
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    context,
    generateSmartResponse,
    isAnalyzing
  } = useConversationIntelligence();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial greeting message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: `Hi! I'm your AI property monetization assistant. I'll help you discover and set up income opportunities from your property. What type of property are you looking to monetize?`,
      timestamp: new Date(),
      suggestedActions: [
        'I have a house with a rooftop',
        'I own an apartment with parking',
        'I have high-speed internet to share'
      ]
    };
    setMessages([welcomeMessage]);
  }, []);

  // Notify parent about conversation stage changes
  useEffect(() => {
    onConversationStageChange(context.conversationStage);
  }, [context.conversationStage, onConversationStageChange]);

  // Notify parent about detected assets
  useEffect(() => {
    if (context.detectedAssets.length > 0) {
      onAssetDetected(context.detectedAssets);
    }
  }, [context.detectedAssets, onAssetDetected]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isAnalyzing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setShowSuggestions(false);

    // Generate AI response
    try {
      const response = await generateSmartResponse(inputMessage);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        suggestedActions: response.suggestedActions,
        detectedAssets: response.detectedAssets,
        confidence: response.confidence
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
    }
  };

  const handleSuggestedAction = (action: string) => {
    setInputMessage(action);
    handleSendMessage();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVoiceRecording = () => {
    setIsVoiceRecording(!isVoiceRecording);
    // Voice recording implementation would go here
  };

  const getStageIcon = () => {
    switch (context.conversationStage) {
      case 'discovery': return <Lightbulb className="h-4 w-4" />;
      case 'recommendation': return <TrendingUp className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Conversation Stage Indicator */}
      {context.conversationStage !== 'greeting' && (
        <div className="p-4 border-b bg-gradient-to-r from-tiptop-purple/5 to-purple-100">
          <div className="flex items-center gap-2 text-sm text-tiptop-purple">
            {getStageIcon()}
            <span className="capitalize">{context.conversationStage} Phase</span>
            {context.detectedAssets.length > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {context.detectedAssets.length} assets detected
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                  <Card className={`${
                    message.role === 'user' 
                      ? 'bg-tiptop-purple text-white' 
                      : 'bg-white border-gray-200'
                  }`}>
                    <CardContent className="p-3">
                      <p className="text-sm">{message.content}</p>
                      
                      {/* Confidence indicator for AI messages */}
                      {message.role === 'assistant' && message.confidence && (
                        <div className="mt-2 text-xs text-gray-500">
                          Confidence: {Math.round(message.confidence * 100)}%
                        </div>
                      )}
                      
                      {/* Detected assets */}
                      {message.detectedAssets && message.detectedAssets.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {message.detectedAssets.map((asset) => (
                            <Badge key={asset} variant="outline" className="text-xs">
                              {asset.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {/* Suggested actions */}
                      {message.suggestedActions && message.suggestedActions.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs font-medium text-gray-600">Quick responses:</p>
                          <div className="space-y-1">
                            {message.suggestedActions.map((action, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                className="w-full text-left justify-start h-auto py-1 px-2 text-xs"
                                onClick={() => handleSuggestedAction(action)}
                              >
                                {action}
                              </Button>
                            ))}
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
          
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <Card className="bg-white border-gray-200">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-tiptop-purple" />
                    <span className="text-sm text-gray-600">Analyzing your message...</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t p-4 bg-white">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your property or ask about monetization..."
              disabled={isAnalyzing}
              className="pr-12"
            />
            <Button
              variant="ghost"
              size="sm"
              className={`absolute right-1 top-1 h-8 w-8 p-0 ${
                isVoiceRecording ? 'text-red-500' : 'text-gray-400'
              }`}
              onClick={toggleVoiceRecording}
            >
              {isVoiceRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isAnalyzing}
            className="bg-tiptop-purple hover:bg-purple-600"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Smart suggestions based on conversation stage */}
        {showSuggestions && context.conversationStage === 'greeting' && (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs text-gray-500">Try asking:</span>
            {['Single-family home', 'Apartment building', 'Condo with amenities'].map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => handleSuggestedAction(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedChatInterface;
