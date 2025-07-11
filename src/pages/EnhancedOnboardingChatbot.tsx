
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
import ChatInputBox from '@/components/onboarding/ChatInputBox';
import SuggestionBubbles from '@/components/onboarding/SuggestionBubbles';
import ChatbotLoadingState from '@/components/onboarding/ChatbotLoadingState';
import ChatbotErrorState from '@/components/onboarding/ChatbotErrorState';
import ChatbotHeader from '@/components/onboarding/ChatbotHeader';
import ChatbotSidebar from '@/components/onboarding/ChatbotSidebar';
import QuickActionsBar from '@/components/onboarding/QuickActionsBar';

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
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  
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
        selectedAssets: assetSelections || []
      };
    } else if (propertyData) {
      console.log('🎯 [CHATBOT] Using property analysis data as fallback:', {
        address: propertyData.address,
        analysisId: propertyData.analysisId,
        revenue: propertyData.totalMonthlyRevenue
      });
      
      return {
        ...propertyData,
        selectedAssets: assetSelections || []
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
      const selectedAsset = unifiedPropertyData.selectedAssets.find(a => 
        a.asset_type.toLowerCase() === targetAsset.toLowerCase()
      );
      
      if (assetInfo || selectedAsset) {
        const assetName = assetInfo?.name || selectedAsset?.asset_type || targetAsset;
        setDetectedAssets([targetAsset]);
        setConversationStage('asset_configuration');
        
        // Auto-start the conversation with the target asset and immediately show partner cards
        setTimeout(() => {
          sendInitialMessage(`I want to manage my ${assetName.toLowerCase()} setup. Please show me the available partner platforms and configuration options.`);
        }, 1000);
        
        const revenue = selectedAsset?.monthly_revenue || assetInfo?.monthlyRevenue || 0;
        toast({
          title: "Asset Setup Started",
          description: `Let's configure your ${assetName} at ${unifiedPropertyData.address} for $${revenue}/month potential earnings.`,
        });
      } else {
        console.warn('⚠️ [ONBOARDING] Target asset not found in analysis:', {
          targetAsset,
          availableAssets: unifiedPropertyData.availableAssets.map(a => a.type),
          selectedAssets: unifiedPropertyData.selectedAssets.map(a => a.asset_type)
        });
        
        // Try to use the asset type directly for initialization
        setDetectedAssets([targetAsset]);
        setConversationStage('asset_configuration');
        
        setTimeout(() => {
          sendInitialMessage(`I want to set up my ${targetAsset} for monetization. Please show me the available partner platforms and configuration options.`);
        }, 1000);
        
        toast({
          title: "Asset Setup Started",
          description: `Let's explore options for your ${targetAsset}.`,
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
      if (unifiedPropertyData.selectedAssets.length > 0) {
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

  const handleSendMessage = async (message: string) => {
    if (!sendInitialMessage) return;
    
    setChatLoading(true);
    setShowSuggestions(false);
    setChatError(null);
    
    try {
      await sendInitialMessage(message);
    } catch (err) {
      setChatError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setChatLoading(false);
    }
  };

  const handleSuggestedAction = async (action: string) => {
    await handleSendMessage(action);
  };

  // Loading state - wait for auth and data
  const isLoading = authLoading || (propertyLoading && journeyLoading && !unifiedPropertyData);

  if (isLoading) {
    return (
      <ChatbotLoadingState 
        isAuthLoading={authLoading}
        analysisId={unifiedPropertyData?.analysisId || analysisId}
        propertyAddress={unifiedPropertyData?.address}
      />
    );
  }

  // Show error state if no data after loading
  if (!unifiedPropertyData && !propertyLoading && !journeyLoading) {
    return <ChatbotErrorState analysisId={analysisId} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative">
      {/* Header - Fixed and Glassy */}
      <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/20">
        <ChatbotHeader
          targetAsset={targetAsset}
          hasPropertyData={!!unifiedPropertyData}
          conversationStage={conversationStage}
          showAnalytics={showAnalytics}
          onToggleAnalytics={() => setShowAnalytics(!showAnalytics)}
          propertyAddress={unifiedPropertyData?.address}
          isReady={!propertyLoading && !journeyLoading && !authLoading}
        />
      </div>

      {/* Fixed Chat Input - Top */}
      <ChatInputBox 
        onSendMessage={handleSendMessage}
        isLoading={chatLoading}
        error={chatError}
      />

      {/* Floating Quick Actions Sidebar */}
      <QuickActionsBar />

      {/* Main Content - Full Height */}
      <div className="h-screen">
        <div className="flex justify-center">
          <div className="w-full max-w-4xl h-full">
            <div className="h-full pt-20">
              <EnhancedChatInterface
                onAssetDetected={handleAssetDetected}
                onConversationStageChange={handleConversationStageChange}
                propertyData={unifiedPropertyData}
                onSendMessageReady={setSendInitialMessage}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Suggestion Bubbles - Bottom */}
      <SuggestionBubbles 
        propertyData={unifiedPropertyData}
        showSuggestions={showSuggestions}
        onSuggestedAction={handleSuggestedAction}
        isLoading={chatLoading}
      />
    </div>
  );
};

export default EnhancedOnboardingChatbot;
