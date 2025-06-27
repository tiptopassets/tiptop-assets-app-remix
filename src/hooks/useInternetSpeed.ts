
import { useState, useEffect, useCallback } from 'react';
import { internetSpeedService } from '@/services/internetSpeedService';

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

  // Load initial data
  useEffect(() => {
    const latest = internetSpeedService.getLatestResult();
    const history = internetSpeedService.getTestHistory();
    
    setLatestResult(latest);
    setTestHistory(history);
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

  const getBandwidthSharingPotential = useCallback(() => {
    if (!latestResult) return { shareable: 0, potential: 0 };

    // Conservative estimate: share 25% of available bandwidth
    const shareableDownload = latestResult.downloadSpeed * 0.25;
    const shareableUpload = latestResult.uploadSpeed * 0.25;
    
    // Estimate potential monthly earnings based on shared bandwidth
    // Using a conservative rate of $0.02 per GB shared
    const avgDataPerMonth = shareableDownload * 30 * 24 * 3600 / 8; // GB per month
    const potentialEarnings = avgDataPerMonth * 0.02;

    return {
      shareable: Math.round(shareableDownload * 100) / 100,
      potential: Math.round(potentialEarnings * 100) / 100
    };
  }, [latestResult]);

  return {
    latestResult,
    testHistory,
    isTestRunning,
    refreshData,
    calculateAverageSpeed,
    getNetworkQuality,
    getBandwidthSharingPotential
  };
};
