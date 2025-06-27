
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Mic, MicOff, Lightbulb, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PropertyAnalysisData } from '@/hooks/useUserPropertyAnalysis';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestedActions?: string[];
  detectedAssets?: string[];
  confidence?: number;
}

interface ConversationState {
  currentAsset: string | null;
  completedAssets: string[];
  availableAssets: any[];
  userName: string;
  propertyAddress: string;
}

interface EnhancedChatInterfaceProps {
  onAssetDetected: (assets: string[]) => void;
  onConversationStageChange: (stage: string) => void;
  propertyData?: PropertyAnalysisData | null;
  conversationState?: ConversationState;
  generateAssetResponse?: (assetType: string) => string;
  generateWelcomeMessage?: () => string;
  generateAssetSuggestions?: () => string[];
}

const EnhancedChatInterface: React.FC<EnhancedChatInterfaceProps> = ({
  onAssetDetected,
  onConversationStageChange,
  propertyData,
  conversationState,
  generateAssetResponse,
  generateWelcomeMessage,
  generateAssetSuggestions
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial greeting message with property intelligence
  useEffect(() => {
    if (propertyData && generateWelcomeMessage) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: generateWelcomeMessage(),
        timestamp: new Date(),
        suggestedActions: generateAssetSuggestions ? generateAssetSuggestions() : [
          'Tell me about solar panels',
          'How do I rent parking spaces?',
          'What about pool sharing?'
        ]
      };
      setMessages([welcomeMessage]);
    } else {
      // Fallback generic message
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `Hi! I'm your AI property monetization assistant. I'll help you discover and set up income opportunities from your property assets. What type of property are you looking to monetize?`,
        timestamp: new Date(),
        suggestedActions: [
          'I have a house with a rooftop',
          'I own an apartment with parking',
          'I have high-speed internet to share'
        ]
      };
      setMessages([welcomeMessage]);
    }
  }, [propertyData, generateWelcomeMessage, generateAssetSuggestions]);

  const analyzeUserMessage = (message: string): string[] => {
    const assetKeywords = {
      'rooftop': ['roof', 'rooftop', 'solar', 'panels'],
      'parking': ['parking', 'driveway', 'garage', 'car space'],
      'pool': ['pool', 'swimming', 'swim'],
      'bandwidth': ['internet', 'bandwidth', 'wifi', 'connection'],
      'storage': ['storage', 'basement', 'attic', 'space'],
      'garden': ['garden', 'yard', 'lawn', 'outdoor space']
    };

    const detected: string[] = [];
    const lowerMessage = message.toLowerCase();

    Object.entries(assetKeywords).forEach(([asset, keywords]) => {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        detected.push(asset);
      }
    });

    return detected;
  };

  const generateIntelligentResponse = (userMessage: string): { message: string; suggestedActions: string[]; detectedAssets: string[] } => {
    const detectedAssets = analyzeUserMessage(userMessage);
    
    // If user mentions a specific asset and we have property data
    if (detectedAssets.length > 0 && generateAssetResponse) {
      const asset = detectedAssets[0];
      const response = generateAssetResponse(asset);
      
      return {
        message: response,
        suggestedActions: [
          'How do I get started?',
          'What are the requirements?',
          'Tell me about other assets'
        ],
        detectedAssets
      };
    }

    // Property-aware responses
    if (propertyData && conversationState) {
      const { availableAssets } = conversationState;
      
      if (userMessage.toLowerCase().includes('start') || userMessage.toLowerCase().includes('begin')) {
        if (availableAssets.length > 0) {
          const topAsset = availableAssets[0];
          return {
            message: `Perfect! Let's start with your highest earning potential: ${topAsset.name} which could generate $${topAsset.monthlyRevenue}/month. This involves ${topAsset.area} of space. Should we proceed with this, or would you prefer to start with a different asset?`,
            suggestedActions: [
              `Yes, set up ${topAsset.name}`,
              'Show me other options',
              'What are the requirements?'
            ],
            detectedAssets: [topAsset.type]
          };
        }
      }

      if (userMessage.toLowerCase().includes('other') || userMessage.toLowerCase().includes('different')) {
        const assetOptions = availableAssets.slice(0, 3).map(asset => 
          `${asset.name} ($${asset.monthlyRevenue}/month)`
        );
        
        return {
          message: `Here are your available monetization options: ${assetOptions.join(', ')}. Each has different setup requirements and earning potential. Which one interests you most?`,
          suggestedActions: availableAssets.slice(0, 3).map(asset => asset.name),
          detectedAssets: availableAssets.map(asset => asset.type)
        };
      }
    }

    // Default intelligent responses
    const responses = [
      {
        message: "That's helpful information! Based on what you've told me, I can provide more specific guidance. What aspect would you like to focus on first?",
        suggestedActions: [
          'Setup requirements',
          'Earning potential', 
          'Time to get started'
        ]
      },
      {
        message: "I understand. Let me help you with the specific details for that asset type. What questions do you have about the setup process?",
        suggestedActions: [
          'How much can I earn?',
          'What do I need to start?',
          'How long does setup take?'
        ]
      }
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    return {
      ...randomResponse,
      detectedAssets
    };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isAnalyzing) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Add user message
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setShowSuggestions(false);
    
    // Simulate AI thinking
    setIsAnalyzing(true);
    
    // Generate intelligent response
    setTimeout(() => {
      const response = generateIntelligentResponse(userMessage);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        suggestedActions: response.suggestedActions,
        detectedAssets: response.detectedAssets,
        confidence: 0.9
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Notify parent components
      if (response.detectedAssets.length > 0) {
        onAssetDetected(response.detectedAssets);
      }
      
      onConversationStageChange('discussion');
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleSuggestedAction = (action: string) => {
    setInputMessage(action);
    setTimeout(() => handleSendMessage(), 100);
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
    if (conversationState?.currentAsset) return <TrendingUp className="h-4 w-4" />;
    return <Lightbulb className="h-4 w-4" />;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Conversation Stage Indicator */}
      {propertyData && (
        <div className="p-4 border-b bg-gradient-to-r from-tiptop-purple/5 to-purple-100">
          <div className="flex items-center gap-2 text-sm text-tiptop-purple">
            {getStageIcon()}
            <span className="capitalize">
              {conversationState?.currentAsset ? 
                `Setting up ${conversationState.currentAsset.replace('_', ' ')}` : 
                'Property Analysis Available'
              }
            </span>
            {propertyData.availableAssets.length > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {propertyData.availableAssets.length} assets available
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
              placeholder={
                propertyData 
                  ? "Ask about your property assets or setup process..." 
                  : "Describe your property or ask about monetization..."
              }
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

        {/* Smart suggestions based on property data */}
        {showSuggestions && propertyData && (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs text-gray-500">Try asking:</span>
            {propertyData.availableAssets.slice(0, 3).map((asset) => (
              <Button
                key={asset.type}
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => handleSuggestedAction(`Tell me about ${asset.name.toLowerCase()}`)}
              >
                {asset.name} (${asset.monthlyRevenue}/mo)
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedChatInterface;
