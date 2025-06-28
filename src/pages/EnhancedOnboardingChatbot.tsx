
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Bot, Settings2, TrendingUp, MessageSquare, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import EnhancedChatInterface from '@/components/onboarding/EnhancedChatInterface';
import ConversationAnalytics from '@/components/onboarding/ConversationAnalytics';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUserPropertyAnalysis } from '@/hooks/useUserPropertyAnalysis';

const EnhancedOnboardingChatbot = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get parameters from URL
  const targetAsset = searchParams.get('asset');
  const analysisId = searchParams.get('analysisId');
  const addressId = searchParams.get('addressId');
  
  console.log('🎯 [ONBOARDING] URL params:', { targetAsset, analysisId, addressId });
  
  // Property analysis integration with specific parameters
  const { propertyData, loading: propertyLoading, hasPropertyData } = useUserPropertyAnalysis({
    analysisId: analysisId || undefined,
    addressId: addressId || undefined,
    forceRefresh: !!analysisId || !!addressId
  });
  
  const [detectedAssets, setDetectedAssets] = useState<string[]>([]);
  const [conversationStage, setConversationStage] = useState('greeting');
  const [conversationStartTime] = useState(Date.now());
  const [messageCount, setMessageCount] = useState(0);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  // Initialize conversation with target asset if provided
  useEffect(() => {
    if (propertyData && targetAsset && !propertyLoading) {
      console.log('🎯 [ONBOARDING] Initializing with target asset:', targetAsset);
      console.log('🏠 [ONBOARDING] Property data:', {
        address: propertyData.address,
        totalRevenue: propertyData.totalMonthlyRevenue,
        assetsCount: propertyData.availableAssets.length
      });
      
      const assetInfo = propertyData.availableAssets.find(a => a.type === targetAsset);
      if (assetInfo) {
        setDetectedAssets([targetAsset]);
        setConversationStage('asset_configuration');
        
        toast({
          title: "Asset Setup Started",
          description: `Let's configure your ${assetInfo.name} for $${assetInfo.monthlyRevenue}/month potential earnings.`,
        });
      } else {
        console.warn('⚠️ [ONBOARDING] Target asset not found in available assets:', {
          targetAsset,
          availableAssets: propertyData.availableAssets.map(a => a.type)
        });
      }
    }
  }, [propertyData, targetAsset, propertyLoading, toast]);

  const [analytics, setAnalytics] = useState({
    totalMessages: 0,
    conversationDuration: 0,
    detectedAssets: [],
    confidenceScore: 0.9,
    completionProgress: 0,
    keyInsights: []
  });

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
    
    if (propertyData) {
      insights.push(`Property analyzed: ${propertyData.address}`);
      insights.push(`Total potential: $${propertyData.totalMonthlyRevenue}/month`);
    }
    
    if (assets.length > 1) {
      insights.push('Multiple assets under discussion');
    }
    
    if (stage === 'asset_configuration') {
      insights.push('Ready for asset setup');
    }
    
    return insights;
  };

  const handleAssetDetected = (assets: string[]) => {
    console.log('🎯 [ONBOARDING] Assets detected:', assets);
    setDetectedAssets(assets);
  };

  const handleConversationStageChange = (stage: string) => {
    console.log('📊 [ONBOARDING] Stage change:', stage);
    setConversationStage(stage);
    setMessageCount(prev => prev + 1);
  };

  // Loading state - wait for both auth and property data
  const isLoading = authLoading || (propertyLoading && !propertyData);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-tiptop-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">
            {authLoading ? 'Authenticating...' : 'Loading your property analysis...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error state if no property data after loading
  if (!propertyData && !propertyLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No property analysis found. Please analyze a property first.</p>
          <Button onClick={() => navigate('/submit-property')}>
            Analyze Property
          </Button>
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
                  OpenAI Powered
                </Badge>
                {targetAsset && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {targetAsset.replace('_', ' ')} Setup
                  </Badge>
                )}
                {hasPropertyData && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Analysis Complete
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
                propertyData={propertyData}
              />
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Property Summary */}
            {hasPropertyData && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings2 className="h-5 w-5 text-tiptop-purple" />
                      Your Property Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Address</p>
                        <p className="text-sm text-gray-600">{propertyData?.address}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Total Monthly Potential</p>
                        <p className="text-lg font-bold text-green-600">${propertyData?.totalMonthlyRevenue}/month</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Available Assets ({propertyData?.availableAssets.length})</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {propertyData?.availableAssets.map((asset) => (
                            <Badge key={asset.type} variant="outline" className="text-xs">
                              {asset.name} (${asset.monthlyRevenue}/mo)
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {targetAsset && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Current Focus</p>
                          <Badge className="bg-tiptop-purple text-white">
                            {targetAsset.replace('_', ' ')} Setup
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
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
                  Analyze Another Property
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

            {/* AI Assistant Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bot className="h-5 w-5 text-tiptop-purple" />
                  AI Assistant Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-tiptop-purple/5 rounded-lg">
                    <p className="font-medium text-tiptop-purple mb-1">Intelligent Responses</p>
                    <p className="text-gray-600">
                      Powered by OpenAI to understand your specific questions and provide accurate answers.
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="font-medium text-green-700 mb-1">Property-Aware</p>
                    <p className="text-gray-600">
                      Knows your exact property analysis and can provide specific recommendations based on your assets.
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-700 mb-1">Context Memory</p>
                    <p className="text-gray-600">
                      Remembers our conversation to provide consistent and relevant assistance.
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
