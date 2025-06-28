import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Send, Mic, MicOff, Lightbulb, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PropertyAnalysisData } from '@/hooks/useUserPropertyAnalysis';
import { useOpenAIConversation } from '@/hooks/useOpenAIConversation';

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
  smartAssetData?: DetectedAsset[];
}

interface EnhancedChatInterfaceProps {
  onAssetDetected: (assets: string[]) => void;
  onConversationStageChange: (stage: string) => void;
  propertyData?: PropertyAnalysisData | null;
}

const EnhancedChatInterface: React.FC<EnhancedChatInterfaceProps> = ({
  onAssetDetected,
  onConversationStageChange,
  propertyData
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    generateWelcomeMessage,
    generateIntelligentResponse,
    addMessage,
    isLoading
  } = useOpenAIConversation(propertyData);

  // Initialize with welcome message
  useEffect(() => {
    if (propertyData && messages.length === 0) {
      console.log('🎬 [CHAT] Initializing with property data:', {
        analysisId: propertyData.analysisId,
        address: propertyData.address,
        assetsCount: propertyData.availableAssets.length,
        totalRevenue: propertyData.totalMonthlyRevenue
      });
      
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: generateWelcomeMessage(),
        timestamp: new Date(),
        suggestedActions: propertyData.availableAssets.slice(0, 3).map(asset => 
          `Tell me about ${asset.name}`
        )
      };
      setMessages([welcomeMessage]);
    }
  }, [propertyData, generateWelcomeMessage, messages.length]);

  const generateSmartAssetData = (detectedAssets: string[]): DetectedAsset[] => {
    if (!propertyData) return [];

    return detectedAssets.map((assetType) => {
      const propertyAsset = propertyData.availableAssets.find(a => a.type === assetType);
      
      if (propertyAsset) {
        return {
          id: assetType,
          name: propertyAsset.name,
          confidence: 0.95,
          estimatedRevenue: propertyAsset.monthlyRevenue,
          setupComplexity: propertyAsset.monthlyRevenue > 300 ? 'medium' : 'low',
          keyRequirements: getAssetRequirements(assetType),
          marketOpportunity: propertyAsset.monthlyRevenue > 200 ? 'high' : 'medium'
        };
      }

      return {
        id: assetType,
        name: assetType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        confidence: 0.7,
        estimatedRevenue: 150,
        setupComplexity: 'medium',
        keyRequirements: ['Initial setup', 'Documentation', 'Service activation'],
        marketOpportunity: 'medium'
      };
    });
  };

  const getAssetRequirements = (assetType: string): string[] => {
    const requirements: Record<string, string[]> = {
      'rooftop': ['Structural assessment', 'Solar permits', 'Grid connection', 'Installation crew'],
      'parking': ['Insurance coverage', 'Access management', 'Payment system', 'Clear boundaries'],
      'pool': ['Safety compliance', 'Insurance update', 'Booking platform', 'Cleaning schedule'],
      'bandwidth': ['Speed verification', 'Router setup', 'Bandwidth allocation', 'Monitoring tools'],
      'storage': ['Security measures', 'Access control', 'Item restrictions', 'Insurance coverage'],
      'garden': ['Space preparation', 'Event permits', 'Liability coverage', 'Equipment access']
    };
    
    return requirements[assetType] || ['Initial setup', 'Documentation', 'Service activation'];
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setShowSuggestions(false);
    
    console.log('📤 [CHAT] Sending message with context:', {
      message: userMessage,
      hasPropertyData: !!propertyData,
      analysisId: propertyData?.analysisId,
      address: propertyData?.address
    });
    
    // Add user message
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    
    // Generate intelligent response using OpenAI with actual property data
    try {
      const response = await generateIntelligentResponse(userMessage);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        suggestedActions: response.suggestedActions,
        detectedAssets: response.detectedAssets,
        confidence: 0.9
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Add smart asset detection if assets were detected
      if (response.detectedAssets.length > 0) {
        setTimeout(() => {
          addSmartAssetDetectionMessage(response.detectedAssets);
        }, 1000);
        onAssetDetected(response.detectedAssets);
      }
      
      onConversationStageChange('discussion');
    } catch (error) {
      console.error('❌ [CHAT] Error handling message:', error);
      
      // Fallback message using property data if available
      const fallbackContent = propertyData 
        ? `I'm having trouble processing your request right now. However, I can see you have ${propertyData.availableAssets.length} available assets at ${propertyData.address} with a total potential of $${propertyData.totalMonthlyRevenue}/month. Could you please try rephrasing your question?`
        : "I'm having trouble processing your request right now. Could you please try rephrasing your question?";
      
      const fallbackMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: fallbackContent,
        timestamp: new Date(),
        suggestedActions: propertyData ? [
          'What are my asset options?',
          'How do I get started?',
          'Tell me about requirements'
        ] : [
          'Try again',
          'Contact support',
          'Go to dashboard'
        ]
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
    }
  };

  const addSmartAssetDetectionMessage = (detectedAssets: string[]) => {
    if (detectedAssets.length === 0) return;

    console.log('🔍 [CHAT] Adding smart asset detection for:', detectedAssets);
    const smartAssetData = generateSmartAssetData(detectedAssets);

    const detectionMessage: Message = {
      id: `smart-detection-${Date.now()}`,
      role: 'assistant',
      content: `Based on your question, I've identified ${detectedAssets.length} relevant asset${detectedAssets.length > 1 ? 's' : ''} from your property analysis:`,
      timestamp: new Date(),
      type: 'smart_asset_detection',
      smartAssetData: smartAssetData,
      suggestedActions: [
        `Set up ${smartAssetData[0]?.name}`,
        'Compare all options',
        'Show setup requirements'
      ]
    };

    setMessages(prev => [...prev, detectionMessage]);
  };

  const handleSuggestedAction = async (action: string) => {
    console.log('💬 [CHAT] Handling suggested action:', action);
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: action,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setShowSuggestions(false);
    
    try {
      const response = await generateIntelligentResponse(action);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        suggestedActions: response.suggestedActions,
        detectedAssets: response.detectedAssets,
        confidence: 0.9
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (response.detectedAssets.length > 0) {
        setTimeout(() => {
          addSmartAssetDetectionMessage(response.detectedAssets);
        }, 1000);
        onAssetDetected(response.detectedAssets);
      }
      
      onConversationStageChange('discussion');
    } catch (error) {
      console.error('Error handling suggested action:', error);
    }
  };

  const handleAssetSelect = (assetId: string) => {
    console.log('🎯 [CHAT] Asset selected:', assetId);
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
  };

  const getStageIcon = () => {
    if (propertyData?.availableAssets.length === 0) return <AlertCircle className="h-4 w-4" />;
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
            🎯 Your Property Assets
          </h4>
          <p className="text-xs text-gray-600">
            Based on your official property analysis
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
                  <Badge className="text-xs bg-green-50 text-green-700 border-green-200">
                    {asset.setupComplexity} setup
                  </Badge>
                </h5>
                <div className="flex items-center gap-4 mt-1">
                  <div className="text-xs font-medium text-tiptop-purple">
                    ${asset.estimatedRevenue}/month
                  </div>
                  <div className="text-xs font-medium text-green-600">
                    {asset.marketOpportunity} demand
                  </div>
                </div>
              </div>
            </div>

            {/* Confidence Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">Analysis Confidence</span>
                <span className="text-xs font-medium">{Math.round(asset.confidence * 100)}%</span>
              </div>
              <Progress value={asset.confidence * 100} className="h-1" />
            </div>

            {/* Key Requirements */}
            <div className="mb-3">
              <h6 className="text-xs font-medium text-gray-900 mb-1">Setup Requirements:</h6>
              <div className="flex flex-wrap gap-1">
                {asset.keyRequirements.map((req, reqIndex) => (
                  <Badge key={reqIndex} variant="outline" className="text-xs">
                    {req}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-tiptop-purple hover:bg-purple-600 text-xs"
                onClick={() => handleAssetSelect(asset.id)}
              >
                Get Started
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => handleSuggestedAction(`Tell me more about ${asset.name} requirements`)}
              >
                Learn More
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Property Data Status */}
      {propertyData && (
        <div className="p-4 border-b bg-gradient-to-r from-tiptop-purple/5 to-purple-100">
          <div className="flex items-center gap-2 text-sm text-tiptop-purple">
            <CheckCircle className="h-4 w-4" />
            <span>
              Property analyzed: {propertyData.address}
            </span>
            <Badge variant="secondary" className="ml-auto">
              {propertyData.availableAssets.length} assets available • ${propertyData.totalMonthlyRevenue}/month potential
            </Badge>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div 
        className="flex-1 overflow-y-auto p-4"
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
                      
                      {/* Confidence indicator for AI messages */}
                      {message.role === 'assistant' && message.confidence && (
                        <div className="mt-2 text-xs text-gray-500">
                          AI Confidence: {Math.round(message.confidence * 100)}%
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
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <Card className="bg-white border-gray-200">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-tiptop-purple" />
                    <span className="text-sm text-gray-600">Analyzing your message with AI...</span>
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
                  ? `Ask about your property at ${propertyData.address}...` 
                  : "Tell me about your property..."
              }
              disabled={isLoading}
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
            disabled={!inputMessage.trim() || isLoading}
            className="bg-tiptop-purple hover:bg-purple-600"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Smart suggestions based on actual property data */}
        {showSuggestions && propertyData && propertyData.availableAssets.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs text-gray-500">Try asking:</span>
            {propertyData.availableAssets.slice(0, 3).map((asset) => (
              <Button
                key={asset.type}
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => handleSuggestedAction(`What are the requirements for ${asset.name.toLowerCase()}?`)}
              >
                {asset.name} requirements
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedChatInterface;
