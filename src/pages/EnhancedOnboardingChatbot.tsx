
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'react-router-dom';
import { useUserPropertyAnalysis } from '@/hooks/useUserPropertyAnalysis';
import { useJourneyTracking } from '@/hooks/useJourneyTracking';
import EnhancedChatInterface from '@/components/onboarding/EnhancedChatInterface';
import ChatbotLoadingState from '@/components/onboarding/ChatbotLoadingState';
import ChatbotErrorState from '@/components/onboarding/ChatbotErrorState';
import ChatbotHeader from '@/components/onboarding/ChatbotHeader';
import ChatbotSidebar from '@/components/onboarding/ChatbotSidebar';

const EnhancedOnboardingChatbot = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  // Get analysis ID and target asset from URL parameters
  const analysisId = searchParams.get('analysisId');
  const targetAsset = searchParams.get('asset');
  
  console.log('🔗 [CHATBOT] Initializing with URL parameters:', { 
    analysisId, 
    targetAsset,
    url: window.location.href
  });
  
  // Enhanced property analysis integration with fallback to journey data
  const { propertyData, loading: propertyLoading, hasPropertyData } = useUserPropertyAnalysis(analysisId || undefined);
  
  // Use journey tracking to get dashboard data as fallback
  const { getDashboardData } = useJourneyTracking();
  
  const [detectedAssets, setDetectedAssets] = useState<string[]>([]);
  const [conversationStage, setConversationStage] = useState('greeting');
  const [conversationStartTime] = useState(Date.now());
  const [messageCount, setMessageCount] = useState(0);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  // Initialize conversation with target asset if provided
  useEffect(() => {
    if (propertyData && targetAsset && !propertyLoading) {
      console.log('🎯 [ONBOARDING] Initializing with target asset:', {
        targetAsset,
        analysisId: propertyData.analysisId,
        address: propertyData.address,
        availableAssets: propertyData.availableAssets.map(a => a.type)
      });
      
      const assetInfo = propertyData.availableAssets.find(a => a.type === targetAsset);
      if (assetInfo) {
        setDetectedAssets([targetAsset]);
        setConversationStage('asset_configuration');
        
        toast({
          title: "Asset Setup Started",
          description: `Let's configure your ${assetInfo.name} at ${propertyData.address} for $${assetInfo.monthlyRevenue}/month potential earnings.`,
        });
      } else {
        console.warn('⚠️ [ONBOARDING] Target asset not found in analysis:', {
          targetAsset,
          availableAssets: propertyData.availableAssets.map(a => a.type)
        });
        
        toast({
          title: "Asset Not Found",
          description: `The requested asset "${targetAsset}" was not found in your property analysis.`,
          variant: "destructive"
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
      if (analysisId) {
        insights.push(`Analysis ID: ${analysisId}`);
      }
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
      <ChatbotLoadingState 
        isAuthLoading={authLoading}
        analysisId={analysisId}
        propertyAddress={propertyData?.address}
      />
    );
  }

  // Show error state if no property data after loading
  if (!propertyData && !propertyLoading) {
    return <ChatbotErrorState analysisId={analysisId} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      {/* Header */}
      <ChatbotHeader
        targetAsset={targetAsset}
        hasPropertyData={hasPropertyData}
        conversationStage={conversationStage}
        showAnalytics={showAnalytics}
        onToggleAnalytics={() => setShowAnalytics(!showAnalytics)}
      />

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
          <ChatbotSidebar
            propertyData={propertyData}
            analysisId={analysisId}
            targetAsset={targetAsset}
            hasPropertyData={hasPropertyData}
            showAnalytics={showAnalytics}
            analytics={analytics}
          />
        </div>
      </div>
    </div>
  );
};

export default EnhancedOnboardingChatbot;
