
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'react-router-dom';
import { useUserPropertyAnalysis } from '@/hooks/useUserPropertyAnalysis';
import { useDashboardJourneyData } from '@/hooks/useDashboardJourneyData';
import { useUserAssetSelections } from '@/hooks/useUserAssetSelections';
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
  
  // Use dashboard journey data as primary source (same as dashboard)
  const { journeyData, loading: journeyLoading } = useDashboardJourneyData();
  
  // Get asset selections (same as dashboard)
  const { assetSelections, loading: assetsLoading } = useUserAssetSelections();
  
  // Use journey tracking to get dashboard data as fallback
  const { getDashboardData } = useJourneyTracking();
  
  const [detectedAssets, setDetectedAssets] = useState<string[]>([]);
  const [conversationStage, setConversationStage] = useState('greeting');
  const [conversationStartTime] = useState(Date.now());
  const [messageCount, setMessageCount] = useState(0);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  // Create a unified data object that prioritizes journey data (same as dashboard)
  const unifiedPropertyData = useMemo(() => {
    if (journeyData) {
      console.log('🎯 [CHATBOT] Using journey data as primary source:', {
        address: journeyData.propertyAddress,
        analysisId: journeyData.analysisId,
        revenue: journeyData.totalMonthlyRevenue,
        opportunities: journeyData.totalOpportunities
      });
      
      return {
        analysisId: journeyData.analysisId || analysisId || '',
        address: journeyData.propertyAddress,
        coordinates: journeyData.analysisResults?.coordinates || journeyData.analysisResults?.propertyCoordinates,
        totalMonthlyRevenue: journeyData.totalMonthlyRevenue,
        totalOpportunities: journeyData.totalOpportunities,
        availableAssets: propertyData?.availableAssets || [],
        analysisResults: journeyData.analysisResults,
        selectedAssets: assetSelections?.map(selection => selection.asset_type) || []
      };
    } else if (propertyData) {
      console.log('🎯 [CHATBOT] Using property analysis data as fallback:', {
        address: propertyData.address,
        analysisId: propertyData.analysisId,
        revenue: propertyData.totalMonthlyRevenue
      });
      
      return {
        ...propertyData,
        selectedAssets: assetSelections?.map(selection => selection.asset_type) || []
      };
    }
    return null;
  }, [journeyData, propertyData, assetSelections, analysisId]);

  // Store reference to send initial message function
  const [sendInitialMessage, setSendInitialMessage] = useState<((message: string) => Promise<void>) | null>(null);

  // Initialize conversation with target asset if provided
  useEffect(() => {
    if (unifiedPropertyData && targetAsset && !propertyLoading && !journeyLoading && sendInitialMessage) {
      console.log('🎯 [ONBOARDING] Initializing with target asset:', {
        targetAsset,
        analysisId: unifiedPropertyData.analysisId,
        address: unifiedPropertyData.address,
        availableAssets: unifiedPropertyData.availableAssets.map(a => a.type),
        selectedAssetsCount: unifiedPropertyData.selectedAssets.length
      });
      
      const assetInfo = unifiedPropertyData.availableAssets.find(a => a.type === targetAsset);
      if (assetInfo) {
        setDetectedAssets([targetAsset]);
        setConversationStage('asset_configuration');
        
        // Auto-start the conversation with the target asset
        setTimeout(() => {
          const assetName = assetInfo.name?.toLowerCase() || 'asset';
          sendInitialMessage(`I want to manage my ${assetName} setup. Can you help me with the current configuration and next steps?`);
        }, 1000);
        
        toast({
          title: "Asset Setup Started",
          description: `Let's configure your ${assetInfo.name} at ${unifiedPropertyData.address} for $${assetInfo.monthlyRevenue}/month potential earnings.`,
        });
      } else {
        console.warn('⚠️ [ONBOARDING] Target asset not found in analysis:', {
          targetAsset,
          availableAssets: unifiedPropertyData.availableAssets.map(a => a.type)
        });
        
        toast({
          title: "Asset Not Found",
          description: `The requested asset "${targetAsset}" was not found in your property analysis.`,
          variant: "destructive"
        });
      }
    }
  }, [unifiedPropertyData, targetAsset, propertyLoading, journeyLoading, toast, sendInitialMessage]);

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
    
    if (unifiedPropertyData) {
      insights.push(`Property analyzed: ${unifiedPropertyData.address}`);
      insights.push(`Total potential: $${unifiedPropertyData.totalMonthlyRevenue}/month`);
      if (unifiedPropertyData.analysisId) {
        insights.push(`Analysis ID: ${unifiedPropertyData.analysisId}`);
      }
      if (unifiedPropertyData.selectedAssets && unifiedPropertyData.selectedAssets.length > 0) {
        insights.push(`${unifiedPropertyData.selectedAssets.length} assets already selected`);
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

  // Loading state - keep loading until auth is done AND we have at least one data source
  const isLoading = authLoading || (!unifiedPropertyData && (propertyLoading || journeyLoading));
  
  console.log('🔄 [CHATBOT] Loading state check:', {
    authLoading,
    propertyLoading,
    journeyLoading,
    assetsLoading,
    hasJourneyData: !!journeyData,
    hasPropertyData: !!propertyData,
    hasUnifiedData: !!unifiedPropertyData,
    isLoading,
    user: !!user,
    loadingReason: authLoading ? 'auth' : (!unifiedPropertyData && (propertyLoading || journeyLoading)) ? 'data' : 'none'
  });

  if (isLoading) {
    console.log('📊 [CHATBOT] Still loading, showing loading state');
    return (
      <ChatbotLoadingState 
        isAuthLoading={authLoading}
        analysisId={unifiedPropertyData?.analysisId || analysisId}
        propertyAddress={unifiedPropertyData?.address}
      />
    );
  }

  // Show error state if no data after loading and user is authenticated
  if (user && !authLoading && !unifiedPropertyData && !propertyLoading && !journeyLoading) {
    console.log('⚠️ [CHATBOT] No data available after loading completed');
    return <ChatbotErrorState analysisId={analysisId} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      {/* Header */}
      <ChatbotHeader
        targetAsset={targetAsset}
        hasPropertyData={!!unifiedPropertyData}
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
                propertyData={unifiedPropertyData}
                onSendMessageReady={setSendInitialMessage}
              />
            </Card>
          </div>

          {/* Sidebar */}
          <ChatbotSidebar
            propertyData={unifiedPropertyData}
            analysisId={unifiedPropertyData?.analysisId || analysisId}
            targetAsset={targetAsset}
            hasPropertyData={!!unifiedPropertyData}
            showAnalytics={showAnalytics}
            analytics={analytics}
          />
        </div>
      </div>
    </div>
  );
};

export default EnhancedOnboardingChatbot;
