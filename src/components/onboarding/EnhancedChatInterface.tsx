
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Send, Mic, MicOff, Lightbulb, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PropertyAnalysisData } from '@/hooks/useUserPropertyAnalysis';

interface DetectedAsset {
  id: string;
  name: string;
  confidence: number;
  estimatedRevenue: number;
  setupComplexity: 'low' | 'medium' | 'high';
  keyRequirements: string[];
  marketOpportunity: 'high' | 'medium' | 'low';
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestedActions?: string[];
  detectedAssets?: string[];
  confidence?: number;
  type?: 'message' | 'asset_analysis' | 'smart_asset_detection';
  assetAnalysisData?: any;
  smartAssetData?: DetectedAsset[];
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
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Smart auto-scroll behavior - only scroll if user is near bottom
  useEffect(() => {
    if (shouldAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setShouldAutoScroll(false);
    }
  }, [messages, shouldAutoScroll]);

  // Check if user is near bottom of scroll
  const isNearBottom = () => {
    if (!messagesContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    return scrollHeight - scrollTop - clientHeight < 100;
  };

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

  const generateSmartAssetData = (detectedAssets: string[]): DetectedAsset[] => {
    return detectedAssets.map((asset, index) => ({
      id: asset,
      name: asset.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      confidence: 0.7 + (Math.random() * 0.3), // 70-100% confidence
      estimatedRevenue: Math.floor(Math.random() * 800) + 200, // $200-$1000
      setupComplexity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
      keyRequirements: getAssetRequirements(asset),
      marketOpportunity: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as 'high' | 'medium' | 'low'
    }));
  };

  const getAssetRequirements = (asset: string): string[] => {
    const requirements: Record<string, string[]> = {
      'rooftop': ['Structural assessment', 'Solar permits', 'Grid connection'],
      'parking': ['Insurance coverage', 'Access management', 'Payment system'],
      'bandwidth': ['Speed test verification', 'Router setup', 'Bandwidth allocation'],
      'pool': ['Safety compliance', 'Insurance update', 'Booking platform'],
      'storage': ['Security measures', 'Access control', 'Item restrictions'],
      'garden': ['Space preparation', 'Event permits', 'Liability coverage']
    };
    
    return requirements[asset] || ['Initial setup', 'Documentation', 'Service activation'];
  };

  const addSmartAssetDetectionMessage = (detectedAssets: string[]) => {
    if (detectedAssets.length === 0) return;

    const smartAssetData = generateSmartAssetData(detectedAssets);

    const detectionMessage: Message = {
      id: `smart-detection-${Date.now()}`,
      role: 'assistant',
      content: `Great! I've analyzed your property and detected ${detectedAssets.length} monetization opportunities. Here's my AI-powered analysis:`,
      timestamp: new Date(),
      type: 'smart_asset_detection',
      smartAssetData: smartAssetData,
      suggestedActions: [
        `Set up ${smartAssetData[0]?.name}`,
        'Tell me about requirements',
        'Show other opportunities'
      ]
    };

    setMessages(prev => [...prev, detectionMessage]);
    
    // Auto-scroll if user was near bottom
    if (isNearBottom()) {
      setShouldAutoScroll(true);
    }
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
    
    // Auto-scroll for user messages
    if (isNearBottom()) {
      setShouldAutoScroll(true);
    }
    
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
      
      // Auto-scroll for assistant messages
      if (isNearBottom()) {
        setShouldAutoScroll(true);
      }
      
      // Add smart asset detection if assets were detected
      if (response.detectedAssets.length > 0) {
        setTimeout(() => {
          addSmartAssetDetectionMessage(response.detectedAssets);
        }, 1000);
      }
      
      // Notify parent components
      if (response.detectedAssets.length > 0) {
        onAssetDetected(response.detectedAssets);
      }
      
      onConversationStageChange('discussion');
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleSuggestedAction = (action: string) => {
    // Directly send the message - no delay, no input field update
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: action,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setShowSuggestions(false);
    setIsAnalyzing(true);
    
    // Auto-scroll for suggested actions
    if (isNearBottom()) {
      setShouldAutoScroll(true);
    }
    
    // Generate response for the suggested action
    setTimeout(() => {
      const response = generateIntelligentResponse(action);
      
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
      
      // Auto-scroll for assistant responses
      if (isNearBottom()) {
        setShouldAutoScroll(true);
      }
      
      // Add smart asset detection if assets were detected
      if (response.detectedAssets.length > 0) {
        setTimeout(() => {
          addSmartAssetDetectionMessage(response.detectedAssets);
        }, 1000);
        onAssetDetected(response.detectedAssets);
      }
      
      onConversationStageChange('discussion');
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleAssetSelect = (assetId: string) => {
    onAssetDetected([assetId]);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `I want to set up ${assetId.replace('_', ' ')}`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Excellent choice! Let's set up your ${assetId.replace('_', ' ')} for monetization. I'll guide you through the specific requirements and connect you with the best service providers.`,
        timestamp: new Date(),
        suggestedActions: [
          'What are the requirements?',
          'How much can I earn?',
          'How long does setup take?'
        ]
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      if (isNearBottom()) {
        setShouldAutoScroll(true);
      }
    }, 1000);
  };

  const handleAssetDismiss = (assetId: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `I'm not interested in ${assetId.replace('_', ' ')} right now`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `No problem! We can focus on other opportunities. What other assets would you like to explore?`,
        timestamp: new Date(),
        suggestedActions: [
          'Show me other options',
          'Tell me about requirements',
          'What has the highest potential?'
        ]
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      if (isNearBottom()) {
        setShouldAutoScroll(true);
      }
    }, 1000);
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

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getOpportunityColor = (opportunity: string) => {
    switch (opportunity) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const renderSmartAssetDetection = (smartAssetData: DetectedAsset[]) => {
    return (
      <div className="mt-3 space-y-3">
        <div className="text-center mb-4">
          <h4 className="text-sm font-semibold text-tiptop-purple mb-2">
            🔍 Smart Asset Detection Results
          </h4>
          <p className="text-xs text-gray-600">
            AI-powered analysis of your property's monetization potential
          </p>
        </div>

        {smartAssetData.map((asset, index) => (
          <motion.div
            key={asset.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border border-l-4 border-l-tiptop-purple rounded-lg p-3 bg-gradient-to-r from-tiptop-purple/5 to-purple-50"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h5 className="font-semibold text-tiptop-purple flex items-center gap-2">
                  {asset.name}
                  <Badge className={`text-xs ${getComplexityColor(asset.setupComplexity)}`}>
                    {asset.setupComplexity} setup
                  </Badge>
                </h5>
                <div className="flex items-center gap-4 mt-1">
                  <div className="text-xs text-gray-600">
                    Confidence: {Math.round(asset.confidence * 100)}%
                  </div>
                  <div className="text-xs font-medium text-tiptop-purple">
                    ${asset.estimatedRevenue}/month
                  </div>
                  <div className={`text-xs font-medium ${getOpportunityColor(asset.marketOpportunity)}`}>
                    {asset.marketOpportunity} demand
                  </div>
                </div>
              </div>
            </div>

            {/* Confidence Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">AI Confidence</span>
                <span className="text-xs font-medium">{Math.round(asset.confidence * 100)}%</span>
              </div>
              <Progress value={asset.confidence * 100} className="h-1" />
            </div>

            {/* Key Requirements */}
            <div className="mb-3">
              <h6 className="text-xs font-medium text-gray-900 mb-1">Key Requirements:</h6>
              <div className="flex flex-wrap gap-1">
                {asset.keyRequirements.map((req, reqIndex) => (
                  <Badge key={reqIndex} variant="outline" className="text-xs">
                    {req}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Market Opportunity Indicator */}
            <div className="flex items-center gap-2 text-xs mb-3">
              <TrendingUp className={`h-3 w-3 ${getOpportunityColor(asset.marketOpportunity)}`} />
              <span className="text-gray-600">Market opportunity:</span>
              <span className={`font-medium ${getOpportunityColor(asset.marketOpportunity)}`}>
                {asset.marketOpportunity}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAssetDismiss(asset.id)}
                className="text-xs"
              >
                Not Interested
              </Button>
              <Button
                size="sm"
                className="bg-tiptop-purple hover:bg-purple-600 text-xs"
                onClick={() => handleAssetSelect(asset.id)}
              >
                Set Up Now
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  const renderAssetAnalysis = (analysisData: any[]) => {
    return (
      <div className="mt-3 space-y-3">
        {analysisData.map((asset, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
            className="border border-tiptop-purple/20 rounded-lg p-3 bg-gradient-to-r from-tiptop-purple/5 to-purple-50"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-tiptop-purple">{asset.name}</h4>
              <Badge className="text-xs bg-green-50 text-green-700 border-green-200">
                ${asset.estimatedRevenue}/month
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge variant="outline" className="text-xs">
                {Math.round(asset.confidence * 100)}% confidence
              </Badge>
              <Badge variant="outline" className="text-xs">
                {asset.setupComplexity} setup
              </Badge>
              <Badge variant="outline" className="text-xs">
                {asset.marketOpportunity} demand
              </Badge>
            </div>
          </motion.div>
        ))}
      </div>
    );
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

      {/* Messages Area - Fixed scroll behavior */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4"
        style={{ 
          scrollBehavior: 'smooth',
          overscrollBehavior: 'contain'
        }}
      >
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
                      
                      {/* Smart Asset Detection Data */}
                      {message.type === 'smart_asset_detection' && message.smartAssetData && (
                        renderSmartAssetDetection(message.smartAssetData)
                      )}
                      
                      {/* Asset Analysis Data */}
                      {message.type === 'asset_analysis' && message.assetAnalysisData && (
                        renderAssetAnalysis(message.assetAnalysisData)
                      )}
                      
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
      </div>

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
