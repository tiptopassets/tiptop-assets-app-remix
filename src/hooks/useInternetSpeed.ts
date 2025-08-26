
import { useState, useEffect, useCallback } from 'react';
import { internetSpeedService } from '@/services/internetSpeedService';
import { aiEarningsService, AIEarningsResponse } from '@/services/aiEarningsService';

interface SpeedTestResult {
  downloadSpeed: number;
  uploadSpeed: number;
  ping: number;
  jitter: number;
  timestamp: Date;
  testDuration: number;
}

export const useInternetSpeed = () => {
  const [latestResult, setLatestResult] = useState<SpeedTestResult | null>(null);
  const [testHistory, setTestHistory] = useState<SpeedTestResult[]>([]);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [aiEarningsAnalysis, setAiEarningsAnalysis] = useState<AIEarningsResponse | null>(null);
  const [isAnalyzingEarnings, setIsAnalyzingEarnings] = useState(false);

  // Load initial data
  useEffect(() => {
    const latest = internetSpeedService.getLatestResult();
    const history = internetSpeedService.getTestHistory();
    
    setLatestResult(latest);
    setTestHistory(history);

    // Auto-analyze earnings when we have data
    if (latest) {
      analyzeEarningsWithAI(latest, history);
    }
  }, []);

  // Check if test is running
  useEffect(() => {
    const checkTestStatus = () => {
      setIsTestRunning(internetSpeedService.isTestInProgress());
    };

    const interval = setInterval(checkTestStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const refreshData = useCallback(() => {
    const latest = internetSpeedService.getLatestResult();
    const history = internetSpeedService.getTestHistory();
    
    setLatestResult(latest);
    setTestHistory(history);

    // Re-analyze earnings with updated data
    if (latest) {
      analyzeEarningsWithAI(latest, history);
    }
  }, []);

  const analyzeEarningsWithAI = useCallback(async (
    result: SpeedTestResult, 
    history: SpeedTestResult[] = []
  ) => {
    if (!result) return;

    setIsAnalyzingEarnings(true);
    console.log('🤖 Starting AI earnings analysis...');

    try {
      const analysis = await aiEarningsService.analyzeEarningsPotential({
        downloadSpeed: result.downloadSpeed,
        uploadSpeed: result.uploadSpeed,
        ping: result.ping,
        jitter: result.jitter,
        testHistory: history.map(h => ({
          downloadSpeed: h.downloadSpeed,
          uploadSpeed: h.uploadSpeed,
          ping: h.ping,
          timestamp: h.timestamp
        }))
      });

      setAiEarningsAnalysis(analysis);
      console.log('✅ AI earnings analysis completed:', analysis);
    } catch (error) {
      console.error('Failed to analyze earnings with AI:', error);
    } finally {
      setIsAnalyzingEarnings(false);
    }
  }, []);

  const calculateAverageSpeed = useCallback(() => {
    if (testHistory.length === 0) return { download: 0, upload: 0 };

    const totalDownload = testHistory.reduce((sum, result) => sum + result.downloadSpeed, 0);
    const totalUpload = testHistory.reduce((sum, result) => sum + result.uploadSpeed, 0);

    return {
      download: Math.round((totalDownload / testHistory.length) * 100) / 100,
      upload: Math.round((totalUpload / testHistory.length) * 100) / 100
    };
  }, [testHistory]);

  const getNetworkQuality = useCallback(() => {
    if (!latestResult) return 0;
    return internetSpeedService.calculateNetworkQuality(latestResult);
  }, [latestResult]);

  // Enhanced bandwidth sharing potential using AI analysis
  const getBandwidthSharingPotential = useCallback(() => {
    if (!latestResult) return { shareable: 0, potential: 0 };

    // If we have AI analysis, use those predictions
    if (aiEarningsAnalysis) {
      const shareableDownload = latestResult.downloadSpeed * 0.25;
      return {
        shareable: Math.round(shareableDownload * 100) / 100,
        potential: aiEarningsAnalysis.monthlyEarnings.average,
        aiPrediction: aiEarningsAnalysis
      };
    }

    // Fallback to basic calculation
    const shareableDownload = latestResult.downloadSpeed * 0.25;
    const shareableUpload = latestResult.uploadSpeed * 0.25;
    
    const avgDataPerMonth = shareableDownload * 30 * 24 * 3600 / 8;
    const potentialEarnings = avgDataPerMonth * 0.02;

    return {
      shareable: Math.round(shareableDownload * 100) / 100,
      potential: Math.round(potentialEarnings * 100) / 100
    };
  }, [latestResult, aiEarningsAnalysis]);

  const getAIOptimizationTips = useCallback(() => {
    return aiEarningsAnalysis?.optimizationTips || [];
  }, [aiEarningsAnalysis]);

  const getMarketFactors = useCallback(() => {
    return aiEarningsAnalysis?.marketFactors || {
      locationPremium: 1.0,
      demandLevel: 'medium' as const,
      competitionLevel: 'medium' as const
    };
  }, [aiEarningsAnalysis]);

  const getBestSharingSchedule = useCallback(() => {
    return aiEarningsAnalysis?.bestSharingSchedule || {
      peakHours: ['19:00-23:00'],
      offPeakHours: ['02:00-06:00'],
      recommendedUptime: 16
    };
  }, [aiEarningsAnalysis]);

  const runSpeedTest = useCallback(async () => {
    if (isTestRunning) return;

    console.log('🚀 Starting automated speed test...');
    setIsTestRunning(true);

    try {
      const result = await internetSpeedService.runFullSpeedTest(
        (progress, status) => {
          console.log(`Speed test progress: ${progress}% - ${status}`);
        }
      );

      setLatestResult(result);
      setTestHistory(internetSpeedService.getTestHistory());

      // Automatically analyze earnings with AI after test completion
      await analyzeEarningsWithAI(result, internetSpeedService.getTestHistory());

      console.log('✅ Speed test completed successfully:', result);
    } catch (error) {
      console.error('Speed test failed:', error);
    } finally {
      setIsTestRunning(false);
    }
  }, [isTestRunning, analyzeEarningsWithAI]);

  return {
    latestResult,
    testHistory,
    isTestRunning,
    refreshData,
    runSpeedTest,
    calculateAverageSpeed,
    getNetworkQuality,
    getBandwidthSharingPotential,
    // New AI-powered features
    aiEarningsAnalysis,
    isAnalyzingEarnings,
    analyzeEarningsWithAI,
    getAIOptimizationTips,
    getMarketFactors,
    getBestSharingSchedule
  };
};
