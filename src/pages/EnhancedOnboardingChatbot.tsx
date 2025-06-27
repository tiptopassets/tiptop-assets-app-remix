import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Bot, Settings2, TrendingUp, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import EnhancedChatInterface from '@/components/onboarding/EnhancedChatInterface';
import SmartAssetDetection from '@/components/onboarding/SmartAssetDetection';
import ConversationAnalytics from '@/components/onboarding/ConversationAnalytics';
import { useNavigate, useSearchParams } from 'react-router-dom';

const EnhancedOnboardingChatbot = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [detectedAssets, setDetectedAssets] = useState<string[]>([]);
  const [conversationStage, setConversationStage] = useState('greeting');
  const [conversationStartTime] = useState(Date.now());
  const [messageCount, setMessageCount] = useState(0);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  // Get asset from URL parameters
  const targetAsset = searchParams.get('asset');
  
  // Simulated conversation analytics
  const [analytics, setAnalytics] = useState({
    totalMessages: 0,
    conversationDuration: 0,
    detectedAssets: [],
    confidenceScore: 0.8,
    completionProgress: 0,
    keyInsights: []
  });

  // Pre-populate detected assets if coming from dashboard with specific asset
  useEffect(() => {
    if (targetAsset) {
      setDetectedAssets([targetAsset]);
      setConversationStage('asset_configuration');
      toast({
        title: "Asset Configuration Started",
        description: `Let's configure your ${targetAsset.replace('_', ' ')} monetization setup.`,
      });
    }
  }, [targetAsset, toast]);

  // Update analytics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setAnalytics(prev => ({
        ...prev,
        totalMessages: messageCount,
        conversationDuration: Math.floor((Date.now() - conversationStartTime) / 1000),
        detectedAssets,
        completionProgress: Math.min(detectedAssets.length * 25, 100),
        keyInsights: generateKeyInsights(detectedAssets, conversationStage)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [messageCount, detectedAssets, conversationStage, conversationStartTime]);

  const generateKeyInsights = (assets: string[], stage: string) => {
    const insights: string[] = [];
    
    if (assets.length > 2) {
      insights.push('Multiple monetization opportunities detected');
    }
    
    if (assets.includes('rooftop')) {
      insights.push('High solar potential based on conversation');
    }
    
    if (stage === 'recommendation') {
      insights.push('Ready for partner recommendations');
    }
    
    return insights;
  };

  const handleAssetDetected = (assets: string[]) => {
    setDetectedAssets(assets);
  };

  const handleConversationStageChange = (stage: string) => {
    setConversationStage(stage);
    setMessageCount(prev => prev + 1);
  };

  const handleAssetSelect = (assetId: string) => {
    toast({
      title: "Asset Selected",
      description: `Setting up ${assetId.replace('_', ' ')} monetization...`,
    });
    
    // Navigate to asset-specific setup
    navigate(`/dashboard?setup=${assetId}`);
  };

  const handleAssetDismiss = (assetId: string) => {
    setDetectedAssets(prev => prev.filter(asset => asset !== assetId));
    
    toast({
      title: "Asset Dismissed",
      description: `${assetId.replace('_', ' ')} removed from recommendations.`,
    });
  };

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-tiptop-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading enhanced chatbot...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-2">
                <Bot className="h-6 w-6 text-tiptop-purple" />
                <h1 className="text-xl font-semibold text-gray-900">
                  AI Property Assistant
                </h1>
                <Badge className="bg-tiptop-purple/10 text-tiptop-purple border-tiptop-purple/20">
                  Enhanced
                </Badge>
                {targetAsset && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {targetAsset.replace('_', ' ')} Setup
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAnalytics(!showAnalytics)}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Analytics
              </Button>
              <Badge variant="secondary" className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {conversationStage.charAt(0).toUpperCase() + conversationStage.slice(1)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-8">
            <Card className="h-[calc(100vh-12rem)]">
              <EnhancedChatInterface
                onAssetDetected={handleAssetDetected}
                onConversationStageChange={handleConversationStageChange}
              />
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Smart Asset Detection */}
            {detectedAssets.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <SmartAssetDetection
                  detectedAssets={detectedAssets}
                  onAssetSelect={handleAssetSelect}
                  onAssetDismiss={handleAssetDismiss}
                />
              </motion.div>
            )}

            {/* Conversation Analytics */}
            {showAnalytics && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <ConversationAnalytics analytics={analytics} />
              </motion.div>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings2 className="h-5 w-5 text-tiptop-purple" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/submit-property')}
                >
                  Submit Property Details
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/dashboard')}
                >
                  View My Dashboard
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open('https://calendly.com/tiptop-concierge', '_blank')}
                >
                  Schedule Concierge Call
                </Button>
              </CardContent>
            </Card>

            {/* Tips & Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-tiptop-purple" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-tiptop-purple/5 rounded-lg">
                    <p className="font-medium text-tiptop-purple mb-1">Be Specific</p>
                    <p className="text-gray-600">
                      The more details you provide about your property, the better recommendations you'll receive.
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="font-medium text-green-700 mb-1">Ask Questions</p>
                    <p className="text-gray-600">
                      Don't hesitate to ask about setup costs, time requirements, or potential earnings.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedOnboardingChatbot;
