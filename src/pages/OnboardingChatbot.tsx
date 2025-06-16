import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, MessageSquare, Settings2, Bot, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/hooks/useOnboarding';
import { toast } from '@/hooks/use-toast';
import { 
  generatePartnerRecommendations, 
  initializePartnerIntegration, 
  type PartnerRecommendation 
} from '@/services/partnerRecommendationService';
import PartnerRecommendationCard from '@/components/onboarding/PartnerRecommendationCard';

const OnboardingChatbot = () => {
  const { user, loading: authLoading } = useAuth();
  const {
    onboardingData,
    messages,
    loading,
    error,
    startOnboarding,
    addMessage,
    updateProgress,
    clearError,
    isAuthenticated
  } = useOnboarding();

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [detectedAssets, setDetectedAssets] = useState<string[]>([]);
  const [partnerRecommendations, setPartnerRecommendations] = useState<PartnerRecommendation[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [integratingPartners, setIntegratingPartners] = useState<Set<string>>(new Set());
  const [completedIntegrations, setCompletedIntegrations] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showRecommendations]);

  // Clear error when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Handle authentication redirect
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to access the asset onboarding chatbot.',
        variant: 'destructive',
      });
    }
  }, [authLoading, isAuthenticated]);

  const analyzeUserMessage = (message: string): string[] => {
    const assetKeywords = {
      'rooftop': ['roof', 'rooftop', 'solar', 'panels'],
      'parking': ['parking', 'driveway', 'garage', 'car space'],
      'pool': ['pool', 'swimming', 'swim'],
      'internet': ['internet', 'bandwidth', 'wifi', 'connection'],
      'storage': ['storage', 'basement', 'attic', 'space'],
      'garden': ['garden', 'yard', 'lawn', 'outdoor space'],
      'unique_spaces': ['unique', 'special', 'event', 'photoshoot']
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

  const handleStartOnboarding = async (option: 'manual' | 'concierge') => {
    const data = await startOnboarding(option);
    if (data) {
      // Add welcome message
      const welcomeMessage = option === 'manual' 
        ? "Hi! I'm here to help you identify and set up monetization opportunities for your property assets. Let's start by telling me about your property. What type of property do you own?"
        : "Welcome to our concierge service! I'll personally guide you through setting up your property assets for maximum revenue. Let's begin with understanding your property better. Can you describe your property to me?";
      
      await addMessage('assistant', welcomeMessage);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !onboardingData || isTyping) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Add user message
    await addMessage('user', userMessage);
    
    // Analyze user message for assets
    const foundAssets = analyzeUserMessage(userMessage);
    const allDetectedAssets = [...new Set([...detectedAssets, ...foundAssets])];
    setDetectedAssets(allDetectedAssets);
    
    // Simulate AI typing
    setIsTyping(true);
    
    // Generate contextual response
    setTimeout(async () => {
      let response = '';
      
      if (foundAssets.length > 0) {
        response = `Great! I can see you have ${foundAssets.join(', ')} assets. `;
        
        if (allDetectedAssets.length >= 2) {
          response += "You have multiple monetizable assets! Let me generate some personalized partner recommendations for you.";
          
          // Generate partner recommendations
          try {
            const recommendations = await generatePartnerRecommendations(onboardingData.id, allDetectedAssets);
            setPartnerRecommendations(recommendations);
            setShowRecommendations(true);
            
            if (recommendations.length > 0) {
              response += ` I found ${recommendations.length} perfect partners that match your assets. Check out the recommendations below!`;
            }
          } catch (error) {
            console.error('Error generating recommendations:', error);
            response += " I'll help you find the best monetization opportunities for your assets.";
          }
        } else {
          response += "Tell me about any other assets you have - like parking spaces, internet connection, storage areas, or unique spaces that could be monetized.";
        }
      } else {
        const responses = [
          "That's helpful information! Can you tell me more about your property? Do you have a rooftop, parking space, pool, or high-speed internet?",
          "I'm gathering details about your property assets. What other features does your property have that we could potentially monetize?",
          "Excellent! Let me ask about specific assets - do you have any parking spaces, storage areas, or unique outdoor spaces?",
          "Thanks for that detail. To give you the best recommendations, can you describe your property's key features like rooftop space, parking, or internet setup?"
        ];
        response = responses[Math.floor(Math.random() * responses.length)];
      }
      
      await addMessage('assistant', response);
      setIsTyping(false);
      
      // Update progress if we have enough assets
      if (allDetectedAssets.length >= 2) {
        await updateProgress({
          current_step: 3,
          progress_data: { detected_assets: allDetectedAssets }
        });
      }
    }, 1500);
  };

  const handlePartnerIntegration = async (partnerName: string, referralLink: string) => {
    if (!user || !onboardingData) return;
    
    setIntegratingPartners(prev => new Set([...prev, partnerName]));
    
    try {
      // Initialize integration tracking
      const integration = await initializePartnerIntegration(
        user.id,
        onboardingData.id,
        partnerName,
        referralLink
      );
      
      if (integration) {
        // Open referral link in new tab
        window.open(referralLink, '_blank', 'noopener,noreferrer');
        
        // Add assistant message about the integration
        await addMessage('assistant', 
          `Great! I've opened the ${partnerName} registration page for you. Follow the steps to create your account and start earning. I'll track your progress and help you optimize your setup!`
        );
        
        // Mark as completed (in real app, this would be triggered by actual completion)
        setTimeout(() => {
          setCompletedIntegrations(prev => new Set([...prev, partnerName]));
          setIntegratingPartners(prev => {
            const newSet = new Set(prev);
            newSet.delete(partnerName);
            return newSet;
          });
          
          toast({
            title: "Integration Started",
            description: `Successfully opened ${partnerName} registration. Complete the signup to start earning!`,
          });
        }, 2000);
      }
    } catch (error) {
      console.error('Error integrating partner:', error);
      toast({
        title: "Integration Error",
        description: `Failed to start integration with ${partnerName}. Please try again.`,
        variant: "destructive",
      });
    }
    
    setIntegratingPartners(prev => {
      const newSet = new Set(prev);
      newSet.delete(partnerName);
      return newSet;
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth required message
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md glassmorphism-card border-white/20 text-white">
          <CardHeader className="text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-tiptop-purple" />
            <CardTitle className="text-xl">Authentication Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-300 mb-4">
              Please log in to access the asset onboarding chatbot.
            </p>
            <Button 
              onClick={() => window.location.href = '/dashboard'}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md glassmorphism-card border-red-500/20 text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-red-400">Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-300 mb-4">{error}</p>
            <Button 
              onClick={clearError}
              variant="outline"
              className="w-full"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bot className="h-8 w-8 text-tiptop-purple" />
              <div>
                <h1 className="text-xl font-bold text-white">Asset Onboarding Assistant</h1>
                <p className="text-sm text-gray-400">
                  {onboardingData?.selected_option === 'concierge' ? 'Concierge Service' : 'Self-Service Setup'}
                </p>
              </div>
            </div>
            {onboardingData && (
              <div className="flex items-center gap-3">
                {detectedAssets.length > 0 && (
                  <Badge variant="outline" className="border-green-500 text-green-500">
                    {detectedAssets.length} Assets Detected
                  </Badge>
                )}
                <Badge variant="outline" className="border-tiptop-purple text-tiptop-purple">
                  Step {onboardingData.current_step} of {onboardingData.total_steps}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4">
        {!onboardingData ? (
          // Onboarding Selection
          <div className="flex-1 flex items-center justify-center">
            <Card className="w-full max-w-2xl glassmorphism-card border-white/20 text-white">
              <CardHeader className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-tiptop-purple" />
                <CardTitle className="text-2xl mb-2">Welcome to Asset Onboarding</CardTitle>
                <p className="text-gray-300">
                  Choose how you'd like to set up your property assets for monetization
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => handleStartOnboarding('manual')}
                  disabled={loading}
                  className="w-full h-16 text-left flex items-center gap-4 bg-gradient-to-r from-tiptop-purple to-purple-600 hover:from-purple-600 hover:to-tiptop-purple"
                >
                  <Settings2 className="h-8 w-8" />
                  <div>
                    <div className="font-semibold">Self-Service Setup</div>
                    <div className="text-sm opacity-80">Guide yourself through the process</div>
                  </div>
                </Button>
                <Button
                  onClick={() => handleStartOnboarding('concierge')}
                  disabled={loading}
                  variant="outline"
                  className="w-full h-16 text-left flex items-center gap-4 border-tiptop-purple text-tiptop-purple hover:bg-tiptop-purple hover:text-white"
                >
                  <Bot className="h-8 w-8" />
                  <div>
                    <div className="font-semibold">Concierge Service</div>
                    <div className="text-sm opacity-80">Get personalized assistance</div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Chat Interface
          <>
            <Card className="flex-1 glassmorphism-card border-white/20 mb-4">
              <ScrollArea className="h-[500px] p-4">
                <div className="space-y-4">
                  <AnimatePresence>
                    {messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            message.role === 'user' ? 'bg-tiptop-purple' : 'bg-gray-700'
                          }`}>
                            {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                          </div>
                          <div className={`rounded-lg p-3 ${
                            message.role === 'user' 
                              ? 'bg-tiptop-purple text-white' 
                              : 'bg-gray-800 text-gray-100'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            <div className="text-xs opacity-70 mt-1">
                              {new Date(message.created_at).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {/* Partner Recommendations */}
                  {showRecommendations && partnerRecommendations.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-2 text-tiptop-purple font-medium">
                        <Sparkles className="w-5 h-5" />
                        <span>Recommended Partners</span>
                      </div>
                      <div className="grid gap-3">
                        {partnerRecommendations.map((recommendation) => (
                          <PartnerRecommendationCard
                            key={recommendation.id}
                            recommendation={recommendation}
                            onIntegrate={handlePartnerIntegration}
                            isIntegrating={integratingPartners.has(recommendation.partner_name)}
                            isCompleted={completedIntegrations.has(recommendation.partner_name)}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                  
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>
            </Card>

            {/* Message Input */}
            <Card className="glassmorphism-card border-white/20">
              <CardContent className="p-4">
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Describe your property assets..."
                    disabled={isTyping}
                    className="flex-1 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    size="icon"
                    className="bg-tiptop-purple hover:bg-purple-600"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default OnboardingChatbot;
